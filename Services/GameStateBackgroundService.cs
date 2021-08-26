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
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;

        public GameStateBackgroundService(GameStateQueueService gameStateQueueService,
            GameStateTableStorage gameStateTableStorage,
            IHubContext<SignalRHub, ISignalRHub> hubContext)
        {
            this.gameStateQueueService = gameStateQueueService;
            this.gameStateTableStorage = gameStateTableStorage;
            this.hubContext = hubContext;
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

                    gameState = await this.gameStateTableStorage.ReplaceAsync(gameState,
                    (gs) =>
                    {
                        if (gs.RoundNumber == gameStateUpdate.RoundNumber &&
                            gs.TurnType == gameStateUpdate.TurnType &&
                            gs.TurnNumber == gameStateUpdate.TurnNumber)
                        {
                            gs.SetTurnType(gameStateUpdate.NewTurnType);
                            return true;
                        }
                        return false;
                    });

                    if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
                    {
                        
                    }
                    await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

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
