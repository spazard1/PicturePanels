using CloudStorage.Models;
using Microsoft.AspNetCore.Mvc;
using PictureGame.Entities;
using PictureGame.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PictureGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatsController : Controller
    {
        private readonly ChatTableStorage chatTableStorage;
        private readonly PlayerTableStorage playerTableStorage;

        public ChatsController(ChatTableStorage chatTableStorage, PlayerTableStorage playerTableStorage)
        {
            this.chatTableStorage = chatTableStorage;
            this.playerTableStorage = playerTableStorage;
        }

        [HttpGet("{teamNumber}")]
        public async Task<IActionResult> GetAsync(string teamNumber)
        {
            var chatModels = await this.chatTableStorage.GetChatsAsync(teamNumber);

            var playerCache = new Dictionary<string, PlayerEntity>();

            var chatEntities = new List<ChatEntity>();
            foreach (var chatModel in chatModels)
            {
                if (playerCache.TryGetValue(chatModel.PlayerId, out PlayerEntity playerEntity))
                {
                    chatEntities.Add(new ChatEntity(chatModel, playerEntity));
                    continue;
                }
                var playerModel = await this.playerTableStorage.GetPlayerAsync(chatModel.PlayerId);
                if (playerModel != null)
                {
                    playerCache[playerModel.PlayerId] = new PlayerEntity(playerModel);
                    chatEntities.Add(new ChatEntity(chatModel, playerCache[playerModel.PlayerId]));
                }
                else
                {
                    chatEntities.Add(new ChatEntity(chatModel, null));
                }
            }

            return Json(chatEntities);
        }
    }
}
