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
        private readonly ImageUploadedByTableStorage imageUploadedByTableStorage;
        private readonly UserPlayedImageTableStorage userPlayedImageTableStorage;

        public ImagesController(
            GameStateTableStorage gameStateTableStorage,
            GameRoundTableStorage gameRoundTableStorage,
            ImageTableStorage imageTableStorage,
            ImageTagTableStorage imageTagTableStorage,
            ImageNumberTableStorage imageNumberTableStorage,
            UserTableStorage userTableStorage,
            ImageNotApprovedTableStorage imageNotApprovedTableStorage,
            ImageUploadedByTableStorage imageUploadedByTableStorage,
            UserPlayedImageTableStorage userPlayedImageTableStorage)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.gameRoundTableStorage = gameRoundTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.imageTagTableStorage = imageTagTableStorage;
            this.imageNumberTableStorage = imageNumberTableStorage;
            this.userTableStorage = userTableStorage;
            this.imageNotApprovedTableStorage = imageNotApprovedTableStorage;
            this.imageUploadedByTableStorage = imageUploadedByTableStorage;
            this.userPlayedImageTableStorage = userPlayedImageTableStorage;
        }

        
        [HttpPut("rebuildTags")]
        [RequireAdmin]
        public async Task<IActionResult> RebuildTagsAsync()
        {
            var tagCounts = new Dictionary<string, int>();
            var tagBatches = new Dictionary<string, TableBatchOperation>();

            await foreach (var imageTableEntity in this.imageTableStorage.GetAllAsync())
            {
                if (!imageTableEntity.Approved)
                {
                    continue;
                }

                if (!imageTableEntity.IsHidden)
                {
                    imageTableEntity.Tags.Add(ImageTagTableEntity.AllTag);
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

            var allTagDictionary = await this.imageTagTableStorage.GetAllTagsDictionaryAsync();

            foreach (var tagCount in tagCounts)
            {
                var tagCountTableEntity = await this.imageTagTableStorage.GetAsync(tagCount.Key);
                tagCountTableEntity.Count = tagCount.Value;
                await this.imageTagTableStorage.InsertOrReplaceAsync(tagCountTableEntity);
                allTagDictionary.Remove(tagCount.Key);
            }

            foreach (var tag in allTagDictionary)
            {
                tag.Value.Count = 0;
                await this.imageTagTableStorage.InsertOrReplaceAsync(tag.Value);
            }

            return StatusCode(200);
        }

        /*
        [HttpGet("populate")]
        public async Task<IActionResult> PopulateAsync()
        {
            var user = await this.userTableStorage.GetAsync("spazard1");
            await foreach (var imageTableEntity in this.imageTableStorage.GetAllAsync())
            {
                if (imageTableEntity.Tags?.Contains("guysweekend") == true)
                {
                    await this.userPlayedImageTableStorage.InsertOrReplaceAsync(new UserPlayedImageTableEntity()
                    {
                        UserId = user.UserId,
                        ImageId = imageTableEntity.Id
                    });
                }
            }

            return StatusCode(200);
        }
        */
    
        /*
        [HttpGet("populate")]
        public async Task<IActionResult> PopulateUploadedByAsync()
        {
            await foreach (var imageTableEntity in this.imageTableStorage.GetAllAsync())
            {
                await this.imageTableStorage.GetThumbnailUrlAsync(imageTableEntity);
            }

            return StatusCode(200);
        }
        */

        [HttpGet("tags")]
        public async Task<IActionResult> GetAllVisbileTagsAsync()
        {
            var tags = await this.imageTagTableStorage.GetAllVisbileTags().ToListAsync();
            tags.Sort();
            return Json(tags.Select((tag) => tag.Tag));
        }

        [HttpGet("alltags")]
        [RequireAdmin]
        public async Task<IActionResult> GetAllTagsAsync()
        {
            var tags = await this.imageTagTableStorage.GetAllAsync().ToListAsync();
            tags.Sort();
            return Json(tags.Select((tag) => new ImageTagCountEntity(tag)));
        }

        [HttpGet("notApproved")]
        [RequireAdmin]
        public async Task<IActionResult> GetNotApprovedImagesAsync()
        {
            var userId = HttpContext.Items[SecurityProvider.UserIdKey].ToString();
            var userTableEntity = await this.userTableStorage.GetAsync(userId);
            if (userTableEntity == null)
            {
                return StatusCode(404);
            }

            var notApprovedImages = this.imageNotApprovedTableStorage.GetAllAsync();

            var imageModels = this.imageTableStorage.PopulateImageDetails(notApprovedImages);
            imageModels = this.userTableStorage.PopulateUploadedBy(imageModels);
            var images = await imageModels.Select(image => new ImageEntity(image)).ToListAsync();

            userTableEntity = await this.userTableStorage.GetOrSaveQueryStringAsync(userTableEntity);

            return Json(new ImageListEntity()
            {
                QueryString = userTableEntity.QueryString,
                Images = images
            });
        }

        [HttpGet("uploadedBy")]
        [RequireAuthorization]
        public async Task<IActionResult> GetUploadedByImagesAsync()
        {
            var userId = HttpContext.Items[SecurityProvider.UserIdKey].ToString();
            var userTableEntity = await this.userTableStorage.GetAsync(userId);
            if (userTableEntity == null)
            {
                return StatusCode(404);
            }

            var uploadedByImages = this.imageUploadedByTableStorage.GetAllFromPartitionAsync(userId);

            var images = await uploadedByImages.Select(image => new ImageIdNameEntity(image)).ToListAsync();

            userTableEntity = await this.userTableStorage.GetOrSaveQueryStringAsync(userTableEntity);

            return Json(new ImageIdNameListEntity()
            {
                QueryString = userTableEntity.QueryString,
                ImageIds = images
            });
        }

        [HttpGet("username/{username}")]
        [RequireAdmin]
        public async Task<IActionResult> GetUserImagesAsync(string username)
        {
            var userId = HttpContext.Items[SecurityProvider.UserIdKey].ToString();
            var userTableEntity = await this.userTableStorage.GetAsync(userId);
            if (userTableEntity == null)
            {
                return StatusCode(404);
            }

            var user = await this.userTableStorage.GetAsync(username);
            if (user == null)
            {
                return StatusCode(404);
            }
            var uploadedByImages = this.imageUploadedByTableStorage.GetAllFromPartitionAsync(user.UserId);

            var imageModels = this.imageTableStorage.PopulateImageDetails(uploadedByImages);
            var images = await imageModels.Select(image => new ImageEntity(image)).ToListAsync();

            userTableEntity = await this.userTableStorage.GetOrSaveQueryStringAsync(userTableEntity);

            return Json(new ImageListEntity()
            {
                QueryString = userTableEntity.QueryString,
                Images = images
            });
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
                uploadedBy = user.DisplayName;
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

            if (gameStateId == ImageTableStorage.WelcomeGameStateId)
            {
                imageTableEntity = await this.imageTableStorage.GetAsync(ImageTableStorage.WelcomeImageId);
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
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 24 * ImageTableStorage.ThumbnailCacheDays;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("thumbnails/{imageId}")]
        [RequireAuthorization]
        public async Task<IActionResult> GetThumbnailAsync(string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(imageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            if (!HttpContext.Items.TryGetValue(SecurityProvider.UserIdKey, out object userIdObject))
            {
                return StatusCode((int)HttpStatusCode.Forbidden);
            }

            var userId = userIdObject?.ToString();
            if (imageTableEntity.UploadedBy != null && imageTableEntity.UploadedBy != userId)
            {
                var user = await this.userTableStorage.GetAsync(userId);
                if (!user.IsAdmin) {
                    return StatusCode((int)HttpStatusCode.Forbidden);
                }
            }

            Response.Headers["Location"] = await this.imageTableStorage.GetThumbnailUrlAsync(imageTableEntity);
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 24 * ImageTableStorage.ThumbnailCacheDays;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("thumbnails/{gameStateId}/{roundNumber:int}")]
        public async Task<IActionResult> GetThumbnailAsync(string gameStateId, int roundNumber)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            if (gameState.TurnType != GameStateTableEntity.TurnTypeEndGame)
            {
                return StatusCode(403);
            }

            if (roundNumber < 1 || roundNumber > gameState.FinalRoundNumber)
            {
                return StatusCode(404);
            }

            var gameRound = await this.gameRoundTableStorage.GetAsync(gameStateId, roundNumber);
            if (gameRound == null)
            {
                return StatusCode(404);
            }

            var imageTableEntity = await this.imageTableStorage.GetAsync(gameRound.ImageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            Response.Headers["Location"] = await this.imageTableStorage.GetThumbnailUrlAsync(imageTableEntity);
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 24 * ImageTableStorage.ThumbnailCacheDays;
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

        private readonly Regex alphanumericRegex = new Regex(@"[^\w\s\-]g");

        [HttpDelete("{imageId}")]
        [RequireAdmin]
        public async Task<IActionResult> DeleteAsync(string imageId)
        {
            var imageTableEntity = await imageTableStorage.GetAsync(imageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            if (imageTableEntity.UploadedBy != null)
            {
                await this.imageUploadedByTableStorage.DeleteAsync(await this.imageUploadedByTableStorage.GetAsync(imageTableEntity.UploadedBy, imageId));
            }

            await this.userPlayedImageTableStorage.DeleteFromPartitionAsync(imageId);
            await this.imageTableStorage.DeleteAsync(imageTableEntity);
            await this.imageNotApprovedTableStorage.DeleteAsync(await this.imageNotApprovedTableStorage.GetAsync(imageId));

            return StatusCode((int)HttpStatusCode.NoContent);
        }

        [HttpPost("uploadTemporaryUrl")]
        [RequireAuthorization]
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
        [RequireAuthorization]
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

        [HttpPatch("{imageId}")]
        [RequireAuthorization]
        public async Task<IActionResult> PatchAsync(string imageId, [FromBody] ImageEntity imageEntity)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(imageId);
            if (imageTableEntity == null)
            {
                return StatusCode(404);
            }

            imageEntity.CopyProperties(imageTableEntity);

            imageTableEntity.AlternativeNames.RemoveAll(entry => string.IsNullOrWhiteSpace(entry));
            imageTableEntity.Tags.RemoveAll(entry => string.IsNullOrWhiteSpace(entry));

            var answers = new List<string>() { GuessChecker.Prepare(imageTableEntity.Name) };
            answers = answers.Concat(GuessChecker.Prepare(imageTableEntity.AlternativeNames)).ToList();

            imageTableEntity.Answers = answers;
            imageTableEntity = await this.imageTableStorage.InsertOrReplaceAsync(imageTableEntity);

            await this.imageUploadedByTableStorage.InsertOrReplaceAsync(new ImageUploadedByTableEntity()
            {
                ImageId = imageTableEntity.Id,
                UploadedBy = imageTableEntity.UploadedBy,
                Name = imageTableEntity.Name
            });

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
            imageTableEntity.Tags?.RemoveAll(entry => string.IsNullOrWhiteSpace(entry));

            await this.imageTableStorage.CopyImageFromScratchAsync(imageTableEntity);

            var answers = new List<string>() { GuessChecker.Prepare(imageTableEntity.Name) };
            answers = answers.Concat(GuessChecker.Prepare(imageTableEntity.AlternativeNames)).ToList();

            await this.imageUploadedByTableStorage.InsertAsync(new ImageUploadedByTableEntity()
            {
                UploadedBy = imageTableEntity.UploadedBy,
                ImageId = imageTableEntity.Id,
                Name = imageTableEntity.Name
            });

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
        [RequireAdmin]
        public async Task<IActionResult> ApproveAsync(string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(imageId);
            if (imageTableEntity == null)
            {
                return StatusCode(404);
            }

            if (imageTableEntity.Approved)
            {
                return StatusCode(400);
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

            await this.imageNotApprovedTableStorage.DeleteAsync(await this.imageNotApprovedTableStorage.GetAsync(imageId));

            var generateTask = Task.Run(() =>
            {
                imageTableStorage.GenerateCacheAsync(imageTableEntity);
            });

            return Json(new ImageEntity(imageTableEntity));
        }
    }
}
