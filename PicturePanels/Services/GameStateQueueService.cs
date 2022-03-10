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
            #if DEBUG
                Client = new ServiceBusClient("***REMOVED***");
            #else
                Client = new ServiceBusClient("***REMOVED***");
            #endif
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
