using PicturePanels.Models;
using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PicturePanels.Services.Storage;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : Controller
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly PlayerService playerService;
        private readonly ChatService chatService;
        private readonly SignalRHelper signalRHelper;

        public PlayersController(PlayerTableStorage playerTableStorage,
            GameStateTableStorage gameStateTableStorage,
            PlayerService playerService,
            ChatService chatService,
            SignalRHelper signalRHelper)
        {
            this.playerTableStorage = playerTableStorage;
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerService = playerService;
            this.chatService = chatService;
            this.signalRHelper = signalRHelper;
        }

        [Route("/")]
        [Route("/player")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            var allPlayers = await this.playerTableStorage.GetActivePlayersAsync();
            return Json(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
        }

        [HttpGet("{playerId}")]
        public async Task<IActionResult> GetAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{playerId}")]
        public async Task<IActionResult> PutAsync(string playerId, [FromBody] PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetAsync(playerId);
            var notifyTeam = false;
            bool newPlayer = false;

            if (playerModel == null)
            {
                notifyTeam = true;
                playerModel = new PlayerTableEntity()
                {
                    PlayerId = playerId,
                    SelectedPanels = new List<string>()
                };
                newPlayer = true;
            }
            else if (playerModel.TeamNumber != entity.TeamNumber)
            {
                notifyTeam = true;
            }
            else if (playerModel.LastPingTime.AddMinutes(5) < DateTime.UtcNow)
            {
                notifyTeam = true;
            }

            playerModel = await this.playerTableStorage.InsertOrReplaceAsync(playerModel, (pm) =>
            {
                pm.Name = entity.Name.Replace("(", "").Replace(")", "");
                pm.Name = playerModel.Name.Substring(0, Math.Min(playerModel.Name.Length, 14));
                pm.TeamNumber = entity.TeamNumber;
                pm.Color = entity.Color;
                pm.LastPingTime = DateTime.UtcNow;
                pm.ConnectionId = entity.ConnectionId;
            }, newPlayer);

            await this.signalRHelper.AddPlayerToTeamGroupAsync(playerModel, notifyTeam && !playerModel.IsAdmin);

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{playerId}/ping")]
        public async Task<IActionResult> PutPingAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.LastPingTime = DateTime.UtcNow;
            });

            await this.signalRHelper.PlayerPingAsync();

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{playerId}/ready")]
        public async Task<IActionResult> PutReadyAsync(string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(playerId);
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
                await this.signalRHelper.ClearPlayerReadyAsync(playerModel.TeamNumber);
                return Json(new PlayerEntity(playerModel));
            }

            var players = await this.playerTableStorage.GetActivePlayersAsync(playerModel.TeamNumber);

            if (players.Count == 1)
            {
                await this.playerService.ReadyAsync(gameState, playerModel);
            }
            else if (players.Any(p => p.IsReady))
            {
                await this.playerService.ReadyAsync(gameState, playerModel);
            }
            else
            {
                playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
                {
                    pm.IsReady = true;
                });
                await this.signalRHelper.PlayerReadyAsync(new PlayerEntity(playerModel));
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpGet("{playerId}/ready")]
        public async Task<IActionResult> GetReadyAsync(string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetGameStateAsync();
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            // don't return a ready player if the team has already submitted
            if ((playerModel.TeamNumber == 1 && !string.IsNullOrWhiteSpace(gameState.TeamOneGuessStatus)) ||
                (playerModel.TeamNumber == 2 && !string.IsNullOrWhiteSpace(gameState.TeamTwoGuessStatus))) {
                return StatusCode(404);
            }

            var players = await this.playerTableStorage.GetActivePlayersAsync(playerModel.TeamNumber);

            var readyPlayer = players.FirstOrDefault(p => p.IsReady);

            if (readyPlayer != null)
            {
                return Json(new PlayerEntity(readyPlayer));
            }

            return StatusCode(404);
        }

        [HttpPut("{playerId}/admin")]
        [RequireAuthorization]
        public async Task<IActionResult> PutAdminAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(playerId);
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
