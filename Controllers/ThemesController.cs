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

            theme.Css = "default.css";

            theme.PlayerJoinSounds = new List<string>() { "playerJoin.mp3" };
            theme.TurnStartSounds = new List<string>() { };
            theme.TeamReadySounds = new List<string>() { "teamReady.mp3" };
            theme.OpenPanelSounds = new List<string>() { "openPanel.mp3" };
            theme.CorrectSounds = new List<string>() { "correct.wav" };
            theme.IncorrectSounds = new List<string>() { "incorrect.wav" };

            await this.themeTableStorage.InsertOrReplaceAsync(theme);

            return Json(new ThemeEntity(theme));
        }
    }
}
