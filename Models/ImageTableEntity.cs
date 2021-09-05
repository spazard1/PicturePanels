using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class ImageTableEntity : TableEntity
    {
        public const string DefaultPartitionKey = "images";

        public ImageTableEntity()
        {
            this.PartitionKey = DefaultPartitionKey;
        }

        public string Id
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public bool Approved { get; set; }

        public string BlobContainer { get; set; }

        public string BlobName { get; set; }

        public string Name { get; set; }

        public List<string> Answers { get; set; }

        public List<string> Tags { get; set; }

        public string UploadedBy { get; set; }

        public bool UploadComplete { get; set; }

        public DateTime? UploadCompleteTime { get; set; }

        public string ThumbnailId { get; set; }

        public ImageTableEntity Clone()
        {
            return (ImageTableEntity)this.MemberwiseClone();
        }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.Answers)))
            {
                this.Answers = properties[nameof(this.Answers)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.Tags)))
            {
                this.Tags = properties[nameof(this.Tags)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.Answers != null)
            {
                result[nameof(this.Answers)] = new EntityProperty(string.Join(",", this.Answers));
            }

            if (this.Tags != null)
            {
                result[nameof(this.Tags)] = new EntityProperty(string.Join(",", this.Tags));
            }

            return result;
        }
    }
}
