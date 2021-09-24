using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class UserPlayedImageTableEntity : TableEntity
    {

        public string ImageId
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public string UserId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }
    }
}
