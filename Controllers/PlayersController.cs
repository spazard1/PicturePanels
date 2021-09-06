using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Models;
using PicturePanels.Services;
using PicturePanels.Services.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : Controller
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly GameStateService gameStateService;
        private readonly ChatService chatService;
        private readonly SignalRHelper signalRHelper;

        public PlayersController(PlayerTableStorage playerTableStorage,
            GameStateTableStorage gameStateTableStorage,
            GameStateService gameStateService,
            ChatService chatService,
            SignalRHelper signalRHelper)
        {
            this.playerTableStorage = playerTableStorage;
            this.gameStateTableStorage = gameStateTableStorage;
            this.gameStateService = gameStateService;
            this.chatService = chatService;
            this.signalRHelper = signalRHelper;
        }

        [Route("/")]
        [Route("/player")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("{gameStateId}")]
        public async Task<IActionResult> GetAsync(string gameStateId)
        {
            var allPlayers = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
            return Json(await allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToListAsync());
        }

        [HttpGet("{gameStateId}/{playerId}")]
        public async Task<IActionResult> GetAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}/{playerId}")]
        public async Task<IActionResult> PutAsync(string gameStateId, string playerId, [FromBody] PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);

            if (entity.GameStateId != gameStateId || entity.PlayerId != playerId)
            {
                return StatusCode(400);
            }

            var isNewPlayer = false;
            bool notifyTeam = true;

            if (playerModel == null)
            {
                isNewPlayer = true;
                playerModel = new PlayerTableEntity()
                {
                    Name = GetPlayerName(entity.Name),
                    TeamNumber = entity.TeamNumber,
                    Color = entity.Color,
                    LastPingTime = DateTime.UtcNow,
                    ConnectionId = entity.ConnectionId,
                    GameStateId = gameStateId,
                    PlayerId = playerId,
                    SelectedPanels = new List<string>()
                };
                await this.playerTableStorage.InsertAsync(playerModel);
            }
            else
            {  
                playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
                {
                    pm.Name = GetPlayerName(entity.Name);
                    pm.TeamNumber = entity.TeamNumber;
                    pm.Color = entity.Color;
                    pm.LastPingTime = DateTime.UtcNow;
                    pm.ConnectionId = entity.ConnectionId;
                });

                notifyTeam = isNewPlayer || playerModel.TeamNumber != entity.TeamNumber ||
                    playerModel.LastPingTime.AddMinutes(5) < DateTime.UtcNow;
            }

            await this.signalRHelper.AddPlayerToTeamGroupAsync(playerModel, notifyTeam && !playerModel.IsAdmin);

            return Json(new PlayerEntity(playerModel));
        }

        private static string GetPlayerName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return "player";
            }
            name = name.Replace("(", "").Replace(")", "");
            name = name.Substring(0, Math.Min(name.Length, 14));
            return name;
        }

        [HttpPut("{gameStateId}/{playerId}/ping")]
        public async Task<IActionResult> PutPingAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.LastPingTime = DateTime.UtcNow;
            });

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}/{playerId}/ready")]
        public async Task<IActionResult> PutReadyAsync(string gameStateId, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            if (playerModel.IsAdmin)
            {
                return StatusCode(400);
            }

            if (playerModel.IsReady)
            {
                playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
                {
                    pm.IsReady = false;
                });
                await this.signalRHelper.ClearPlayerReadyAsync(playerModel);
                return Json(new PlayerEntity(playerModel));
            }

            var players = await this.playerTableStorage.GetActivePlayersAsync(gameStateId, playerModel.TeamNumber).ToListAsync();

            if (players.Count == 1 || players.Any(p => p.IsReady && p.PlayerId != playerId))
            {
                await this.gameStateService.PlayerReadyAsync(gameState, playerModel);
            }
            else
            {
                playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
                {
                    pm.IsReady = true;
                });
                await this.signalRHelper.PlayerReadyAsync(playerModel);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpGet("{gameStateId}/{playerId}/ready")]
        public async Task<IActionResult> GetReadyAsync(string gameStateId, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            // don't return a ready player if the team has already submitted
            if ((playerModel.TeamNumber == 1 && !string.IsNullOrWhiteSpace(gameState.TeamOneGuessStatus)) ||
                (playerModel.TeamNumber == 2 && !string.IsNullOrWhiteSpace(gameState.TeamTwoGuessStatus))) {
                return StatusCode(404);
            }

            var players = this.playerTableStorage.GetActivePlayersAsync(gameStateId, playerModel.TeamNumber);

            var readyPlayer = await players.FirstOrDefaultAsync(p => p.IsReady);

            if (readyPlayer != null)
            {
                return Json(new PlayerEntity(readyPlayer));
            }

            return StatusCode(404);
        }

        [HttpPut("{gameStateId}/{playerId}/admin")]
        [RequireAuthorization]
        public async Task<IActionResult> PutAdminAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.IsAdmin = !pm.IsAdmin;
            });

            return Json(new PlayerEntity(playerModel));
        }
    }
}
