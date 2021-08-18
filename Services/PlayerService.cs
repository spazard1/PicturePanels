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

        public PlayerService(GameStateTableStorage gameStateTableStorage, PlayerTableStorage playerTableStorage)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
        }

        public async Task ReadyAsync(PlayerTableEntity playerModel)
        {
            var gameState = await this.gameStateTableStorage.GetGameStateAsync();

            if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
            {
                await this.OpenPanelAsync(playerModel);
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


        }
    }
}
