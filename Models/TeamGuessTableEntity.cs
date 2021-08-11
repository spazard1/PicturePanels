using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public class TeamGuessTableEntity : TableEntity
    {
        public const string PartitionKeyPrefix = "team_";

        private int teamNumber;

        public int TeamNumber
        {
            get { return teamNumber; }
            set
            {
                teamNumber = value;
                this.PartitionKey = PartitionKeyPrefix + value;
            }
        }

        public DateTime CreatedTime
        {
            get { return new DateTime(long.Parse(this.RowKey), DateTimeKind.Utc); }
            set { this.RowKey = value.Ticks.ToString(); }
        }

        public string Guess { get; set; }

        public string PlayerId { get; set; }
    }
}
