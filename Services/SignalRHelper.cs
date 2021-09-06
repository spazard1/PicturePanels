using PicturePanels.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PicturePanels.Services.Storage;

namespace PicturePanels.Services
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

        public async Task PlayerPingAsync(string gameStateId)
        {
            if (LastGameboardPlayerUpdate.AddSeconds(30) < DateTime.UtcNow)
            {
                LastGameboardPlayerUpdate = DateTime.UtcNow;

                var allPlayers = await this.playerTableStorage.GetActivePlayersAsync(gameStateId).ToListAsync();
                await this.hubContext.Clients.Group(SignalRHub.GetGameBoardGroupName(gameStateId)).Players(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
            }
        }

        public async Task AddPlayerToTeamGroupAsync(PlayerTableEntity playerModel, bool notifyTeam)
        {
            await this.hubContext.Clients.Group(SignalRHub.GetGameBoardGroupName(playerModel.GameStateId)).AddPlayer(new PlayerEntity(playerModel));

            if (playerModel.IsAdmin)
            {
                await this.hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.GetTeamGroupName(playerModel.GameStateId, 1));
                await this.hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.GetTeamGroupName(playerModel.GameStateId, 2));
                return;
            }

            if (playerModel.TeamNumber == 1)
            {
                if (!string.IsNullOrWhiteSpace(playerModel.ConnectionId))
                {
                    var remove = this.hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.GetTeamGroupName(playerModel.GameStateId, 2));
                    await this.hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.GetTeamGroupName(playerModel.GameStateId, 1));
                }
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(playerModel.ConnectionId))
                {
                    var remove = this.hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.GetTeamGroupName(playerModel.GameStateId, 1));
                    await this.hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.GetTeamGroupName(playerModel.GameStateId, 2));
                }

            }

            if (notifyTeam)
            {
                await this.hubContext.Clients.Group(playerModel.SignalRTeamGroupName).AddPlayer(new PlayerEntity(playerModel));
            }
        }

        public async Task RandomizeTeamsAsync(string gameStateId)
        {
            var tasks = new List<Task>();
            var rand = new Random();
            var teamNumber = rand.Next(1, 3);
            TableBatchOperation batchOperation = new TableBatchOperation();

            await foreach (var playerModelIteration in this.playerTableStorage.GetActivePlayersAsync(gameStateId).OrderBy(playerEntity => rand.Next()))
            {
                if (batchOperation.Count >= 100)
                {
                    await playerTableStorage.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }
                var playerModel = playerModelIteration;
                var changedTeams = playerModel.TeamNumber != teamNumber;
                playerModel.TeamNumber = teamNumber;
                playerModel.SelectedPanels = new List<string>();
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
            var allPlayers = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
            await foreach (var playerModel in allPlayers)
            {
                if (!string.IsNullOrWhiteSpace(playerModel.ConnectionId))
                {
                    tasks.Add(hubContext.Clients.Client(playerModel.ConnectionId).RandomizeTeam(new PlayerEntity(playerModel)));
                }
            }
            tasks.Add(hubContext.Clients.Group(SignalRHub.GetGameBoardGroupName(gameStateId)).Players(await allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToListAsync()));

            await Task.WhenAll(tasks);
        }

        public async Task AddTeamGuessAsync(string gameStateId, TeamGuessEntity teamGuessEntity, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.GetTeamGroupName(gameStateId, teamNumber)).AddTeamGuess(teamGuessEntity);
        }

        public async Task DeleteTeamGuessAsync(string gameStateId, TeamGuessEntity teamGuessEntity, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.GetTeamGroupName(gameStateId, teamNumber)).DeleteTeamGuess(teamGuessEntity);
        }

        public async Task ChatAsync(ChatEntity chatEntity, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.GetTeamGroupName(chatEntity.GameStateId, teamNumber)).Chat(chatEntity);
        }

        public async Task ChatAsync(ChatEntity chatEntity)
        {
            await hubContext.Clients.Group(SignalRHub.GetTeamGroupName(chatEntity.GameStateId, int.Parse(chatEntity.TeamNumber))).Chat(chatEntity);
        }

        public async Task VoteTeamGuessAsync(string gameStateId, string oldVote, string newVote, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.GetTeamGroupName(gameStateId, teamNumber)).VoteTeamGuess(oldVote, newVote);
        }

        public async Task ClearPlayerReadyAsync(PlayerTableEntity playerModel)
        {
            await hubContext.Clients.Group(playerModel.SignalRTeamGroupName).PlayerReady(null);
        }

        public async Task PlayerReadyAsync(PlayerTableEntity playerModel)
        {
            await hubContext.Clients.Group(playerModel.SignalRTeamGroupName).PlayerReady(new PlayerEntity(playerModel));
        }
    }
}
