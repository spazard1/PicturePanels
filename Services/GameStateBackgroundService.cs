using Azure.Messaging.ServiceBus;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
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
            var options = new ServiceBusProcessorOptions
            {
                PrefetchCount = 10,
                MaxConcurrentCalls = 10
            };
            await using ServiceBusProcessor processor = this.gameStateQueueService.Client.CreateProcessor("gamestateupdates", options);

            processor.ProcessMessageAsync += MessageHandler;
            processor.ProcessErrorAsync += ErrorHandler;

            await processor.StartProcessingAsync(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }

            await processor.CloseAsync(stoppingToken);
        }

        private  Task ErrorHandler(ProcessErrorEventArgs args)
        {
            Console.WriteLine(args.Exception);
            return Task.CompletedTask;
        }

        private async Task MessageHandler(ProcessMessageEventArgs args)
        {
            var receivedMessage = args.Message;
            if (receivedMessage == null)
            {
                return;
            }

            var gameStateUpdate = JsonConvert.DeserializeObject<GameStateUpdateMessage>(receivedMessage.Body.ToString());
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateUpdate.GameStateId);
            if (gameState == null || !gameState.TurnEndTime.HasValue || !gameState.IsUpdateAllowed(gameStateUpdate))
            {
                return;
            }

            var activeGameBoard = await this.activeGameBoardTableStorage.GetAsync(gameState.GameStateId);
            if (activeGameBoard == null || activeGameBoard.PingTime.AddSeconds(30) < DateTime.UtcNow)
            {
                return;
            }

            var delayTime = gameState.TurnEndTime.Value - DateTime.UtcNow;
            if (delayTime.TotalMilliseconds > 0)
            {
                await Task.Delay(delayTime, args.CancellationToken);
            }

            await this.gameStateService.ToNextTurnTypeAsync(gameState);
        }
    }
}
