﻿using Azure.Messaging.ServiceBus;
using Newtonsoft.Json;
using PicturePanels.Models;
using System;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateQueueService
    {
        public ServiceBusSender Sender { get; }
        public ServiceBusReceiver Receiver { get; }

        public GameStateQueueService()
        {
            var client = new ServiceBusClient("Endpoint=sb://picturepanels.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=TJLwj1a8CdqLrFrJeBaAGuUwulEbe9GbhHwK8WhQGdQ=");

            Sender = client.CreateSender("gamestateupdates");
            Receiver = client.CreateReceiver("gamestateupdates");
        }

        public async Task QueueGameStateChangeAsync(GameStateTableEntity gameState)
        {
            if (!gameState.TurnEndTime.HasValue)
            {
                return;
            }

            var message = new ServiceBusMessage(JsonConvert.SerializeObject(new GameStateUpdateMessage(gameState)));

            // add a small extra grace period
            await this.Sender.ScheduleMessageAsync(message, gameState.TurnEndTime.Value.Subtract(TimeSpan.FromSeconds(1)));
        }
    }
}
