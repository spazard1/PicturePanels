using Microsoft.Azure.Cosmos.Table;
using System;

namespace PicturePanels.Models
{
    public class ImageNotApprovedTableEntity : TableEntity
    {
        public const string DefaultPartitionKey = "images";

        public ImageNotApprovedTableEntity()
        {
            this.PartitionKey = DefaultPartitionKey;
        }

        public string ImageId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }
    }
}
