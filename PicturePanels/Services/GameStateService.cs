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
        private readonly TeamGuessesService teamGuessesService;
        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;

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
            TeamGuessesService teamGuessesService,
            IHubContext<SignalRHub, ISignalRHub> hubContext)
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
            this.teamGuessesService = teamGuessesService;
            this.hubContext = hubContext;
        }

        public async Task<GameStateTableEntity> ToNextTurnTypeAsync(GameStateTableEntity gameState)
        {
            return gameState.TurnType switch
            {
                GameStateTableEntity.TurnTypeWelcome => await this.ExitWelcomeAsync(gameState),
                GameStateTableEntity.TurnTypeOpenPanel => await this.ExitOpenPanelAsync(gameState),
                GameStateTableEntity.TurnTypeMakeGuess => await this.ExitMakeGuessAsync(gameState),
                GameStateTableEntity.TurnTypeVoteGuess => await this.ExitVoteGuessAsync(gameState),
                GameStateTableEntity.TurnTypeGuessesMade => await this.ExitGuessesMadeAsync(gameState),
                GameStateTableEntity.TurnTypeEndRound => await this.ExitEndRoundAsync(gameState),
                _ => null,
            };
        }

        public async Task<GameStateTableEntity> QueueStartGameAsync(GameStateTableEntity gameState, PlayerTableEntity playerModel)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.TurnEndTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.StartGameDelayTime);
                gs.TurnTime = GameStateTableEntity.StartGameDelayTime;
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);
            await this.chatService.SendBroadcastAsync(playerModel, "has started the game!");

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitWelcomeAsync(GameStateTableEntity gameState)
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

        public async Task QueueNextTurnIfNeeded(GameStateTableEntity gameState)
        {
            if (gameState.TurnEndTime.HasValue && gameState.TurnEndTime.Value.AddSeconds(GameStateTableEntity.TurnEndTimeGracePeriod) < DateTime.UtcNow)
            {
                await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);
            }
        }

        public Task<GameStateTableEntity> TogglePauseGameAsync(GameStateTableEntity gameState)
        {
            if (gameState.PauseState == GameStateTableEntity.PauseStatePaused)
            {
                return this.ResumeGameAsync(gameState);
            }
            return this.PauseGameAsync(gameState);
        }

        public async Task<GameStateTableEntity> PauseGameAsync(GameStateTableEntity gameState)
        {
            if (gameState.PauseState == GameStateTableEntity.PauseStatePaused)
            {
                return gameState;
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                var remainingTime = gs.TurnEndTime - DateTime.UtcNow;
                gs.PauseState = GameStateTableEntity.PauseStatePaused;
                gs.PauseTurnRemainingTime = remainingTime.HasValue && remainingTime.Value.TotalSeconds > 0 ? remainingTime.Value.TotalSeconds : -1;
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));

            return gameState;
        }

        public async Task<GameStateTableEntity> ResumeGameAsync(GameStateTableEntity gameState)
        {
            if (gameState.PauseState != GameStateTableEntity.PauseStatePaused)
            {
                return gameState;
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.PauseState = null;
                if (gs.PauseTurnRemainingTime > 0)
                {
                    gs.TurnEndTime = DateTime.UtcNow.AddSeconds(gs.PauseTurnRemainingTime);
                }
                else if (gs.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
                {
                    gs.TurnEndTime = gs.OpenPanelTime > 0 ? DateTime.UtcNow.AddSeconds(gs.OpenPanelTime) : DateTime.UtcNow.AddSeconds(GameStateTableEntity.DefaultOpenPanelTime);
                }
                else if (gs.TurnType == GameStateTableEntity.TurnTypeMakeGuess)
                {
                    gs.TurnEndTime = gs.GuessTime > 0 ? DateTime.UtcNow.AddSeconds(gs.GuessTime) : DateTime.UtcNow.AddSeconds(GameStateTableEntity.DefaultMakeGuessTime);
                }
                else 
                {
                    gs.TurnEndTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.ResumeTime);
                }
                gs.PauseTurnRemainingTime = 0;
            });

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));

            if (await this.AdvanceIfAllPlayersReadyAsync(gameState))
            {
                return gameState;
            }

            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task SetGameBoardActiveAsync(string gameStateId)
        {
            await this.activeGameBoardTableStorage.InsertOrReplaceAsync(new ActiveGameBoardTableEntity()
            {
                GameStateId = gameStateId,
                PingTime = DateTime.UtcNow
            });
        }

        public async Task<bool> AdvanceIfAllPlayersReadyAsync(GameStateTableEntity gameState)
        {
            if (gameState.PauseState == GameStateTableEntity.PauseStatePaused)
            {
                return false;
            }

            IAsyncEnumerable<PlayerTableEntity> players = null;
            if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
            {
                players = this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, gameState.TeamTurn);
            }
            else if (gameState.TurnType == GameStateTableEntity.TurnTypeVoteGuess)
            {
                if (gameState.TeamOneGuessStatus != GameStateTableEntity.TeamGuessStatusSkip && gameState.TeamTwoGuessStatus != GameStateTableEntity.TeamGuessStatusSkip)
                {
                    players = this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId);
                }
                else if (gameState.TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusSkip)
                {
                    players = this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, 2);
                }
                else
                {
                    players = this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, 1);
                }
            }
            else
            {
                players = this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId);
            }

            if (await players.AllAsync(p => p.IsReady))
            {
                await this.gameStateQueueService.QueueAllPlayersReadyGameStateChangeAsync(gameState);
                return true;
            }

            return false;
        }

        public async Task<GameStateTableEntity> ExitOpenPanelAsync(GameStateTableEntity gameState)
        {
            var panelId = await this.GetMostVotesPanelAsync(gameState);

            var teamOneScoreChange = 0;
            var teamTwoScoreChange = 0;
            if (GameStateTableEntity.InnerPanels.Contains(panelId))
            {
                if (gameState.TeamTurn == 1 && gameState.TeamOneInnerPanels <= 0)
                {
                    teamOneScoreChange = -1;
                }
                else if (gameState.TeamTurn == 2 && gameState.TeamTwoInnerPanels <= 0)
                {
                    teamTwoScoreChange = -1;
                }
            }

            await hubContext.Clients.Group(SignalRHub.GameBoardGroup(gameState.GameStateId)).ScoreChange(new ScoreChangeEntity() { TeamOne = teamOneScoreChange, TeamTwo = teamTwoScoreChange, ChangeType = "OpenPanel" });

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.OpenPanel(panelId);
                gs.ClearGuesses();
                gs.NewTurnType(GameStateTableEntity.TurnTypeMakeGuess);

                gs.TeamOneScore += teamOneScoreChange;
                gs.TeamTwoScore += teamTwoScoreChange;
            });

            if (teamOneScoreChange != 0 || teamTwoScoreChange != 0)
            {
                var gameRoundTableEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
                gameRoundTableEntity = await this.gameRoundTableStorage.ReplaceAsync(gameRoundTableEntity, gr =>
                {
                    gr.TeamOneScore += teamOneScoreChange;
                    gr.TeamTwoScore += teamTwoScoreChange;
                });
            }

            await this.playerTableStorage.ResetPlayersAsync(gameState);
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).OpenPanel();
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

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
                var randomOuterPanels = GameStateTableEntity.OuterPanels.ToArray();
                randomOuterPanels.Shuffle();

                foreach (var panelId in randomOuterPanels)
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
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitMakeGuessAsync(GameStateTableEntity gameState)
        {
            var players = this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId);

            var teamOneTask = this.teamGuessesService.SaveTeamGuessesAsync(gameState, players, 1);
            var teamTwoTask = this.teamGuessesService.SaveTeamGuessesAsync(gameState, players, 2);

            await Task.WhenAll(teamOneTask, teamTwoTask);

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.TeamOneCorrect = false;
                gs.TeamTwoCorrect = false;

                if (teamOneTask.Result + teamTwoTask.Result == 0)
                {
                    gs.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusSkip;
                    gs.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusSkip;
                    gs.NewTurnType(GameStateTableEntity.TurnTypeGuessesMade);
                }
                else if (teamOneTask.Result == 0)
                {
                    gs.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusSkip;
                    gs.TeamTwoGuessStatus = string.Empty;
                    gs.NewTurnType(GameStateTableEntity.TurnTypeVoteGuess);
                }
                else if (teamTwoTask.Result == 0)
                {
                    gs.TeamOneGuessStatus = string.Empty;
                    gs.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusSkip;
                    gs.NewTurnType(GameStateTableEntity.TurnTypeVoteGuess);
                }
                else
                {
                    gs.TeamOneGuessStatus = string.Empty;
                    gs.TeamTwoGuessStatus = string.Empty;
                    gs.NewTurnType(GameStateTableEntity.TurnTypeVoteGuess);
                }
            });

            var teamGuesses = await this.teamGuessesService.GetTeamGuessesAsync(gameState.GameStateId);

            var teamOneGuessesTask = hubContext.Clients.Group(SignalRHub.TeamGroup(gameState.GameStateId, 1)).TeamGuesses(teamGuesses.Item1);
            var teamTwoGuessesTask = hubContext.Clients.Group(SignalRHub.TeamGroup(gameState.GameStateId, 2)).TeamGuesses(teamGuesses.Item2);

            await Task.WhenAll(teamOneGuessesTask, teamTwoGuessesTask);

            await this.playerTableStorage.ResetPlayersAsync(gameState);
            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitVoteGuessAsync(GameStateTableEntity gameState)
        {
            gameState = await this.HandleTeamGuessVotesAsync(gameState);

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
            var imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.TeamOneCorrect = gameState.TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsMatch(gs.TeamOneGuess, imageTableEntity.Answers);
                gs.TeamTwoCorrect = gameState.TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess && GuessChecker.IsMatch(gs.TeamTwoGuess, imageTableEntity.Answers);

                gs.IncrementScores();
                gs.NewTurnType(GameStateTableEntity.TurnTypeGuessesMade);
            });

            var gameRoundTableEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
            gameRoundTableEntity = await this.gameRoundTableStorage.ReplaceAsync(gameRoundTableEntity, gr =>
            {
                gr.TeamOneScore += gameState.GetTeamScoreChange(1);
                gr.TeamTwoScore += gameState.GetTeamScoreChange(2);
            });

            await this.playerTableStorage.ResetPlayersAsync(gameState);

            var correctGuessPlayersEntity = await GetCorrectGuessPlayersAsync(gameState);
            await hubContext.Clients.Group(SignalRHub.GameBoardGroup(gameState.GameStateId)).CorrectGuessPlayers(correctGuessPlayersEntity);

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await hubContext.Clients.Group(SignalRHub.GameBoardGroup(gameState.GameStateId)).ScoreChange(new ScoreChangeEntity() { TeamOne = gameState.GetTeamScoreChange(1), TeamTwo = gameState.GetTeamScoreChange(2), ChangeType = "GuessesMade" });

            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        private async Task<GameStateTableEntity> HandleTeamGuessVotesAsync(GameStateTableEntity gameState)
        {
            TeamGuessTableEntity teamOneGuess = null;
            TeamGuessTableEntity teamTwoGuess = null;

            if (gameState.TeamOneGuessStatus != GameStateTableEntity.TeamGuessStatusSkip)
            {
                teamOneGuess = await this.GetMostVotesTeamGuessAsync(gameState, 1);
            }

            if (gameState.TeamTwoGuessStatus != GameStateTableEntity.TeamGuessStatusSkip)
            {
                teamTwoGuess = await this.GetMostVotesTeamGuessAsync(gameState, 2);
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.HandleGuess(teamOneGuess, 1);
                gs.HandleGuess(teamTwoGuess, 2);
            });

            return gameState;
        }

        private async Task<TeamGuessTableEntity> GetMostVotesTeamGuessAsync(GameStateTableEntity gameState, int teamNumber)
        {
            var voteCounts = new Dictionary<string, int>();

            await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, teamNumber))
            {
                if (p.IsReady && !string.IsNullOrEmpty(p.GuessVoteId))
                {
                    if (!voteCounts.TryAdd(p.GuessVoteId, 1))
                    {
                        voteCounts[p.GuessVoteId]++;
                    }
                }
            }

            List<string> mostVotesTeamGuessIds = new List<string>();
            int maxVoteCount = 0;

            foreach (var voteCount in voteCounts)
            {
                if (voteCount.Value > maxVoteCount)
                {
                    maxVoteCount = voteCount.Value;
                    mostVotesTeamGuessIds = new List<string> { voteCount.Key };
                }
                else if (voteCount.Value == maxVoteCount)
                {
                    mostVotesTeamGuessIds.Add(voteCount.Key);
                }
            }

            if (maxVoteCount == 0)
            {
                return null;
            }

            if (mostVotesTeamGuessIds.Contains(GameStateTableEntity.TeamGuessStatusPass) && mostVotesTeamGuessIds.Count == 1)
            {
                return null;
            }

            mostVotesTeamGuessIds.Remove(GameStateTableEntity.TeamGuessStatusPass);

            if (mostVotesTeamGuessIds.Count == 1)
            {
                return await this.teamGuessTableStorage.GetAsync(gameState.GameStateId, teamNumber, mostVotesTeamGuessIds.First());
            }

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
            var imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);

            double maxConfidence = double.MinValue;
            List<TeamGuessTableEntity> highestConfidenceGuesses = new List<TeamGuessTableEntity>();
            foreach (var teamGuessId in mostVotesTeamGuessIds)
            {
                var teamGuess = await this.teamGuessTableStorage.GetAsync(gameState.GameStateId, teamNumber, teamGuessId);
                if (teamGuess.Confidence > maxConfidence)
                {
                    maxConfidence = teamGuess.Confidence;
                    highestConfidenceGuesses = new List<TeamGuessTableEntity>() { teamGuess };
                }
                else if (teamGuess.Confidence == maxConfidence)
                {
                    highestConfidenceGuesses.Add(teamGuess);
                }
            }

            if (highestConfidenceGuesses.Count == 1)
            {
                return highestConfidenceGuesses.First();
            }

            double maxRatio = double.MinValue;
            TeamGuessTableEntity highestRatioGuess = null;
            foreach (var teamGuess in highestConfidenceGuesses)
            {
                var ratio = GuessChecker.GetRatio(teamGuess.Guess, imageTableEntity.Answers);
                if (ratio > maxRatio)
                {
                    maxRatio = ratio;
                    highestRatioGuess = teamGuess;
                }
            }

            return highestRatioGuess;
        }

        public async Task<CorrectGuessPlayersEntity> GetCorrectGuessPlayersAsync(GameStateTableEntity gameState)
        {
            var teamOnePlayers = new List<PlayerNameEntity>();
            var teamTwoPlayers = new List<PlayerNameEntity>();

            if (gameState.TeamOneCorrect)
            {  
                await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, 1))
                {
                    if (p.GuessVoteId == gameState.TeamOneGuessId)
                    {
                        teamOnePlayers.Add(new PlayerNameEntity(p));
                    }
                }
            }

            if (gameState.TeamTwoCorrect)
            {
                await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameState.GameStateId, 2))
                {
                    if (p.GuessVoteId == gameState.TeamTwoGuessId)
                    {
                        teamTwoPlayers.Add(new PlayerNameEntity(p));
                    }
                }
            }

            return new CorrectGuessPlayersEntity() {
                TeamOnePlayers = teamOnePlayers,
                TeamTwoPlayers = teamTwoPlayers
            };
        }

        public async Task<GameStateTableEntity> ExitGuessesMadeAsync(GameStateTableEntity gameState)
        {
            if (gameState.IsRoundOver())
            {
                await this.SaveRoundCompleteAsync(gameState);
            }

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                if (gs.TeamOneCorrect || gs.TeamTwoCorrect)
                {
                    gs.NewRound();
                }
                else if (gs.RevealedPanels.Count >= GameStateTableEntity.MaxOpenPanels)
                {
                    gs.NewTurnType(GameStateTableEntity.TurnTypeEndRound);
                }
                else
                {
                    gs.NewTurnType(GameStateTableEntity.TurnTypeOpenPanel);
                    gs.SwitchTeamTurn();
                }
            });

            await this.playerTableStorage.ResetPlayersAsync(gameState);

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> EndRoundAsync(GameStateTableEntity gameState)
        {
            await this.SaveRoundCompleteAsync(gameState);

            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.NewTurnType(GameStateTableEntity.TurnTypeEndRound);
            });

            await this.playerTableStorage.ResetPlayersAsync(gameState);

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        public async Task<GameStateTableEntity> ExitEndRoundAsync(GameStateTableEntity gameState)
        {
            gameState = await this.gameStateTableStorage.ReplaceAsync(gameState, (gs) =>
            {
                gs.NewRound();
            });

            await this.playerTableStorage.ResetPlayersAsync(gameState);

            await hubContext.Clients.Group(SignalRHub.AllGroup(gameState.GameStateId)).GameState(new GameStateEntity(gameState));
            await this.gameStateQueueService.QueueGameStateChangeAsync(gameState);

            return gameState;
        }

        private async Task SaveRoundCompleteAsync(GameStateTableEntity gameState)
        {
            var gameRoundTableEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
            await this.SaveUserPlayedImageAsync(gameState, gameRoundTableEntity);
            await this.teamGuessTableStorage.DeleteTeamGuessesAsync(gameState.GameStateId);
        }

        private async Task SaveUserPlayedImageAsync(GameStateTableEntity gameState, GameRoundTableEntity gameRoundTableEntity)
        {
            if (!string.IsNullOrWhiteSpace(gameState.CreatedBy))
            {
                await this.userPlayedImageTableStorage.InsertOrReplaceAsync(new UserPlayedImageTableEntity()
                {
                    UserId = gameState.CreatedBy,
                    ImageId = gameRoundTableEntity.ImageId
                });
            }
        }

        private static readonly Random rand = new Random();

        public async Task<GameStateTableEntity> PopulateGameRoundsAsync(GameStateTableEntity gameState, Dictionary<string, ImageTagTableEntity> imageTags)
        {
            if (gameState.Tags?.Any() == true)
            {
                foreach (var imageTag in imageTags)
                {
                    if (!gameState.Tags?.Contains(imageTag.Key) == true || gameState.ExcludedTags?.Contains(imageTag.Key) == true)
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

            while (populatedImages.Count < gameState.FinalRoundNumber)
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

                    if (gameState.ExcludedTags?.Any(tag => imageTableEntity.Tags.Contains(tag)) == true)
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

        private static ImageTagTableEntity GetRandomTag(Dictionary<string, ImageTagTableEntity> imageTags)
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
