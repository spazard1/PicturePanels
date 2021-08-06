using PicturePanels.Models;
using System.Collections.Generic;

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
            this.PlayerId = tableEntity.PlayerId;
            this.Name = tableEntity.Name;
            this.TeamNumber = tableEntity.TeamNumber;
            this.SelectedPanels = tableEntity.SelectedPanels ?? new List<string>();
            this.Color = tableEntity.Color;
            this.IsAdmin = tableEntity.IsAdmin;
        }

        public string PlayerId { get; set; }

        public string Name { get; set; }

        public int TeamNumber { get; set; }

        public List<string> SelectedPanels { get; set; }

        public string Color { get; set; }

        public bool IsAdmin { get; }

        public string ConnectionId { get; set; }

        public PlayerTableEntity ToModel()
        {
            return new PlayerTableEntity()
            {
                PlayerId = this.PlayerId,
                Name = this.Name,
                TeamNumber = this.TeamNumber,
                SelectedPanels = this.SelectedPanels,
                Color = this.Color,
                ConnectionId = this.ConnectionId
            };
        }
    }
}
