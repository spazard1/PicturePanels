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
        private readonly ActiveGameBoardTableStorage activeGameBoardTableStorage;
        private readonly GameStateService gameStateService;

        public GameStateBackgroundService(GameStateQueueService gameStateQueueService,
            GameStateTableStorage gameStateTableStorage,
            ActiveGameBoardTableStorage activeGameBoardTableStorage,
            GameStateService gameStateService)
        {
            this.gameStateQueueService = gameStateQueueService;
            this.gameStateTableStorage = gameStateTableStorage;
            this.activeGameBoardTableStorage = activeGameBoardTableStorage;
            this.gameStateService = gameStateService;
        }

        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                ServiceBusReceivedMessage receivedMessage = null;
                try
                {
                    receivedMessage = await gameStateQueueService.Receiver.ReceiveMessageAsync(cancellationToken: stoppingToken);
                    if (receivedMessage == null)
                    {
                        continue;
                    }

                    var gameStateUpdate = JsonConvert.DeserializeObject<GameStateUpdateMessage>(receivedMessage.Body.ToString());
                    var gameState = await this.gameStateTableStorage.GetAsync(gameStateUpdate.GameStateId);
                    if (gameState == null)
                    {
                        continue;
                    }

                    var activeGameBoard = await this.activeGameBoardTableStorage.GetAsync(gameState.GameStateId);
                    if (activeGameBoard == null || activeGameBoard.PingTime.AddSeconds(30) < DateTime.UtcNow)
                    {
                        continue;
                    }

                    if (gameState.IsUpdateAllowed(gameStateUpdate))
                    {
                        await this.gameStateService.ToNextTurnTypeAsync(gameState);
                    }
                }
                catch(Exception ex)
                {
                    Debug.WriteLine(ex);
                }
                finally
                {
                    if (receivedMessage != null)
                    {
                        await gameStateQueueService.Receiver.CompleteMessageAsync(receivedMessage, stoppingToken);
                    }
                }
            }
        }
    }
}
