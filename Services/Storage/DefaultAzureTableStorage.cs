using Microsoft.Azure.Cosmos.Table;
using Polly;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace PicturePanels.Services.Storage
{
    public class DefaultAzureTableStorage<T> where T:TableEntity, new()
    {
        protected readonly CloudTable cloudTable;

        public DefaultAzureTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider, string tableName)
        {
            var tableClient = cloudStorageAccountProvider.CloudStorageAccount.CreateCloudTableClient();
            cloudTable = tableClient.GetTableReference(tableName);
        }

        public async Task StartupAsync()
        {
            await cloudTable.CreateIfNotExistsAsync();
        }

        public async Task<T> GetAsync(string partitionKey, string rowKey)
        {
            TableResult retrievedResult = await cloudTable.ExecuteAsync(TableOperation.Retrieve<T>(partitionKey, rowKey));
            return (T)retrievedResult.Result;
        }

        public async Task<T> GetAsync(T tableEntity)
        {
            TableResult retrievedResult = await cloudTable.ExecuteAsync(TableOperation.Retrieve<T>(tableEntity.PartitionKey, tableEntity.RowKey));
            return (T)retrievedResult.Result;
        }

        public async Task<List<T>> GetAllAsync()
        {
            var results = new List<T>();
            TableQuery<T> tableQuery = new TableQuery<T>();
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;
                results.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            return results;
        }

        public async Task<List<T>> GetAllAsync(TableQuery<T> tableQuery)
        {
            var results = new List<T>();
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;
                results.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            return results;
        }

        public async Task<List<T>> GetAllFromPartitionAsync(string partitionKey)
        {
            var results = new List<T>();
            var tableQueryFilter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, partitionKey);
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(new TableQuery<T>().Where(tableQueryFilter), continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;
                results.AddRange(tableQueryResult.Results);
            } while (continuationToken != null);

            return results;
        }

        public virtual async Task<T> InsertAsync(T tableEntity)
        {
            await cloudTable.ExecuteAsync(TableOperation.Insert(tableEntity));
            return tableEntity;
        }

        public async Task<T> InsertOrReplaceAsync(T tableEntity, Func<T, bool> update, bool isNewEntity)
        {
            if (isNewEntity)
            {
                return await this.InsertAsync(tableEntity);
            }
            
            return await this.ReplaceAsync(tableEntity, update);
        }

        public async Task<T> InsertOrReplaceAsync(T tableEntity, Func<T, bool> update)
        {
            var existingEntity = this.GetAsync(tableEntity);
            if (existingEntity == null)
            {
                return await this.InsertAsync(tableEntity);
            }

            return await this.ReplaceAsync(tableEntity, update);
        }

        public async Task<T> ReplaceAsync(T tableEntity, Func<T, bool> update)
        {
            return await Policy
                .Handle<StorageException>(ex => ex.RequestInformation.HttpStatusCode == (int)HttpStatusCode.PreconditionFailed)
                .RetryAsync(5, onRetryAsync: async(exception, retryCount) =>
                {
                    tableEntity = await this.GetAsync(tableEntity);
                }).ExecuteAsync(async () =>
                {
                    if (update(tableEntity))
                    {
                        await cloudTable.ExecuteAsync(TableOperation.Replace(tableEntity));
                    }

                    return tableEntity;
                });
        }

        public async Task<T> ReplaceAsync(T tableEntity, Func<T, Task<bool>> update)
        {
            return await Policy
                .Handle<StorageException>(ex => ex.RequestInformation.HttpStatusCode == (int)HttpStatusCode.PreconditionFailed)
                .RetryAsync(5, onRetryAsync: async (exception, retryCount) =>
                {
                    tableEntity = await this.GetAsync(tableEntity);
                }).ExecuteAsync(async () =>
                {
                    if (await update(tableEntity))
                    {
                        await cloudTable.ExecuteAsync(TableOperation.Replace(tableEntity));
                    };

                    return tableEntity;
                });
        }

        public async Task DeleteAsync(T tableEntity)
        {
            await cloudTable.ExecuteAsync(TableOperation.Delete(tableEntity));
        }

        public async Task DeleteFromPartitionAsync(string partitionKey)
        {
            TableBatchOperation batchOperation = new TableBatchOperation();
            foreach (var tableEntity in await this.GetAllFromPartitionAsync(partitionKey))
            {
                if (batchOperation.Count >= 100)
                {
                    await cloudTable.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }

                batchOperation.Add(TableOperation.Delete(tableEntity));
            }

            if (batchOperation.Count > 0)
            {
                await cloudTable.ExecuteBatchAsync(batchOperation);
            }
        }

        public async Task ExecuteBatchAsync(TableBatchOperation tableBatchOperation)
        {
            await cloudTable.ExecuteBatchAsync(tableBatchOperation);
        }
    }
}
