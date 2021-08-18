using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using PicturePanels.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GameStateService
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly ImageTableStorage imageTableStorage;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;

        public GameStateService(GameStateTableStorage gameStateTableStorage, 
            PlayerTableStorage playerTableStorage,
            ImageTableStorage imageTableStorage,
            IHubContext<SignalRHub, ISignalRHub> hubContext)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.hubContext = hubContext;
        }

        public async Task<GameStateTableEntity> OpenPanelAsync(GameStateTableEntity gameState, string panelId)
        {
            gameState.OpenPanel(panelId);
            gameState.ClearGuesses();

            await this.playerTableStorage.ResetPlayersAsync();

            gameState.TurnType = GameStateTableEntity.TurnTypeMakeGuess;

            gameState = await this.gameStateTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
            
            return gameState;
        }

        public async Task<GameStateTableEntity> ForceOpenPanelAsync(GameStateTableEntity gameState, string panelId)
        {
            gameState.OpenPanel(panelId, true);

            gameState = await this.gameStateTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return gameState;
        }

        public async Task<GameStateTableEntity> GuessAsync(GameStateTableEntity gameState, int teamNumber, string guess)
        {
            if (teamNumber == 1)
            {
                gameState.TeamOneGuess = guess;
                gameState.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
            }
            else
            {
                gameState.TeamTwoGuess = guess;
                gameState.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);
            gameState = await this.gameStateTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return gameState;
        }

        public async Task<GameStateTableEntity> PassAsync(GameStateTableEntity gameState, int teamNumber)
        {
            if (teamNumber == 1)
            {
                gameState.TeamOneGuess = string.Empty;
                gameState.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusPass;
            }
            else
            {
                gameState.TeamTwoGuess = string.Empty;
                gameState.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusPass;
            }

            await this.HandleBothTeamsGuessReadyAsync(gameState);
            gameState = await this.gameStateTableStorage.AddOrUpdateGameStateAsync(gameState);
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            return gameState;
        }

        public async Task HandleBothTeamsGuessReadyAsync(GameStateTableEntity gameState)
        {
            if (!string.IsNullOrWhiteSpace(gameState.TeamOneGuessStatus) && !string.IsNullOrWhiteSpace(gameState.TeamTwoGuessStatus))
            {
                var imageEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);
                if (imageEntity.Answers == null || !imageEntity.Answers.Any())
                {
                    imageEntity.Answers = new List<string>() { GuessChecker.Prepare(imageEntity.Name) };
                    imageEntity = await this.imageTableStorage.AddOrUpdateAsync(imageEntity);
                }

                gameState.TeamOneCorrect = gameState.TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gameState.TeamOneGuess, imageEntity.Answers);
                gameState.TeamTwoCorrect = gameState.TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gameState.TeamTwoGuess, imageEntity.Answers);

                gameState.IncrementScores();
                gameState.TurnType = GameStateTableEntity.TurnTypeGuessesMade;
            }
        }
    }
}
