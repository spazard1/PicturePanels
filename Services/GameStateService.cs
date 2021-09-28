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
        private readonly GameRoundTableStorage gameRoundTableStorage;
        private readonly ImageTagTableStorage imageTagTableStorage;
        private readonly ImageNumberTableStorage imageNumberTableStorage;
        private readonly UserPlayedImageTableStorage userPlayedImageTableStorage;
        private readonly ActiveGameBoardTableStorage activeGameBoardTableStorage;
        private readonly ChatService chatService;
        private readonly GameStateQueueService gameStateQueueService;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly SignalRHelper signalRHelper;

        public GameStateService(GameStateTableStorage gameStateTableStorage, 
            PlayerTableStorage playerTableStorage,
            ImageTableStorage imageTableStorage,
            TeamGuessTableStorage teamGuessTableStorage,
            GameRoundTableStorage gameRoundTableStorage,
            ImageTagTableStorage imageTagTableStorage,
            ImageNumberTableStorage imageNumberTableStorage,
            UserPlayedImageTableStorage userPlayedImageTableStorage,
            ActiveGameBoardTableStorage activeGameBoardTableStorage,
            ChatService chatService,
            GameStateQueueService gameStateQueueService,
            IHubContext<SignalRHub, ISignalRHub> hubContext,
            SignalRHelper signalRHelper)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.imageTableStorage = imageTableStorage;
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.gameRoundTableStorage = gameRoundTableStorage;
            this.imageTagTableStorage = imageTagTableStorage;
            this.imageNumberTableStorage = imageNumberTableStorage;
            this.userPlayedImageTableStorage = userPlayedImageTableStorage;
            this.activeGameBoardTableStorage = activeGameBoardTableStorage;
            this.chatService = chatService;
            this.gameStateQueueService = gameStateQueueService;
            this.hubContext = hubContext;
            this.signalRHelper = signalRHelper;
        }

        public async Task ToNextTurnTypeAsync(GameStateTableEntity gameState)
        {
            switch (gameState.TurnType)
            {
                case GameStateTableEntity.TurnTypeWelcome:
                    gameState = await this.StartGameAsync(gameState);
                    break;
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

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
        }

        public async Task<GameStateTableEntity> QueueStartGameAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.TurnEndTime = DateTime.UtcNow.AddSeconds(10);
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);
            await this.chatService.SendBroadcastAsync(playerModel, "has started the game!");

            return gameState;
        }

        public async Task<GameStateTableEntity> StartGameAsync(GameStateTableEntity gameState)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.StartGame();
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);
            return gameState;
        }

        public async Task<GameStateTableEntity> CancelStartGameAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.TurnEndTime = null;
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.chatService.SendBroadcastAsync(playerModel, "canceled the start of the game.");

            return gameState;
        }

        public async Task QueueNextTurnIfNeeded(string gameStateId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);

            if (gameState.TurnEndTime.HasValue && gameState.TurnEndTime.Value.AddSeconds(GameStateTableEntity.TurnEndTimeGracePeriod) < DateTime.UtcNow)
            {
                await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);
            }
        }

        public async Task SetGameBoardActiveAsync(string gameStateId)
        {
            await this.activeGameBoardTableStorage.InsertOrReplaceAsync(new ActiveGameBoardTableEntity()
            {
                GameStateId = gameStateId,
                PingTime = DateTime.UtcNow
            });
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

            await this.playerTableStorage.ResetPlayersAsync(gameState.GameStateId);
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState), GameStateTableEntity.UpdateTypeNewTurn);
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> OpenMostVotesPanelAsync(GameStateTableEntity gameState)
        {
            var panelIdToOpen = await this.GetMostVotesPanelAsync(gameState);
            gameState = await this.OpenPanelAsync(gameState, panelIdToOpen);
            await this.chatService.SendChatAsync(gameState.GameStateId, gameState.TeamTurn, "Voting for panels is finished! Your team opened panel " + panelIdToOpen + ".", true);

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
            var panelVoteCounts = new Dictionary<string, int>();
            for (int i = 1; i <= 20; i++)
            {
                panelVoteCounts[i.ToString()] = 0;
            }

            await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, gameState.TeamTurn))
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
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState), GameStateTableEntity.UpdateTypeNewTurn);

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
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));

            return gameState;
        }

        private async Task<GameStateTableEntity> SubmitMostVotesTeamGuessAsync(GameStateTableEntity gameState, int teamNumber)
        {
            var teamGuess = await this.GetMostVotesTeamGuessAsync(gameState, teamNumber);
            if (teamGuess == null)
            {
                gameState = await this.PassAsync(gameState, teamNumber);
                return gameState;
            }

            gameState = await this.GuessAsync(gameState, teamNumber, teamGuess.Guess);
            await signalRHelper.DeleteTeamGuessAsync(gameState.GameStateId, new TeamGuessEntity(teamGuess), teamNumber);
            await this.teamGuessTableStorage.DeleteAsync(teamGuess);

            return gameState;
        }

        public async Task<GameStateTableEntity> SubmitMostVotesTeamGuessAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            var teamGuess = await this.GetMostVotesTeamGuessAsync(gameState, playerModel.TeamNumber);
            if (teamGuess == null)
            {
                gameState = await this.PassAsync(gameState, playerModel.TeamNumber);
                await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team passed.", true);
            }
            else
            {
                gameState = await this.GuessAsync(gameState, playerModel.TeamNumber, teamGuess.Guess);
                await signalRHelper.DeleteTeamGuessAsync(gameState.GameStateId, new TeamGuessEntity(teamGuess), playerModel.TeamNumber);
                await this.chatService.SendChatAsync(playerModel, "confirmed the team is ready! Your team submitted the guess \"" + teamGuess.Guess + ".\"", true);
                await this.teamGuessTableStorage.DeleteAsync(teamGuess);
            }

            gameState = await this.ExitMakeGuessIfNeededAsync(gameState);
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));

            return gameState;
        }

        public async Task<TeamGuessTableEntity> GetMostVotesTeamGuessAsync(GameStateTableEntity gameState, int teamNumber)
        {
            var voteCounts = new Dictionary<string, int>();

            await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, teamNumber))
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

            if (mostVotesTeamGuesses.Contains(GameStateTableEntity.TeamGuessStatusPass) || maxVoteCount == 0)
            {
                return null;
            }
            
            mostVotesTeamGuesses.Sort();
            foreach (var mostVotesTeamGuess in mostVotesTeamGuesses)
            {
                var teamGuess = await this.teamGuessTableStorage.GetAsync(gameState.GameStateId, teamNumber, mostVotesTeamGuess);
                if (teamGuess != null)
                {
                    return teamGuess;
                }
            }

            var teamGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(gameState.GameStateId, teamNumber).ToListAsync();

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
                var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
                var imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);

                gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
                {
                    gs.TeamOneCorrect = gameState.TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gs.TeamOneGuess, imageTableEntity.Answers);
                    gs.TeamTwoCorrect = gameState.TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsCorrect(gs.TeamTwoGuess, imageTableEntity.Answers);

                    gs.IncrementScores();
                    gs.NewTurnType(GameStateTableEntity.TurnTypeGuessesMade);
                });

                if (gameState.TeamOneCorrect || gameState.TeamTwoCorrect)
                {
                    var gameRoundTableEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
                    await this.gameRoundTableStorage.ReplaceAsync(gameRoundTableEntity, gr =>
                    {
                        gr.TeamOneScore = gameState.GetTeamScoreChange(1);
                        gr.TeamTwoScore = gameState.GetTeamScoreChange(2); 
                    });
                }

                await this.playerTableStorage.ResetPlayersAsync(gameState.GameStateId);
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

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState), updateType);
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitEndRoundAsync(GameStateTableEntity gameState)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.NewRound();
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState), GameStateTableEntity.UpdateTypeNewRound);

            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        private static Random rand = new Random();

        public async Task<GameStateTableEntity> PopulateGameRoundsAsync(GameStateTableEntity gameState)
        {
            Dictionary<string, ImageTagTableEntity> imageTags;
            if (gameState.Tags?.Any() == true)
            {
                imageTags = await this.imageTagTableStorage.GetAllTagsDictionaryAsync();
                foreach (var imageTag in imageTags)
                {
                    if (!gameState.Tags.Contains(imageTag.Key))
                    {
                        imageTags.Remove(imageTag.Key);
                    }
                }
            }
            else
            {
                var allImageTag = await this.imageTagTableStorage.GetAsync(ImageTagTableEntity.AllTag);
                imageTags = new Dictionary<string, ImageTagTableEntity>() { { ImageTagTableEntity.AllTag, allImageTag } };
            }

            var populatedImages = new HashSet<string>();

            while (populatedImages.Count < GameStateTableEntity.MaxRounds)
            {
                var imageTag = GetRandomTag(imageTags);
                if (imageTag == null)
                {
                    break;
                }

                var startIndex = rand.Next(imageTag.Count);
                var foundImageId = string.Empty;
                for (var i = 0; i < imageTag.Count; i++)
                {
                    var imageNumber = (startIndex + i) % imageTag.Count;
                    var imageNumberEntity = await this.imageNumberTableStorage.GetAsync(imageTag.Tag, imageNumber);
                    if (!string.IsNullOrWhiteSpace(gameState.CreatedBy))
                    {
                        var userPlayedImageEntity = await this.userPlayedImageTableStorage.GetAsync(imageNumberEntity.ImageId, gameState.CreatedBy);
                        if (userPlayedImageEntity != null)
                        {
                            continue;
                        }
                    }

                    if (populatedImages.Contains(imageNumberEntity.ImageId))
                    {
                        continue;
                    }

                    var imageTableEntity = await this.imageTableStorage.GetAsync(imageNumberEntity.ImageId);
                    if (imageTableEntity == null)
                    {
                        continue;
                    }

                    foundImageId = imageNumberEntity.ImageId;
                    break;
                }

                if (string.IsNullOrWhiteSpace(foundImageId))
                {
                    imageTags.Remove(imageTag.Tag);
                    continue;
                }

                populatedImages.Add(foundImageId);
                await this.gameRoundTableStorage.InsertAsync(new GameRoundTableEntity()
                {
                    GameStateId = gameState.GameStateId,
                    ImageId = foundImageId,
                    RoundNumber = populatedImages.Count
                });    
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, gs =>
            {
                gs.FinalRoundNumber = populatedImages.Count;
            });

            return gameState;
        }

        private ImageTagTableEntity GetRandomTag(Dictionary<string, ImageTagTableEntity> imageTags)
        {
            var totalSum = 0;
            foreach (var imageTag in imageTags)
            {
                totalSum += imageTag.Value.Count;
            }

            var index = rand.Next(totalSum);

            foreach (var imageTag in imageTags)
            {
                index -= imageTag.Value.Count;
                if (index <= 0)
                {
                    return imageTag.Value;
                }
            }

            return null;
        }
    }
}
