using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using System.Net;
using CloudStorage.Services;
using CloudStorage.Entities;
using PictureGame.Services;
using PictureGame.Filters;
using PictureGame.Entities;
using System;
using System.Text.RegularExpressions;

namespace CloudStorage.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : Controller
    {
        private readonly GameTableStorage gameTableStorage;
        private readonly ImageTableStorage imageTableStorage;

        public ImagesController(GameTableStorage gameTableStorage, ImageTableStorage imageTableStorage)
        {
            this.gameTableStorage = gameTableStorage;
            this.imageTableStorage = imageTableStorage;
        }

        [HttpGet("all")]
        [RequireAuthorization]
        public async Task<IEnumerable<ImageEntity>> GetAllAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            var results = (await imageTableStorage.GetAllImagesAsync(gameState.BlobContainer))
                .Select(image => new ImageEntity(image)).ToList();
            results.Sort();

            return results;
        }

        [HttpGet("all/{blobContainer}")]
        [RequireAuthorization]
        public async Task<IEnumerable<ImageEntity>> GetAllByBlobContainerAsync(string blobContainer)
        {
            var results = (await imageTableStorage.GetAllImagesAsync(blobContainer))
                .Select(image => new ImageEntity(image)).ToList();
            results.Sort();

            return results;
        }

        [HttpGet("blobContainers")]
        [RequireAuthorization]
        public async Task<IEnumerable<BlobContainerEntity>> GetAllBlobContainersAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            var results = (await imageTableStorage.GetAllBlobContainersAsync())
                .Select(blobContainer => new BlobContainerEntity() { Name = blobContainer }).ToList();
            results.Sort();

            return results;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            var imageTableEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);
            if (imageTableEntity == null)
            {
                return StatusCode((int) HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            Response.Headers["Location"] = this.imageTableStorage.GetDownloadUrl(gameState.BlobContainer, imageTableEntity);
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("welcome")]
        public async Task<IActionResult> WelcomeAsync()
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(ImageTableStorage.WelcomeBlobContainer, "soundofmusic");

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            Response.Headers["Location"] = this.imageTableStorage.GetDownloadUrl(ImageTableStorage.WelcomeBlobContainer, imageTableEntity);
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 7;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("entity/{imageId}")]
        public async Task<IActionResult> GetEntityAsync(string imageId)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();

            var imageTableEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, imageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            var imageEntity = new ImageEntity
            {
                UploadedBy = imageTableEntity.UploadedBy
            };

            return Json(imageEntity);
        }

        [HttpGet("tiles/{tileNumber:int}")]
        public async Task<IActionResult> GetTileImageAsync(int tileNumber)
        {
            var gameState = await this.gameTableStorage.GetGameStateAsync();
            var imageTableEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            var imageUrl = "";
            if (!gameState.RevealedTiles.Contains(tileNumber.ToString()) && tileNumber > 0)
            {
                imageUrl = "/api/images/tiles/0";
            }
            else
            {
                imageUrl = await this.imageTableStorage.GetTileImageUrlAsync(imageTableEntity, tileNumber);
            }

            Response.Headers["Location"] = imageUrl;
            return StatusCode((int)HttpStatusCode.TemporaryRedirect);
        }

        [HttpGet("{blobContainer}/{imageId}")]
        public async Task<IActionResult> GetAsync(string blobContainer, string imageId)
        {
            var imageTableEntity = await this.imageTableStorage.GetAsync(blobContainer, imageId);

            if (imageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            Response.Headers["Location"] = this.imageTableStorage.GetDownloadUrl(blobContainer, imageTableEntity);
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 7;
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
            Response.Headers["Cache-Control"] = "max-age=" + 3600 * 7;
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
            var imageTableEntity = await imageTableStorage.AddOrUpdateAsync(imageEntity.ToTableEntity());
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

            imageTableEntity.Name = imageEntity.Name;
            imageTableEntity.UploadedBy = imageEntity.UploadedBy;
            imageTableEntity = await imageTableStorage.AddOrUpdateAsync(imageTableEntity);

            return Json(new ImageEntity(imageTableEntity));
        }

        [HttpPut("move")]
        [RequireAuthorization]
        public async Task<IActionResult> MoveAsync([FromBody] MoveImageEntity moveImageEntity)
        {
            var sourceImageTableEntity = await imageTableStorage.GetAsync(moveImageEntity.SourceBlobContainer, moveImageEntity.SourceImageId);
            if (sourceImageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            var imageTableEntity = await this.imageTableStorage.MoveToBlobContainerAsync(sourceImageTableEntity, moveImageEntity.TargetBlobContainer);
            
            return Json(new ImageEntity(imageTableEntity));
        }

        [HttpPut("copy")]
        [RequireAuthorization]
        public async Task<IActionResult> CopyAsync([FromBody] MoveImageEntity moveImageEntity)
        {
            var sourceImageTableEntity = await imageTableStorage.GetAsync(moveImageEntity.SourceBlobContainer, moveImageEntity.SourceImageId);
            if (sourceImageTableEntity == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound, "Did not find image with specified id");
            }

            var imageTableEntity = await this.imageTableStorage.CopyToBlobContainerAsync(sourceImageTableEntity, moveImageEntity.TargetBlobContainer);

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

            imageTableEntity.UploadComplete = true;
            imageTableEntity.UploadCompleteTime = DateTime.UtcNow;
            imageTableEntity = await imageTableStorage.AddOrUpdateAsync(imageTableEntity);

            await imageTableStorage.GenerateCacheAsync(imageTableEntity);

            return Json(new ImageEntity(imageTableEntity));
        }
    }
}
