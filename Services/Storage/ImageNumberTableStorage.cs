using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class ImageNumberTableStorage : DefaultAzureTableStorage<ImageNumberTableEntity>
    {

        public ImageNumberTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "imagenumbers")
        {

        }
    }
}
