using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using System.Net;
using PicturePanels.Services;
using PicturePanels.Entities;
using PicturePanels.Filters;
using System;
using System.Text.RegularExpressions;
using PicturePanels.Models;
using PicturePanels.Services.Storage;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : Controller
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly GameRoundTableStorage gameRoundTableStorage;
        private readonly ImageTableStorage imageTableStorage;
        private readonly ImageTagTableStorage imageTagTableStorage;
        private readonly ImageNumberTableStorage imageNumberTableStorage;
        private readonly UserTableStorage userTableStorage;

        public ImagesController(
            GameStateTableStorage gameStateTableStorage,
            GameRoundTableStorage gameRoundTableStorage,
            ImageTableStorage imageTableStorage,
            ImageTagTableStorage imageTagTableStorage,
            ImageNumberTableStorage imageNumberTableStorage,
            UserTableStorage userTableStorage)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.gameRoundTableStorage = gameRoundTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.imageTagTableStorage = imageTagTableStorage;
            this.imageNumberTableStorage = imageNumberTableStorage;
            this.userTableStorage = userTableStorage;
        }

        [HttpPatch("migrate")]
        public async Task<IActionResult> MigrateAsync()
        {
            await foreach (var imageEntity in this.imageTableStorage.GetAllAsync())
            {
                if (imageEntity.PartitionKey == "images")
                {
                    continue;
                }

                if (imageEntity.UploadedBy == "admin")
                {
                    imageEntity.UploadedBy = "spazard1";
                }

                var migratedImageEntity = new ImageTableEntity()
                {
                    Id = Guid.NewGuid().ToString(),
                    BlobName = imageEntity.BlobName,
                    Name = imageEntity.Name,
                    UploadComplete = imageEntity.UploadComplete,
                    UploadCompleteTime = imageEntity.UploadCompleteTime,
                    ThumbnailId = imageEntity.ThumbnailId,
                    Approved = true
                };

                if (imageEntity.BlobContainer.Contains("guysweekend"))
                {
                    migratedImageEntity.Tags = new List<string> { "guysweekend", "all" };
                }
                else if (imageEntity.BlobContainer.Contains("benji"))
                {
                    migratedImageEntity.Tags = new List<string> { "benji" };
                }
                else if (imageEntity.BlobContainer.Contains("welcome"))
                {
                    migratedImageEntity.Tags = new List<string> { "welcome" };
                }
                else if (imageEntity.BlobContainer.Contains("christmas"))
                {
                    migratedImageEntity.Tags = new List<string> { "christmas" };
                }
                else
                {
                    migratedImageEntity.Tags = new List<string> { "all" };
                }

                int imageNumber;
                foreach (var tag in migratedImageEntity.Tags)
                {
                    var imageTagEntity = await this.imageTagTableStorage.GetAsync(tag);
                    if (imageTagEntity == null)
                    {
                        imageTagEntity = new ImageTagTableEntity()
                        {
                            Tag = tag,
                            Count = 1
                        };
                        imageNumber = 1;
                    }
                    else
                    {
                        imageTagEntity.Count++;
                        imageNumber = imageTagEntity.Count;
                    }

                    var imageNumberEntity = new ImageNumberTableEntity()
                    {
                        ImageId = migratedImageEntity.Id,
                        Number = imageNumber,
                        Tag = tag
                    };

                    await this.imageTagTableStorage.InsertOrReplaceAsync(imageTagEntity);
                    await this.imageNumberTableStorage.InsertOrReplaceAsync(imageNumberEntity);
                }

                var userName = imageEntity.UploadedBy.ToLowerInvariant().Replace(" ", "");
                var user = await this.userTableStorage.GetAsync(userName);
                if (user == null)
                {
                    user = await this.userTableStorage.NewUserAsync(userName, migratedImageEntity.UploadedBy);
                }

                await this.imageTableStorage.CopyToBlobContainerAsync(imageEntity, user.UserId);

                migratedImageEntity.UploadedBy = user.UserId;
                migratedImageEntity.BlobContainer = user.UserId;
                await this.imageTableStorage.InsertAsync(migratedImageEntity);
            }

            return StatusCode(200);
        }

        [HttpGet("all/{blobContainer}")]
        [RequireAuthorization]
        public async Task<IEnumerable<ImageEntity>> GetAllByBlobContainerAsync(string blobContainer)
        {
            var results = await imageTableStorage.GetAllImagesAsync(blobContainer).Select(image => new ImageEntity(image)).ToListAsync();
            results.Sort();
            return results;
        }

        [HttpGet("blobContainers")]
        [RequireAuthorization]
        public async Task<IEnumerable<BlobContainerEntity>> GetAllBlobContainersAsync()
        {
            var results = (await imageTableStorage.GetAllBlobContainersAsync())
                .Select(blobContainer => new BlobContainerEntity() { Name = blobContainer }).ToList();
            results.Sort();

            return results;
        }

        [HttpGet("entity/{gameStateId}")]
        public async Task<IActionResult> GetEntityAsync(string gameStateId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameStateId, gameState.RoundNumber);
            if (gameRoundEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            var imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            var user = await this.userTableStorage.GetAsync(imageTableEntity.UploadedBy);
            string uploadedBy = string.Empty;

            if (user != null)
            {
                uploadedBy = user.Name;
            }

            ImageEntity imageEntity;

            if (gameState.IsRoundOver())
            {
                imageEntity = new ImageEntity
                {
                    Name = imageTableEntity.Name,
                    UploadedBy = uploadedBy
                };
            }
            else
            {
                imageEntity = new ImageEntity
                {
                    UploadedBy = uploadedBy
                };
            }
            return Json(imageEntity);
        }
        

        [HttpGet("panels/{gameStateId}/{panelNumber:int}")]
        public async Task<IActionResult> GetPanelImageAsync(string gameStateId, int panelNumber)
        {
            if (panelNumber < 0 || panelNumber > ImageTableStorage.Across * ImageTableStorage.Down)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "panelNumber out of range");
            }

            ImageTableEntity imageTableEntity;

            if (gameStateId == ImageTableStorage.WelcomeBlobContainer)
            {
                imageTableEntity = await this.imageTableStorage.GetAsync(ImageTableStorage.WelcomeBlobContainer, ImageTableStorage.WelcomeImageId);
                await this.imageTableStorage.GeneratePanelImageUrlAsync(imageTableEntity, panelNumber);
                return ImageRedirectResult(this.imageTableStorage.GetPanelImageUrl(imageTableEntity.Id, panelNumber));
            }
            
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameStateId, gameState.RoundNumber);
            if (gameRoundEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            if (!gameState.RevealedPanels.Contains(panelNumber.ToString()) && !gameState.IsRoundOver())
            {
                await this.imageTableStorage.GeneratePanelImageUrlAsync(gameRoundEntity.ImageId, 0);
                return ImageRedirectResult(this.imageTableStorage.GetPanelImageUrl(gameRoundEntity.ImageId, 0));
            }

            imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            await this.imageTableStorage.GeneratePanelImageUrlAsync(imageTableEntity, panelNumber);
            return ImageRedirectResult(this.imageTableStorage.GetPanelImageUrl(gameRoundEntity.ImageId, panelNumber));
        }

        [HttpGet("{blobContainer}/{imageId}")]
        public async Task<IActionResult> GetAsync(string blobContainer, string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(blobContainer, imageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            return ImageRedirectResult(this.imageTableStorage.GetDownloadUrl(blobContainer, imageTableEntity));
        }

        private IActionResult ImageRedirectResult(string imageUrl)
        {
            Response.Headers["Location"] = imageUrl;
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 24 * 365 * 10;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("{blobContainer}/{imageId}/thumbnail")]
        public async Task<IActionResult> GetThumbnailAsync(string blobContainer, string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(blobContainer, imageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            Response.Headers["Location"] = await this.imageTableStorage.GetThumbnailUrlAsync(imageTableEntity);
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 24 * 365 * 10;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        private readonly Regex alphanumericRegex = new Regex(@"[^\w\s\-]g");

        [HttpPut]
        public async Task<IActionResult> PutAsync([FromBody] ImageEntity imageEntity)
        {
            if (string.IsNullOrWhiteSpace(imageEntity.Id))
            {
                imageEntity.Id = Guid.NewGuid().ToString();
            }

            imageEntity.BlobName = alphanumericRegex.Replace(imageEntity.Name, string.Empty) + "-" + imageEntity.Id + ".png";
            if (string.IsNullOrWhiteSpace(imageEntity.BlobContainer) || !(bool)this.HttpContext.Items[AuthorizationFilter.AuthorizedKey])
            {
                imageEntity.BlobContainer = ImageTableStorage.DefaultBlobContainer;
            }

            var imageTableEntity = await imageTableStorage.InsertAsync(imageEntity.ToTableEntity());
            return Json(new ImageEntity(imageTableEntity));
        }

        [HttpPut("{blobContainer}/{imageId}")]
        public async Task<IActionResult> PutEditAsync(string blobContainer, string imageId, [FromBody] ImageEntity imageEntity)
        {
            var imageTableEntity = await imageTableStorage.GetAsync(blobContainer, imageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified blobcontainer/id");
            }

            imageTableEntity = await imageTableStorage.ReplaceAsync(imageTableEntity, i =>
            {
                i.Name = imageEntity.Name;
                i.UploadedBy = imageEntity.UploadedBy;
            });

            return Json(new ImageEntity(imageTableEntity));
        }

        [HttpDelete("{blobContainer}/{imageId}")]
        [RequireAuthorization]
        public async Task<IActionResult> DeleteAsync(string blobContainer, string imageId)
        {
            var imageTableEntity = await imageTableStorage.GetAsync(blobContainer, imageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            await this.imageTableStorage.DeleteAsync(imageTableEntity);

            return StatusCode((int) HttpStatusCode.NoContent);
        }

        [HttpPost("uploadTemporary")]
        public async Task<IActionResult> UploadTemporaryAsync([FromBody] UrlEntity urlEntity)
        {
            try
            {
                var imageUrlOrError = await imageTableStorage.UploadTemporaryAsync(new Uri(urlEntity.Url));
                if (!imageUrlOrError.StartsWith("https"))
                {
                    return StatusCode((int)HttpStatusCode.BadRequest, imageUrlOrError);
                }
                return Json(new UrlEntity() { Url = imageUrlOrError });
            }
            catch
            {
                return StatusCode((int)HttpStatusCode.BadRequest, "That URL didn't seem to be an image.");
            }
        }

        [HttpPost("{blobContainer}/{imageId}")]
        public async Task<IActionResult> UploadAsync(string blobContainer, string imageId)
        {
            if (!(bool)this.HttpContext.Items[AuthorizationFilter.AuthorizedKey])
            {
                blobContainer = ImageTableStorage.DefaultBlobContainer;
            }

            var imageTableEntity = await imageTableStorage.GetAsync(blobContainer, imageId);
            if (imageTableStorage == null)
            {
                return StatusCode((int) HttpStatusCode.NotFound);
            }

            await imageTableStorage.UploadFromStream(blobContainer, imageTableEntity.BlobName, this.Request.BodyReader.AsStream());

            imageTableEntity = await imageTableStorage.ReplaceAsync(imageTableEntity, i =>
            {
                i.UploadComplete = true;
                i.UploadCompleteTime = DateTime.UtcNow;
            });

            var generateTask = Task.Run(() =>
            {
                imageTableStorage.GenerateCacheAsync(imageTableEntity);
            });

            return Json(new ImageEntity(imageTableEntity));
        }
    }
}
