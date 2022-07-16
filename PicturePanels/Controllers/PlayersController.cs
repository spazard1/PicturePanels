using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Models;
using PicturePanels.Services;
using PicturePanels.Services.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : Controller
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly GameStateTableStorage gameStateTableStorage;
        private readonly GameStateService gameStateService;
        private readonly SignalRHelper signalRHelper;

        public PlayersController(PlayerTableStorage playerTableStorage,
            GameStateTableStorage gameStateTableStorage,
            GameStateService gameStateService,
            SignalRHelper signalRHelper)
        {
            this.playerTableStorage = playerTableStorage;
            this.gameStateTableStorage = gameStateTableStorage;
            this.gameStateService = gameStateService;
            this.signalRHelper = signalRHelper;
        }

        [Route("/")]
        [Route("/player")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("{gameStateId}")]
        public async Task<IActionResult> GetAsync(string gameStateId)
        {
            var allPlayers = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
            return Json(await allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToListAsync());
        }

        [HttpGet("{gameStateId}/avatars")]
        public IActionResult GetAvatars(string gameStateId)
        {
            var allPlayers = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
            return Json(new AvatarsEntity(allPlayers));
        }

        [HttpGet("{gameStateId}/{playerId}")]
        public async Task<IActionResult> GetAsync(string gameStateId, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}")]
        public async Task<IActionResult> PutAsync(string gameStateId, [FromBody] PlayerEntity entity)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, entity.PlayerId ?? string.Empty);
            IAsyncEnumerable<PlayerTableEntity> players = null;

            if (playerModel == null)
            {
                players = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
                var newPlayerName = GetPlayerName(entity.Name.ToLower());

                if (await players.AnyAsync(p => p.Name?.ToLower() == newPlayerName))
                {
                    return Conflict("name");
                }

                playerModel = new PlayerTableEntity()
                {
                    GameStateId = gameStateId,
                    PlayerId = Guid.NewGuid().ToString(),
                    Name = GetPlayerName(entity.Name),
                    LastPingTime = DateTime.UtcNow,
                    SelectedPanels = new List<string>(),
                    PreviousGuesses = new List<string>(),
                    IsReady = false,
                };
                await this.playerTableStorage.InsertAsync(playerModel);
            }
            else
            {
                players = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
                var newPlayerName = GetPlayerName(entity.Name.ToLower());

                if (await players.Where(p => p.PlayerId != entity.PlayerId).AnyAsync(p => p.Name?.ToLower() == newPlayerName))
                {
                    return Conflict("name");
                }

                if (!string.IsNullOrWhiteSpace(entity.Avatar))
                {
                    if (await players.Where(p => p.PlayerId != entity.PlayerId).AnyAsync(p =>p.Avatar?.ToLower() == entity.Avatar?.ToLower()))
                    {
                        return Conflict("avatar");
                    }
                }

                var newTeam = playerModel.TeamNumber != entity.TeamNumber && entity.TeamNumber > 0;
                var previousLastPingTime = playerModel.LastPingTime;
                var previousTeamNumber = playerModel.TeamNumber;

                playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
                {
                    pm.Name = GetPlayerName(entity.Name);
                    pm.LastPingTime = DateTime.UtcNow;

                    if (entity.Colors.Any())
                    {
                        pm.Colors = entity.Colors;
                    }
                    if (entity.TeamNumber > 0)
                    {
                        pm.TeamNumber = entity.TeamNumber;
                    }
                    if (!string.IsNullOrWhiteSpace(entity.Avatar))
                    {
                        pm.Avatar = entity.Avatar;
                    }
                    if (newTeam)
                    {
                        pm.Guess = string.Empty;
                        pm.GuessVoteId = string.Empty;
                        pm.SelectedPanels = new List<string>();
                        pm.PreviousGuesses = new List<string>();
                    }
                    pm.IsReady = GetPlayerReady(gameState, playerModel, previousTeamNumber, entity.TeamNumber);
                });

                if (!string.IsNullOrWhiteSpace(playerModel.Name) && !string.IsNullOrWhiteSpace(playerModel.Avatar) && playerModel.TeamNumber > 0)
                {
                    if (newTeam)
                    {
                        await this.signalRHelper.SwitchTeamGroupsAsync(playerModel);
                    }

                    await this.signalRHelper.PlayerAsync(playerModel, newTeam);
                }

                if (!string.IsNullOrWhiteSpace(playerModel.Avatar))
                {
                    players = this.playerTableStorage.GetActivePlayersAsync(gameStateId);
                    await this.signalRHelper.AvatarsAsync(gameStateId, new AvatarsEntity(players));
                }
            }

            return Json(new PlayerEntity(playerModel));
        }

        private static bool GetPlayerReady(GameStateTableEntity gameState, PlayerTableEntity playerModel, int oldTeamNumber, int newTeamNumber)
        {
            if (oldTeamNumber == newTeamNumber)
            {
                return playerModel.IsReady;
            }

            if (gameState.TurnType == GameStateTableEntity.TurnTypeOpenPanel)
            {
                return newTeamNumber != gameState.TeamTurn;
            }

            if (gameState.TurnType == GameStateTableEntity.TurnTypeMakeGuess || gameState.TurnType == GameStateTableEntity.TurnTypeVoteGuess)
            {
                return false;
            }

            return true;
        }

        [HttpPut("{gameStateId}/{playerId}")]
        public async Task<IActionResult> PutPlayerResumeAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);

            if (playerModel == null)
            {
                return StatusCode(404);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.LastPingTime = DateTime.UtcNow;
            });

            await this.signalRHelper.PlayerAsync(playerModel, false);

            return Json(new PlayerEntity(playerModel));
        }

        private static string GetPlayerName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return "player";
            }
            name = name.Replace("(", "").Replace(")", "");
            return name;
        }

        [HttpPut("{gameStateId}/{playerId}/ping")]
        public async Task<IActionResult> PutPingAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.LastPingTime = DateTime.UtcNow;
            });

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}/{playerId}/ready")]
        public async Task<IActionResult> PutReadyAsync(string gameStateId, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            if (playerModel.IsAdmin)
            {
                return StatusCode(400);
            }

            if (playerModel.IsReady)
            {
                return StatusCode(400);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.IsReady = true;
            });

            await this.signalRHelper.PlayerReadyAsync(playerModel);

            await this.gameStateService.AdvanceIfAllPlayersReadyAsync(gameState);

            return Json(new PlayerEntity(playerModel));
        }
        

        [HttpPut("{gameStateId}/{playerId}/openPanelVote")]
        public async Task<IActionResult> PutOpenPanelVoteAsync(string gameStateId, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            if (gameState.TurnType != GameStateTableEntity.TurnTypeOpenPanel)
            {
                return StatusCode(403);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            if (playerModel.IsAdmin)
            {
                return StatusCode(400);
            }

            if (playerModel.IsReady)
            {
                return StatusCode(400);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.IsReady = true;
            });

            await this.signalRHelper.PlayerReadyAsync(playerModel);

            await this.gameStateService.AdvanceIfAllPlayersReadyAsync(gameState);

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}/{playerId}/guess")]
        public async Task<IActionResult> PutGuessAsync([FromBody] GuessEntity guessEntity, string gameStateId, string playerId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            if (playerModel.IsAdmin)
            {
                return StatusCode(400);
            }

            if (playerModel.IsReady)
            {
                return StatusCode(400);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.IsReady = true;
                pm.Guess = guessEntity.Guess;
                pm.Confidence = guessEntity.Confidence;

                if (guessEntity.Guess != GameStateTableEntity.TeamGuessStatusPass && !pm.PreviousGuesses.Contains(guessEntity.Guess))
                {
                    pm.PreviousGuesses.Add(guessEntity.Guess);
                }
            });

            await this.signalRHelper.PlayerReadyAsync(playerModel);

            await this.gameStateService.AdvanceIfAllPlayersReadyAsync(gameState);

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}/{playerId}/guessVote/{guessVoteId}")]
        public async Task<IActionResult> PutGuessVoteAsync(string gameStateId, string playerId, string guessVoteId)
        {
            var gameState = await this.gameStateTableStorage.GetAsync(gameStateId);
            if (gameState == null)
            {
                return StatusCode(404);
            }

            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            if (playerModel.IsAdmin)
            {
                return StatusCode(400);
            }

            if (playerModel.IsReady)
            {
                return StatusCode(400);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.IsReady = true;
                pm.GuessVoteId = guessVoteId;
            });

            await this.signalRHelper.PlayerReadyAsync(playerModel);

            await this.gameStateService.AdvanceIfAllPlayersReadyAsync(gameState);

            return Json(new PlayerEntity(playerModel));
        }

        [HttpPut("{gameStateId}/{playerId}/admin")]
        [RequireAuthorization]
        public async Task<IActionResult> PutAdminAsync(string gameStateId, string playerId)
        {
            var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
            if (playerModel == null)
            {
                return StatusCode(404);
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.IsAdmin = !pm.IsAdmin;
            });

            return Json(new PlayerEntity(playerModel));
        }
    }
}
