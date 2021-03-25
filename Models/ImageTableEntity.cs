using System;
using Microsoft.Azure.Cosmos.Table;

namespace CloudStorage.Models
{
    public class ImageTableEntity : TableEntity
    {
        public ImageTableEntity()
        {

        }

        public string BlobContainer
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public string Id
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string BlobName { get; set; }

        public string Name { get; set; }

        public string UploadedBy { get; set; }

        public bool UploadComplete { get; set; }

        public DateTime? PlayedTime { get; set; }

        public ImageTableEntity Clone()
        {
            return (ImageTableEntity)this.MemberwiseClone();
        }
    }
}
