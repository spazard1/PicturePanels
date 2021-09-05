using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Models
{
    public class ImageTagTableEntity : TableEntity
    {
        public const string DefaultPartitionKey = "imagetags";

        public ImageTagTableEntity()
        {
            this.PartitionKey = DefaultPartitionKey;
        }

        public string Tag
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public int Count { get; set; }
    }
}
