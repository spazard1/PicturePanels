using Azure.Messaging.ServiceBus;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Storage;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateBackgroundService : BackgroundService
    {
        private readonly GameStateQueueService gameStateQueueService;
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly GameStateService gameStateService;

        public GameStateBackgroundService(GameStateQueueService gameStateQueueService,
            GameStateTableStorage gameStateTableStorage,
            GameStateService gameStateService)
        {
            this.gameStateQueueService = gameStateQueueService;
            this.gameStateTableStorage = gameStateTableStorage;
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

                    var gameState = await this.gameStateTableStorage.GetAsync();
                    var gameStateUpdate = JsonConvert.DeserializeObject<GameStateUpdateMessage>(receivedMessage.Body.ToString());

                    if (gameState.RoundNumber <= 10 && gameState.IsUpdateAllowed(gameStateUpdate))
                    {
                        await this.gameStateService.ToNextTurnTypeAsync(gameState);
                    }

                    await gameStateQueueService.Receiver.CompleteMessageAsync(receivedMessage, stoppingToken);
                }
                catch(Exception ex)
                {
                    Debug.WriteLine(ex);
                }
            }
        }
    }
}
