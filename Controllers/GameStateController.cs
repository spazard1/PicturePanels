using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PicturePanels.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameStateController : Controller
    {
        private readonly GameTableStorage gameTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly ImageTableStorage imageTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;

        public GameStateController(GameTableStorage gameTableStorage, 
            PlayerTableStorage playerTableStorage, 
            ImageTableStorage imageTableStorage, 
            IHubContext<SignalRHub, ISignalRHub> hubContext,
            SignalRHelper signalRHelper)
        {
            this.gameTableStorage = gameTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
        }

        [HttpGet]
        public async Task<GameStateEntity> GetAsync()
        {
            return new GameStateEntity(await this.gameTableStorage.GetGameStateAsync());
        }

        [HttpPatch]
        [RequireAuthorization]
        public async Task<GameStateEntity> PatchAsync(GameStateEntity entity)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            var newRound = !string.IsNullOrWhiteSpace(entity.ImageId) && entity.ImageId != gameState.ImageId;
            var newBlobContainer = !string.IsNullOrWhiteSpace(entity.BlobContainer) && entity.BlobContainer != gameState.BlobContainer;
            var newTurnType = (!string.IsNullOrWhiteSpace(entity.TurnType) && entity.TurnType != gameState.TurnType) || (entity.TeamTurn > 0 && entity.TeamTurn != gameState.TeamTurn);

            entity.CopyProperties(gameState);

            if (newBlobContainer)
            {
                var results = (await imageTableStorage.GetAllImagesAsync(gameState.BlobContainer))
                    .Select(image => new ImageEntity(image)).ToList();
                results.Sort();
                gameState.ImageId = results.FirstOrDefault()?.Id;
            }

            if (newRound || newBlobContainer)
            {
                gameState.SwitchTeamFirstTurn();
                gameState.TeamTurn = gameState.TeamFirstTurn;
                gameState.RoundNumber++;
                gameState.SetTurnType(GameStateTableEntity.ActionNewRound);
                gameState.RevealedPanels = new List<string>();
            }

            if (newTurnType || newRound || newBlobContainer)
            {
                await this.playerTableStorage.ResetPlayersAsync();
                gameState.ClearGuesses();
            }

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("nextTurn")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutNextTurnAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.SwitchTeamTurn();
            gameState.SetTurnType(GameStateTableEntity.ActionNextTurn);
            gameState.ClearGuesses();

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("teamPass/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutTeamPassAsync(int teamNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (teamNumber == 1)
            {
                gameState.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusPass;
            }
            else
            {
                gameState.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusPass;
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("teamCorrect/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutTeamCorrectAsync(int teamNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            var imageEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);

            if (teamNumber == 1)
            {
                gameState.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
                gameState.TeamOneGuess = imageEntity.Name;
            }
            else
            {
                gameState.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
                gameState.TeamTwoGuess = imageEntity.Name;
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("teamIncorrect/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutTeamIncorrectAsync(int teamNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (teamNumber == 1)
            {
                gameState.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
                gameState.TeamOneGuess = "wrong guess";
            }
            else
            {
                gameState.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
                gameState.TeamTwoGuess = "wrong guess";
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("endRound")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutEndRoundAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.SetTurnType(GameStateTableEntity.ActionEndRound);
            gameState.ClearGuesses();

            await this.imageTableStorage.SetPlayedTimeAsync(gameState.BlobContainer, gameState.ImageId);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("newGame")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutNewGameAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            gameState.RoundNumber = 1;
            gameState.TeamOneScore = 0;
            gameState.TeamTwoScore = 0;
            gameState.TeamOneIncorrectGuesses = 0;
            gameState.TeamTwoIncorrectGuesses = 0;
            gameState.TeamOneInnerPanels = 5;
            gameState.TeamTwoInnerPanels = 5;
            gameState.TurnType = GameStateTableEntity.TurnTypeOpenPanel;
            gameState.RevealedPanels = new List<string>();
            gameState.ClearGuesses();

            await this.playerTableStorage.ResetPlayersAsync();

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("randomizeTeams")]
        [RequireAuthorization]
        public async Task<IActionResult> RandomizeTeamsAsync()
        {
            await this.signalRHelper.RandomizeTeamsAsync();
            
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode((int)HttpStatusCode.Accepted);
        }

        [HttpPost("openPanel/{panelId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenPanelAsync(string panelId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.OpenPanel(panelId);
            gameState.ClearGuesses();

            await this.playerTableStorage.ResetPlayersAsync();

            gameState.SetTurnType(GameStateTableEntity.ActionOpenPanel);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode(200);
        }

        [HttpPost("openPanel/{panelId}/force")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenPanelForceAsync(string panelId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.OpenPanel(panelId, false);
            gameState.ClearGuesses();

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode(200);
        }

        [HttpPost("closePanel/{panelId}")]
        [RequireAuthorization]
        public async Task<IActionResult> ClosePanelAsync(string panelId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (!gameState.RevealedPanels.Contains(panelId))
            {
                return StatusCode(400);
            }

            gameState.RevealedPanels.Remove(panelId);

            await this.playerTableStorage.ResetPlayersAsync();

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode(200);
        }

        private async Task HandleBothTeamsGuessReadyAsync(GameStateTableEntity gameState)
        {
            if (!string.IsNullOrWhiteSpace(gameState.TeamOneGuessStatus) && !string.IsNullOrWhiteSpace(gameState.TeamTwoGuessStatus))
            {
                var imageEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);
                if (imageEntity.Answers == null || !imageEntity.Answers.Any())
                {
                    imageEntity.Answers = new List<string>() { GuessChecker.Prepare(imageEntity.Name) };
                    imageEntity = await this.imageTableStorage.AddOrUpdateAsync(imageEntity);
                }

                gameState.TeamOneCorrect = gameState.TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gameState.TeamOneGuess, imageEntity.Answers);
                gameState.TeamTwoCorrect = gameState.TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gameState.TeamTwoGuess, imageEntity.Answers);

                gameState.IncrementScores();
                gameState.SetTurnType(GameStateTableEntity.ActionGuessesMade);
            }
        }
    }
}
