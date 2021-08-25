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

        public async Task<TeamGuessTableEntity> GetAsync(int teamNumber, string ticks)
        {
            return await this.GetAsync(TeamGuessTableEntity.PartitionKeyPrefix + teamNumber, ticks);
        }

        public async Task<List<TeamGuessTableEntity>> GetTeamGuessesAsync(int teamNumber)
        {
            return await this.GetAllFromPartitionAsync(TeamGuessTableEntity.PartitionKeyPrefix + teamNumber);
        }

        public async Task DeleteTeamGuessesAsync()
        {
            await Task.WhenAll(this.DeleteFromPartitionAsync(TeamGuessTableEntity.PartitionKeyPrefix + 1), this.DeleteFromPartitionAsync(TeamGuessTableEntity.PartitionKeyPrefix + 2));
        }
    }
}
