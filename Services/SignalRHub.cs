using PicturePanels.Models;
using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using PicturePanels.Services.Storage;
using System.Linq;

namespace PicturePanels.Services
{
    public class SignalRHub : Hub<ISignalRHub>
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly ChatTableStorage chatTableStorage;
        private readonly GameStateService gameStateService;

        public SignalRHub(PlayerTableStorage playerTableStorage,
            ChatTableStorage chatTableStorage, 
            GameStateService gameStateService)
        {
            this.playerTableStorage = playerTableStorage;
            this.chatTableStorage = chatTableStorage;
            this.gameStateService = gameStateService;
        }

        public static string GetTeamGroupName(string gameStateId, int teamNumber)
        {
             return gameStateId + "_team_" + teamNumber;        
        }

        public static string GetGameBoardGroupName(string gameStateId)
        {
            return gameStateId + "_gameboard";
        }

        public async Task GameBoardPing(string gameStateId)
        {
            await this.gameStateService.QueueNextTurnIfNeeded(gameStateId);

            var allPlayers = await this.playerTableStorage.GetActivePlayersAsync(gameStateId).ToListAsync();
            await this.Clients.Caller.Players(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
        }

        public async Task RegisterGameBoard(string gameStateId)
        {
            await this.gameStateService.QueueNextTurnIfNeeded(gameStateId);
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGameBoardGroupName(gameStateId));
        }

        private static readonly Regex MultipleNewLines = new(@"([\r\n])+");

        public async Task Chat(PlayerEntity entity, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            message = message.Trim();
            message = message.Substring(0, Math.Min(message.Length, 150));
            message = MultipleNewLines.Replace(message, "\n");

            var playerModel = await this.playerTableStorage.GetAsync(entity.GameStateId, entity.PlayerId);
            if (playerModel == null)
            {
                return;
            }

            if (playerModel.IsAdmin)
            {
                playerModel.TeamNumber = entity.TeamNumber;
            }

            var chatModel = await this.chatTableStorage.InsertAsync(playerModel, message);

            await Clients.GroupExcept(playerModel.SignalRTeamGroupName, new List<string>() { Context.ConnectionId }).Chat(new ChatEntity(chatModel, playerModel));
        }

        public async Task Typing(PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetAsync(entity.GameStateId, entity.PlayerId);
            if (playerModel == null)
            {
                return;
            }

            if (playerModel.IsAdmin)
            {
                playerModel.TeamNumber = entity.TeamNumber;
            }

            await Clients.GroupExcept(playerModel.SignalRTeamGroupName, new List<string>() { Context.ConnectionId }).Typing(new PlayerEntity(playerModel));
        }

        public async Task SelectPanels(PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetAsync(entity.GameStateId, entity.PlayerId);
            if (playerModel == null)
            {
                return;
            }

            if (playerModel.IsAdmin)
            {
                return;
            }

            playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, (pm) =>
            {
                pm.SelectedPanels = entity.SelectedPanels;
            });

            await Clients.Group(GetGameBoardGroupName(entity.GameStateId)).SelectPanels(new PlayerEntity(playerModel));
        }
    }
}
