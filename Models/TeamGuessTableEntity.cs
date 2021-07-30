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
        public string Ticks
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string Guess { get; set; }
    }
}
