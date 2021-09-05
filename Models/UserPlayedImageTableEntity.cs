using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class UserPlayedImageTableEntity : TableEntity
    {
        public string UserId
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public int ImageId
        {
            get { return int.Parse(this.RowKey); }
            set { this.RowKey = value.ToString(); }
        }
    }
}
