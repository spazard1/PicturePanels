using NUglify.JavaScript.Syntax;
using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services.Storage;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class TeamGuessesService
    {
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly GameRoundTableStorage gameRoundTableStorage;
        private readonly ImageTableStorage imageTableStorage;

        public TeamGuessesService(
            TeamGuessTableStorage teamGuessTableStorage,
            PlayerTableStorage playerTableStorage,
            GameRoundTableStorage gameRoundTableStorage,
            ImageTableStorage imageTableStorage)
        {
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.gameRoundTableStorage = gameRoundTableStorage;
            this.imageTableStorage = imageTableStorage;
        }

        public async Task<List<TeamGuessEntity>> GetTeamGuessesAsync(string gameStateId, int teamNumber)
        {
            var players = await this.playerTableStorage.GetAllPlayersDictionaryAsync(gameStateId);
            var teamGuesses = this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, teamNumber);
            return await this.GetTeamGuessEntitiesAsync(teamGuesses, players);
        }

        public async Task<Tuple<List<TeamGuessEntity>, List<TeamGuessEntity>>> GetTeamGuessesAsync(string gameStateId)
        {
            var players = await this.playerTableStorage.GetAllPlayersDictionaryAsync(gameStateId);

            var teamOneGuesses = this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, 1);
            var teamTwoGuesses = this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, 2);

            var teamOneGuessEntitiesTask = this.GetTeamGuessEntitiesAsync(teamOneGuesses, players);
            var teamTwoGuessEntitiesTask = this.GetTeamGuessEntitiesAsync(teamTwoGuesses, players);
            await Task.WhenAll(teamOneGuessEntitiesTask, teamTwoGuessEntitiesTask);

            return new Tuple<List<TeamGuessEntity>, List<TeamGuessEntity>>(teamOneGuessEntitiesTask.Result,
                teamTwoGuessEntitiesTask.Result);
        }

        public async Task<int> SaveTeamGuessesAsync(GameStateTableEntity gameState, IAsyncEnumerable<PlayerTableEntity> players, int teamNumber)
        {
            List<TeamGuessTableEntity> teamGuesses = new List<TeamGuessTableEntity>();

            var gameRoundEntity = await this.gameRoundTableStorage.GetAsync(gameState.GameStateId, gameState.RoundNumber);
            var imageTableEntity = await this.imageTableStorage.GetAsync(gameRoundEntity.ImageId);

            var guessesCreated = 0;

            await foreach (var player in players)
            {
                if (player.TeamNumber != teamNumber || !player.IsReady || player.Confidence <= 0)
                {
                    continue;
                }

                teamGuesses.Add(new TeamGuessTableEntity()
                {
                    TeamGuessId = Guid.NewGuid().ToString(),
                    GameStateId = gameState.GameStateId,
                    TeamNumber = teamNumber,
                    Guess = player.Guess,
                    PlayerIds = new List<string>() { player.PlayerId },
                    Confidence = player.Confidence,
                });
                guessesCreated++;
            }

            for (int i = 0; i < teamGuesses.Count; i++)
            {
                for (int j = i + 1; j < teamGuesses.Count; j++)
                {
                    if (GuessChecker.IsMatch(teamGuesses[i].Guess, teamGuesses[j].Guess))
                    {
                        var guessiRatio = GuessChecker.GetRatio(teamGuesses[i].Guess, imageTableEntity.Answers);
                        var guessjRatio = GuessChecker.GetRatio(teamGuesses[j].Guess, imageTableEntity.Answers);
                        if (guessiRatio > guessjRatio)
                        {
                            teamGuesses[i] = MergeTeamGuesses(teamGuesses[i], teamGuesses[j]);
                            teamGuesses.RemoveAt(j);
                        }
                        else
                        {
                            teamGuesses[i] = MergeTeamGuesses(teamGuesses[j], teamGuesses[i]);
                            teamGuesses.RemoveAt(j);
                        }
                    }
                }
            }

            await this.teamGuessTableStorage.DeleteFromPartitionAsync(TeamGuessTableEntity.GetPartitionKey(gameState.GameStateId, teamNumber));
            await this.teamGuessTableStorage.InsertAsync(teamGuesses);

            return guessesCreated;
        }

        private static TeamGuessTableEntity MergeTeamGuesses(TeamGuessTableEntity primary, TeamGuessTableEntity secondary)
        {
            primary.Confidence = ((primary.Confidence * primary.PlayerIds.Count) + (secondary.Confidence * secondary.PlayerIds.Count)) / (primary.PlayerIds.Count + secondary.PlayerIds.Count);
            primary.PlayerIds.AddRange(secondary.PlayerIds);
            return primary;
        }

        private async Task<List<TeamGuessEntity>> GetTeamGuessEntitiesAsync(IAsyncEnumerable<TeamGuessTableEntity> teamGuessTableEntities, Dictionary<string, PlayerTableEntity> players)
        {
            var teamGuessEntities = new List<TeamGuessEntity>();

            await foreach (var guessModel in teamGuessTableEntities)
            {
                var teamGuessEntity = new TeamGuessEntity(guessModel);
                foreach (var teamGuessPlayerId in guessModel.PlayerIds)
                {
                    if (players.TryGetValue(teamGuessPlayerId, out PlayerTableEntity playerModel))
                    {
                        teamGuessEntity.Players.Add(new PlayerNameEntity(playerModel));
                    }
                }
                teamGuessEntities.Add(teamGuessEntity);
            }
            teamGuessEntities.Sort();

            return teamGuessEntities;
        }
    }
}
