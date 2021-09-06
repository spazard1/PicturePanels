using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Storage;
using System;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class ChatService
    {
        private readonly ChatTableStorage chatTableStorage;
        private readonly SignalRHelper signalRHelper;

        public ChatService(ChatTableStorage chatTableStorage, SignalRHelper signalRHelper)
        {
            this.chatTableStorage = chatTableStorage;
            this.signalRHelper = signalRHelper;
        }

        public async Task SendChatAsync(PlayerTableEntity player, string message, bool isSystem)
        {
            var chatModel = await this.chatTableStorage.InsertAsync(player, message, isSystem);
            await signalRHelper.ChatAsync(new ChatEntity(chatModel, player));
        }

        public async Task SendBroadcastAsync(PlayerTableEntity player, string message)
        {
            await signalRHelper.ChatAsync(new ChatEntity()
            {
                GameStateId = player.GameStateId,
                TeamNumber = "1",
                Message = message,
                IsSystem = true
            });

            await signalRHelper.ChatAsync(new ChatEntity()
            {
                GameStateId = player.GameStateId,
                TeamNumber = "2",
                Message = message,
                IsSystem = true
            });
        }

        public async Task SendChatAsync(string gameStateId, int teamNumber, string message, bool isSystem)
        {
            var chatModel = await this.chatTableStorage.InsertAsync(gameStateId, teamNumber, message, isSystem);
            await signalRHelper.ChatAsync(teamNumber, new ChatEntity(chatModel));
        }
    }
}
