using System.Collections.Generic;

namespace PicturePanels.Entities
{
    public class VotingPlayersEntity
    {
        public List<PlayerNameEntity> TeamOneVotingPlayers { get; set; }

        public List<PlayerNameEntity> TeamOneNotVotingPlayers { get; set; }

        public List<PlayerNameEntity> TeamTwoVotingPlayers { get; set; }

        public List<PlayerNameEntity> TeamTwoNotVotingPlayers { get; set; }

    }
}
