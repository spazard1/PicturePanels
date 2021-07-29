using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class GuessEntity
    {
        public GuessEntity()
        {

        }

        public GuessEntity(TeamGuessTableEntity tableEntity)
        {
            this.Guess = tableEntity.Guess;
        }

        [Required]
        [MinLength(1)]
        public string Guess { get; set; }

        public TeamGuessTableEntity ToModel(int teamNumber)
        {
            return new TeamGuessTableEntity()
            {
                TeamNumber = teamNumber,
                CreatedTime = DateTime.UtcNow,
                Guess = this.Guess
            };
        }
    }
}
