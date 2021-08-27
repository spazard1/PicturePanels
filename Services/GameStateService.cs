using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Storage;
using System;
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
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly ChatService chatService;
        private readonly GameStateQueueService gameStateQueueService;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;

        public GameStateService(GameStateTableStorage gameStateTableStorage, 
            PlayerTableStorage playerTableStorage,
            ImageTableStorage imageTableStorage,
            TeamGuessTableStorage teamGuessTableStorage,
            ChatService chatService,
            GameStateQueueService gameStateQueueService,
            IHubContext<SignalRHub, ISignalRHub> hubContext,
            SignalRHelper signalRHelper)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.chatService = chatService;
            this.gameStateQueueService = gameStateQueueService;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
        }

        public async Task ToNextTurnTypeAsync(GameStateTableEntity gameState)
        {
            switch (gameState.TurnType)
            {
                case GameStateTableEntity.TurnTypeOpenPanel:
                    gameState = await this.OpenMostVotesPanelAsync(gameState);
                    break;
                case GameStateTableEntity.TurnTypeMakeGuess:
                    gameState = await this.SubmitMostVotesTeamGuessAsync(gameState);
                    break;
                case GameStateTableEntity.TurnTypeGuessesMade:
                    gameState = await this.ExitGuessesMadeAsync(gameState);
                    break;
                case GameStateTableEntity.TurnTypeEndRound:
                    gameState = await this.ExitEndRoundAsync(gameState);
                    break;
            }

             await hubContext.Clients.All.GameState(new GameStateEntity(gameState));
        }

        public async Task PlayerReadyAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
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

        public async Task<GameStateTableEntity> OpenPanelAsync(GameStateTableEntity gameState, string panelId)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.OpenPanel(panelId);
                gs.ClearGuesses();
                gs.NewTurnType(GameStateTableEntity.TurnTypeMakeGuess);
            });

            await this.playerTableStorage.ResetPlayersAsync();
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState));

            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> OpenMostVotesPanelAsync(GameStateTableEntity gameState)
        {
            var panelIdToOpen = await this.GetMostVotesPanelAsync(gameState);
            gameState = await this.OpenPanelAsync(gameState, panelIdToOpen);
            await this.chatService.SendChatAsync(gameState.TeamTurn, "Voting for panels is finished! Your team opened panel " + panelIdToOpen + ".", true);

            return gameState;
        }

        public async Task<GameStateTableEntity> OpenMostVotesPanelAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            var panelIdToOpen = await this.GetMostVotesPanelAsync(gameState);
            gameState = await this.OpenPanelAsync(gameState, panelIdToOpen);
            await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team opened panel " + panelIdToOpen + ".", true);
            return gameState;
        }

        private async Task<string> GetMostVotesPanelAsync(GameStateTableEntity gameState)
        {
            var players = await this.playerTableStorage.GetActivePlayersAsync(gameState.TeamTurn);

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

            return panelIdToOpen;
        }

        public async Task<GameStateTableEntity> ForceOpenPanelAsync(GameStateTableEntity gameState, string panelId)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.OpenPanel(panelId, true);
            });
            await hubContext.Clients.All.GameState(new GameStateEntity(gameState), GameStateTableEntity.UpdateTypeNewTurn);

            return gameState;
        }

        public async Task<GameStateTableEntity> GuessAsync(GameStateTableEntity gameState, int teamNumber, string guess)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.Guess(teamNumber, guess);
            });

            return gameState;
        }

        public async Task<GameStateTableEntity> PassAsync(GameStateTableEntity gameState, int teamNumber)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.Pass(teamNumber);
            });

            return gameState;
        }

        public async Task<GameStateTableEntity> SubmitMostVotesTeamGuessAsync(GameStateTableEntity gameState)
        {
            if (string.IsNullOrWhiteSpace(gameState.TeamOneGuessStatus))
            {
                gameState = await SubmitMostVotesTeamGuessAsync(gameState, 1);
            }
            if (string.IsNullOrWhiteSpace(gameState.TeamTwoGuessStatus))
            {
                gameState = await SubmitMostVotesTeamGuessAsync(gameState, 2);
            }

            gameState = await this.ExitMakeGuessIfNeededAsync(gameState);

            return gameState;
        }

        private async Task<GameStateTableEntity> SubmitMostVotesTeamGuessAsync(GameStateTableEntity gameState, int teamNumber)
        {
            var teamGuess = await this.GetMostVotesTeamGuessAsync(teamNumber);
            if (teamGuess == null)
            {
                gameState = await this.PassAsync(gameState, teamNumber);
                return gameState;
            }

            gameState = await this.GuessAsync(gameState, teamNumber, teamGuess.Guess);
            await signalRHelper.DeleteTeamGuessAsync(new TeamGuessEntity(teamGuess), teamNumber);
            await this.teamGuessTableStorage.DeleteAsync(teamGuess);

            return gameState;
        }

        public async Task<GameStateTableEntity> SubmitMostVotesTeamGuessAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            var teamGuess = await this.GetMostVotesTeamGuessAsync(playerModel.TeamNumber);
            if (teamGuess == null)
            {
                gameState = await this.PassAsync(gameState, playerModel.TeamNumber);
                await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team passed.", true);
                return gameState;
            }
            
            gameState = await this.GuessAsync(gameState, playerModel.TeamNumber, teamGuess.Guess);
            await signalRHelper.DeleteTeamGuessAsync(new TeamGuessEntity(teamGuess), playerModel.TeamNumber);
            await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team submitted the guess \"" + teamGuess.Guess + ".\"", true);
            await this.teamGuessTableStorage.DeleteAsync(teamGuess);

            return gameState;
        }

        public async Task<TeamGuessTableEntity> GetMostVotesTeamGuessAsync(int teamNumber)
        {
            var players = await this.playerTableStorage.GetActivePlayersAsync(teamNumber);

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
                return null;
            }
            
            mostVotesTeamGuesses.Sort();
            foreach (var mostVotesTeamGuess in mostVotesTeamGuesses)
            {
                var teamGuess = await this.teamGuessTableStorage.GetAsync(teamNumber, mostVotesTeamGuess);
                if (teamGuess != null)
                {
                    return teamGuess;
                }
            }

            var teamGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(teamNumber);

            if (teamGuesses.Any())
            {
                return teamGuesses.First();
            }
            else
            {
                return null;
            }
        }

        public async Task<GameStateTableEntity> ExitMakeGuessIfNeededAsync(GameStateTableEntity gameState)
        {
            if (gameState.TurnType == GameStateTableEntity.TurnTypeMakeGuess &&
                !string.IsNullOrWhiteSpace(gameState.TeamOneGuessStatus) &&
                !string.IsNullOrWhiteSpace(gameState.TeamTwoGuessStatus))
            {
                var imageEntity = await this.imageTableStorage.GetAsync(gameState.BlobContainer, gameState.ImageId);
                if (imageEntity.Answers == null || !imageEntity.Answers.Any())
                {
                    imageEntity = await this.imageTableStorage.ReplaceAsync(imageEntity, i =>
                    {
                        i.Answers = new List<string>() { GuessChecker.Prepare(imageEntity.Name) };
                    });
                }

                gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
                {
                    gs.TeamOneCorrect = gameState.TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gs.TeamOneGuess, imageEntity.Answers);
                    gs.TeamTwoCorrect = gameState.TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gs.TeamTwoGuess, imageEntity.Answers);

                    gs.IncrementScores();
                    gs.NewTurnType(GameStateTableEntity.TurnTypeGuessesMade);
                });

                await this.playerTableStorage.ResetPlayersAsync();

                await hubContext.Clients.All.GameState(new GameStateEntity(gameState), GameStateTableEntity.UpdateTypeNewTurn);

                await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);
            }

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitGuessesMadeAsync(GameStateTableEntity gameState)
        {
            var updateType = string.Empty;
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                if (gs.TeamOneCorrect || gs.TeamTwoCorrect)
                {
                    updateType = GameStateTableEntity.UpdateTypeNewRound;
                    gs.NewRound();
                }
                else if (gs.RevealedPanels.Count > GameStateTableEntity.MaxOpenPanels)
                {
                    updateType = GameStateTableEntity.UpdateTypeNewTurn;
                    gs.NewTurnType(GameStateTableEntity.TurnTypeEndRound);
                }
                else
                {
                    updateType = GameStateTableEntity.UpdateTypeNewTurn;
                    gs.NewTurnType(GameStateTableEntity.TurnTypeOpenPanel);
                    gs.SwitchTeamTurn();
                }
            });

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState), updateType);

            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitEndRoundAsync(GameStateTableEntity gameState)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.NewRound();
            });

            await hubContext.Clients.All.GameState(new GameStateEntity(gameState), GameStateTableEntity.UpdateTypeNewRound);

            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }
    }
}
