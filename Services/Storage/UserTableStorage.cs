using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Models;

namespace PicturePanels.Services.Storage
{
    public class UserTableStorage : DefaultAzureTableStorage<UserTableEntity>
    {

        public UserTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "users")
        {

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
    }
}
