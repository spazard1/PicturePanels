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
    public class ThemesController : Controller
    {
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly ThemeTableStorage themeTableStorage;

        public ThemesController(GameStateTableStorage gameStateTableStorage, ThemeTableStorage themeTableStorage)
        {
            this.gameStateTableStorage = gameStateTableStorage;
            this.themeTableStorage = themeTableStorage;
        }

        [HttpGet("{gameStateId}")]
        public async Task<IActionResult> GetAsync(string gameStateId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var theme = await this.themeTableStorage.GetAsync(gameState.Theme);

            return Json(new ThemeEntity(theme));
        }

        [HttpGet("create")]
        public async Task<IActionResult> CreateAsync()
        {
            var theme = await this.themeTableStorage.GetAsync("default");
            theme.Css = "default/default.css";
            theme.PlayerJoinSounds = new List<string>() { "default/playerJoin.mp3" };
            theme.TurnStartSounds = new List<string>() { "default/turnStart.wav" };
            theme.CountdownSounds = new List<string>() { "default/countdown.wav" };
            theme.TeamReadySounds = new List<string>() { "default/teamReady.mp3" };
            theme.OpenPanelSounds = new List<string>() { "default/openPanel.mp3" };
            theme.CorrectSounds = new List<string>() { "default/correct.wav" };
            theme.IncorrectSounds = new List<string>() { "default/incorrect.wav" };
            theme.EndGameSounds = new List<string>() { "default/endGame.wav" };

            await this.themeTableStorage.InsertOrReplaceAsync(theme);

            theme = await this.themeTableStorage.GetAsync("guysweekend");
            theme.Css = "guysweekend/guysweekend.css";
            theme.PlayerJoinSounds = new List<string>() { "default/playerJoin.mp3" };
            theme.TurnStartSounds = new List<string>() { "default/turnStart.wav" };
            theme.CountdownSounds = new List<string>() { "default/countdown.wav" };
            theme.TeamReadySounds = new List<string>() { "default/teamReady.mp3" };
            theme.OpenPanelSounds = new List<string>() { "default/openPanel.mp3" };
            theme.CorrectSounds = new List<string>() { "default/correct.wav" };
            theme.IncorrectSounds = new List<string>() { "default/incorrect.wav" };
            theme.EndGameSounds = new List<string>() { "default/endGame.wav" };

            await this.themeTableStorage.InsertOrReplaceAsync(theme);

            return Json(new ThemeEntity(theme));
        }
    }
}
