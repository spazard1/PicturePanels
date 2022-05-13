using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class TeamGuessEntity : IComparable<TeamGuessEntity>
    {
        public TeamGuessEntity()
        {

        }

        public TeamGuessEntity(TeamGuessTableEntity tableEntity)
        {
            this.TeamGuessId = tableEntity.TeamGuessId;
            this.Guess = tableEntity.Guess;
            this.Confidence = tableEntity.Confidence;
            this.Players = new List<PlayerNameEntity>();
        }

        public string TeamGuessId { get; set; }

        public string Guess { get; set; }

        public double Confidence { get; set; }

        public List<PlayerNameEntity> Players { get; set; }

        public int CompareTo(TeamGuessEntity other)
        {
            return (int) (other.Confidence - this.Confidence);
        }
    }
}
