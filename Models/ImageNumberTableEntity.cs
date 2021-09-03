using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class ImageNumberTableEntity : TableEntity
    {
        public ImageNumberTableEntity()
        {

        }

        public string Tag
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public int Number
        {
            get { return int.Parse(this.RowKey); }
            set { this.RowKey = value.ToString(); }
        }

        public string BlobContainer { get; set; }

        public string ImageId { get; set; }
    }
}
