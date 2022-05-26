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
            this.Colors = tableEntity.Colors;
            this.Avatar = tableEntity.Avatar;
        }

        public string PlayerId { get; set; }

        public string Name { get; set; }

        public int TeamNumber { get; set; }

        public List<string> Colors { get; set; }

        public string Avatar { get; set; }
    }
}
