using CloudStorage.Models;
using System.Collections.Generic;

namespace PictureGame.Entities
{
    public class PlayerEntity
    {
        public PlayerEntity()
        {
            this.SelectedTiles = new List<string>();
        }

        public PlayerEntity(PlayerTableEntity tableEntity)
        {
            this.PlayerId = tableEntity.PlayerId;
            this.Name = tableEntity.Name;
            this.TeamNumber = tableEntity.TeamNumber;
            this.SelectedTiles = tableEntity.SelectedTiles ?? new List<string>();
            this.Color = tableEntity.Color;
            this.IsAdmin = tableEntity.IsAdmin;
        }

        public string PlayerId { get; set; }

        public string Name { get; set; }

        public int TeamNumber { get; set; }

        public List<string> SelectedTiles { get; set; }

        public string Color { get; set; }

        public bool IsAdmin { get; }

        public PlayerTableEntity ToModel()
        {
            return new PlayerTableEntity()
            {
                PlayerId = this.PlayerId,
                Name = this.Name,
                TeamNumber = this.TeamNumber,
                SelectedTiles = this.SelectedTiles,
                Color = this.Color
            };
        }
    }
}
