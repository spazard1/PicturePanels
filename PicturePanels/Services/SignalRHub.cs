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

        public async override Task OnConnectedAsync()
        {
            var httpContext = this.Context.GetHttpContext();

            var gameStateId = httpContext.Request.Query["gameStateId"];
            var playerId = httpContext.Request.Query["playerId"];


            if (!string.IsNullOrWhiteSpace(playerId))
            {
                var playerModel = await this.playerTableStorage.GetAsync(gameStateId, playerId);
                if (playerModel != null)
                {
                    playerModel = await this.playerTableStorage.ReplaceAsync(playerModel, pm =>
                    {
                        pm.ConnectionId = Context.ConnectionId;
                    });
                    await this.AddPlayerToGroupsAsync(playerModel);
                }
            }
            else
            {
                await this.AddGameboardToGroupsAsync(gameStateId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");

            await base.OnDisconnectedAsync(exception);
        }

        public static string TeamGroup(string gameStateId, int teamNumber)
        {
             return gameStateId + "_team_" + teamNumber;        
        }

        public static string GameBoardGroup(string gameStateId)
        {
            return gameStateId + "_gameboard";
        }

        public static string AllGroup(string gameStateId)
        {
            return gameStateId + "_all";
        }

        public async Task RegisterGameBoard(string gameStateId)
        {
            await this.gameStateService.SetGameBoardActiveAsync(gameStateId);
            await this.gameStateService.QueueNextTurnIfNeeded(gameStateId);
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

            await Clients.Group(GameBoardGroup(entity.GameStateId)).SelectPanels(new PlayerEntity(playerModel));
        }

        private async Task AddGameboardToGroupsAsync(string gameStateId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, AllGroup(gameStateId));
            await Groups.AddToGroupAsync(Context.ConnectionId, GameBoardGroup(gameStateId));
        }

        private async Task AddPlayerToGroupsAsync(PlayerTableEntity playerModel)
        {
            await this.Groups.AddToGroupAsync(Context.ConnectionId, SignalRHub.AllGroup(playerModel.GameStateId));

            if (playerModel.IsAdmin)
            {
                await this.Groups.AddToGroupAsync(Context.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 1));
                await this.Groups.AddToGroupAsync(Context.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 2));
                return;
            }

            await this.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, playerModel.TeamNumber));
        }
    }
}
