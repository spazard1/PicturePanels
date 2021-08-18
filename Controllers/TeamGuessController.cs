using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamGuessController : Controller
    {
        private readonly TeamGuessTableStorage teamGuessTableStorage;
        private readonly PlayerTableStorage playerTableStorage;
        private readonly SignalRHelper signalRHelper;
        private readonly ChatService chatService;

        public TeamGuessController(TeamGuessTableStorage teamGuessTableStorage, PlayerTableStorage playerTableStorage, SignalRHelper signalRHelper, ChatService chatService)
        {
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.signalRHelper = signalRHelper;
            this.chatService = chatService;
        }

        [HttpGet("{playerId}")]
        public async Task<IActionResult> GetAllAsync(string playerId)
        {
            var player = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var allGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(player.TeamNumber);
            var players = await this.playerTableStorage.GetActivePlayersAsync(player.TeamNumber);

            var voteCounts = new Dictionary<string, int>();

            foreach (var p in players)
            {
                if (!string.IsNullOrEmpty(p.TeamGuessVote)) {
                    if (!voteCounts.TryAdd(p.TeamGuessVote, 1)) {
                        voteCounts[p.TeamGuessVote]++;
                    }
                }
            }

            var teamGuessEntities = new List<TeamGuessEntity>();

            foreach (var guessModel in allGuesses)
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

            return Json(teamGuessEntities);
        }

        [HttpPut("{playerId}/{ticks}")]
        public async Task<IActionResult> PutVoteAsync(string playerId, string ticks)
        {
            var player = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            if (player.TeamGuessVote == ticks)
            {
                return StatusCode(200);
            }

            var oldVote = player.TeamGuessVote ?? string.Empty;
            player.TeamGuessVote = ticks;
            player = await this.playerTableStorage.AddOrUpdatePlayerAsync(player);

            await signalRHelper.VoteTeamGuessAsync(oldVote, player.TeamGuessVote, player.TeamNumber);

            return StatusCode(200);
        }

        [HttpDelete("{playerId}/{ticks}")]
        public async Task<IActionResult> DeleteAsync(string playerId, string ticks)
        {
            var player = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var teamGuess = await this.teamGuessTableStorage.GetTeamGuessAsync(player.TeamNumber, ticks);
            if (teamGuess == null)
            {
                return StatusCode(404);
            }

            await this.teamGuessTableStorage.DeleteTeamGuessAsync(teamGuess);
            await signalRHelper.DeleteTeamGuessesAsync(new TeamGuessEntity(teamGuess), player.TeamNumber);

            await this.chatService.SendChatAsync(player, "has deleted the guess '" + teamGuess.Guess + "'", true);

            return StatusCode(204);
        }

        [HttpPost("{playerId}")]
        public async Task<IActionResult> PostAsync([FromBody] GuessEntity entity, string playerId)
        {
            var player = await this.playerTableStorage.GetPlayerAsync(playerId);
            if (player == null)
            {
                return StatusCode(404);
            }

            var allGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(player.TeamNumber);

            if (allGuesses.Count >= TeamGuessTableStorage.MaxGuesses)
            {
                return StatusCode(400);
            }

            if (GuessChecker.IsCorrect(entity.Guess, allGuesses.Select(guess => guess.Guess)))
            {
                return StatusCode(405);
            }

            var teamGuess = await this.teamGuessTableStorage.AddOrUpdateTeamGuessAsync(entity.ToModel(player));
            await signalRHelper.AddTeamGuessAsync(new TeamGuessEntity(teamGuess), player.TeamNumber);

            await this.chatService.SendChatAsync(player, "has submitted the guess '" + teamGuess.Guess + "'", true);

            return Json(new TeamGuessEntity(teamGuess));
        }
    }
}
