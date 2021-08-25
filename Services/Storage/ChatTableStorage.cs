using PicturePanels.Models;
using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services.Storage
{
    public class ChatTableStorage : DefaultAzureTableStorage<ChatTableEntity>
    {
        public ChatTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "chats")
        {

        }


        public async Task<List<ChatTableEntity>> GetAllAsync(string teamNumber)
        {
            string partitionFilter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, teamNumber);
            string rowFilter = TableQuery.GenerateFilterCondition(
                               "RowKey", QueryComparisons.GreaterThanOrEqual,
                               DateTime.UtcNow.Subtract(TimeSpan.FromHours(1)).Ticks.ToString());
            string finalFilter = TableQuery.CombineFilters(partitionFilter, TableOperators.And, rowFilter);
            var tableQuery = new TableQuery<ChatTableEntity>().Where(finalFilter).Take(1000);

            return await this.GetAllAsync(tableQuery);
        }

        public Task<ChatTableEntity> InsertAsync(PlayerTableEntity playerModel, string message)
        {
            return this.InsertAsync(playerModel, message, false);
        }

        public Task<ChatTableEntity> InsertAsync(int teamNumber, string message, bool isSystem)
        {
            return this.InsertAsync(new ChatTableEntity()
            {
                TeamNumber = teamNumber.ToString(),
                Message = message,
                CreatedTime = DateTime.UtcNow,
                IsSystem = isSystem
            });
        }

        public Task<ChatTableEntity> InsertAsync(PlayerTableEntity playerModel, string message, bool isSystem)
        {
            return this.InsertAsync(new ChatTableEntity()
            {
                TeamNumber = playerModel.TeamNumber.ToString(),
                Message = message,
                PlayerId = playerModel.PlayerId,
                CreatedTime = DateTime.UtcNow,
                IsSystem = isSystem
            });
        }
    }
}
