using Microsoft.Azure.Cosmos.Table;
using System;

namespace PicturePanels.Models
{
    public class GameRoundEntity : IComparable<GameRoundEntity>
    {
        public GameRoundEntity()
        {

        }

        public GameRoundEntity(GameRoundTableEntity gameRoundTableEntity)
        {
            this.RoundNumber = gameRoundTableEntity.RoundNumber;
            this.TeamOneScore = gameRoundTableEntity.TeamOneScore;
            this.TeamTwoScore = gameRoundTableEntity.TeamTwoScore;
        }

        public int RoundNumber { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamTwoScore { get; set; }

        public int CompareTo(GameRoundEntity other)
        {
            return this.RoundNumber - other.RoundNumber;
        }
    }
}
