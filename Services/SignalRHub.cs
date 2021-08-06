using PicturePanels.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Primitives;
using PicturePanels.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class SignalRHub : Hub<ISignalRHub>
    {
        private readonly PlayerTableStorage playerTableStorage;
        private readonly ChatTableStorage chatTableStorage;
        
        public const string GameBoardGroup = "gameboard";
        public const string TeamOneGroup = "teamone";
        public const string TeamTwoGroup = "teamtwo";

        public SignalRHub(PlayerTableStorage playerTableStorage, ChatTableStorage chatTableStorage)
        {
            this.playerTableStorage = playerTableStorage;
            this.chatTableStorage = chatTableStorage;
        }

        public static string TeamGroup(int teamNumber)
        {
            if (teamNumber == 1)
            {
                return TeamOneGroup;
            }
            else
            {
                return TeamTwoGroup;
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var removeOne = Groups.RemoveFromGroupAsync(Context.ConnectionId, SignalRHub.TeamOneGroup);
            var removeTwo = Groups.RemoveFromGroupAsync(Context.ConnectionId, SignalRHub.TeamTwoGroup);
            var removeGameboard = Groups.RemoveFromGroupAsync(Context.ConnectionId, SignalRHub.GameBoardGroup);

            await Task.CompletedTask;
        }

        public async Task RegisterGameBoard()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GameBoardGroup);
        }

        public async Task Chat(PlayerEntity entity, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            message = message.Substring(0, Math.Min(message.Length, 150));

            var playerModel = await this.playerTableStorage.GetPlayerAsync(entity.PlayerId);
            if (playerModel == null)
            {
                return;
            }

            if (playerModel.IsAdmin)
            {
                playerModel.TeamNumber = entity.TeamNumber;
            }

            var chatModel = await this.chatTableStorage.AddOrUpdateChatAsync(playerModel, message);

            await Clients.GroupExcept(playerModel.SignalRGroup, new List<string>() { Context.ConnectionId }).Chat(new ChatEntity(chatModel, playerModel));
        }

        public async Task Typing(PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(entity.PlayerId);
            if (playerModel == null)
            {
                return;
            }

            if (playerModel.IsAdmin)
            {
                playerModel.TeamNumber = entity.TeamNumber;
            }

            await Clients.GroupExcept(playerModel.SignalRGroup, new List<string>() { Context.ConnectionId }).Typing(new PlayerEntity(playerModel));
        }

        public async Task SelectPanels(PlayerEntity entity)
        {
            var playerModel = await this.playerTableStorage.GetPlayerAsync(entity.PlayerId);
            if (playerModel == null)
            {
                return;
            }

            if (playerModel.IsAdmin)
            {
                return;
            }

            playerModel.SelectedPanels = entity.SelectedPanels;
            playerModel = await this.playerTableStorage.AddOrUpdatePlayerAsync(playerModel);

            await Clients.Group(GameBoardGroup).SelectPanels(new PlayerEntity(playerModel));
        }

        public async Task AddPlayerToTeamGroupAsync(PlayerTableEntity playerModel)
        {
            if (string.IsNullOrWhiteSpace(playerModel.ConnectionId))
            {
                return;
            }

            if (playerModel.TeamNumber == 1)
            {
                var remove = Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamTwoGroup);
                await Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamOneGroup);
            }
            else
            {
                var remove = Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamOneGroup);
                await Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamTwoGroup);
            }
        }
    }
}
