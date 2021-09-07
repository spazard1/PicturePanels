using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class ActiveGameBoardTableStorage : DefaultAzureTableStorage<ActiveGameBoardTableEntity>
    {

        public ActiveGameBoardTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "activegameboards")
        {

        }
        public async Task<ActiveGameBoardTableEntity> GetAsync(string id)
        {
            return await this.GetAsync(id, id);
        }
    }
}
