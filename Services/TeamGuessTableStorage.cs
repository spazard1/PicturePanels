﻿using PicturePanels.Models;
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

        public async Task<TeamGuessTableEntity> GetTeamGuessAsync(int teamNumber, string ticks)
        {
            TableResult retrievedResult = await teamGuessesTable.ExecuteAsync(TableOperation.Retrieve<TeamGuessTableEntity>(TeamGuessTableEntity.PartitionKeyPrefix + teamNumber, ticks));
            return (TeamGuessTableEntity)retrievedResult.Result;
        }

        public async Task<List<TeamGuessTableEntity>> GetTeamGuessesAsync()
        {
            var teamGuessResults = new List<TeamGuessTableEntity>();
            var tableQueryFilterTeam1 = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, TeamGuessTableEntity.PartitionKeyPrefix + 1);
            var tableQueryFilterTeam2 = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, TeamGuessTableEntity.PartitionKeyPrefix + 2);
            var tableQueryFilter = TableQuery.CombineFilters(tableQueryFilterTeam1, TableOperators.Or, tableQueryFilterTeam2);
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<TeamGuessTableEntity> tableQueryResult = await teamGuessesTable.ExecuteQuerySegmentedAsync(new TableQuery<TeamGuessTableEntity>().Where(tableQueryFilter), continuationToken);

                continuationToken = tableQueryResult.ContinuationToken;

                teamGuessResults.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            return teamGuessResults;
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

        public async Task DeleteTeamGuessesAsync()
        {
            await Task.WhenAll(this.DeleteTeamGuessesAsync(1), this.DeleteTeamGuessesAsync(2));
        }

        public async Task DeleteTeamGuessesAsync(int teamNumber)
        {
            TableBatchOperation batchOperation = new TableBatchOperation();
            foreach (var teamGuess in await this.GetTeamGuessesAsync(teamNumber))
            {
                if (batchOperation.Count >= 100)
                {
                    await teamGuessesTable.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }

                batchOperation.Add(TableOperation.Delete(teamGuess));
            }

            if (batchOperation.Count > 0)
            {
                await teamGuessesTable.ExecuteBatchAsync(batchOperation);
            }
        }
    }
}
