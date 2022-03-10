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
        public const int QueryBatchSize = 25;

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

        public async Task<T> GetAsync(string partitionKey, int rowKey)
        {
            TableResult retrievedResult = await cloudTable.ExecuteAsync(TableOperation.Retrieve<T>(partitionKey, rowKey.ToString()));
            return (T)retrievedResult.Result;
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

        public async IAsyncEnumerable<T> GetAllAsync(int take)
        {
            var count = 0;
            TableQuery<T> tableQuery = new TableQuery<T>();
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;

                foreach (var result in tableQueryResult.Results)
                {
                    if (count >= take)
                    {
                        yield break;
                    }

                    yield return result;
                    count++;
                }
            } while (continuationToken != null);
        }

        public async IAsyncEnumerable<T> GetAllAsync()
        {
            TableQuery<T> tableQuery = new TableQuery<T>();
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;

                foreach (var result in tableQueryResult.Results)
                {
                    yield return result;
                }
            } while (continuationToken != null);
        }

        public async IAsyncEnumerable<T> GetAllAsync(TableQuery<T> tableQuery)
        {
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;
                foreach (var result in tableQueryResult.Results)
                {
                    yield return result;
                }
            } while (continuationToken != null);
        }

        public async IAsyncEnumerable<T> GetAllFromPartitionAsync(string partitionKey)
        {
            var tableQueryFilter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, partitionKey);
            TableContinuationToken continuationToken = null;

            do
            {
                TableQuerySegment<T> tableQueryResult = await cloudTable.ExecuteQuerySegmentedAsync(new TableQuery<T>().Where(tableQueryFilter), continuationToken);
                continuationToken = tableQueryResult.ContinuationToken;
                foreach (var result in tableQueryResult.Results)
                {
                    yield return result;
                }
            } while (continuationToken != null);
        }

        public virtual async Task<T> InsertAsync(T tableEntity)
        {
            await cloudTable.ExecuteAsync(TableOperation.Insert(tableEntity));
            return tableEntity;
        }

        public async Task<T> InsertOrReplaceAsync(T tableEntity)
        {
            await cloudTable.ExecuteAsync(TableOperation.InsertOrReplace(tableEntity));
            return tableEntity;
        }

        public async Task<Tuple<T, bool>> ReplaceAsync(T tableEntity, Func<T, bool> update)
        {
            return await Policy
                .Handle<StorageException>(ex => ex.RequestInformation.HttpStatusCode == (int)HttpStatusCode.PreconditionFailed)
                .RetryAsync(5, onRetryAsync: async (exception, retryCount) =>
                {
                    tableEntity = await this.GetAsync(tableEntity);
                }).ExecuteAsync(async () =>
                {
                    if (update(tableEntity))
                    {
                        await cloudTable.ExecuteAsync(TableOperation.Replace(tableEntity));
                        return Tuple.Create(tableEntity, true);
                    };

                    return Tuple.Create(tableEntity, false);
                });
        }

        public async Task<T> ReplaceAsync(T tableEntity, Func<T, Task> update)
        {
            return await Policy
                .Handle<StorageException>(ex => ex.RequestInformation.HttpStatusCode == (int)HttpStatusCode.PreconditionFailed)
                .RetryAsync(5, onRetryAsync: async (exception, retryCount) =>
                {
                    tableEntity = await this.GetAsync(tableEntity);
                }).ExecuteAsync(async () =>
                {
                    await update(tableEntity);
                    var result = await cloudTable.ExecuteAsync(TableOperation.Replace(tableEntity));

                    return tableEntity;
                });
        }

        public async Task<T> ReplaceAsync(T tableEntity, Action<T> update)
        {
            return await Policy
                .Handle<StorageException>(ex => ex.RequestInformation.HttpStatusCode == (int)HttpStatusCode.PreconditionFailed)
                .RetryAsync(5, onRetryAsync: async (exception, retryCount) =>
                {
                    tableEntity = await this.GetAsync(tableEntity);
                }).ExecuteAsync(async () =>
                {
                    update(tableEntity);
                    var result = await cloudTable.ExecuteAsync(TableOperation.Replace(tableEntity));

                    return tableEntity;
                });
        }

        public async Task<Tuple<T,bool>> ReplaceAsync(T tableEntity, Func<T, Task<bool>> update)
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
                        return Tuple.Create(tableEntity, true);
                    };

                    return Tuple.Create(tableEntity, false);
                });
        }

        public virtual async Task DeleteAsync(T tableEntity)
        {
            if (tableEntity == null)
            {
                return;
            }
            await cloudTable.ExecuteAsync(TableOperation.Delete(tableEntity));
        }

        public async Task DeleteFromPartitionAsync(string partitionKey)
        {
            TableBatchOperation batchOperation = new TableBatchOperation();
            await foreach (var tableEntity in this.GetAllFromPartitionAsync(partitionKey))
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
