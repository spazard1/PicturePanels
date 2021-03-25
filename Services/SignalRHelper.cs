using CloudStorage.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.Cosmos.Table;
using PictureGame.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PictureGame.Services
{
    public class SignalRHelper
    {
        public static DateTime LastGameboardPlayerUpdate = DateTime.MinValue;

        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly PlayerTableStorage playerTableStorage;

        public SignalRHelper(IHubContext<SignalRHub, ISignalRHub> hubContext, PlayerTableStorage playerTableStorage)
        {
            this.hubContext = hubContext;
            this.playerTableStorage = playerTableStorage;
        }

        public async Task PlayerPingAsync()
        {
            if (LastGameboardPlayerUpdate.AddSeconds(30) < DateTime.UtcNow)
            {
                LastGameboardPlayerUpdate = DateTime.UtcNow;

                var allPlayers = await this.playerTableStorage.GetPlayersAsync();
                await this.hubContext.Clients.Group(SignalRHub.GameBoardGroup).Players(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
            }
        }

        public async Task AddPlayerToTeamGroupAsync(PlayerTableEntity playerModel, bool notifyTeam)
        {
            await this.hubContext.Clients.Group(SignalRHub.GameBoardGroup).AddPlayer(new PlayerEntity(playerModel));

            if (playerModel.TeamNumber == 1)
            {
                if (!string.IsNullOrWhiteSpace(playerModel.ConnectionId))
                {
                    var remove = this.hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamTwoGroup);
                    await this.hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamOneGroup);
                }
                if (notifyTeam)
                {
                    await this.hubContext.Clients.Group(SignalRHub.TeamOneGroup).AddPlayer(new PlayerEntity(playerModel));
                }
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(playerModel.ConnectionId))
                {
                    var remove = this.hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamOneGroup);
                    await this.hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamTwoGroup);
                }
                if (notifyTeam)
                {
                    await this.hubContext.Clients.Group(SignalRHub.TeamTwoGroup).AddPlayer(new PlayerEntity(playerModel));
                }
            }
        }

        public async Task RandomizeTeamsAsync()
        {
            var tasks = new List<Task>();
            var rand = new Random();
            var teamNumber = rand.Next(1, 3);
            TableBatchOperation batchOperation = new TableBatchOperation();

            foreach (var playerModelIteration in (await this.playerTableStorage.GetPlayersAsync()).OrderBy(playerEntity => rand.Next()))
            {
                if (batchOperation.Count >= 100)
                {
                    await playerTableStorage.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }
                var playerModel = playerModelIteration;
                var changedTeams = playerModel.TeamNumber != teamNumber;
                playerModel.TeamNumber = teamNumber;
                playerModel.SelectedTiles = new List<string>();
                teamNumber = teamNumber == 1 ? 2 : 1;

                batchOperation.Add(TableOperation.InsertOrReplace(playerModel));

                tasks.Add(this.AddPlayerToTeamGroupAsync(playerModel, changedTeams));
            }

            if (batchOperation.Count > 0)
            {
                await playerTableStorage.ExecuteBatchAsync(batchOperation);
            }

            await Task.WhenAll(tasks);

            // notify of the new teams
            tasks = new List<Task>();
            var allPlayers = await this.playerTableStorage.GetPlayersAsync();
            foreach (var playerModel in allPlayers)
            {
                if (!string.IsNullOrWhiteSpace(playerModel.ConnectionId))
                {
                    tasks.Add(hubContext.Clients.Client(playerModel.ConnectionId).RandomizeTeam(new PlayerEntity(playerModel)));
                }
            }
            tasks.Add(hubContext.Clients.Group(SignalRHub.GameBoardGroup).Players(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList()));

            await Task.WhenAll(tasks);
        }
    }
}
