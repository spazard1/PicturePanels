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
            // default
            var theme = await this.themeTableStorage.GetAsync("default");
            theme.Css = "default/default.css";
            theme.PlayerJoinSounds = new List<string>() { "default/playerJoin.mp3" };
            theme.TurnStartSounds = new List<string>() { "default/turnStart.wav" };
            theme.CountdownSounds = new List<string>() { "default/countdown.wav" };
            theme.PlayerReadySounds = new List<string>() { "default/playerReady.mp3" };
            theme.BothTeamsPassSounds = new List<string>() { "default/bothTeamsPass.wav" };
            theme.OpenPanelSounds = new List<string>() { "default/openPanel.mp3" };
            theme.CorrectSounds = new List<string>() { "default/correct.wav" };
            theme.IncorrectSounds = new List<string>() { "default/incorrect.wav" };
            theme.EndGameSounds = new List<string>() { "default/endGame.wav" };

            await this.themeTableStorage.InsertOrReplaceAsync(theme);

            // christmas
            theme = await this.themeTableStorage.GetAsync("christmas");
            theme.Css = "christmas/christmas.css";
            theme.PlayerJoinSounds = new List<string>() { "default/playerJoin.mp3" };
            theme.TurnStartSounds = new List<string>() { "default/turnStart.wav" };
            theme.CountdownSounds = new List<string>() { "christmas/jingle-bells.wav" };
            theme.PlayerReadySounds = new List<string>() { "default/playerReady.mp3" };
            theme.BothTeamsPassSounds = new List<string>() { "default/bothTeamsPass.wav" };
            theme.OpenPanelSounds = new List<string>() { "default/openPanel.mp3" };
            theme.CorrectSounds = new List<string>() { 
                "christmas/grinch-welcome-christmas.mp3",
                "christmas/elf-smilings-my-favorite.mp3",
                "christmas/merry-christmas-charlie-brown.mp3",
                "christmas/rudolph-im-cute.mp3",
                "christmas/rudolph-skinny-santa.mp3",
                "christmas/run-a-neat-inn.mp3",
                "christmas/roast-beast.mp3",
                "christmas/thats-what-its-all-about.mp3",
                "christmas/wonderful-life-youve-had-a-wonderful-life.mp3",
                "christmas/hot-goose.mp3",
                "christmas/wonderful-at-christmas.mp3",
                "christmas/what-right.mp3"
            };
            theme.IncorrectSounds = new List<string>() { 
                "christmas/elf-bye-buddy.mp3",
                "christmas/elf-fruit-spray.mp3",
                "christmas/elf-im-singing.mp3",
                "christmas/elf-need-a-hug.mp3",
                "christmas/elf-throne-of-lies.mp3",
                "christmas/ive-killed-it.mp3",
                "christmas/mean-one.mp3",
                "christmas/wonderful-life-kind-of-an-angel-id-get.mp3",
                "christmas/wonderful-life-some-easier-way-to-get-my-wings.mp3",
                "christmas/humbug.mp3"
            };
            theme.EndGameSounds = new List<string>() {
                "christmas/god-bless-us.mp3"
            };

            await this.themeTableStorage.InsertOrReplaceAsync(theme);

            // guys weekend
            theme = await this.themeTableStorage.GetAsync("guysweekend");
            theme.Css = "guysweekend/guysweekend.css";
            theme.PlayerJoinSounds = new List<string>() { "guysweekend/wow.mp3" };
            theme.TurnStartSounds = new List<string>() { "default/turnStart.wav" };
            theme.CountdownSounds = new List<string>() { "default/countdown.wav" };
            theme.PlayerReadySounds = new List<string>() { "default/playerReady.mp3" };
            theme.BothTeamsPassSounds = new List<string>() { "default/bothTeamsPass.wav" };
            theme.OpenPanelSounds = new List<string>() { "default/openPanel.mp3" };
            theme.CorrectSounds = new List<string>() { 
                "guysweekend/and-when-you-pop-the-top-the-panties-drop.mp3",
                "guysweekend/ha-ha-i-threw-that-shit-before-i-walked-in-the-room.mp3",
                "guysweekend/ever-since-i-was-a-boy-all-i-knew-was-how-to-fight-fight-fight-fight-and-when-i-got-tired-i-would-fight-some-more.mp3",
                "guysweekend/he-said-something-to-me-in-chinese-like-sounded-like-some-cartoon-shit-but-i-understood-it-to-be-a-question-that-he-was-asking-me.mp3",
                "guysweekend/mama-always-said-a-helping-hand-is-a-helping-hand-clean-or-dirty-guess-my-hands-ain't-clean-enough-for-you.mp3",
                "guysweekend/man-i-mean-these-cats-looked-mean-meaner-than-two-fat-motherfuckers-wrestling-over-pork-chops-and-greens.mp3",
                "guysweekend/now-look-here-these-times-they-come-and-they-go-and-if-you-live-long-enough-you'll-be-around-to-see-them-come-again.mp3",
                "guysweekend/now-you-can-hit-the-sheets-or-the-streets-it-don't-make-me-no-never-mind.mp3",
                "guysweekend/now-you-take-that-spell-it-backwards-and-drop-the-s.mp3",
                "guysweekend/pimping-has-been-around.mp3",
                "guysweekend/you-know-people-they-don't-want-to-see-the-cow-killed-they-just-want-their-steak-on-a-plate-can-you-dig-it.mp3"
            };
            theme.IncorrectSounds = new List<string>() {
                "guysweekend/donuts-don't-wear-alligator-shoes.mp3",
                "guysweekend/euphoria-shut-the-fuck-up-i-know-that-was-you-i-ain't-even-gotta-look.mp3",
                "guysweekend/come-on-this-has-been-my-worst-physical-year-ever.mp3",
                "guysweekend/hey-uh-sweet-thing-you-know-what-don't-make-no-sense-is-the-service-around-this-motherfucker-bitch-do-you-see-us.mp3",
                "guysweekend/if-you-were-in-charge-the-people-might-as-well-surrender-to-whitey-right-now-because-your-survival-skills-ain't-worth-a-damn.mp3",
                "guysweekend/i'm-spending-more-bail-money-than-i'm-getting-tail-money.mp3",
                "guysweekend/i-told-you-jive-chumps-i-ain't-no-snitch.mp3",
                "guysweekend/now-aunt-billy-how-many-times-i-told-you-not-to-call-here-and-interrupt-my-kung-fu.mp3",
                "guysweekend/now-do-you-really-want-help-or-are-you-just-trying-to-prove-to-the-world-you-can-do-it-all-on-your-own.mp3",
                "guysweekend/but-black-dynamite-i-sell-drugs-to-the-community.mp3"
            };
            theme.EndGameSounds = new List<string>() {
                "guysweekend/hey-little-mama-it-may-be-bigger-than-you-and-it-may-be-bigger-than-me-but-it-ain't-bigger-than-you-and-me-can-you-dig-it.mp3",
            };

            await this.themeTableStorage.InsertOrReplaceAsync(theme);

            return Json(new ThemeEntity(theme));
        }
    }
}
