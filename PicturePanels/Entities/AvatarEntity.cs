using PicturePanels.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PicturePanels.Entities
{
    public class AvatarEntity
    {
        public string PlayerId { get; set; }

        public string Avatar { get; set; }
    }
}
