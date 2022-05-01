using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace PicturePanels.Services.Storage
{
    public class PlayerTableStorage : DefaultAzureTableStorage<PlayerTableEntity>
    {
        public const int PlayerTimeoutInMinutes = 3;

        public PlayerTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "players")
        {

        }

        public IAsyncEnumerable<PlayerTableEntity> GetActivePlayersAsync(string gameStateId)
        {
            var players = this.GetAllFromPartitionAsync(gameStateId);
            players = players.Where(player => !player.IsAdmin && player.LastPingTime > DateTime.UtcNow.Subtract(TimeSpan.FromMinutes(PlayerTimeoutInMinutes)));
            return players;
        }

        public IAsyncEnumerable<PlayerTableEntity> GetActivePlayersAsync(string gameStateId, int teamNumber)
        {
            var players = GetActivePlayersAsync(gameStateId);
            players = players.Where(player => player.TeamNumber == teamNumber);
            return players;
        }

        public async Task<Dictionary<string, PlayerTableEntity>> GetAllPlayersDictionaryAsync(string gameStateId)
        {
            var players = GetAllFromPartitionAsync(gameStateId);
            var playerDictionary = new Dictionary<string, PlayerTableEntity>();

            await foreach (var player in players)
            {
                playerDictionary[player.PlayerId] = player;
            }

            return playerDictionary;
        }

        public async Task ResetPlayersAsync(string gameStateId)
        {
            TableBatchOperation batchOperation = new TableBatchOperation();
            await foreach (var playerModel in this.GetActivePlayersAsync(gameStateId))
            {
                if (batchOperation.Count >= 100)
                {
                    await cloudTable.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }

                playerModel.SelectedPanels = new List<string>();
                playerModel.IsReady = false;
                playerModel.TeamGuessVote = null;

                batchOperation.Add(TableOperation.InsertOrReplace(playerModel));
            }

            if (batchOperation.Count > 0)
            {
                await cloudTable.ExecuteBatchAsync(batchOperation);
            }
        }

        public override async Task<PlayerTableEntity> InsertAsync(PlayerTableEntity tableEntity)
        {
            if (string.IsNullOrWhiteSpace(tableEntity.Color))
            {
                tableEntity.Color = GenerateRandomColor(tableEntity.PlayerId);
            }
            return await base.InsertAsync(tableEntity);
        }

        private string GenerateRandomColor(string playerId)
        {
            var random = new Random(playerId.GetHashCode());
            return "hsl(" + random.Next(0, 360) + "," + random.Next(70, 100) + "%," + random.Next(75, 100) + "%)";
        }
    }
}
