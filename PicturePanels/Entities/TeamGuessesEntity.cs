using System.Collections.Generic;

namespace PicturePanels.Entities
{
    public class TeamGuessesEntity
    {
        public TeamGuessesEntity()
        {

        }

        public TeamGuessesEntity(List<TeamGuessEntity> teamGuesses, int passVoteCount)
        {
            this.TeamGuesses = teamGuesses;
            this.PassVoteCount = passVoteCount;
        }

        public List<TeamGuessEntity> TeamGuesses { get; set; }

        public int PassVoteCount { get; internal set; }
    }
}
