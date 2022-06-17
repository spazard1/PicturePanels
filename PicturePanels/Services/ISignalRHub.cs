using PicturePanels.Models;
using PicturePanels.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public interface ISignalRHub
    {
        Task Init();

        Task Players(List<PlayerEntity> entities);

        Task GameState(GameStateEntity entity);

        Task OpenPanel();

        Task ScoreChange(ScoreChangeEntity entity);

        Task TeamGuesses(List<TeamGuessEntity> teamGuessEntities);

        Task CorrectGuessPlayers(CorrectGuessPlayersEntity correctGuessPlayersEntity);

        Task Player(PlayerEntity entity, bool isNew);

        Task SelectPanels(PlayerEntity entity);

        Task PlayerReady(string playerId);

        Task Chat(ChatEntity entity);

        Task Typing(PlayerEntity entity);

        Task RandomizeTeam(PlayerEntity entity);
    }
}
