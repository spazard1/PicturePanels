using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Models
{
    public class GameStateUpdateMessage
    {
        public GameStateUpdateMessage()
        {

        }

        public GameStateUpdateMessage(GameStateTableEntity gameState)
        {
            Id = Guid.NewGuid().ToString();
            RoundNumber = gameState.RoundNumber;
            TurnType = gameState.TurnType;
            TurnNumber = gameState.TurnNumber;
        }

        public string Id { get; set; }

        public int RoundNumber { get; set; }

        public string TurnType { get; set; }

        public int TurnNumber { get; set; }
    }
}
