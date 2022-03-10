using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class GameRoundTableStorage : DefaultAzureTableStorage<GameRoundTableEntity>
    {

        public GameRoundTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "gamerounds")
        {

        }
    }
}
