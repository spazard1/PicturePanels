using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class GameRoundsTableEntity : TableEntity
    {
        public const string GameStateDefaultId = "Default";

        public GameRoundsTableEntity()
        {
            this.PartitionKey = GameStateDefaultId;
        }

        public int RoundNumber
        {
            get { return int.Parse(this.RowKey); }
            set { this.RowKey = value.ToString(); }
        }

        public string ImageId { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamOneCorrect { get; set; }

        public int TeamTwoScore { get; set; }

        public int TeamTwoCorrect { get; set; }

    }
}
