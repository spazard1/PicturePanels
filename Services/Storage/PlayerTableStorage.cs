using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services.Storage
{
    public class PlayerTableStorage : DefaultAzureTableStorage<PlayerTableEntity>
    {
        public const int PlayerTimeoutInMinutes = 5;

        public PlayerTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "players")
        {

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

                await this.InsertAsync(playerModel);
            }
        }

        public async Task<PlayerTableEntity> GetAsync(string playerId)
        {
            return await this.GetAsync(PlayerTableEntity.Players, playerId);
        }

        public async Task<List<PlayerTableEntity>> GetActivePlayersAsync()
        {
            var players = await this.GetAllAsync();
            players.RemoveAll(player => player.IsAdmin || player.LastPingTime < DateTime.UtcNow.Subtract(TimeSpan.FromMinutes(PlayerTimeoutInMinutes)));
            return players;
        }

        public async Task<List<PlayerTableEntity>> GetActivePlayersAsync(int teamNumber)
        {
            var players = await GetActivePlayersAsync();
            players.RemoveAll(player => player.TeamNumber != teamNumber);
            return players;
        }

        public async Task<Dictionary<string, PlayerTableEntity>> GetAllPlayersDictionaryAsync()
        {
            var players = await this.GetAllAsync();
            var playerDictionary = new Dictionary<string, PlayerTableEntity>();

            foreach (var player in players)
            {
                playerDictionary[player.PlayerId] = player;
            }

            return playerDictionary;
        }

        public async Task ResetPlayersAsync()
        {
            TableBatchOperation batchOperation = new TableBatchOperation();
            foreach (var playerModel in await this.GetActivePlayersAsync())
            {
                if (batchOperation.Count >= 100)
                {
                    await cloudTable.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }

                playerModel.SelectedPanels = new List<string>();
                playerModel.IsReady = false;

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
