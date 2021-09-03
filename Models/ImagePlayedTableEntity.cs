using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Models
{
    public class ImagePlayedTableEntity : TableEntity
    {
        public string UserName
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public string ImageId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public DateTime PlayedTime { get; set; }
    }
}
