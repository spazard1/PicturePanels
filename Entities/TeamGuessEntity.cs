using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class TeamGuessEntity
    {
        public TeamGuessEntity()
        {

        }

        public TeamGuessEntity(TeamGuessTableEntity tableEntity, PlayerEntity playerEntity)
        {
            this.Guess = tableEntity.Guess;
            this.Ticks = tableEntity.CreatedTime.Ticks.ToString();
            this.Player = playerEntity;
        }

        public string Guess { get; set; }

        public string Ticks { get; set; }

        public PlayerEntity Player { get; set; }
    }
}
