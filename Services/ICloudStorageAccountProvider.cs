using Azure.Storage.Blobs;
using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public interface ICloudStorageAccountProvider
    {
        CloudStorageAccount CloudStorageAccount { get; }

        BlobServiceClient BlobServiceClient { get; }
    }
}
