using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class GameStateTableStorage : DefaultAzureTableStorage<GameStateTableEntity>
    {

        public GameStateTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "gamestates")
        {

        }

        public async Task<GameStateTableEntity> GetAsync()
        {
            return await this.GetAsync(GameStateTableEntity.GameStatePartitionKey, GameStateTableEntity.GameStateDefaultId);
        }
    }
}
