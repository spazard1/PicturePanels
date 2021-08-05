﻿using PicturePanels.Models;

namespace PicturePanels.Entities
{
    public class ChatEntity
    {
        public ChatEntity()
        {

        }

        public ChatEntity(ChatTableEntity tableEntity, PlayerTableEntity playerEntity)
        {
            this.TeamNumber = tableEntity.TeamNumber;
            this.Message = tableEntity.Message;
            this.Ticks = tableEntity.CreatedTime.Ticks.ToString();
            this.IsSystem = tableEntity.IsSystem;
            this.Player = new PlayerEntity(playerEntity);
        }

        public string TeamNumber { get; set; }

        public string Message { get; set; }

        public string Ticks { get; set; }

        public bool IsSystem { get; set; }

        public PlayerEntity Player { get; set; }
    }
}
