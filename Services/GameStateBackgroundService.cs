using Azure.Messaging.ServiceBus;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using PicturePanels.Models;
using System.Threading;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateBackgroundService : BackgroundService
    {
        private readonly GameStateQueueService gameStateQueueService;
        private readonly GameStateService gameStateService;

        public GameStateBackgroundService(GameStateQueueService gameStateQueueService, GameStateService gameStateService)
        {
            this.gameStateQueueService = gameStateQueueService;
            this.gameStateService = gameStateService;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    ServiceBusReceivedMessage receivedMessage = await gameStateQueueService.Receiver.ReceiveMessageAsync(cancellationToken: stoppingToken);
                    if (receivedMessage == null)
                    {
                        continue;
                    }

                    var gameState = await this.gameStateService.GetGameStateAsync();
                    var gameStateUpdate = JsonConvert.DeserializeObject<GameStateUpdateMessage>(receivedMessage.Body.ToString());

                    if (gameState.RoundNumber == gameStateUpdate.RoundNumber &&
                        gameState.TurnType == gameStateUpdate.TurnType &&
                        gameState.TurnNumber == gameStateUpdate.TurnNumber)
                    {
                        await this.gameStateService.SetTurnType(gameState, gameStateUpdate.NewTurnType);
                    }

                    await gameStateQueueService.Receiver.CompleteMessageAsync(receivedMessage, stoppingToken);
                }
                catch
                {

                }
            }
        }
    }
}
