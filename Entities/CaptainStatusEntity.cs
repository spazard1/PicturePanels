using PicturePanels.Models;

namespace PicturePanels.Entities
{
    public class CaptainStatusEntity
    {
        public CaptainStatusEntity()
        {

        }

        public CaptainStatusEntity(GameStateTableEntity tableEntity, int teamNumber)
        {
            this.Guess = teamNumber == 1 ? tableEntity.TeamOneGuess : tableEntity.TeamTwoGuess;
            this.Status = teamNumber == 1 ? tableEntity.TeamOneCaptainStatus : tableEntity.TeamTwoCaptainStatus;
        }

        public string Guess { get; set; }

        public string Status { get; set; }
    }
}
