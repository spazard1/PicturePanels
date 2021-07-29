using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class TeamGuessTableStorage
    {
        public const int MaxGuesses = 5;

        private CloudStorageAccount cloudStorageAccount;
        private CloudTable teamGuessesTable;

        public TeamGuessTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider)
        {
            cloudStorageAccount = cloudStorageAccountProvider.CloudStorageAccount;
            var tableClient = cloudStorageAccount.CreateCloudTableClient();
            teamGuessesTable = tableClient.GetTableReference("teamguesses");
        }

        public async Task Startup()
        {
            await teamGuessesTable.CreateIfNotExistsAsync();  
        }

        public async Task<TeamGuessTableEntity> GetTeamGuessAsync(int teamNumber, long ticks)
        {
            TableResult retrievedResult = await teamGuessesTable.ExecuteAsync(TableOperation.Retrieve<PlayerTableEntity>(TeamGuessTableEntity.PartitionKeyPrefix + teamNumber, ticks.ToString()));
            return (TeamGuessTableEntity)retrievedResult.Result;
        }

        public async Task<List<TeamGuessTableEntity>> GetTeamGuessesAsync(int teamNumber)
        {
            var teamGuessResults = new List<TeamGuessTableEntity>();
            var tableQueryFilter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, TeamGuessTableEntity.PartitionKeyPrefix + teamNumber);
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<TeamGuessTableEntity> tableQueryResult = await teamGuessesTable.ExecuteQuerySegmentedAsync(new TableQuery<TeamGuessTableEntity>().Where(tableQueryFilter), continuationToken);

                continuationToken = tableQueryResult.ContinuationToken;

                teamGuessResults.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            return teamGuessResults;
        }

        public async Task<TeamGuessTableEntity> AddOrUpdateTeamGuessAsync(TeamGuessTableEntity tableEntity)
        {
            await teamGuessesTable.ExecuteAsync(TableOperation.InsertOrReplace(tableEntity));
            return tableEntity;
        }

        public async Task DeleteTeamGuessAsync(TeamGuessTableEntity tableEntity)
        {
            await teamGuessesTable.ExecuteAsync(TableOperation.Delete(tableEntity));
        }
    }
}
