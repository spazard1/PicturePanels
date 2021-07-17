using CloudStorage.Models;
using CloudStorage.Services;
using Microsoft.Azure.Cosmos.Table;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameTableStorage
    {

        private CloudStorageAccount cloudStorageAccount;
        private CloudTable gameTable;

        public GameTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider)
        {
            cloudStorageAccount = cloudStorageAccountProvider.CloudStorageAccount;
            var tableClient = cloudStorageAccount.CreateCloudTableClient();
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
