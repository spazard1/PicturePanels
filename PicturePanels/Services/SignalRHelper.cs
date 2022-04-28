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
                await this.hubContext.Clients.Group(SignalRHub.GameBoardGroup(gameStateId)).Players(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
            }
        }

        /*
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
            tasks.Add(hubContext.Clients.Group(SignalRHub.GameBoardGroup(gameStateId)).Players(await allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToListAsync()));

            await Task.WhenAll(tasks);
        }
        */

        public async Task AddPlayerAsync(PlayerTableEntity playerModel)
        {
            await hubContext.Clients.Group(SignalRHub.GameBoardGroup(playerModel.GameStateId)).AddPlayer(new PlayerEntity(playerModel));
            await hubContext.Clients.Group(playerModel.SignalRTeamGroupName).AddPlayer(new PlayerEntity(playerModel));
        }

        public async Task AddTeamGuessAsync(string gameStateId, TeamGuessEntity teamGuessEntity, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.TeamGroup(gameStateId, teamNumber)).AddTeamGuess(teamGuessEntity);
        }

        public async Task AddTeamGuessAsync(string gameStateId, TeamGuessEntity teamGuessEntity, int teamNumber, string startingPlayerId)
        {
            await hubContext.Clients.Group(SignalRHub.TeamGroup(gameStateId, teamNumber)).AddTeamGuess(teamGuessEntity, startingPlayerId);
        }

        public async Task DeleteTeamGuessAsync(string gameStateId, TeamGuessEntity teamGuessEntity, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.TeamGroup(gameStateId, teamNumber)).DeleteTeamGuess(teamGuessEntity);
        }

        public async Task ChatAsync(ChatEntity chatEntity)
        {
            await hubContext.Clients.Group(SignalRHub.TeamGroup(chatEntity.GameStateId, int.Parse(chatEntity.TeamNumber))).Chat(chatEntity);
        }

        public async Task VoteTeamGuessAsync(string gameStateId, string playerId, string oldVote, string newVote, int teamNumber)
        {
            await hubContext.Clients.Group(SignalRHub.TeamGroup(gameStateId, teamNumber)).VoteTeamGuess(oldVote, newVote, playerId);
        }

        public async Task ClearPlayerReadyAsync(PlayerTableEntity playerModel)
        {
            await hubContext.Clients.Group(playerModel.SignalRTeamGroupName).PlayerReady(null);
        }

        public async Task PlayerReadyAsync(PlayerTableEntity playerModel)
        {
            await hubContext.Clients.Group(playerModel.SignalRTeamGroupName).PlayerReady(new PlayerEntity(playerModel));
        }

        public async Task SwitchTeamGroupsAsync(PlayerTableEntity playerModel)
        {
            if (playerModel.TeamNumber == 1)
            {
                await hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 2));
                await hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 1));
            }
            else
            {
                await hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 1));
                await hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 2));
            }
        }
    }
}
