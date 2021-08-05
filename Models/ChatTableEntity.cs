using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public class ChatTableEntity : TableEntity
    {
        public ChatTableEntity()
        {

        }

        public string TeamNumber
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public DateTime CreatedTime {
            get { return new DateTime(long.Parse(this.RowKey), DateTimeKind.Utc); }
            set { this.RowKey = value.Ticks.ToString(); }
        }

        public string Message { get; set; }

        public string PlayerId { get; set; }

        public bool IsSystem { get; set; }
        
    }
}
