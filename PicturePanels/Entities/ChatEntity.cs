using PicturePanels.Models;

namespace PicturePanels.Entities
{
    public class ChatEntity
    {
        public ChatEntity()
        {

        }

        public ChatEntity(ChatTableEntity tableEntity, PlayerTableEntity playerEntity)
        {
            this.GameStateId = tableEntity.GameStateId;
            this.TeamNumber = tableEntity.TeamNumber;
            this.Message = tableEntity.Message;
            this.Ticks = tableEntity.CreatedTime.Ticks.ToString();
            this.IsSystem = tableEntity.IsSystem;
            this.Player = new PlayerNameEntity(playerEntity);
        }

        public ChatEntity(ChatTableEntity tableEntity)
        {
            this.GameStateId = tableEntity.GameStateId;
            this.TeamNumber = tableEntity.TeamNumber;
            this.Message = tableEntity.Message;
            this.Ticks = tableEntity.CreatedTime.Ticks.ToString();
            this.IsSystem = tableEntity.IsSystem;
        }

        public string GameStateId { get; set; }

        public string TeamNumber { get; set; }

        public string Message { get; set; }

        public string Ticks { get; set; }

        public bool IsSystem { get; set; }

        public PlayerNameEntity Player { get; set; }
    }
}
