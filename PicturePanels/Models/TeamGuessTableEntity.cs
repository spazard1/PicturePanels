using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public class TeamGuessTableEntity : TableEntity
    {
        public static string GetPartitionKey(string gameStateId, string teamNumber)
        {
            return gameStateId + "_" + teamNumber;
        }

        public static string GetPartitionKey(string gameStateId, int teamNumber)
        {
            return GetPartitionKey(gameStateId, teamNumber.ToString());
        }

        public string GetPartitionKey()
        {
            return GetPartitionKey(GameStateId, TeamNumber.ToString());
        }

        public string GameStateId { get; set; }

        public int TeamNumber { get; set; }

        public string TeamGuessId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string Guess { get; set; }

        public int Confidence { get; set; }

        public List<string> PlayerIds { get; set; }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);
            result[nameof(this.PartitionKey)] = new EntityProperty(GetPartitionKey());

            return result;
        }
    }
}
