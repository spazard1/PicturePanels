using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PicturePanels.Services.Storage;

namespace PicturePanels.Services.Storage
{
    public class TeamGuessTableStorage : DefaultAzureTableStorage<TeamGuessTableEntity>
    {
        public const int MaxGuesses = 5;

        public TeamGuessTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider):base(cloudStorageAccountProvider, "teamguesses")
        {

        }

        public async Task<TeamGuessTableEntity> GetAsync(string gameStateId, int teamNumber, string teamGuessId)
        {
            return await this.GetAsync(TeamGuessTableEntity.GetPartitionKey(gameStateId, teamNumber.ToString()), teamGuessId);
        }

        public IAsyncEnumerable<TeamGuessTableEntity> GetTeamGuessesAsync(string gameStateId, int teamNumber)
        {
            return this.GetAllFromPartitionAsync(TeamGuessTableEntity.GetPartitionKey(gameStateId, teamNumber.ToString()));
        }

        public async Task DeleteTeamGuessesAsync(string gameStateId)
        {
            await Task.WhenAll(this.DeleteFromPartitionAsync(TeamGuessTableEntity.GetPartitionKey(gameStateId, "1")), this.DeleteFromPartitionAsync(TeamGuessTableEntity.GetPartitionKey(gameStateId, "2")));
        }
    }
}
