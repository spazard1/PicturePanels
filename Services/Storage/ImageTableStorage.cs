﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using PicturePanels.Entities;
using PicturePanels.Models;
using Microsoft.Azure.Cosmos.Table;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage;
using Azure.Storage.Blobs.Models;
using System.Drawing.Drawing2D;

namespace PicturePanels.Services.Storage
{
    public class ImageTableStorage : DefaultAzureTableStorage<ImageTableEntity>
    {
        private readonly IConnectionStringProvider connectionStringProvider;
        private BlobServiceClient blobServiceClient;

        public const int Across = 5;
        public const int Down = 4;
        public const string DefaultBlobContainer = "pending";
        public const string ScratchBlobContainer = "scratch";
        public const string ThumbnailsBlobContainer = "thumbnails";
        public const string PanelsBlobContainer = "panels";
        public const string WelcomeBlobContainer = "welcome";
        public const string WelcomeImageId = "soundofmusic";


        public ImageTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider, IConnectionStringProvider connectionStringProvider) : base(cloudStorageAccountProvider, "images")
        {
            this.connectionStringProvider = connectionStringProvider;
            blobServiceClient = cloudStorageAccountProvider.BlobServiceClient;
        }

        public override async Task<ImageTableEntity> InsertAsync(ImageTableEntity image)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(image.BlobContainer);
            await blobContainerClient.CreateIfNotExistsAsync();

            return await base.InsertAsync(image);
        }

        public override async Task DeleteAsync(ImageTableEntity tableEntity)
        {
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(tableEntity.BlobContainer);
            var blobClient = blobContainerClient.GetBlobClient(tableEntity.BlobName);
            await blobClient.DeleteIfExistsAsync();

            await base.DeleteAsync(tableEntity);
        }

        public async Task SetPlayedTimeAsync(string blobContainer, string imageId)
        {
            var imageTableEntity = await this.GetAsync(blobContainer, imageId);

            await this.ReplaceAsync(imageTableEntity, (i) =>
            {
                i.PlayedTime = DateTime.UtcNow;
            });
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
            sasBuilderBlob.ExpiresOn = DateTimeOffset.UtcNow.AddYears(10);
            sasBuilderBlob.SetPermissions(BlobSasPermissions.Read);

            // Use the key to get the SAS token.
            var sasToken = sasBuilderBlob.ToSasQueryParameters(new StorageSharedKeyCredential(blobServiceClient.AccountName, connectionStringProvider.AccountKey)).ToString();

            return blobContainerClient.GetBlockBlobClient(imageId).Uri + "?" + sasToken;
        }

        public IAsyncEnumerable<ImageTableEntity> GetAllImagesAsync(string blobContainer)
        {
            var allImages = this.GetAllAsync();
            allImages = allImages.Where(result => result.UploadComplete && result.BlobContainer == blobContainer);
            return allImages;
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
            blobContainers.Remove(PanelsBlobContainer);
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

                if (image.Width <= 400)
                {
                    await this.ReplaceAsync(entity, i =>
                    {
                        i.ThumbnailId = "skip - too small";
                    });
                    return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName);
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

                return this.GetDownloadUrl(ThumbnailsBlobContainer, entity.ThumbnailId);
            }
            catch
            {
                await this.ReplaceAsync(entity, i =>
                {
                    i.ThumbnailId = "skip - failed";
                });
                return this.GetDownloadUrl(entity.BlobContainer, entity.BlobName);
            }
        }

        public async Task<string> GetPanelImageUrlAsync(ImageTableEntity entity, int panelNumber)
        {
            var panelsContainer = blobServiceClient.GetBlobContainerClient(PanelsBlobContainer);
            var panelBlob = panelsContainer.GetBlobClient(entity.Id + "_panel_" + panelNumber);

            if (await panelBlob.ExistsAsync())
            {
                return this.GetDownloadUrl(PanelsBlobContainer, entity.Id + "_panel_" + panelNumber);
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
            return this.GetDownloadUrl(PanelsBlobContainer, entity.Id + "_panel_" + panelNumber);
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
                tasks.Add(this.GetPanelImageUrlAsync(entity, i));
            }

            return Task.WhenAll(tasks);
        }
    }
}
