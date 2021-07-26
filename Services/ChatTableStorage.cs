using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class ChatTableStorage
    {

        private CloudStorageAccount cloudStorageAccount;
        private CloudTable chatsTable;

        public ChatTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider)
        {
            cloudStorageAccount = cloudStorageAccountProvider.CloudStorageAccount;
            var tableClient = cloudStorageAccount.CreateCloudTableClient();
            chatsTable = tableClient.GetTableReference("chats");
        }
        
        public async Task Startup()
        {
            await chatsTable.CreateIfNotExistsAsync();  
        }

        public async Task<List<ChatTableEntity>> GetChatsAsync(string teamNumber)
        {
            var chatResults = new List<ChatTableEntity>();

            string partitionFilter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, teamNumber);
            string rowFilter = TableQuery.GenerateFilterCondition(
                               "RowKey", QueryComparisons.GreaterThanOrEqual,
                               DateTime.UtcNow.Subtract(TimeSpan.FromHours(1)).Ticks.ToString());
            string finalFilter = TableQuery.CombineFilters(partitionFilter, TableOperators.And, rowFilter);
            var tableQuery = new TableQuery<ChatTableEntity>().Where(finalFilter).Take(1000);

            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<ChatTableEntity> tableQueryResult =
                    await chatsTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);

                continuationToken = tableQueryResult.ContinuationToken;

                chatResults.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            return chatResults;
        }

        public async Task<ChatTableEntity> AddOrUpdateChatAsync(PlayerTableEntity playerModel, string message)
        {
            var tableEntity = new ChatTableEntity()
            {
                TeamNumber = playerModel.TeamNumber.ToString(),
                Message = message,
                PlayerId = playerModel.PlayerId,
                CreatedTime = DateTime.UtcNow
            };
            await chatsTable.ExecuteAsync(TableOperation.InsertOrReplace(tableEntity));
            return tableEntity;
        }
    }
}
