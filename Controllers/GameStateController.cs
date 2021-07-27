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

            await CheckTeamCaptainsAsync(gameState);

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

            await CheckTeamCaptainsAsync(gameState);

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

            await CheckTeamCaptainsAsync(gameState);

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

            await CheckTeamCaptainsAsync(gameState);
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

            await CheckTeamCaptainsAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode((int)HttpStatusCode.Accepted);
        }

        [HttpPut("captains")]
        [RequireAuthorization]
        public async Task<IActionResult> CaptainsAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            await CheckTeamCaptainsAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode((int)HttpStatusCode.Accepted);
        }

        [HttpPut("captain/{playerId}")]
        public async Task<IActionResult> CaptainAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (playerModel.TeamNumber == 1)
            {
                gameState.TeamOneCaptain = playerId;
            }
            else
            {
                gameState.TeamTwoCaptain = playerId;
            }

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode(200);
        }

        [HttpPut("captainPass/{playerId}")]
        public async Task<IActionResult> PassAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (playerModel.TeamNumber == 1 && playerModel.PlayerId == gameState.TeamOneCaptain)
            {
                gameState.TeamOneCaptainStatus = GameStateTableEntity.CaptainStatusPass;
            }
            else if (playerModel.TeamNumber == 2 && playerModel.PlayerId == gameState.TeamTwoCaptain)
            {
                gameState.TeamTwoCaptainStatus = GameStateTableEntity.CaptainStatusPass;
            }
            else
            {
                return StatusCode(400);
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);
            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            await hubContext.Clients.Group(playerModel.SignalRGroup).CaptainStatus(new CaptainStatusEntity(gameState, playerModel.TeamNumber));

            return StatusCode(200);
        }

        [HttpPut("captainGuess/{playerId}")]
        public async Task<IActionResult> GuessAsync([FromBody] GuessEntity entity, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (playerModel.TeamNumber == 1 && playerModel.PlayerId == gameState.TeamOneCaptain)
            {
                gameState.TeamOneCaptainStatus = GameStateTableEntity.CaptainStatusGuess;
                gameState.TeamOneGuess = entity.Guess;
            }
            else if (playerModel.TeamNumber == 2 && playerModel.PlayerId == gameState.TeamTwoCaptain)
            {
                gameState.TeamTwoCaptainStatus = GameStateTableEntity.CaptainStatusGuess;
                gameState.TeamTwoGuess = entity.Guess;
            }
            else
            {
                return StatusCode(400);
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            await hubContext.Clients.Group(playerModel.SignalRGroup).CaptainStatus(new CaptainStatusEntity(gameState, playerModel.TeamNumber));

            return StatusCode(200);
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
            if (!string.IsNullOrWhiteSpace(gameState.TeamOneCaptainStatus) && !string.IsNullOrWhiteSpace(gameState.TeamTwoCaptainStatus))
            {
                var imageEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);
                if (imageEntity.Answers == null || !imageEntity.Answers.Any())
                {
                    imageEntity.Answers = new List<string>() { GuessChecker.Prepare(imageEntity.Name) };
                    imageEntity = await this.imageTableStorage.AddOrUpdateAsync(imageEntity);
                }

                gameState.TeamOneCorrect = gameState.TeamOneCaptainStatus == GameStateTableEntity.CaptainStatusGuess && GuessChecker.IsCorrect(gameState.TeamOneGuess, imageEntity.Answers);
                gameState.TeamTwoCorrect = gameState.TeamTwoCaptainStatus == GameStateTableEntity.CaptainStatusGuess && GuessChecker.IsCorrect(gameState.TeamTwoGuess, imageEntity.Answers);

                gameState.IncrementScores();
                gameState.SetTurnType(GameStateTableEntity.ActionGuessesMade);
            }
        }

        private async Task CheckTeamCaptainsAsync(GameStateTableEntity gameState)
        {
            var teamOneNeedsNewCaptain = true;
            if (!string.IsNullOrWhiteSpace(gameState.TeamOneCaptain))
            {
                var teamCaptain = await this.playerTableStorage.GetPlayerAsync(gameState.TeamOneCaptain);
                if (teamCaptain != null &&
                    teamCaptain.TeamNumber == 1 &&
                    teamCaptain.LastPingTime.AddMinutes(PlayerTableStorage.PlayerTimeoutInMinutes) > DateTime.UtcNow)
                {
                    teamOneNeedsNewCaptain = false;
                }
            }

            var teamTwoNeedsNewCaptain = true;
            if (!string.IsNullOrWhiteSpace(gameState.TeamTwoCaptain))
            {
                var teamCaptain = await this.playerTableStorage.GetPlayerAsync(gameState.TeamTwoCaptain);
                if (teamCaptain != null &&
                    teamCaptain.TeamNumber == 2 &&
                    teamCaptain.LastPingTime.AddMinutes(PlayerTableStorage.PlayerTimeoutInMinutes) > DateTime.UtcNow)
                {
                    teamTwoNeedsNewCaptain = false;
                }
            }

            if (!teamOneNeedsNewCaptain && !teamTwoNeedsNewCaptain)
            {
                return;
            }

            var allPlayers = await this.playerTableStorage.GetPlayersAsync();

            foreach (var player in allPlayers)
            {
                if (!teamOneNeedsNewCaptain && !teamTwoNeedsNewCaptain)
                {
                    break;
                }

                if (teamOneNeedsNewCaptain && player.TeamNumber == 1)
                {
                    gameState.TeamOneCaptain = player.PlayerId;
                    teamOneNeedsNewCaptain = false;
                }
                if (teamTwoNeedsNewCaptain && player.TeamNumber == 2)
                {
                    gameState.TeamTwoCaptain = player.PlayerId;
                    teamTwoNeedsNewCaptain = false;
                }
            }
        }
    }
}
