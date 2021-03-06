using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Authentication;

namespace PicturePanels.Services.Storage
{
    public class UserTableStorage : DefaultAzureTableStorage<UserTableEntity>
    {
        private readonly SecurityProvider securityProvider;

        public UserTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider, SecurityProvider securityProvider) : base(cloudStorageAccountProvider, "users")
        {
            this.securityProvider = securityProvider;
        }

        public async Task<UserTableEntity> NewUserAsync(string userName, string displayName, string password)
        {
            var userId = Guid.NewGuid().ToString();

            await this.InsertAsync(new UserTableEntity()
            {
                UserId = userName.Trim(),
                UserName = userId
            });

            var salt = this.securityProvider.GetSalt();

            return await this.InsertAsync(new UserTableEntity
            {
                UserName = userName.Trim(),
                UserId = userId,
                DisplayName = displayName.Trim(),
                Salt = salt,
                Password = this.securityProvider.GetPasswordHash(password.Trim(), salt),
            });
        }

        public async Task<UserTableEntity> EditUserAsync(UserTableEntity userModel, string displayName, string password)
        {
            if (!string.IsNullOrWhiteSpace(password))
            {
                var salt = this.securityProvider.GetSalt();
                userModel.Salt = salt;
                userModel.Password = this.securityProvider.GetPasswordHash(password, salt);
            }

            if (!string.IsNullOrWhiteSpace(displayName))
            {
                userModel.DisplayName = displayName;
            }

            return await this.InsertOrReplaceAsync(userModel);
        }

        public async Task<UserTableEntity> GetAsync(string userIdOrUserName)
        {
            UserTableEntity user;
            if (Guid.TryParse(userIdOrUserName, out Guid result))
            {
                user = await this.GetAllFromPartitionAsync(userIdOrUserName).FirstOrDefaultAsync();
                return user;
            }

            user = await this.GetAllFromPartitionAsync(userIdOrUserName).FirstOrDefaultAsync();

            if (user == null)
            {
                return null;
            }      

            // username has the guid here
            return await this.GetAllFromPartitionAsync(user.UserName).FirstOrDefaultAsync();
        }

        public async Task<UserTableEntity> GetOrSaveQueryStringAsync(UserTableEntity userTableEntity)
        {
            if (!userTableEntity.QueryStringCreateTime.HasValue || userTableEntity.QueryStringCreateTime.Value.AddDays(ImageTableStorage.ThumbnailCacheDays) < DateTime.UtcNow)
            {
                userTableEntity.QueryString = this.securityProvider.GetSignedQueryStringUrlEncoded(userTableEntity.UserId);
                userTableEntity.QueryStringCreateTime = DateTime.UtcNow;
                userTableEntity = await this.InsertOrReplaceAsync(userTableEntity);
                return userTableEntity;
            }

            return userTableEntity;
        }

        public async IAsyncEnumerable<ImageTableEntity> PopulateUploadedBy(IAsyncEnumerable<ImageTableEntity> imageTableEntities)
        {
            var tasks = new List<Task<ImageTableEntity>>();
            await foreach (var imageTableEntity in imageTableEntities)
            {
                var task = this.GetAsync(imageTableEntity.UploadedBy).ContinueWith(userModel =>
                {
                    imageTableEntity.UploadedBy = userModel.Result?.DisplayName;
                    return imageTableEntity;
                });

                tasks.Add(task);

                if (tasks.Count >= QueryBatchSize)
                {
                    await Task.WhenAll(tasks);

                    foreach (var imageTableEntityTask in tasks)
                    {
                        yield return imageTableEntityTask.Result;
                    }

                    tasks.Clear();
                }
            }

            foreach (var imageTableEntityTask in tasks)
            {
                yield return imageTableEntityTask.Result;
            }
        }
    }
}
