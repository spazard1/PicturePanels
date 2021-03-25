using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using CloudStorage.Entities;
using CloudStorage.Models;
using Microsoft.Azure.Cosmos.Table;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage;
using Azure.Storage.Blobs.Models;
using System.Reflection.Metadata.Ecma335;

namespace CloudStorage.Services
{
    public class ImageTableStorage
    {
        private readonly IConnectionStringProvider connectionStringProvider;
        private CloudStorageAccount cloudStorageAccount;
        private CloudTable imageTable;
        private BlobServiceClient blobServiceClient;

        public const string DefaultBlobContainer = "pending";

        public ImageTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider, IConnectionStringProvider connectionStringProvider)
        {
            this.connectionStringProvider = connectionStringProvider;
            cloudStorageAccount = cloudStorageAccountProvider.CloudStorageAccount;
            var tableClient = cloudStorageAccount.CreateCloudTableClient();
            imageTable = tableClient.GetTableReference("images");

            blobServiceClient = cloudStorageAccountProvider.BlobServiceClient;
        }

        public async Task Startup()
        {
            await imageTable.CreateIfNotExistsAsync();
        }
        
        public async Task<ImageTableEntity> GetAsync(string blobContainer, string id)
        {
            TableResult retrievedResult = await imageTable.ExecuteAsync(TableOperation.Retrieve<ImageTableEntity>(blobContainer, id));
            return (ImageTableEntity) retrievedResult.Result;
        }

        public async Task<ImageTableEntity> AddOrUpdateAsync(ImageTableEntity image)
        {
            await imageTable.ExecuteAsync(TableOperation.InsertOrReplace(image));

            var blobContainerClient = blobServiceClient.GetBlobContainerClient(image.BlobContainer);
            await blobContainerClient.CreateIfNotExistsAsync();

            return image;
        }

        public async Task DeleteAsync(ImageTableEntity tableEntity)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(tableEntity.BlobContainer);
            var blobClient = blobContainerClient.GetBlobClient(tableEntity.BlobName);
            await blobClient.DeleteIfExistsAsync();

