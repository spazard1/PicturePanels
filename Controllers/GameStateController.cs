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
using PicturePanels.Services.Storage;
using System.Text;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameStateController : Controller
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly ImageTableStorage imageTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly GameRoundTableStorage gameRoundTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;
        private readonly GameStateService gameStateService;

        public GameStateController(GameStateTableStorage gameStateTableStorage,
            ImageTableStorage imageTableStorage,
            PlayerTableStorage playerTableStorage,
            GameRoundTableStorage gameRoundTableStorage,
            IHubContext<SignalRHub, ISignalRHub> hubContext,
            SignalRHelper signalRHelper,
            GameStateService gameStateService)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.gameRoundTableStorage = gameRoundTableStorage;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
            this.gameStateService = gameStateService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAsync(string id)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            return Json(new GameStateEntity(gameState));
        }

        private char[] gameStateIdLetters = { 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Z' };

        private string GenerateGameStateId()
        {
            var rand = new Random();
            var stringBuilder = new StringBuilder();

            for (var i = 0; i < 4; i++)
            {
                stringBuilder.Append(gameStateIdLetters[rand.Next(0, gameStateIdLetters.Length)]);
            }

            return stringBuilder.ToString();
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync()
        {
            string gameStateId = string.Empty;
            GameStateTableEntity gameState;
            for (int i = 0; i < 10; i++)
            {
                gameStateId = GenerateGameStateId();
                gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
                if (gameState == null)
                {
                    break;
                }
                gameStateId = string.Empty;
            }
            if (string.IsNullOrWhiteSpace(gameStateId))
            {
                return StatusCode((int)HttpStatusCode.Conflict);
            }

            gameState = new GameStateTableEntity()
            {
                GameStateId = gameStateId,
                TurnType = GameStateTableEntity.TurnTypeSetup,
                TurnStartTime = DateTime.UtcNow,
                TeamOneName = "Team 1",
                TeamTwoName = "Team 2",
            };

            gameState = await this.gameStateTableStorage.InsertAsync(gameState);

            return Json(new GameStateEntity(gameState));
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsync(GameStateEntity entity, string id)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            if (gameState.TurnType != GameStateTableEntity.TurnTypeSetup)
            {
                return StatusCode(403);
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.NewGame();
                gs.TeamOneName = entity.TeamOneName;
                gs.TeamTwoName = entity.TeamTwoName;
                gs.OpenPanelTime = entity.OpenPanelTime.HasValue ? entity.OpenPanelTime.Value : GameStateTableEntity.DefaultOpenPanelTime;
                gs.GuessTime = entity.GuessTime.HasValue ? entity.GuessTime.Value : GameStateTableEntity.DefaultMakeGuessTime;
            });

            gameState = await this.gameStateService.PopulateGameRoundsAsync(gameState);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/{playerId}/start")]
        public async Task<IActionResult> PutStartAsync(string id, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            if (gameState.TurnType != GameStateTableEntity.TurnTypeWelcome)
            {
                return StatusCode(403);
            }

            var playerModel = await this.playerTableStorage.GetAsync(id, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            await this.gameStateService.QueueStartGameAsync(gameState, playerModel);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/{playerId}/cancelStart")]
        public async Task<IActionResult> PutCancelStartAsync(string id, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            if (gameState.TurnType != GameStateTableEntity.TurnTypeWelcome)
            {
                return StatusCode(403);
            }

            var playerModel = await this.playerTableStorage.GetAsync(id, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            await this.gameStateService.CancelStartGameAsync(gameState, playerModel);

            return Json(new GameStateEntity(gameState));
        }

        [HttpGet("{id}/{playerId}/smallestTeam")]
        public async Task<IActionResult> GetSmallestTeamAsync(string id, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(id, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            var allPlayers = this.playerTableStorage.GetActivePlayersAsync(id);
            var teamOneCount = await allPlayers.CountAsync(player => player.TeamNumber == 1 && player.PlayerId != playerId);
            var teamTwoCount = await allPlayers.CountAsync(player => player.TeamNumber == 2 && player.PlayerId != playerId);

            if (teamOneCount == teamTwoCount)
            {
                return Json(new TeamNumberEntity() { TeamNumber = new Random().Next(1) + 1 });
            }
            else if (teamOneCount < teamTwoCount)
            {
                return Json(new TeamNumberEntity() { TeamNumber = 1 });
            }
            return Json(new TeamNumberEntity() { TeamNumber = 2 });
        }

        /*
        [HttpPatch("{id}")]
        [RequireAuthorization]
        public async Task<IActionResult> PatchAsync(GameStateEntity entity, string id)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var newRound = !string.IsNullOrWhiteSpace(entity.ImageId) && entity.ImageId != gameState.ImageId;
            var newBlobContainer = !string.IsNullOrWhiteSpace(entity.BlobContainer) && entity.BlobContainer != gameState.BlobContainer;
            var newTurnType = (!string.IsNullOrWhiteSpace(entity.TurnType) && entity.TurnType != gameState.TurnType) || (entity.TeamTurn > 0 && entity.TeamTurn != gameState.TeamTurn);
            string updateType = string.Empty;

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, async (gs) =>
            {
                entity.CopyProperties(gs);

                if (newBlobContainer)
                {
                    var results = await imageTableStorage.GetAllImagesAsync(gs.BlobContainer).Select(image => new ImageEntity(image)).ToListAsync();
                    results.Sort();
                    gs.ImageId = results.FirstOrDefault()?.Id;
                }

                if (newRound || newBlobContainer)
                {
                    await this.teamGuessTableStorage.DeleteTeamGuessesAsync(gameState.GameStateId);
                    gs.NewRound();
                    updateType = GameStateTableEntity.UpdateTypeNewRound;
                }

                if (newTurnType || newRound || newBlobContainer)
                {
                    await this.playerTableStorage.ResetPlayersAsync(entity.GameStateId);
                    gs.NewTurnType(gs.TurnType);
                    updateType = GameStateTableEntity.UpdateTypeNewTurn;
                }
            });

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState), updateType);

            return Json(new GameStateEntity(gameState));
        }
        */

        [HttpPut("{id}/nextTurn")]
        [RequireAuthorization]
        public async Task<IActionResult> PutNextTurnAsync(string id)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }   

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.SwitchTeamTurn();
                gs.ClearGuesses();
                gs.NewTurnType(GameStateTableEntity.TurnTypeOpenPanel);
            });

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/teamPass/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamPassAsync(string id, int teamNumber)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateService.PassAsync(gameState, teamNumber);
            await this.gameStateService.ExitMakeGuessIfNeededAsync(gameState);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/teamCorrect/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamCorrectAsync(string id, int teamNumber)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(id, gameState.RoundNumber);
            if (gameRoundEntity == null)
            {
                return StatusCode(404);
            }

            var imageEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);
            if (imageEntity == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateService.GuessAsync(gameState, teamNumber, imageEntity.Name);
            await this.gameStateService.ExitMakeGuessIfNeededAsync(gameState);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/teamIncorrect/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamIncorrectAsync(string id, int teamNumber)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }
            gameState = await this.gameStateService.GuessAsync(gameState, teamNumber, "incorrect");
            await this.gameStateService.ExitMakeGuessIfNeededAsync(gameState);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/endRound")]
        [RequireAuthorization]
        public async Task<IActionResult> PutEndRoundAsync(string id)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.NewTurnType(GameStateTableEntity.TurnTypeGuessesMade);
                gs.ClearGuesses();
            });

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("{id}/randomizeTeams")]
        [RequireAuthorization]
        public async Task<IActionResult> RandomizeTeamsAsync(string id)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            await this.signalRHelper.RandomizeTeamsAsync(id);
            return StatusCode((int)HttpStatusCode.Accepted);
        }

        [HttpPost("{id}/openPanel/{panelId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenPanelAsync(string id, string panelId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }
            await this.gameStateService.OpenPanelAsync(gameState, panelId);

            return StatusCode(200);
        }

        [HttpPost("{id}/openPanel/{panelId}/force")]
        [RequireAuthorization]
        public async Task<IActionResult> PostForceOpenPanelAsync(string id, string panelId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(id);
            if (gameState == null)
            {
                return StatusCode(404);
            }
            await this.gameStateService.ForceOpenPanelAsync(gameState, panelId);

            return StatusCode(200);
        }
    }
}
