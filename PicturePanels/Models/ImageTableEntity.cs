using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Cosmos.Table;
using Newtonsoft.Json;

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

        public bool IsHidden { get; set; }

        public List<string> AlternativeNames { get; set; }

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

            if (properties.ContainsKey(nameof(this.AlternativeNames)))
            {
                this.AlternativeNames = TableEntityExtension.Deserialize(properties[nameof(this.AlternativeNames)].StringValue);
            }

            if (properties.ContainsKey(nameof(this.Answers)))
            {
                this.Answers = TableEntityExtension.Deserialize(properties[nameof(this.Answers)].StringValue);
            }

            if (properties.ContainsKey(nameof(this.Tags)))
            {
                this.Tags = TableEntityExtension.Deserialize(properties[nameof(this.Tags)].StringValue);
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.AlternativeNames != null)
            {
                result[nameof(this.AlternativeNames)] = new EntityProperty(JsonConvert.SerializeObject(this.AlternativeNames));
            }

            if (this.Answers != null)
            {
                result[nameof(this.Answers)] = new EntityProperty(JsonConvert.SerializeObject(this.Answers));
            }

            if (this.Tags != null)
            {
                result[nameof(this.Tags)] = new EntityProperty(JsonConvert.SerializeObject(this.Tags));
            }

            return result;
        }
    }
}
