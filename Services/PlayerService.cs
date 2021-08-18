using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class PlayerService
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly GameStateService gameStateService;

        public PlayerService(GameStateTableStorage gameStateTableStorage,
            PlayerTableStorage playerTableStorage,
            TeamGuessTableStorage teamGuessTableStorage,
            GameStateService gameStateService)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.gameStateService = gameStateService;
        }

        public async Task ReadyAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
            {
                await this.OpenPanelAsync(playerModel);
            }
            else if (gameState.TurnType == GameStateTableEntity.TurnTypeMakeGuess)
            {
                await this.GuessAsync(playerModel);
            }
        }

        private async Task OpenPanelAsync(PlayerTableEntity playerModel)
        {
            var players = await this.playerTableStorage.GetActivePlayersAsync(playerModel.TeamNumber);

            var panelVoteCounts = new Dictionary<string, int>();
            for (int i = 1; i <= 20; i++)
            {
                panelVoteCounts[i.ToString()] = 0;
            }

            foreach (var p in players)
            {
                foreach (var panel in p.SelectedPanels)
                {
                    panelVoteCounts[panel]++;
                }
            }
            List<string> mostVotesPanels = new List<string>();
            int maxVoteCounts = 0;

            foreach (var panelVoteCount in panelVoteCounts)
            {
                if (panelVoteCount.Value > maxVoteCounts)
                {
                    maxVoteCounts = panelVoteCount.Value;
                    mostVotesPanels = new List<string> { panelVoteCount.Key };
                }
                else if (panelVoteCount.Value == maxVoteCounts)
                {
                    mostVotesPanels.Add(panelVoteCount.Key);
                }
            }

            var random = new Random();
            var panelId = mostVotesPanels[random.Next(0, mostVotesPanels.Count())];

            await this.gameStateService.OpenPanelAsync(panelId);
        }

        private async Task GuessAsync(PlayerTableEntity playerModel)
        {
            var players = await this.playerTableStorage.GetActivePlayersAsync(playerModel.TeamNumber);

            var voteCounts = new Dictionary<string, int>();

            foreach (var p in players)
            {
                if (!string.IsNullOrEmpty(p.TeamGuessVote))
                {
                    if (!voteCounts.TryAdd(p.TeamGuessVote, 1))
                    {
                        voteCounts[p.TeamGuessVote]++;
                    }
                }
            }

            var maxGuess = voteCounts.Max();
            var guess = await this.teamGuessTableStorage.GetTeamGuessAsync(playerModel.TeamNumber, maxGuess.Key);

            await this.gameStateService.GuessAsync(playerModel.TeamNumber, guess.Guess);
        }
    }
}
