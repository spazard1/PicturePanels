using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using PicturePanels.Models;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateService
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;

        public GameStateService(GameStateTableStorage gameStateTableStorage, 
            PlayerTableStorage playerTableStorage,
            IHubContext<SignalRHub, ISignalRHub> hubContext)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.hubContext = hubContext;
        }

        public async Task OpenPanelAsync(string panelId)
        {
            var gameState = await this.gameStateTableStorage.GetGameStateAsync();
            gameState.OpenPanel(panelId);
            gameState.ClearGuesses();

            await this.playerTableStorage.ResetPlayersAsync();

            gameState.TurnType = GameStateTableEntity.TurnTypeMakeGuess;

            gameState = await this.gameStateTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
        }

        public async Task ForceOpenPanelAsync(string panelId)
        {
            var gameState = await this.gameStateTableStorage.GetGameStateAsync();
            gameState.OpenPanel(panelId, true);

            gameState = await this.gameStateTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
        }
    }
}
