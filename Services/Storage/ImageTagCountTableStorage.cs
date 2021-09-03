using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class ImageTagCountTableStorage : DefaultAzureTableStorage<ImageTagCountTableEntity>
    {

        public ImageTagCountTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "imagetagcounts")
        {

        }
    }
}
