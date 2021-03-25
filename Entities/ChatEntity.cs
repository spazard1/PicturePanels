using CloudStorage.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PictureGame.Entities
{
    public class ChatEntity
    {
        public ChatEntity()
        {

        }

        public ChatEntity(ChatTableEntity tableEntity, PlayerEntity playerEntity)
        {
            this.TeamNumber = tableEntity.TeamNumber;
            this.Message = tableEntity.Message;
            this.Player = playerEntity;
        }

        public string TeamNumber { get; set; }

        public string Message { get; set; }

        public PlayerEntity Player { get; set; }
    }
}
