using PicturePanels.Models;
using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Services;
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
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{playerId}")]
        public async Task<IActionResult> PutAsync(string playerId, [FromBody] PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            var notifyTeam = false;

            if (playerModel == null)
            {
                notifyTeam = true;
                playerModel = new PlayerTableEntity()
                {
                    PlayerId = playerId,
                    SelectedPanels = new List<string>()
                };
            }
            else if (playerModel.TeamNumber != entity.TeamNumber)
            {
                notifyTeam = true;
            }
            else if (playerModel.LastPingTime.AddMinutes(5) < DateTime.UtcNow)
            {
                notifyTeam = true;
            }

            playerModel.Name = entity.Name.Replace("(", "").Replace(")", "");
            playerModel.Name = playerModel.Name.Substring(0, Math.Min(playerModel.Name.Length, 14));
            playerModel.TeamNumber = entity.TeamNumber;
            playerModel.Color = entity.Color;
            playerModel.LastPingTime = DateTime.UtcNow;
            playerModel.ConnectionId = entity.ConnectionId;

            playerModel = await this.playerTableStorage.AddOrUpdatePlayerAsync(playerModel);
            await this.signalRHelper.AddPlayerToTeamGroupAsync(playerModel, notifyTeam && !playerModel.IsAdmin);

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{playerId}/ping")]
        public async Task<IActionResult> PutPingAsync(string playerId)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }
            playerModel.LastPingTime = DateTime.UtcNow;
            playerModel = await this.playerTableStorage.AddOrUpdatePlayerAsync(playerModel);

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

            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            if (playerModel.IsReady)
            {
                //return StatusCode(400);
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
                playerModel.IsReady = true;
                await this.playerTableStorage.AddOrUpdatePlayerAsync(playerModel);
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

            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
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
            var playerModel = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }
            playerModel.IsAdmin = !playerModel.IsAdmin;
            playerModel = await this.playerTableStorage.AddOrUpdatePlayerAsync(playerModel);

            return Json(new PlayerEntity(playerModel));
        }
    }
}
