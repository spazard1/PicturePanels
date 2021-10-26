using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using PicturePanels.Models;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage;
using Azure.Storage.Blobs.Models;
using System.Drawing.Drawing2D;
using PicturePanels.Entities;

namespace PicturePanels.Services.Storage
{
    public class ImageTableStorage : DefaultAzureTableStorage<ImageTableEntity>
    {
        private readonly IConnectionStringProvider connectionStringProvider;
        private BlobServiceClient blobServiceClient;

        public const int ThumbnailCacheDays = 90;
        public const int Across = 5;
        public const int Down = 4;
        public const string DefaultBlobContainer = "pending";
        public const string ScratchBlobContainer = "scratch";
        public const string ThumbnailsBlobContainer = "thumbnails";
        public const string PanelsBlobContainer = "panels";
        public const string WelcomeGameStateId = "welcome";
        public const string WelcomeImageId = "17d941da-39ae-43c0-a940-3dc1c1ffda7c";

        public ImageTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider, IConnectionStringProvider connectionStringProvider) : base(cloudStorageAccountProvider, "images")
        {
            this.connectionStringProvider = connectionStringProvider;
            blobServiceClient = cloudStorageAccountProvider.BlobServiceClient;
        }

        public async Task<ImageTableEntity> GetAsync(string imageId)
        {
            return await this.GetAsync(ImageTableEntity.DefaultPartitionKey, imageId);
        }

        public override async Task DeleteAsync(ImageTableEntity tableEntity)
        {
            if (!string.IsNullOrWhiteSpace(tableEntity.BlobContainer) && !string.IsNullOrWhiteSpace(tableEntity.BlobName))
            {
                var blobContainerClient = blobServiceClient.GetBlobContainerClient(tableEntity.BlobContainer);
                var blobClient = blobContainerClient.GetBlobClient(tableEntity.BlobName);
                await blobClient.DeleteIfExistsAsync();
            }

            await base.DeleteAsync(tableEntity);
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
            return GetDownloadUrl(blobContainer, imageId, DateTime.UtcNow.AddHours(1));
        }

        public string GetDownloadUrl(string blobContainer, string imageId, DateTime expirationTime)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(blobContainer);

