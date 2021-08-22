using Azure.Messaging.ServiceBus;
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateBackgroundService : BackgroundService
    {
        private readonly GameStateQueueService gameStateQueueService;

        public GameStateBackgroundService(GameStateQueueService gameStateQueueService)
        {
            this.gameStateQueueService = gameStateQueueService;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                ServiceBusReceivedMessage receivedMessage = await this.gameStateQueueService.Receiver.ReceiveMessageAsync();

                
            }
        }
    }
}
