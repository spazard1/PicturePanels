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

        [HttpGet("{gameStateId:string}")]
        public async Task<IActionResult> GetAsync(string gameStateId)
        {
            var allPlayers = await this.playerTableStorage.GetActivePlayersAsync(gameStateId);
            return Json(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
        }

        [HttpGet("{gameStateId:string}/{playerId}")]
        public async Task<IActionResult> GetAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId:string}/{playerId}")]
        public async Task<IActionResult> PutAsync(string gameStateId, string playerId, [FromBody] PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
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

        [HttpPut("{gameStateId:string}/{playerId}/ping")]
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

            await this.signalRHelper.PlayerPingAsync(gameStateId);

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId:string}/{playerId}/ready")]
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
                await this.signalRHelper.ClearPlayerReadyAsync(playerModel.TeamNumber);
                return Json(new PlayerEntity(playerModel));
            }

            var players = await this.playerTableStorage.GetActivePlayersAsync(gameStateId, playerModel.TeamNumber);

            if (players.Count == 1)
            {
                await this.gameStateService.PlayerReadyAsync(gameState, playerModel);
            }
            else if (players.Any(p => p.IsReady))
            {
                await this.gameStateService.PlayerReadyAsync(gameState, playerModel);
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

        [HttpGet("{gameStateId:string}/{playerId}/ready")]
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

            var players = await this.playerTableStorage.GetActivePlayersAsync(gameStateId, playerModel.TeamNumber);

            var readyPlayer = players.FirstOrDefault(p => p.IsReady);

            if (readyPlayer != null)
            {
                return Json(new PlayerEntity(readyPlayer));
            }

            return StatusCode(404);
        }

        [HttpPut("{gameStateId:string}/{playerId}/admin")]
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
