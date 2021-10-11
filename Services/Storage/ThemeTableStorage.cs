using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace PicturePanels.Services.Storage
{
    public class ThemeTableStorage : DefaultAzureTableStorage<ThemeTableEntity>
    {

        public ThemeTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "themes")
        {

        }

        public async Task<ThemeTableEntity> GetAsync(string theme)
        {
            return await this.GetAsync(ThemeTableEntity.DefaultPartitionKey, theme);
        }
    }
}
