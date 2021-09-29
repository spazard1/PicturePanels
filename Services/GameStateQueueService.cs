using Azure.Messaging.ServiceBus;
using Newtonsoft.Json;
using PicturePanels.Models;
using System;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateQueueService
    {
        public ServiceBusClient Client { get; }

        public ServiceBusSender Sender { get; }

        public GameStateQueueService()
        {
            Client = new ServiceBusClient("Endpoint=sb://picturepanels.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=TJLwj1a8CdqLrFrJeBaAGuUwulEbe9GbhHwK8WhQGdQ=");

            Sender = Client.CreateSender("gamestateupdates");
        }

        public async Task QueueGameStateChangeAsync(GameStateTableEntity gameState)
        {
            if (!gameState.TurnEndTime.HasValue)
            {
                return;
            }

            var message = new ServiceBusMessage(JsonConvert.SerializeObject(new GameStateUpdateMessage(gameState)));

            // subtract a small extra grace period to handle latency
            await this.Sender.ScheduleMessageAsync(message, gameState.TurnEndTime.Value.Subtract(TimeSpan.FromSeconds(2)));
        }
    }
}
