using System;
using System.Threading.Tasks;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class UserPlayedImageTableStorage : DefaultAzureTableStorage<ImageNumberTableEntity>
    {

        public UserPlayedImageTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "userplayedimages")
        {

        }
    }
}
