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

        private string gameStateId;
        public string GameStateId {
            get { return gameStateId; }
            set
            {
                this.gameStateId = value;
                this.PartitionKey = GetPartitionKey(gameStateId, teamNumber);
            }
        }

        private int teamNumber;
        public int TeamNumber
        {
            get { return teamNumber; }
            set
            {
                this.teamNumber = value;
                this.PartitionKey = GetPartitionKey(gameStateId, teamNumber);
            }
        }

        public string TeamGuessId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string Guess { get; set; }

        public double Confidence { get; set; }

        public List<string> PlayerIds { get; set; }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.PlayerIds)))
            {
                this.PlayerIds = properties[nameof(this.PlayerIds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.PlayerIds != null)
            {
                result[nameof(this.PlayerIds)] = new EntityProperty(string.Join(",", this.PlayerIds));
            }

            return result;
        }
    }
}
