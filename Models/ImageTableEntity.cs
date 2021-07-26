using System;
using System.Collections.Generic;
using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
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

        public List<string> AlternativeNames { get; set; }

        public string UploadedBy { get; set; }

        public bool UploadComplete { get; set; }

        public DateTime? UploadCompleteTime { get; set; }

        public DateTime? PlayedTime { get; set; }

        public string ThumbnailId { get; set; }

        public ImageTableEntity Clone()
        {
            return (ImageTableEntity)this.MemberwiseClone();
        }
    }
}
