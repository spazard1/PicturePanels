using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class PlayerService
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly GameStateService gameStateService;
        private readonly ChatService chatService;
        private readonly SignalRHelper signalRHelper;

        public PlayerService(PlayerTableStorage playerTableStorage,
            TeamGuessTableStorage teamGuessTableStorage,
            GameStateService gameStateService,
            ChatService chatService,
            SignalRHelper signalRHelper)
        {
            this.playerTableStorage = playerTableStorage;
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.gameStateService = gameStateService;
            this.chatService = chatService;
            this.signalRHelper = signalRHelper;
        }

        public async Task ReadyAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
            {
                await this.OpenMostVotesPanelAsync(gameState, playerModel);
            }
            else if (gameState.TurnType == GameStateTableEntity.TurnTypeMakeGuess)
            {
                await this.SubmitMostVotesTeamGuessAsync(gameState, playerModel);
            }
        }

        private async Task OpenMostVotesPanelAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            var players = await this.playerTableStorage.GetActivePlayersAsync(playerModel.TeamNumber);

            var panelVoteCounts = new Dictionary<string, int>();
            for (int i = 1; i <= 20; i++)
            {
                panelVoteCounts[i.ToString()] = 0;
            }

            foreach (var p in players)
            {
                if (p.TeamNumber == 1 && gameState.TeamOneInnerPanels <= 0 || p.TeamNumber == 2 && gameState.TeamTwoInnerPanels <= 0)
                {
                    p.SelectedPanels.RemoveAll(sp => GameStateTableEntity.InnerPanels.Contains(sp));
                }
                foreach (var panel in p.SelectedPanels)
                {
                    panelVoteCounts[panel]++;
                }
            }
            List<string> mostVotesPanels = new List<string>();
            int maxVoteCount = 0;

            foreach (var panelVoteCount in panelVoteCounts)
            {
                if (panelVoteCount.Value > maxVoteCount)
                {
                    maxVoteCount = panelVoteCount.Value;
                    mostVotesPanels = new List<string> { panelVoteCount.Key };
                }
                else if (panelVoteCount.Value == maxVoteCount)
                {
                    mostVotesPanels.Add(panelVoteCount.Key);
                }
            }

            string panelIdToOpen = string.Empty;
            if (maxVoteCount > 0 && mostVotesPanels.Any())
            {
                var random = new Random();
                panelIdToOpen = mostVotesPanels[random.Next(0, mostVotesPanels.Count)];
            }
            else
            {
                foreach (var panelId in GameStateTableEntity.AllPanels)
                {
                    if (!gameState.RevealedPanels.Contains(panelId))
                    {
                        panelIdToOpen = panelId;
                        break;
                    }
                }
            }

            await this.gameStateService.OpenPanelAsync(gameState, panelIdToOpen);
            await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team opened panel " + panelIdToOpen + ".", true);
        }

        private async Task SubmitMostVotesTeamGuessAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
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

            List<string> mostVotesTeamGuesses = new List<string>();
            int maxVoteCount = 0;

            foreach (var voteCount in voteCounts)
            {
                if (voteCount.Value > maxVoteCount)
                {
                    maxVoteCount = voteCount.Value;
                    mostVotesTeamGuesses = new List<string> { voteCount.Key };
                }
                else if (voteCount.Value == maxVoteCount)
                {
                    mostVotesTeamGuesses.Add(voteCount.Key);
                }
            }

            if (mostVotesTeamGuesses.Contains(GameStateTableEntity.TeamGuessStatusPass))
            {
                await this.SendPassAsync(gameState, playerModel);
            }
            else
            {
                mostVotesTeamGuesses.Sort();
                foreach (var mostVotesTeamGuess in mostVotesTeamGuesses)
                {
                    var teamGuess = await this.teamGuessTableStorage.GetAsync(playerModel.TeamNumber, mostVotesTeamGuess);
                    if (teamGuess != null)
                    {
                        await this.SendGuessAsync(gameState, playerModel, teamGuess);
                        return;
                    }
                }

                var teamGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(playerModel.TeamNumber);

                if (teamGuesses.Any())
                {
                    await this.SendGuessAsync(gameState, playerModel, teamGuesses.First());
                }
                else
                {
                    await this.SendPassAsync(gameState, playerModel);
                }
            }
        }

        private async Task SendGuessAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel, TeamGuessTableEntity teamGuess)
        {
            await this.gameStateService.GuessAsync(gameState, playerModel.TeamNumber, teamGuess.Guess);
            await signalRHelper.DeleteTeamGuessAsync(new TeamGuessEntity(teamGuess), playerModel.TeamNumber);
            await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team submitted the guess \"" + teamGuess.Guess + ".\"", true);
            await this.teamGuessTableStorage.DeleteAsync(teamGuess);
        }

        private async Task SendPassAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            await this.gameStateService.PassAsync(gameState, playerModel.TeamNumber);
            await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team passed.", true);
        }
    }
}
