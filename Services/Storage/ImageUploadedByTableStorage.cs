using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class ImageUploadedByTableStorage : DefaultAzureTableStorage<ImageUploadedByTableEntity>
    {

        public ImageUploadedByTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "imageuploadedbys")
        {

        }
    }
}
