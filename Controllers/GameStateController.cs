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
        private readonly GameStateTableStorage gameTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly ImageTableStorage imageTableStorage;
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;
        private readonly GameStateService gameStateService;

        public GameStateController(GameStateTableStorage gameTableStorage, 
            PlayerTableStorage playerTableStorage, 
            ImageTableStorage imageTableStorage,
            TeamGuessTableStorage teamGuessTableStorage,
            IHubContext<SignalRHub, ISignalRHub> hubContext,
            SignalRHelper signalRHelper,
            GameStateService gameStateService)
        {
            this.gameTableStorage = gameTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
            this.gameStateService = gameStateService;
        }

        [HttpGet]
        public async Task<GameStateEntity> GetAsync()
        {
            return new GameStateEntity(await this.gameTableStorage.GetGameStateAsync());
        }

        [HttpPatch]
        [RequireAuthorization]
        public async Task<IActionResult> PatchAsync(GameStateEntity entity)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

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
                await this.teamGuessTableStorage.DeleteTeamGuessesAsync();

                gameState.SwitchTeamFirstTurn();
                gameState.TeamTurn = gameState.TeamFirstTurn;
                gameState.RoundNumber++;
                gameState.TurnType = GameStateTableEntity.TurnTypeOpenPanel;
                gameState.RevealedPanels = new List<string>();
            }

            if (newTurnType || newRound || newBlobContainer)
            {
                await this.playerTableStorage.ResetPlayersAsync();
                gameState.ClearGuesses();
                gameState.TurnStartTime = DateTime.UtcNow;
            }

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("nextTurn")]
        [RequireAuthorization]
        public async Task<IActionResult> PutNextTurnAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState.SwitchTeamTurn();
            gameState.ClearGuesses();
            gameState.TurnType = GameStateTableEntity.TurnTypeOpenPanel;

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("teamPass/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamPassAsync(int teamNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateService.PassAsync(gameState, teamNumber);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("teamCorrect/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamCorrectAsync(int teamNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var imageEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);
            if (imageEntity == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateService.GuessAsync(gameState, teamNumber, imageEntity.Name);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("teamIncorrect/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamIncorrectAsync(int teamNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }
            gameState = await this.gameStateService.GuessAsync(gameState, teamNumber, "incorrect");

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("endRound")]
        [RequireAuthorization]
        public async Task<IActionResult> PutEndRoundAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState.TurnType = GameStateTableEntity.TurnTypeGuessesMade;
            gameState.ClearGuesses();

            await this.imageTableStorage.SetPlayedTimeAsync(gameState.BlobContainer, gameState.ImageId);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("newGame")]
        [RequireAuthorization]
        public async Task<IActionResult> PutNewGameAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

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

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("randomizeTeams")]
        [RequireAuthorization]
        public async Task<IActionResult> RandomizeTeamsAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            await this.signalRHelper.RandomizeTeamsAsync();
            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode((int)HttpStatusCode.Accepted);
        }

        [HttpPost("openPanel/{panelId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenPanelAsync(string panelId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }
            await this.gameStateService.OpenPanelAsync(gameState, panelId);

            return StatusCode(200);
        }

        [HttpPost("openPanel/{panelId}/force")]
        [RequireAuthorization]
        public async Task<IActionResult> PostForceOpenPanelAsync(string panelId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }
            await this.gameStateService.ForceOpenPanelAsync(gameState, panelId);

            return StatusCode(200);
        }
    }
}
