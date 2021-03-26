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
using System.Drawing.Drawing2D;

namespace CloudStorage.Services
{
    public class ImageTableStorage
    {
        private readonly IConnectionStringProvider connectionStringProvider;
        private CloudStorageAccount cloudStorageAccount;
        private CloudTable imageTable;
        private BlobServiceClient blobServiceClient;

        public const string DefaultBlobContainer = "pending";
        public const string ScratchBlobContainer = "scratch";
        public const string ThumbnailsBlobContainer = "thumbnails";
        public const string WelcomeBlobContainer = "welcome";

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
            blobContainers.Remove(ScratchBlobContainer);
            blobContainers.Remove(ThumbnailsBlobContainer);
            blobContainers.Remove(WelcomeBlobContainer);

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
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(ScratchBlobContainer);
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
            else if ((int)response.StatusCode >= 400)
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
            return GetDownloadUrl(ScratchBlobContainer, imageId);
        }

        public async Task<string> GetThumbnailUrlAsync(ImageTableEntity entity)
        {
            if (entity.ThumbnailId?.StartsWith("skip") == true)
            {
                return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName);
            }

            if (!string.IsNullOrWhiteSpace(entity.ThumbnailId))
            {
                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId);
            }

            var blobContainerThumbnail = blobServiceClient.GetBlobContainerClient(ThumbnailsBlobContainer);
            var blobThumbnail = blobContainerThumbnail.GetBlobClient(entity.ThumbnailId);
            if (await blobThumbnail.ExistsAsync())
            {
                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId);
            }

            try
            {
                var blobContainerClient = blobServiceClient.GetBlobContainerClient(entity.BlobContainer);
                var blob = blobContainerClient.GetBlobClient(entity.BlobName);

                var imageMemoryStream = new MemoryStream();
                await blob.DownloadToAsync(imageMemoryStream);

                var image = Image.FromStream(imageMemoryStream);

                if (image.Width < 500 || image.Height < 500)
                {
                    entity.ThumbnailId = "skip - too small";
                    await this.AddOrUpdateAsync(entity);
                    return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName);
                }

                double scale = .2;
                var resizedImage = ResizeImage(image, (int)Math.Ceiling(image.Width * scale), (int)Math.Ceiling(image.Height * scale));
                var memoryStream = new MemoryStream();
                resizedImage.Save(memoryStream, ImageFormat.Png);
                memoryStream.Seek(0, SeekOrigin.Begin);

                var thumbnailId = Guid.NewGuid().ToString();
                var blobResized = blobContainerThumbnail.GetBlobClient(thumbnailId);
                await blobResized.UploadAsync(memoryStream, new BlobHttpHeaders() { ContentType = "image/png" });

                entity.ThumbnailId = thumbnailId;
                await this.AddOrUpdateAsync(entity);

                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId);
            }
            catch
            {
                entity.ThumbnailId = "skip - failed";
                await this.AddOrUpdateAsync(entity);
                return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName);
            }
        }

        /// <summary>
        /// Resize the image to the specified width and height.
        /// </summary>
        /// <param name="image">The image to resize.</param>
        /// <param name="width">The width to resize to.</param>
        /// <param name="height">The height to resize to.</param>
        /// <returns>The resized image.</returns>
        public static Bitmap ResizeImage(Image image, int width, int height)
        {
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }
    }
}
