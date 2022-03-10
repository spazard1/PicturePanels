using Microsoft.Azure.Cosmos.Table;
using System;

namespace PicturePanels.Models
{
    public class ActiveGameBoardTableEntity : TableEntity
    {
        public string GameStateId
        {
            get { return this.PartitionKey; }
            set
            {
                this.PartitionKey = value;
                this.RowKey = value;
            }
        }

        public DateTime PingTime { get; set; }
    }
}
