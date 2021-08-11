using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class PlayerTableStorage
    {
        public const int PlayerTimeoutInMinutes = 5;

        private CloudStorageAccount CloudStorageAccount;
        private CloudTable playerTable;

        public PlayerTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider)
        {
            CloudStorageAccount = cloudStorageAccountProvider.CloudStorageAccount;
            var tableClient = CloudStorageAccount.CreateCloudTableClient();
            playerTable = tableClient.GetTableReference("players");
        }

        public async Task CreatePlayerAsync()
        {
            for (int i = 0; i < 50; i++)
            {
                var playerModel = new PlayerTableEntity()
                {
                    PlayerId = Guid.NewGuid().ToString(),
                    Name = "Player " + i,
                    TeamNumber = i % 2,
                    LastPingTime = DateTime.UtcNow
                };

                await this.AddOrUpdatePlayerAsync(playerModel);
            }
        }

        public async Task Startup()
        {
            await playerTable.CreateIfNotExistsAsync();  
        }

        public async Task<PlayerTableEntity> GetPlayerAsync(string playerId)
        {
            TableResult retrievedResult = await playerTable.ExecuteAsync(TableOperation.Retrieve<PlayerTableEntity>(PlayerTableEntity.Players, playerId));
            return (PlayerTableEntity)retrievedResult.Result;
        }

        public async Task<List<PlayerTableEntity>> GetActivePlayersAsync()
        {
            var playerResults = new List<PlayerTableEntity>();

            TableQuery<PlayerTableEntity> tableQuery = new TableQuery<PlayerTableEntity>();
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<PlayerTableEntity> tableQueryResult =
                    await playerTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);

                continuationToken = tableQueryResult.ContinuationToken;

                playerResults.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            playerResults.RemoveAll(player => player.IsAdmin || player.LastPingTime < DateTime.UtcNow.Subtract(TimeSpan.FromMinutes(PlayerTimeoutInMinutes)));

            return playerResults;
        }

        public async Task<List<PlayerTableEntity>> GetActivePlayersAsync(int teamNumber)
        {
            var players = await GetActivePlayersAsync();
            players.RemoveAll(player => player.TeamNumber != teamNumber);
            return players;
        }

        public async Task<Dictionary<string, PlayerTableEntity>> GetAllPlayersDictionaryAsync()
        {
            var playerResults = new Dictionary<string, PlayerTableEntity>();

            TableQuery<PlayerTableEntity> tableQuery = new TableQuery<PlayerTableEntity>();
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<PlayerTableEntity> tableQueryResult =
                    await playerTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);

                continuationToken = tableQueryResult.ContinuationToken;

                foreach (var result in tableQueryResult.Results)
                {
                    playerResults[result.PlayerId] = result;
                }

            } while (continuationToken != null);

            return playerResults;
        }

        public async Task ResetPlayersAsync()
        {
            TableBatchOperation batchOperation = new TableBatchOperation();
            foreach (var playerModel in await this.GetActivePlayersAsync())
            {
                if (batchOperation.Count >= 100)
                {
                    await playerTable.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }

                playerModel.SelectedPanels = new List<string>();
                batchOperation.Add(TableOperation.InsertOrReplace(playerModel));
            }

            if (batchOperation.Count > 0)
            {
                await playerTable.ExecuteBatchAsync(batchOperation);
            }
        }

        public async Task ExecuteBatchAsync(TableBatchOperation tableBatchOperation)
        {
            await playerTable.ExecuteBatchAsync(tableBatchOperation);
        }

        public async Task<PlayerTableEntity> AddOrUpdatePlayerAsync(PlayerTableEntity tableEntity)
        {
            if (string.IsNullOrWhiteSpace(tableEntity.Color))
            {
                tableEntity.Color = GenerateRandomColor(tableEntity.PlayerId);
            }
            await playerTable.ExecuteAsync(TableOperation.InsertOrReplace(tableEntity));
            return tableEntity;
        }

        public async Task DeletePlayerAsync(PlayerTableEntity tableEntity)
        {
            await playerTable.ExecuteAsync(TableOperation.Delete(tableEntity));
        }

        private string GenerateRandomColor(string playerId)
        {
            var random = new Random(playerId.GetHashCode());
            return "hsl(" + random.Next(0, 360) + "," + random.Next(70, 100) + "%," + random.Next(75, 100) + "%)";
        }
    }
}
