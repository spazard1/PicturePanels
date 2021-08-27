using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class GameRoundsTableStorage : DefaultAzureTableStorage<GameRoundsTableEntity>
    {

        public GameRoundsTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "gamerounds")
        {

        }
    }
}