            BlobSasBuilder sasBuilderBlob = new BlobSasBuilder()
            {
                BlobContainerName = blobContainer,
                BlobName = imageId,
                Resource = "b",
            };
            sasBuilderBlob.StartsOn = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(15));
            sasBuilderBlob.ExpiresOn = expirationTime;
            sasBuilderBlob.SetPermissions(BlobSasPermissions.Read);

            // Use the key to get the SAS token.
            var sasToken = sasBuilderBlob.ToSasQueryParameters(new StorageSharedKeyCredential(blobServiceClient.AccountName, connectionStringProvider.AccountKey)).ToString();

            return blobContainerClient.GetBlockBlobClient(imageId).Uri + "?" + sasToken;
        }

        public async Task CopyToBlobContainerAsync(ImageTableEntity imageTableEntity, string targetBlobContainer)
        {
            var targetBlobContainerClient = blobServiceClient.GetBlobContainerClient(targetBlobContainer);
            await targetBlobContainerClient.CreateIfNotExistsAsync();
            var targetCloudBlob = targetBlobContainerClient.GetBlobClient(imageTableEntity.BlobName);

            if (await targetCloudBlob.ExistsAsync())
            {
                return;   
            }

            await targetCloudBlob.StartCopyFromUriAsync(new Uri(this.GetDownloadUrl(imageTableEntity)));
        }

        public async Task<bool> MoveToBlobContainerAsync(string sourceBlobContainer, string sourceBlobName, string targetBlobContainer, string targetBlobName)
        {
            var targetBlobContainerClient = blobServiceClient.GetBlobContainerClient(targetBlobContainer);
            await targetBlobContainerClient.CreateIfNotExistsAsync();
            var targetCloudBlob = targetBlobContainerClient.GetBlobClient(targetBlobName);

            var sourceBlobContainerClient = blobServiceClient.GetBlobContainerClient(sourceBlobContainer);
            var sourceCloudBlob = sourceBlobContainerClient.GetBlobClient(sourceBlobName);

            if (!await sourceCloudBlob.ExistsAsync())
            {
                return false;
            }

            if (await targetCloudBlob.ExistsAsync())
            {
                return true;
            }

            if (sourceBlobName == targetBlobName)
            {
                return true;
            }

            await targetCloudBlob.StartCopyFromUriAsync(new Uri(this.GetDownloadUrl(sourceBlobContainer, sourceBlobName)));

            await sourceCloudBlob.DeleteIfExistsAsync();

            return true;
        }

        public async Task CopyImageFromScratchAsync(ImageTableEntity imageTableEntity)
        {
            var targetBlobContainerClient = blobServiceClient.GetBlobContainerClient(imageTableEntity.BlobContainer);
            await targetBlobContainerClient.CreateIfNotExistsAsync();
            var targetCloudBlob = targetBlobContainerClient.GetBlobClient(imageTableEntity.BlobName);

            if (await targetCloudBlob.ExistsAsync())
            {
                return;
            }

            await targetCloudBlob.StartCopyFromUriAsync(new Uri(this.GetDownloadUrl(ScratchBlobContainer, imageTableEntity.Id)));
        }

        public async Task<string> UploadFromStream(string blobContainer, string blobName, Stream imageStream)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(blobContainer);
            await blobContainerClient.CreateIfNotExistsAsync();

            var blob = blobContainerClient.GetBlobClient(blobName);
            await blob.UploadAsync(imageStream, new BlobHttpHeaders() { ContentType = "image/png" });

            return GetDownloadUrl(blobContainer, blobName);
        }

        public async Task<string> UploadTemporaryAsync(Stream imageStream)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(ScratchBlobContainer);
            await blobContainerClient.CreateIfNotExistsAsync();

            var imageId = Guid.NewGuid().ToString();
            var blob = blobContainerClient.GetBlobClient(imageId);

            await blob.UploadAsync(imageStream, new BlobHttpHeaders() { ContentType = "image/png" });

            return GetDownloadUrl(ScratchBlobContainer, imageId);
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
                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
            }

            if (!string.IsNullOrWhiteSpace(entity.ThumbnailId))
            {
                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
            }

            var blobContainerThumbnail = blobServiceClient.GetBlobContainerClient(ThumbnailsBlobContainer);
            var blobThumbnail = blobContainerThumbnail.GetBlobClient(entity.ThumbnailId);
            if (await blobThumbnail.ExistsAsync())
            {
                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
            }

            if (entity.BlobContainer == null)
            {
                return string.Empty;
            }

            try
            {
                var blobContainerClient = blobServiceClient.GetBlobContainerClient(entity.BlobContainer);
                var blob = blobContainerClient.GetBlobClient(entity.BlobName);

                var imageMemoryStream = new MemoryStream();
                await blob.DownloadToAsync(imageMemoryStream);

                var image = Image.FromStream(imageMemoryStream);

                if (image.Width <= 400)
                {
                    await this.ReplaceAsync(entity, i =>
                    {
                        i.ThumbnailId = "skip - too small";
                    });
                    return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
                }

                var ratio = 400.0 / image.Width;
                var resizedImage = ResizeImage(image, 400, (int)Math.Ceiling(image.Height * ratio));
                var memoryStream = new MemoryStream();
                resizedImage.Save(memoryStream, ImageFormat.Png);
                memoryStream.Seek(0, SeekOrigin.Begin);

                var blobResized = blobContainerThumbnail.GetBlobClient(entity.Id);
                await blobResized.UploadAsync(memoryStream, new BlobHttpHeaders() { ContentType = "image/png" });

                await this.ReplaceAsync(entity, i =>
                {
                    i.ThumbnailId = entity.Id;
                });

                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
            }
            catch
            {
                await this.ReplaceAsync(entity, i =>
                {
                    i.ThumbnailId = "skip - failed";
                });
                return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
            }
        }

        public async Task CropImageAsync(ImageCropEntity imageCropEntity)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(ScratchBlobContainer);
            var blob = blobContainerClient.GetBlobClient(imageCropEntity.ImageId);

            var imageMemoryStream = new MemoryStream();
            await blob.DownloadToAsync(imageMemoryStream);

            var image = Image.FromStream(imageMemoryStream);

            var croppedImage = CropImage(image, (int) imageCropEntity.X, (int) imageCropEntity.Y, (int) imageCropEntity.Width, (int) imageCropEntity.Height);

            var memoryStream = new MemoryStream();
            croppedImage.Save(memoryStream, ImageFormat.Png);
            memoryStream.Seek(0, SeekOrigin.Begin);
            await blob.UploadAsync(memoryStream, new BlobHttpHeaders() { ContentType = "image/png" });
        }

        public string GetPanelImageUrl(string imageId, int panelNumber)
        {
            return this.GetDownloadUrl(PanelsBlobContainer, imageId + "_panel_" + panelNumber, DateTime.UtcNow.AddDays(ThumbnailCacheDays));
        }

        public async Task GeneratePanelImageUrlAsync(string imageId, int panelNumber)
        {
            var imageEntity = await this.GetAsync(imageId);
            if (imageEntity != null)
            {
                await this.GeneratePanelImageUrlAsync(imageEntity, panelNumber);
            }
        }

        public async Task GeneratePanelImageUrlAsync(ImageTableEntity entity, int panelNumber)
        {
            var panelsContainer = blobServiceClient.GetBlobContainerClient(PanelsBlobContainer);
            var panelBlob = panelsContainer.GetBlobClient(entity.Id + "_panel_" + panelNumber);

            if (await panelBlob.ExistsAsync())
            {
                return;
            }

            var blobContainerClient = blobServiceClient.GetBlobContainerClient(entity.BlobContainer);
            var blob = blobContainerClient.GetBlobClient(entity.BlobName);

            var imageMemoryStream = new MemoryStream();
            await blob.DownloadToAsync(imageMemoryStream);

            var image = Image.FromStream(imageMemoryStream);

            var panelImage = GetPanelImage(image, panelNumber);
            var memoryStream = new MemoryStream();
            panelImage.Save(memoryStream, ImageFormat.Png);
            memoryStream.Seek(0, SeekOrigin.Begin);

            await panelBlob.UploadAsync(memoryStream, new BlobHttpHeaders() { ContentType = "image/png" });
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

        public static Bitmap CropImage(Image image, int x, int y, int width, int height)
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
                    graphics.DrawImage(image, destRect, x, y, width, height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }

        /// <summary>
        /// Get the image for a specified panel number
        /// </summary>
        /// <param name="image">The image to get the panel number</param>
        /// <param name="panelNumber">The panelNumber to retrieve</param>
        /// <returns>The image at that panel</returns>
        public static Bitmap GetPanelImage(Image image, int panelNumber)
        {
            var panelWidth = (int) Math.Ceiling((double)image.Width / Across);
            var panelHeight = (int) Math.Ceiling((double)image.Height / Down);

            var destRect = new Rectangle(0, 0, panelWidth, panelHeight);
            var destImage = new Bitmap(panelWidth, panelHeight);

            var startX = ((panelNumber - 1) % Across) * panelWidth;
            var startY = ((panelNumber - 1) / Across) * panelHeight;

            // Draw the cloned portion of the Bitmap object.
            using (var graphics = Graphics.FromImage(destImage))
            {
                if (panelNumber > 0)
                {
                    graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    graphics.DrawImage(image, destRect, startX, startY, panelWidth, panelHeight, GraphicsUnit.Pixel);
                }
                else
                {
                    var brush = new SolidBrush(Color.Transparent);
                    graphics.FillRectangle(brush, destRect);
                }
            }
            return destImage;
        }

        public Task GenerateCacheAsync(ImageTableEntity entity)
        {
            var tasks = new List<Task>();
            tasks.Add(this.GetThumbnailUrlAsync(entity));

            for (var i = 0; i <= Across * Down; i++)
            {
                tasks.Add(this.GeneratePanelImageUrlAsync(entity, i));
            }

            return Task.WhenAll(tasks);
        }

        public async IAsyncEnumerable<ImageTableEntity> PopulateImageDetails(IAsyncEnumerable<IImageIdTableEntity> imageIdTableEntities)
        {
            await foreach (var imageIdTableEntity in imageIdTableEntities)
            {
                var imageEntity = await this.GetAsync(imageIdTableEntity.ImageId);
                if (imageEntity != null)
                {
                    yield return imageEntity;
                }
            }
        }
    }
}
