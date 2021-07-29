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

        public TeamGuessTableEntity()
        {
            this.PartitionKey = "Players";
        }

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

        public long Ticks { get; set; }

        public DateTime CreatedTime
        {
            get { return new DateTime(this.Ticks); }
            set
            {
                this.Ticks = value.Ticks;
                this.RowKey = value.Ticks.ToString();
            }
        }

        public string Guess { get; set; }
    }
}
