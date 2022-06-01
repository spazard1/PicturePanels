using System.Collections.Generic;

namespace PicturePanels.Entities
{
    public class CorrectGuessPlayersEntity
    {
        public List<PlayerNameEntity> TeamOnePlayers { get; set; }

        public List<PlayerNameEntity> TeamTwoPlayers { get; set; }
    }
}