            await imageTable.ExecuteAsync(TableOperation.Delete(tableEntity));
        }

        public async Task SetPlayedTimeAsync(string blobContainer, string imageId)
        {
            var imageTableEntity = await this.GetAsync(blobContainer, imageId);

            imageTableEntity.PlayedTime = DateTime.UtcNow;
            await this.AddOrUpdateAsync(imageTableEntity);
        }

        public async Task<ImageEntity> GetMissingImageTableEntityAsync(GameStateTableEntity gameState)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(gameState.BlobContainer);

            await foreach (var blobItem in blobContainerClient.GetBlobsAsync())
            {
                var found = false;
                foreach (var imageEntity in await this.GetAllImagesAsync(gameState.BlobContainer))
                {
                    if (imageEntity.BlobName == blobItem.Name)
                    {
                        found = true;
                        break;
                    }
                }

                if (!found)
                {
                    return new ImageEntity()
                    {
                        BlobContainer = gameState.BlobContainer,
                        BlobName = blobItem.Name
                    };
                }
            }

            return null;
        }

        public string GetUploadUrl(ImageTableEntity image)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(image.BlobContainer);

            // Create a SAS token that's valid for one hour.
            BlobSasBuilder sasBuilderBlob = new BlobSasBuilder()
            {
                BlobContainerName = blobContainerClient.Name,
                BlobName = image.BlobName,
                Resource = "b",
            };
            sasBuilderBlob.StartsOn = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(15));
            sasBuilderBlob.ExpiresOn = DateTimeOffset.UtcNow.AddHours(1);
            sasBuilderBlob.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Add | BlobSasPermissions.Create);

            // Use the key to get the SAS token.
            var sasToken = sasBuilderBlob.ToSasQueryParameters(new StorageSharedKeyCredential(blobServiceClient.AccountName, connectionStringProvider.AccountKey)).ToString();

            return blobContainerClient.GetBlockBlobClient(image.BlobName).Uri + "?" + sasToken;
        }

        public string GetDownloadUrl(string blobContainer, ImageTableEntity imageEntity)
        {
            return this.GetDownloadUrl(blobContainer, imageEntity.BlobName);
        }

        public string GetDownloadUrl(ImageTableEntity imageEntity)
        {
            return this.GetDownloadUrl(imageEntity.BlobContainer, imageEntity.BlobName);
        }

        public string GetDownloadUrl(string blobContainer, string imageId)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(blobContainer);

            BlobSasBuilder sasBuilderBlob = new BlobSasBuilder()
            {
                BlobContainerName = blobContainer,
                BlobName = imageId,
                Resource = "b",
            };
            sasBuilderBlob.StartsOn = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(15));
            sasBuilderBlob.ExpiresOn = DateTimeOffset.UtcNow.AddHours(24);
            sasBuilderBlob.SetPermissions(BlobSasPermissions.Read);

            // Use the key to get the SAS token.
            var sasToken = sasBuilderBlob.ToSasQueryParameters(new StorageSharedKeyCredential(blobServiceClient.AccountName, connectionStringProvider.AccountKey)).ToString();

            return blobContainerClient.GetBlockBlobClient(imageId).Uri + "?" + sasToken;
        }

        public async Task<ImageTableEntity> MoveToBlobContainerAsync(ImageTableEntity imageTableEntity, string targetBlobContainer)
        {
            var targetBlobContainerClient = blobServiceClient.GetBlobContainerClient(targetBlobContainer);
            var targetCloudBlob = targetBlobContainerClient.GetBlobClient(imageTableEntity.BlobName);

            if (!await targetCloudBlob.ExistsAsync())
            {
                await targetCloudBlob.StartCopyFromUriAsync(new Uri(this.GetDownloadUrl(imageTableEntity)));
            }

            var sourceImageTableEntity = imageTableEntity.Clone();

            imageTableEntity.BlobContainer = targetBlobContainer;
            await this.AddOrUpdateAsync(imageTableEntity);

            await this.DeleteAsync(sourceImageTableEntity);

            return imageTableEntity;
        }

        public async Task<ImageTableEntity> CopyToBlobContainerAsync(ImageTableEntity imageTableEntity, string targetBlobContainer)
        {
            var targetBlobContainerClient = blobServiceClient.GetBlobContainerClient(targetBlobContainer);
            var targetCloudBlob = targetBlobContainerClient.GetBlobClient(imageTableEntity.BlobName);

            if (!await targetCloudBlob.ExistsAsync())
            {
                await targetCloudBlob.StartCopyFromUriAsync(new Uri(this.GetDownloadUrl(imageTableEntity)));
            }

            imageTableEntity.BlobContainer = targetBlobContainer;
            await this.AddOrUpdateAsync(imageTableEntity);

            return imageTableEntity;
        }

        public async Task<List<ImageTableEntity>> GetAllImagesAsync(string blobContainer)
        {
            var imageTableResults = new List<ImageTableEntity>();

            TableQuery<ImageTableEntity> tableQuery = new TableQuery<ImageTableEntity>();

            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<ImageTableEntity> tableQueryResult =
                    await imageTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);

                continuationToken = tableQueryResult.ContinuationToken;

                imageTableResults.AddRange(tableQueryResult.Results.Where(result => result.UploadComplete && result.BlobContainer == blobContainer));
            } while (continuationToken != null);

            return imageTableResults;
        }

        public async Task<List<string>> GetAllBlobContainersAsync()
        {
            var blobContainers = new List<string>();
            await foreach (var blobContainer in blobServiceClient.GetBlobContainersAsync())
            {
                blobContainers.Add(blobContainer.Name);
            }

            return blobContainers;
        }

        public async Task<string> UploadFromStream(string blobContainer, string blobName, Stream imageStream)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(blobContainer);
            await blobContainerClient.CreateIfNotExistsAsync();

            var blob = blobContainerClient.GetBlobClient(blobName);
            await blob.UploadAsync(imageStream, new BlobHttpHeaders() { ContentType = "image/png" });

            return GetDownloadUrl(blobContainer, blobName);
        }

        public async Task<string> UploadTemporaryAsync(Uri url)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient("scratch");
            await blobContainerClient.CreateIfNotExistsAsync();

            var handler = new HttpClientHandler()
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
            };

            var client = new HttpClient(handler);
            var response = await client.GetAsync(url);

            if ((int)response.StatusCode == 401 || (int) response.StatusCode == 403)
            {
                return $"Did not have access to that URL ({response.StatusCode}).";
            }
            else if ((int)response.StatusCode > 400)
            {
                return $"Could not load from from that URL ({response.StatusCode}).";
            }

            var imageId = Guid.NewGuid().ToString();
            var blob = blobContainerClient.GetBlobClient(imageId);

            var bitmap = new Bitmap(await response.Content.ReadAsStreamAsync());
            var memoryStream = new MemoryStream();
            bitmap.Save(memoryStream, ImageFormat.Png);
            memoryStream.Seek(0, SeekOrigin.Begin);
            await blob.UploadAsync(memoryStream, new BlobHttpHeaders() { ContentType = response.Content.Headers.ContentType.MediaType });
            return GetDownloadUrl("scratch", imageId);
        }
    }
}
