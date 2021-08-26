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

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameStateController : Controller
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly ImageTableStorage imageTableStorage;
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;
        private readonly GameStateService gameStateService;
        private readonly GameStateQueueService gameStateQueueService;

        public GameStateController(GameStateTableStorage gameStateTableStorage, 
            PlayerTableStorage playerTableStorage, 
            ImageTableStorage imageTableStorage,
            TeamGuessTableStorage teamGuessTableStorage,
            IHubContext<SignalRHub, ISignalRHub> hubContext,
            SignalRHelper signalRHelper,
            GameStateService gameStateService,
            GameStateQueueService gameStateQueueService)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
            this.gameStateService = gameStateService;
            this.gameStateQueueService = gameStateQueueService;
        }

        [HttpGet]
        public async Task<GameStateEntity> GetAsync()
        {
            return new GameStateEntity(await this.gameStateTableStorage.GetAsync());
        }

        [HttpPatch]
        [RequireAuthorization]
        public async Task<IActionResult> PatchAsync(GameStateEntity entity)
        {
            var gameState = await this.gameStateTableStorage.GetAsync();
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
                    var results = (await imageTableStorage.GetAllImagesAsync(gs.BlobContainer))
                        .Select(image => new ImageEntity(image)).ToList();
                    results.Sort();
                    gs.ImageId = results.FirstOrDefault()?.Id;
                }

                if (newRound || newBlobContainer)
                {
                    await this.teamGuessTableStorage.DeleteTeamGuessesAsync();

                    gs.SwitchTeamFirstTurn();
                    gs.TeamTurn = gameState.TeamFirstTurn;
                    gs.RoundNumber++;
                    gs.SetTurnType(GameStateTableEntity.TurnTypeOpenPanel);
                    gs.TurnNumber = 1;
                    gs.RevealedPanels = new List<string>();
                    updateType = GameStateTableEntity.UpdateTypeNewRound;
                }

                if (newTurnType || newRound || newBlobContainer)
                {
                    await this.playerTableStorage.ResetPlayersAsync();
                    gs.ClearGuesses();
                    gs.TurnStartTime = DateTime.UtcNow;
                    updateType = GameStateTableEntity.UpdateTypeNewTurn;
                }
            });

            if (newRound && gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
            {
                await this.gameStateQueueService.QueueGameStateChangeAsync(gameState, GameStateTableEntity.TurnTypeMakeGuess,
                    gameState.OpenPanelTime);
            }

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState), updateType);

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("nextTurn")]
        [RequireAuthorization]
        public async Task<IActionResult> PutNextTurnAsync()
        {
            var gameState = await this.gameStateTableStorage.GetAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }   

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.SwitchTeamTurn();
                gs.ClearGuesses();
                gs.SetTurnType(GameStateTableEntity.TurnTypeOpenPanel);
            });

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("teamPass/{teamNumber:int}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutTeamPassAsync(int teamNumber)
        {
            var gameState = await this.gameStateTableStorage.GetAsync();
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
            var gameState = await this.gameStateTableStorage.GetAsync();
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
            var gameState = await this.gameStateTableStorage.GetAsync();
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
            var gameState = await this.gameStateTableStorage.GetAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.SetTurnType(GameStateTableEntity.TurnTypeGuessesMade);
                gs.ClearGuesses();
            });

            await this.imageTableStorage.SetPlayedTimeAsync(gameState.BlobContainer, gameState.ImageId);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("newGame")]
        [RequireAuthorization]
        public async Task<IActionResult> PutNewGameAsync()
        {
            var gameState = await this.gameStateTableStorage.GetAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.RoundNumber = 1;
                gs.TeamOneScore = 0;
                gs.TeamTwoScore = 0;
                gs.TeamOneIncorrectGuesses = 0;
                gs.TeamTwoIncorrectGuesses = 0;
                gs.TeamOneInnerPanels = 5;
                gs.TeamTwoInnerPanels = 5;
                gs.SetTurnType(GameStateTableEntity.TurnTypeOpenPanel);
                gs.TurnNumber = 1;
                gs.RevealedPanels = new List<string>();
                gs.ClearGuesses();
            });

            await this.playerTableStorage.ResetPlayersAsync();
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return Json(new GameStateEntity(gameState));
        }

        [HttpPut("randomizeTeams")]
        [RequireAuthorization]
        public async Task<IActionResult> RandomizeTeamsAsync()
        {
            var gameState = await this.gameStateTableStorage.GetAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            await this.signalRHelper.RandomizeTeamsAsync();
            return StatusCode((int)HttpStatusCode.Accepted);
        }

        [HttpPost("openPanel/{panelId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PostOpenPanelAsync(string panelId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync();
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
            var gameState = await this.gameStateTableStorage.GetAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }
            await this.gameStateService.ForceOpenPanelAsync(gameState, panelId);

            return StatusCode(200);
        }
    }
}
