using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class ImageNotApprovedTableStorage : DefaultAzureTableStorage<ImageNotApprovedTableEntity>
    {

        public ImageNotApprovedTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "imagesnotapproved")
        {

        }

        public async Task<ImageNotApprovedTableEntity> GetAsync(string imageId)
        {
            return await this.GetAsync(ImageNotApprovedTableEntity.DefaultPartitionKey, imageId);
        }
    }
}
