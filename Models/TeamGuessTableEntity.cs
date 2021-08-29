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

        public string GameStateId { get; set; }

        public string TeamNumber { get; set; }

        public DateTime CreatedTime
        {
            get { return new DateTime(long.Parse(this.RowKey), DateTimeKind.Utc); }
            set { this.RowKey = value.Ticks.ToString(); }
        }

        public string Guess { get; set; }

        public string PlayerId { get; set; }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            this.PartitionKey = GameStateId + "_" + TeamNumber;

            var result = base.WriteEntity(operationContext);

            return result;
        }
    }
}
