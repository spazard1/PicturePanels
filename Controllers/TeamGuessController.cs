using PicturePanels.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Services;
using System;
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
        private readonly ChatTableStorage chatTableStorage;
        private readonly SignalRHelper signalRHelper;

        public TeamGuessController(TeamGuessTableStorage teamGuessTableStorage, PlayerTableStorage playerTableStorage, ChatTableStorage chatTableStorage, SignalRHelper signalRHelper)
        {
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.playerTableStorage = playerTableStorage;
            this.chatTableStorage = chatTableStorage;
            this.signalRHelper = signalRHelper;
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
            var players = await this.playerTableStorage.GetAllPlayersDictionaryAsync();
            var teamGuessEntities = new List<TeamGuessEntity>();

            foreach (var guessModel in allGuesses)
            {
                if (players.TryGetValue(guessModel.PlayerId, out PlayerTableEntity playerTableEntity))
                {
                    teamGuessEntities.Add(new TeamGuessEntity(guessModel, new PlayerEntity(playerTableEntity)));
                }
                else
                {
                    teamGuessEntities.Add(new TeamGuessEntity(guessModel, null));
                }
            }

            return Json(teamGuessEntities);
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
            await signalRHelper.DeleteTeamGuessesAsync(new TeamGuessEntity(teamGuess, new PlayerEntity(player)));

            var chatModel = await this.chatTableStorage.AddOrUpdateChatAsync(player, "has deleted the guess '" + teamGuess.Guess + "'", true);
            await signalRHelper.ChatAsync(new ChatEntity(chatModel, player));

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
            await signalRHelper.AddTeamGuessAsync(new TeamGuessEntity(teamGuess, new PlayerEntity(player)));

            var chatModel = await this.chatTableStorage.AddOrUpdateChatAsync(player, "has submitted the guess '" + teamGuess.Guess + "'", true);
            await signalRHelper.ChatAsync(new ChatEntity(chatModel, player));

            return Json(new TeamGuessEntity(teamGuess, new PlayerEntity(player)));
        }
    }
}
