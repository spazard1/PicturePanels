using PicturePanels.Models;
using PicturePanels.Services;
using Microsoft.Azure.Cosmos.Table;
using Microsoft.OData;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace PicturePanels.Services.Storage
{
    public class PlayerTableStorage : DefaultAzureTableStorage<PlayerTableEntity>
    {
        public const int PlayerTimeoutInMinutes = 3;

        public PlayerTableStorage(ICloudStorageAccountProvider cloudStorageAccountProvider) : base(cloudStorageAccountProvider, "players")
        {

        }

        public IAsyncEnumerable<PlayerTableEntity> GetActivePlayersAsync(string gameStateId)
        {
            var players = this.GetAllFromPartitionAsync(gameStateId);
            players = players.Where(player => !player.IsAdmin && player.LastPingTime > DateTime.UtcNow.Subtract(TimeSpan.FromMinutes(PlayerTimeoutInMinutes)));
            return players;
        }

        public IAsyncEnumerable<PlayerTableEntity> GetActivePlayersAsync(string gameStateId, int teamNumber)
        {
            var players = GetActivePlayersAsync(gameStateId);
            players = players.Where(player => player.TeamNumber == teamNumber);
            return players;
        }

        public async Task<Dictionary<string, PlayerTableEntity>> GetAllPlayersDictionaryAsync(string gameStateId)
        {
            var players = GetAllFromPartitionAsync(gameStateId);
            var playerDictionary = new Dictionary<string, PlayerTableEntity>();

            await foreach (var player in players)
            {
                playerDictionary[player.PlayerId] = player;
            }

            return playerDictionary;
        }

        public async Task ResetPlayersAsync(GameStateTableEntity gameState)
        {
            if (gameState.TurnType == GameStateTableEntity.TurnTypeEndRound ||
                gameState.TurnType == GameStateTableEntity.TurnTypeEndGame)
            {
                return;
            }
 
            TableBatchOperation batchOperation = new TableBatchOperation();
            await foreach (var playerModel in this.GetActivePlayersAsync(gameState.GameStateId))
            {
                if (batchOperation.Count >= 100)
                {
                    await cloudTable.ExecuteBatchAsync(batchOperation);
                    batchOperation = new TableBatchOperation();
                }

                if (gameState.TurnType == GameStateTableEntity.TurnTypeGuessesMade)
                {
                    playerModel.IsReady = true;
                }
                else if (gameState.TurnType == GameStateTableEntity.TurnTypeMakeGuess ||
                    gameState.TurnType == GameStateTableEntity.TurnTypeVoteGuess)
                {
                    playerModel.IsReady = false;
                }
                else if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
                {
                    playerModel.IsReady = playerModel.TeamNumber != gameState.TeamTurn;
                    playerModel.SelectedPanels = new List<string>();
                    playerModel.Guess = string.Empty;
                    playerModel.GuessVoteId = string.Empty;
                }

                if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel && gameState.TurnNumber == 1)
                {
                    playerModel.PreviousGuesses = new List<string>();
                }

                batchOperation.Add(TableOperation.InsertOrReplace(playerModel));
            }

            if (batchOperation.Count > 0)
            {
                await cloudTable.ExecuteBatchAsync(batchOperation);
            }
        }

        public override async Task<PlayerTableEntity> InsertAsync(PlayerTableEntity tableEntity)
        {
            if (tableEntity.Colors == null || tableEntity.Colors.Count == 0 || string.IsNullOrWhiteSpace(tableEntity.Colors[0]))
            {
                tableEntity.Colors = new List<string> { GenerateRandomColor(tableEntity.PlayerId) };
            }
            return await base.InsertAsync(tableEntity);
        }

        private static string GenerateRandomColor(string playerId)
        {
            var random = new Random(playerId.GetHashCode());
            return "hsl(" + random.Next(0, 360) + "," + random.Next(70, 100) + "%," + random.Next(75, 100) + "%)";
        }
    }
}
