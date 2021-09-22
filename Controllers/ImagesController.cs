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
using PicturePanels.Services.Authentication;
using Microsoft.Azure.Cosmos.Table;

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
        private readonly ImageNotApprovedTableStorage imageNotApprovedTableStorage;

        public ImagesController(
            GameStateTableStorage gameStateTableStorage,
            GameRoundTableStorage gameRoundTableStorage,
            ImageTableStorage imageTableStorage,
            ImageTagTableStorage imageTagTableStorage,
            ImageNumberTableStorage imageNumberTableStorage,
            UserTableStorage userTableStorage,
            ImageNotApprovedTableStorage imageNotApprovedTableStorage)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.gameRoundTableStorage = gameRoundTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.imageTagTableStorage = imageTagTableStorage;
            this.imageNumberTableStorage = imageNumberTableStorage;
            this.userTableStorage = userTableStorage;
            this.imageNotApprovedTableStorage = imageNotApprovedTableStorage;
        }
        
        [HttpGet("migrate")]
        public async Task<IActionResult> MigrateAsync()
        {
            var tagCounts = new Dictionary<string, int>();
            var tagBatches = new Dictionary<string, TableBatchOperation>();

            await foreach (var imageTableEntity in this.imageTableStorage.GetAllAsync())
            {
                if (!imageTableEntity.Approved)
                {
                    continue;
                }

                foreach (var tag in imageTableEntity.Tags)
                {
                    if (!tagCounts.ContainsKey(tag))
                    {
                        tagCounts[tag] = 0;
                    }

                    if (!tagBatches.ContainsKey(tag))
                    {
                        tagBatches[tag] = new TableBatchOperation();
                    }

                    tagBatches[tag].Add(TableOperation.InsertOrReplace(new ImageNumberTableEntity()
                    {
                        ImageId = imageTableEntity.Id,
                        Number = tagCounts[tag],
                        Tag = tag
                    }));

                    if (tagBatches[tag].Count >= 100)
                    {
                        await this.imageNumberTableStorage.ExecuteBatchAsync(tagBatches[tag]);
                        tagBatches[tag].Clear();
                    }

                    tagCounts[tag]++;
                }
            }

            foreach (var batchOperation in tagBatches)
            {
                if (batchOperation.Value.Count > 0)
                {
                    await this.imageNumberTableStorage.ExecuteBatchAsync(batchOperation.Value);
                    batchOperation.Value.Clear();
                }
            }

            foreach (var tagCount in tagCounts)
            {
                var tagCountTableEntity = await this.imageTagTableStorage.GetAsync(tagCount.Key);
                await this.imageTagTableStorage.InsertOrReplaceAsync(new ImageTagTableEntity()
                {
                    Tag = tagCount.Key,
                    Count = tagCount.Value,
                    IsHidden = tagCountTableEntity?.IsHidden ?? true
                });
            }

            return StatusCode(200);
        }

        /*
        [HttpGet("migrate")]
        public async Task<IActionResult> MigrateAsync()
        {

            var ids = new List<string>();

            await foreach (var imageTableEntity in this.imageTableStorage.GetAllAsync())
            {
                var oldBlobName = imageTableEntity.BlobName;

                imageTableEntity.BlobName = alphanumericRegex.Replace(imageTableEntity.Name, string.Empty) + "-" + imageTableEntity.Id + ".png";

                var result = await this.imageTableStorage.MoveToBlobContainerAsync(imageTableEntity.BlobContainer, oldBlobName, imageTableEntity.BlobContainer, imageTableEntity.BlobName);

                if (!result)
                {
                    return Json(imageTableEntity.Id);
                }

                await this.imageTableStorage.InsertOrReplaceAsync(imageTableEntity);
            }

            return Json(ids);
        }
        */

        [HttpGet("tags")]
        public IActionResult GetAllTags()
        {
            var images = this.imageTagTableStorage.GetAllTagsAsync();
            return Json(images.Select((tag) => tag.Tag));
        }

        [HttpGet("notApproved")]
        public IActionResult GetNotApprovedImages()
        {
            var images = this.imageNotApprovedTableStorage.GetAllAsync();
            return Json(images);
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


        [HttpGet("panels/{gameStateId}/{roundNumber:int}/{panelNumber:int}")]
        public async Task<IActionResult> GetPanelImageAsync(string gameStateId, int roundNumber, int panelNumber)
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

            if (panelNumber > 0 && !gameState.RevealedPanels.Contains(panelNumber.ToString()) && !gameState.IsRoundOver())
            {
                return StatusCode((int)HttpStatusCode.Forbidden);
            }

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameStateId, gameState.RoundNumber);
            if (gameRoundEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            await this.imageTableStorage.GeneratePanelImageUrlAsync(imageTableEntity, panelNumber);
            return ImageRedirectResult(this.imageTableStorage.GetPanelImageUrl(gameRoundEntity.ImageId, panelNumber));
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

        [HttpGet("{imageId}")]
        public async Task<IActionResult> GetAsync(string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(imageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            if (imageTableEntity.UploadComplete)
            {
                return StatusCode((int)HttpStatusCode.Forbidden, "Images that have been finished uploading can no longer be seen.");
            }

            Response.Headers["Location"] = this.imageTableStorage.GetDownloadUrl(ImageTableStorage.ScratchBlobContainer, imageTableEntity.Id);
            Response.Headers["Cache-Control"] = "max-age=" + 3600;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("welcome/{imageNumber:int}")]
        public async Task<IActionResult> GetWelcomeImageAsync(int imageNumber)
        {
            var images = await this.imageNumberTableStorage.GetAllFromPartitionAsync(ImageTableStorage.WelcomeBlobContainer).ToListAsync();
            if (imageNumber < 0 || imageNumber >= images.Count())
            {
                return StatusCode(404);
            }

            var imageTableEntity = await this.imageTableStorage.GetAsync(images[imageNumber].ImageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            Response.Headers["Location"] = this.imageTableStorage.GetDownloadUrl(imageTableEntity);
            Response.Headers["Cache-Control"] = "max-age=" + 3600;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        private readonly Regex alphanumericRegex = new Regex(@"[^\w\s\-]g");

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

            return StatusCode((int)HttpStatusCode.NoContent);
        }

        [HttpPost("uploadTemporaryUrl")]
        public async Task<IActionResult> UploadTemporaryUrlAsync([FromBody] UrlEntity urlEntity)
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

        [HttpPost("uploadTemporaryBlob")]
        public async Task<IActionResult> UploadTemporaryBlobAsync()
        {
            try
            {
                var imageUrlOrError = await imageTableStorage.UploadTemporaryAsync(this.Request.BodyReader.AsStream());

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

        [HttpPost]
        [RequireAuthorization]
        public async Task<IActionResult> PostAsync()
        {
            var imageTableEntity = new ImageTableEntity()
            {
                Id = Guid.NewGuid().ToString()
            };

            await this.imageTableStorage.UploadFromStream(ImageTableStorage.ScratchBlobContainer, imageTableEntity.Id, this.Request.BodyReader.AsStream());

            await this.imageNotApprovedTableStorage.InsertAsync(new ImageNotApprovedTableEntity()
            {
                ImageId = imageTableEntity.Id
            });

            await this.imageTableStorage.InsertAsync(imageTableEntity);

            return Json(new ImageEntity(imageTableEntity));
        }

        [HttpPut("{imageId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PutAsync(string imageId, [FromBody] ImageEntity imageEntity)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(imageId);
            if (imageTableEntity == null || imageTableEntity.UploadComplete)
            {
                return StatusCode(400);
            }

            imageEntity.CopyProperties(imageTableEntity);

            imageTableEntity.Id = imageId;
            imageTableEntity.UploadedBy = HttpContext.Items[SecurityProvider.UserIdKey].ToString();
            imageTableEntity.BlobName = alphanumericRegex.Replace(imageEntity.Name, string.Empty) + "-" + imageTableEntity.Id + ".png";
            imageTableEntity.BlobContainer = imageTableEntity.UploadedBy;
            imageTableEntity.AlternativeNames.RemoveAll(entry => string.IsNullOrWhiteSpace(entry));
            imageTableEntity.Tags.RemoveAll(entry => string.IsNullOrWhiteSpace(entry));
            if (!imageTableEntity.Tags.Contains(ImageTagTableEntity.AllTag))
            {
                imageTableEntity.Tags.Add(ImageTagTableEntity.AllTag);
            }
            imageTableEntity.Tags = imageTableEntity.Tags.Select(tag => tag.ToLowerInvariant()).ToList();

            await this.imageTableStorage.CopyImageFromScratchAsync(imageTableEntity);

            var answers = new List<string>() { GuessChecker.Prepare(imageTableEntity.Name) };
            answers = answers.Concat(GuessChecker.Prepare(imageTableEntity.AlternativeNames)).ToList();

            imageTableEntity = await this.imageTableStorage.ReplaceAsync(imageTableEntity, i =>
            {
                i.Answers = answers;
                i.UploadComplete = true;
                i.UploadCompleteTime = DateTime.UtcNow;
            });

            var generateTask = Task.Run(() =>
            {
                imageTableStorage.GenerateCacheAsync(imageTableEntity);
            });

            return Json(new ImageEntity(imageTableEntity));
        }

        [HttpPut("{imageId}/approve")]
        [RequireAuthorization]
        public async Task<IActionResult> ApproveAsync(string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(imageId);
            if (imageTableEntity == null)
            {
                return StatusCode(404);
            }

            foreach (var tag in imageTableEntity.Tags)
            {
                var imageTagCount = await this.imageTagTableStorage.GetAsync(tag);
                if (imageTagCount == null)
                {
                    continue;
                }

                await this.imageNumberTableStorage.InsertOrReplaceAsync(new ImageNumberTableEntity()
                {
                    ImageId = imageTableEntity.Id,
                    Number = imageTagCount.Count,
                    Tag = tag
                });

                imageTagCount.Count++;
                await this.imageTagTableStorage.InsertOrReplaceAsync(imageTagCount);
            }

            imageTableEntity = await this.imageTableStorage.ReplaceAsync(imageTableEntity, i =>
            {
                i.Approved = true;
            });

            var generateTask = Task.Run(() =>
            {
                imageTableStorage.GenerateCacheAsync(imageTableEntity);
            });

            return Json(new ImageEntity(imageTableEntity));
        }
    }
}
