using CloudStorage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PictureGame.Entities;
using PictureGame.Filters;
using PictureGame.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PictureGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : Controller
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;

        public PlayersController(PlayerTableStorage playerTableStorage, IHubContext<SignalRHub, ISignalRHub> hubContext, SignalRHelper signalRHelper)
        {
            this.playerTableStorage = playerTableStorage;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            var allPlayers = await this.playerTableStorage.GetPlayersAsync();
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
                    SelectedTiles = new List<string>()
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

            playerModel = await this.playerTableStorage.AddOrUpdatePlayerAsync(playerModel);

            if (!playerModel.IsAdmin)
            {
                await this.signalRHelper.AddPlayerToTeamGroupAsync(playerModel, notifyTeam);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{playerId}/ping")]
        public async Task<IActionResult> PingAsync(string playerId)
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
