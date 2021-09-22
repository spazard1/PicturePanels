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
    }
}
