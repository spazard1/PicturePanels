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
        private readonly SignalRHelper signalRHelper;

        public TeamGuessController(TeamGuessTableStorage teamGuessTableStorage, SignalRHelper signalRHelper)
        {
            this.teamGuessTableStorage = teamGuessTableStorage;
            this.signalRHelper = signalRHelper;
        }

        [HttpGet("{teamNumber}")]
        public async Task<IActionResult> GetAllAsync(int teamNumber)
        {
            var allGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(teamNumber);
            return Json(allGuesses.Select(guessModel => new GuessEntity(guessModel)).ToList());
        }

        [HttpDelete("{teamNumber}/{ticks}")]
        public async Task<IActionResult> DeleteAsync(int teamNumber, long ticks)
        {
            var teamGuess = await this.teamGuessTableStorage.GetTeamGuessAsync(teamNumber, ticks);
            if (teamGuess == null)
            {
                return StatusCode(404);
            }

            await this.teamGuessTableStorage.DeleteTeamGuessAsync(teamGuess);

            return StatusCode(204);
        }

        [HttpPost("{teamNumber}")]
        public async Task<IActionResult> PostAsync([FromBody] GuessEntity entity, int teamNumber)
        {
            var allGuesses = await this.teamGuessTableStorage.GetTeamGuessesAsync(teamNumber);

            if (allGuesses.Count >= TeamGuessTableStorage.MaxGuesses)
            {
                return StatusCode(400);
            }

            var guess = await this.teamGuessTableStorage.AddOrUpdateTeamGuessAsync(entity.ToModel(teamNumber));
            allGuesses.Add(guess);
            await signalRHelper.SendTeamGuessesAsync(allGuesses.Select(guessModel => new TeamGuessEntity(guessModel)).ToList(), teamNumber);

            return Json(new GuessEntity(guess));
        }
    }
}
