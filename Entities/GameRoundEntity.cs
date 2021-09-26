using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class GameRoundEntity
    {
        public GameRoundEntity()
        {

        }

        public GameRoundEntity(GameRoundTableEntity gameRoundTableEntity)
        {
            this.GameStateId = gameRoundTableEntity.GameStateId;
            this.RoundNumber = gameRoundTableEntity.RoundNumber;
            this.ImageId = gameRoundTableEntity.ImageId;
            this.TeamOneCorrect = gameRoundTableEntity.TeamOneCorrect;
            this.TeamOneScore = gameRoundTableEntity.TeamOneScore;
            this.TeamTwoCorrect = gameRoundTableEntity.TeamTwoCorrect;
            this.TeamTwoScore = gameRoundTableEntity.TeamTwoScore;
        }

        public string GameStateId { get; set; }

        public int RoundNumber { get; set; }

        public string ImageId { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamOneCorrect { get; set; }

        public int TeamTwoScore { get; set; }

        public int TeamTwoCorrect { get; set; }

    }
}
