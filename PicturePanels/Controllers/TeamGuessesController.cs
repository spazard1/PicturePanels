using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Models;
using PicturePanels.Services;
using PicturePanels.Services.Storage;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamGuessesController : Controller
    {
        

        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        //private readonly SignalRHelper signalRHelper;
        //private readonly ChatService chatService;

        public TeamGuessesController(TeamGuessTableStorage teamGuessTableStorage, PlayerTableStorage playerTableStorage) //, SignalRHelper signalRHelper, ChatService chatService)
        {
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.playerTableStorage = playerTableStorage;
            //this.signalRHelper = signalRHelper;
            //this.chatService = chatService;
        }

        [HttpGet("{gameStateId}/{playerId}")]
        public async Task<IActionResult> GetAllAsync(string gameStateId, string playerId)
        {
            var player = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var players = await this.playerTableStorage.GetAllPlayersDictionaryAsync(gameStateId);

            var teamGuessEntities = new List<TeamGuessEntity>();

            await foreach (var guessModel in this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, player.TeamNumber))
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

            return Json(teamGuessEntities);
        }

        /*
        [HttpGet("{gameStateId}/{playerId}")]
        public async Task<IActionResult> GetAllAsync(string gameStateId, string playerId)
        {
            var player = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var voteCounts = new Dictionary<string, int>() { { GameStateTableEntity.TeamGuessStatusPass, 0 } };

            await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameStateId, player.TeamNumber))
            {
                if (!string.IsNullOrEmpty(p.TeamGuessVote)) {
                    if (!voteCounts.TryAdd(p.TeamGuessVote, 1)) {
                        voteCounts[p.TeamGuessVote]++;
                    }
                }
            }

            var teamGuessEntities = new List<TeamGuessEntity>();

            await foreach (var guessModel in this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, player.TeamNumber))
            {
                if (voteCounts.TryGetValue(guessModel.CreatedTime.Ticks.ToString(), out int voteCount))
                {
                    teamGuessEntities.Add(new TeamGuessEntity(guessModel) { VoteCount = voteCount });
                }
                else
                {
                    teamGuessEntities.Add(new TeamGuessEntity(guessModel));
                }
            }

            teamGuessEntities.Add(new TeamGuessEntity()
            {
                Guess= GameStateTableEntity.TeamGuessStatusPass,
                Ticks= GameStateTableEntity.TeamGuessStatusPass,
                VoteCount = voteCounts[GameStateTableEntity.TeamGuessStatusPass]
            });

            return Json(teamGuessEntities);
        }

        [HttpGet("{gameStateId}/{playerId}/object")]
        public async Task<IActionResult> GetAllAsObjectAsync(string gameStateId, string playerId)
        {
            var player = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var voteCounts = new Dictionary<string, int>() { { GameStateTableEntity.TeamGuessStatusPass, 0 } };

            await foreach (var p in this.playerTableStorage.GetActivePlayersAsync(gameStateId, player.TeamNumber))
            {
                if (!string.IsNullOrEmpty(p.TeamGuessVote))
                {
                    if (!voteCounts.TryAdd(p.TeamGuessVote, 1))
                    {
                        voteCounts[p.TeamGuessVote]++;
                    }
                }
            }

            var teamGuessEntities = new List<TeamGuessEntity>();

            await foreach (var guessModel in this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, player.TeamNumber))
            {
                if (voteCounts.TryGetValue(guessModel.CreatedTime.Ticks.ToString(), out int voteCount))
                {
                    teamGuessEntities.Add(new TeamGuessEntity(guessModel) { VoteCount = voteCount });
                }
                else
                {
                    teamGuessEntities.Add(new TeamGuessEntity(guessModel));
                }
            }

            return Json(new TeamGuessesEntity()
            {
                TeamGuesses = teamGuessEntities,
                PassVoteCount = voteCounts[GameStateTableEntity.TeamGuessStatusPass]
            });
        }

        [HttpPut("{gameStateId}/{playerId}/{ticks}")]
        public async Task<IActionResult> PutVoteAsync(string gameStateId, string playerId, string ticks)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            // reset player vote if they vote for the same thing again
            if (playerModel.TeamGuessVote == ticks)
            {
                ticks = string.Empty;
            }

            var oldVote = playerModel.TeamGuessVote ?? string.Empty;
            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.TeamGuessVote = ticks;
            });

            await signalRHelper.VoteTeamGuessAsync(gameStateId, playerModel.PlayerId, oldVote, playerModel.TeamGuessVote, playerModel.TeamNumber);

            return StatusCode(200);
        }

        [HttpDelete("{gameStateId}/{playerId}/{ticks}")]
        public async Task<IActionResult> DeleteAsync(string gameStateId, string playerId, string ticks)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            var teamGuess = await this.teamGuessTableStorage.GetAsync(gameStateId, playerModel.TeamNumber, ticks);
            if (teamGuess == null)
            {
                return StatusCode(404);
            }

            await this.teamGuessTableStorage.DeleteAsync(teamGuess);
            await signalRHelper.DeleteTeamGuessAsync(gameStateId, new TeamGuessEntity(teamGuess), playerModel.TeamNumber);
            await this.chatService.SendChatAsync(playerModel, "deleted the guess '" + teamGuess.Guess + "'", true);

            return StatusCode(204);
        }

        [HttpPost("{gameStateId}/{playerId}")]
        public async Task<IActionResult> PostAsync([FromBody] GuessEntity entity, string gameStateId, string playerId)
        {
            var player = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var allGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(gameStateId, player.TeamNumber).ToListAsync();
            var allGuessesToLower = allGuesses.Select(guess => guess.Guess.ToLowerInvariant());

            if (allGuesses.Count >= TeamGuessTableStorage.MaxGuesses)
            {
                return StatusCode(400);
            }

            if (allGuessesToLower.Contains(entity.Guess.ToLowerInvariant())) {
                return StatusCode((int)HttpStatusCode.Conflict);
            }

            var teamGuess = await this.teamGuessTableStorage.InsertAsync(entity.ToModel(player));

            await signalRHelper.AddTeamGuessAsync(gameStateId, new TeamGuessEntity(teamGuess), player.TeamNumber);
            await this.chatService.SendChatAsync(player, "added the guess '" + teamGuess.Guess + "'", true);

            return Json(new TeamGuessEntity(teamGuess));
        }
        */
    }
}
