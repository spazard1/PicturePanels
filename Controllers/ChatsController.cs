using PicturePanels.Models;
using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using PicturePanels.Services.Storage;

namespace PicturePanels.Controllers
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

        [HttpGet("{gameStateId:string}/{teamNumber}")]
        public async Task<IActionResult> GetAsync(string gameStateId, string teamNumber)
        {
            var chatModels = await this.chatTableStorage.GetAllAsync(teamNumber);
            var players = await this.playerTableStorage.GetAllPlayersDictionaryAsync(gameStateId);
            var chatEntities = new List<ChatEntity>();

            foreach (var chatModel in chatModels)
            {
                if (chatModel.PlayerId != null && players.TryGetValue(chatModel.PlayerId, out PlayerTableEntity playerModel))
                {
                    chatEntities.Add(new ChatEntity(chatModel, playerModel));
                    continue;
                }
                else
                {
                    chatEntities.Add(new ChatEntity(chatModel));
                }
            }

            return Json(chatEntities);
        }
    }
}
