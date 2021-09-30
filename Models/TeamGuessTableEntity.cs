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

        public string GetPartitionKey()
        {
            return GetPartitionKey(GameStateId, TeamNumber);
        }

        public string GameStateId { get; set; }

        public string TeamNumber { get; set; }

        public DateTime CreatedTime
        {
            get { return new DateTime(long.Parse(this.RowKey), DateTimeKind.Utc); }
            set { this.RowKey = value.Ticks.ToString(); }
        }

        public string Ticks {
            get => this.RowKey;
        }

        public string Guess { get; set; }

        public string PlayerId { get; set; }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);
            result[nameof(this.PartitionKey)] = new EntityProperty(GetPartitionKey());

            return result;
        }
    }
}
