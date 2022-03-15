﻿using System;
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
            GameStateId = gameState.GameStateId;
            RoundNumber = gameState.RoundNumber;
            TurnType = gameState.TurnType;
            TurnNumber = gameState.TurnNumber;
            TurnEndTime = gameState.TurnEndTime.Value;
        }

        public string GameStateId { get; set; }

        public int RoundNumber { get; set; }

        public string TurnType { get; set; }

        public int TurnNumber { get; set; }

        public DateTime TurnEndTime { get; set; }
    }
}