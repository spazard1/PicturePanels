using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class ImageTagTableStorage : DefaultAzureTableStorage<ImageTagTableEntity>
    {

        public ImageTagTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "imagetagcounts")
        {

        }

        public Task<ImageTagTableEntity> GetAsync(string rowKey)
        {
            return this.GetAsync(ImageTagTableEntity.DefaultPartitionKey, rowKey);
        }

        public IAsyncEnumerable<ImageTagTableEntity> GetAllVisbileTags()
        {
            var imageTags = this.GetAllAsync();
            return imageTags.Where(it => !it.IsHidden);
        }

        public async Task<Dictionary<string, ImageTagTableEntity>> GetAllTagsDictionaryAsync()
        {
            var imageTagDictionary = new Dictionary<string, ImageTagTableEntity>();

            await foreach (var imageTag in GetAllAsync())
            {
                imageTagDictionary[imageTag.Tag] = imageTag;
            }

            return imageTagDictionary;
        }
    }
}
