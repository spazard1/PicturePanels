using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos.Table;
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

        public async Task<UserTableEntity> NewUserAsync(string userName, string name)
        {
            var userId = Guid.NewGuid().ToString();
            
            await this.InsertOrReplaceAsync(new UserTableEntity()
            {
                UserId = userName,
                UserName = userId
            });

            return await this.InsertOrReplaceAsync(new UserTableEntity()
            {
                UserId = userId,
                UserName = userName,
                Name = name
            });
        }

        public async Task<UserTableEntity> GetAsync(string userIdOrUserName)
        {
            var user = await this.GetAllFromPartitionAsync(userIdOrUserName).FirstOrDefaultAsync();

            if (user == null)
            {
                return null;
            }

            if (Guid.TryParse(userIdOrUserName, out Guid result))
            {
                return user;
            }

            return await this.GetAsync(user.UserName, user.UserId);
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
    }
}
