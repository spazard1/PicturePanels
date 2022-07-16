using PicturePanels.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace PicturePanels.Entities
{
    public class AvatarsEntity
    {
        public AvatarsEntity(IAsyncEnumerable<PlayerTableEntity> players)
        {
            this.Avatars = players.Select(player => new AvatarEntity() { PlayerId = player.PlayerId, Avatar = player.Avatar }).ToListAsync().Result;
        }

        public List<AvatarEntity> Avatars { get; set; }
    }
}
