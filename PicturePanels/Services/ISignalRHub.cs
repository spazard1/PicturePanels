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

        Task ScoreChange(ScoreChangeEntity entity);

        Task AddTeamGuess(TeamGuessEntity teamGuessEntity);

        Task AddTeamGuess(TeamGuessEntity teamGuessEntity, string creatorPlayerId);

        Task DeleteTeamGuess(TeamGuessEntity teamGuessEntity);

        Task VoteTeamGuess(string oldVote, string newVote, string playerId);

        Task AddPlayer(PlayerEntity entity);

        Task SelectPanels(PlayerEntity entity);

        Task PlayerReady(PlayerEntity entity);

        Task Chat(ChatEntity entity);

        Task Typing(PlayerEntity entity);

        Task RandomizeTeam(PlayerEntity entity);
    }
}
