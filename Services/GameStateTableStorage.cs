using PicturePanels.Models;
using Microsoft.Azure.Cosmos.Table;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace PicturePanels.Services
{
    public class GameStateTableStorage
    {

        private readonly CloudStorageAccount CloudStorageAccount;
        private readonly CloudTable gameTable;

        public GameStateTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider)
        {
            CloudStorageAccount = cloudStorageAccountProvider.CloudStorageAccount;
            var tableClient = CloudStorageAccount.CreateCloudTableClient();
            gameTable = tableClient.GetTableReference("gamestates");
        }

        public async Task Startup()
        {
            await gameTable.CreateIfNotExistsAsync();
        }

        public async Task<GameStateTableEntity> GetGameStateAsync()
        {
            TableResult retrievedResult = await gameTable.ExecuteAsync(TableOperation.Retrieve<GameStateTableEntity>(GameStateTableEntity.GameStatePartitionKey, GameStateTableEntity.GameStateDefaultId));
            return (GameStateTableEntity)retrievedResult.Result;
        }

        public async Task<GameStateTableEntity> AddOrUpdateGameStateAsync(GameStateTableEntity tableEntity)
        {
            if (string.IsNullOrWhiteSpace(tableEntity.Id))
            {
                tableEntity.Id = GameStateTableEntity.GameStateDefaultId;
            }

            await gameTable.ExecuteAsync(TableOperation.InsertOrReplace(tableEntity));
            return tableEntity;
        }
    }
}
