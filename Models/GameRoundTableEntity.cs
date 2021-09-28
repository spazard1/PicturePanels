using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class GameRoundTableEntity : TableEntity
    {
        public string GameStateId
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public int RoundNumber
        {
            get { return int.Parse(this.RowKey); }
            set { this.RowKey = value.ToString(); }
        }

        public string ImageId { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamTwoScore { get; set; }
    }
}
