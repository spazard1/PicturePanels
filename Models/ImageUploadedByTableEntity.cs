using Microsoft.Azure.Cosmos.Table;
using System;

namespace PicturePanels.Models
{
    public class ImageUploadedByTableEntity : TableEntity, IImageIdTableEntity
    {

        public string UploadedBy
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public string ImageId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }
    }
}
