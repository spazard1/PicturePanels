using CloudStorage.Models;
using PictureGame.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PictureGame.Services
{
    public interface ISignalRHub
    {
        Task Init();

        Task Players(List<PlayerEntity> entities);

        Task GameState(GameStateEntity entity);

        Task AddPlayer(PlayerEntity entity);

        Task SelectTiles(PlayerEntity entity);

        Task Chat(PlayerEntity entity, string message);

        Task Typing(PlayerEntity entity);

        Task RandomizeTeam(PlayerEntity entity);
    }
}
