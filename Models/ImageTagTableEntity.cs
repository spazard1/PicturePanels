using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class ImageTagTableEntity : TableEntity
    {
        public const string AllTag = "all";
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

        public bool IsHidden { get; set; }
    }
}
