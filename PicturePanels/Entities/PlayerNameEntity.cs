using PicturePanels.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PicturePanels.Entities
{
    public class PlayerNameEntity
    {

        public PlayerNameEntity(PlayerTableEntity tableEntity)
        {
            this.PlayerId = tableEntity.PlayerId;
            this.Name = tableEntity.Name;
            this.TeamNumber = tableEntity.TeamNumber;
            this.Color = tableEntity.Color;
        }

        public string PlayerId { get; set; }

        public string Name { get; set; }

        public int TeamNumber { get; set; }

        public string Color { get; set; }
    }
}
