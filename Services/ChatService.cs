using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Storage;
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

        public async Task SendChatAsync(int teamNumber, string message, bool isSystem)
        {
            var chatModel = await this.chatTableStorage.InsertAsync(teamNumber, message, isSystem);
            await signalRHelper.ChatAsync(teamNumber, new ChatEntity(chatModel));
        }
    }
}
