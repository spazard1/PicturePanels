using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PicturePanels.Entities;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class UserPlayedImageTableStorage : DefaultAzureTableStorage<UserPlayedImageTableEntity>
    {

        public UserPlayedImageTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "userplayedimages")
        {

        }

        public async IAsyncEnumerable<ImageEntity> PopulateIsPlayed(IAsyncEnumerable<ImageEntity> imageEntities, string userId)
        {
            var tasks = new List<Task<ImageEntity>>();
            await foreach (var imageEntity in imageEntities)
            {
                var task = this.GetAsync(imageEntity.Id, userId).ContinueWith(userPlayedImageModel =>
                {
                    if (userPlayedImageModel.Result != null)
                    {
                        imageEntity.IsPlayed = true;
                    }
                    return imageEntity;
                });

                tasks.Add(task);

                if (tasks.Count >= QueryBatchSize)
                {
                    await Task.WhenAll(tasks);

                    foreach (var imageEntityTask in tasks)
                    {
                        yield return imageEntityTask.Result;
                    }

                    tasks.Clear();
                }
            }

            foreach (var imageEntityTask in tasks)
            {
                yield return imageEntityTask.Result;
            }
        }
    }
}
