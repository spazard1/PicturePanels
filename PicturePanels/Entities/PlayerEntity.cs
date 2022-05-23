using PicturePanels.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PicturePanels.Entities
{
    public class PlayerEntity
    {
        public PlayerEntity()
        {
            this.SelectedPanels = new List<string>();
        }

        public PlayerEntity(PlayerTableEntity tableEntity)
        {
            this.GameStateId = tableEntity.GameStateId;
            this.PlayerId = tableEntity.PlayerId;
            this.Name = tableEntity.Name;
            this.TeamNumber = tableEntity.TeamNumber;
            this.SelectedPanels = tableEntity.SelectedPanels ?? new List<string>();
            this.PreviousGuesses = tableEntity.PreviousGuesses ?? new List<string>();
            this.GuessVoteId = tableEntity.GuessVoteId;
            this.IsReady = tableEntity.IsReady;
            this.Colors = tableEntity.Colors;
            this.Dot = tableEntity.Dot;
            this.IsAdmin = tableEntity.IsAdmin;
        }

        public string GameStateId { get; set; }

        public string PlayerId { get; set; }

        [Required]
        [MinLength(2)]
        [MaxLength(14)]
        public string Name { get; set; }

        public int TeamNumber { get; set; }

        public List<string> SelectedPanels { get; set; }

        public List<string> PreviousGuesses { get; set; }

        public string GuessVoteId { get; internal set; }

        public bool IsReady { get; internal set; }

        public List<string> Colors { get; set; }

        public string Dot { get; set; }

        public bool IsAdmin { get; }

        public string ConnectionId { get; set; }
    }
}
