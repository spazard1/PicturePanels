using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class TeamGuessEntity : IComparable<TeamGuessTableEntity>
    {
        public TeamGuessEntity()
        {

        }

        public TeamGuessEntity(TeamGuessTableEntity tableEntity)
        {
            this.TeamGuessId = tableEntity.TeamGuessId;
            this.Guess = tableEntity.Guess;
            this.Confidence = tableEntity.Confidence;
        }

        public string TeamGuessId { get; set; }

        public string Guess { get; set; }

        public double Confidence { get; set; }

        public int CompareTo(TeamGuessTableEntity other)
        {
            return (int) (this.Confidence - other.Confidence);
        }
    }
}
