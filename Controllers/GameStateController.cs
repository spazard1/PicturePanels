using CloudStorage.Entities;
using CloudStorage.Models;
using CloudStorage.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PictureGame.Entities;
using PictureGame.Filters;
using PictureGame.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace PictureGame.Controllers
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

            gameState = entity.ToModel(gameState);

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
                gameState.CaptainStatus = null;
                gameState.RevealedTiles = new List<string>();
            }

            if (newTurnType || newRound || newBlobContainer)
            {
                await this.playerTableStorage.ResetPlayersAsync();
            }

            await CheckTeamCaptainsAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("pass")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutPassAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.CaptainStatus = null;
            gameState.SwitchTeamTurn();
            gameState.SetTurnType(GameStateTableEntity.ActionPass);

            await CheckTeamCaptainsAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("incorrect")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutIncorrectAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.CaptainStatus = null;
            gameState.Incorrect();
            gameState.SwitchTeamTurn();
            gameState.SetTurnType(GameStateTableEntity.ActionIncorrect);

            await CheckTeamCaptainsAsync(gameState);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("correct")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutCorrectAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.CaptainStatus = null;
            gameState.Correct();
            gameState.SetTurnType(GameStateTableEntity.ActionCorrect);

            await CheckTeamCaptainsAsync(gameState);

            await this.imageTableStorage.SetPlayedTimeAsync(gameState.BlobContainer, gameState.ImageId);

            gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return new GameStateEntity(gameState);
        }

        [HttpPut("endRound")]
        [RequireAuthorization]
        public async Task<GameStateEntity> PutEndRoundAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            gameState.CaptainStatus = null;
            gameState.SetTurnType(GameStateTableEntity.ActionEndRound);

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
            gameState.TeamOneInnerTiles = 5;
            gameState.TeamTwoInnerTiles = 5;
            gameState.TeamOneOuterTiles = 8;
            gameState.TeamTwoOuterTiles = 8;
            gameState.TurnType = GameStateTableEntity.TurnTypeOpenTile;
            gameState.CaptainStatus = null;
            gameState.RevealedTiles = new List<string>();

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

            if (playerModel.TeamNumber == gameState.TeamTurn &&
                ((playerModel.TeamNumber == 1 && playerModel.PlayerId == gameState.TeamOneCaptain) ||
                (playerModel.TeamNumber == 2 && playerModel.PlayerId == gameState.TeamTwoCaptain)))
            {
                gameState.CaptainStatus = "Pass";
                gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
                await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
            }
            else
            {
                return StatusCode(400);
            }

            return StatusCode(200);
        }

        [HttpPut("captainGuess/{playerId}")]
        public async Task<IActionResult> GuessAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (playerModel.TeamNumber == gameState.TeamTurn &&
                ((playerModel.TeamNumber == 1 && playerModel.PlayerId == gameState.TeamOneCaptain) ||
                (playerModel.TeamNumber == 2 && playerModel.PlayerId == gameState.TeamTwoCaptain)))
            {
                gameState.CaptainStatus = "Guess";
                gameState = await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
                await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
            }
            else
            {
                return StatusCode(400);
            }

            return StatusCode(200);
        }

        [HttpPost("openTile/{tileId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenTileAsync(string tileId)
        {
            await OpenTileAsync(tileId);

            var gameState = await this.gameTableStorage.GetGameStateAsync();
            if (gameState.TurnType != GameStateTableEntity.TurnTypeOpenFreeTile)
            {
                gameState.UpdateTileCount(tileId);
            }
            gameState.SetTurnType(GameStateTableEntity.ActionOpenTile);

            await this.playerTableStorage.ResetPlayersAsync();

            await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode(200);
        }

        [HttpPost("openTile/{tileId}/force")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenTileForceAsync(string tileId)
        {
            await OpenTileAsync(tileId);
            return StatusCode(200);
        }

        private async Task OpenTileAsync(string tileId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            gameState.RevealedTiles.Add(tileId);

            await this.playerTableStorage.ResetPlayersAsync();

            await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
        }

        [HttpPost("closeTile/{tileId}")]
        [RequireAuthorization]
        public async Task<IActionResult> CloseTileAsync(string tileId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            if (!gameState.RevealedTiles.Contains(tileId))
            {
                return StatusCode(400);
            }

            gameState.RevealedTiles.Remove(tileId);

            await this.playerTableStorage.ResetPlayersAsync();

            await this.gameTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return StatusCode(200);
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

            if (teamOneNeedsNewCaptain)
            {
                gameState.TeamOneCaptain = string.Empty;
            }

            if (teamTwoNeedsNewCaptain)
            {
                gameState.TeamTwoCaptain = string.Empty;
            }
        }
    }
}
