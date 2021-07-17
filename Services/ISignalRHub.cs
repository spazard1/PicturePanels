using CloudStorage.Models;
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

        Task AddPlayer(PlayerEntity entity);

        Task SelectPanels(PlayerEntity entity);

        Task Chat(PlayerEntity entity, string message);

        Task Typing(PlayerEntity entity);

        Task RandomizeTeam(PlayerEntity entity);
    }
}
