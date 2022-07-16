using PicturePanels.Models;
using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;
using PicturePanels.Services.Storage;

namespace PicturePanels.Services
{
    public class SignalRHelper
    {
        public static DateTime LastGameboardPlayerUpdate = DateTime.MinValue;

        private readonly IHubContext<SignalRHub, ISignalRHub> hubContext;
        private readonly PlayerTableStorage playerTableStorage;

        public SignalRHelper(IHubContext<SignalRHub, ISignalRHub> hubContext, PlayerTableStorage playerTableStorage)
        {
            this.hubContext = hubContext;
            this.playerTableStorage = playerTableStorage;
        }

        public async Task PlayerPingAsync(string gameStateId)
        {
            if (LastGameboardPlayerUpdate.AddSeconds(30) < DateTime.UtcNow)
            {
                LastGameboardPlayerUpdate = DateTime.UtcNow;

                var allPlayers = await this.playerTableStorage.GetActivePlayersAsync(gameStateId).ToListAsync();
                await this.hubContext.Clients.Group(SignalRHub.GameBoardGroup(gameStateId)).Players(allPlayers.Select(playerModel => new PlayerEntity(playerModel)).ToList());
            }
        }

        public async Task PlayerAsync(PlayerTableEntity playerModel, bool isNew)
        {
            await hubContext.Clients.Group(SignalRHub.GameBoardGroup(playerModel.GameStateId)).Player(new PlayerEntity(playerModel), isNew);
            //await hubContext.Clients.Group(playerModel.SignalRTeamGroupName).Player(new PlayerEntity(playerModel), isNew);
        }

        public async Task AvatarsAsync(string gameStateId, AvatarsEntity avatarsEntity)
        {
            await hubContext.Clients.Group(SignalRHub.PlayerGroup(gameStateId)).Avatars(avatarsEntity);
        }

        public async Task ChatAsync(ChatEntity chatEntity)
        {
            await hubContext.Clients.Group(SignalRHub.TeamGroup(chatEntity.GameStateId, int.Parse(chatEntity.TeamNumber))).Chat(chatEntity);
        }

        public async Task PlayerReadyAsync(PlayerTableEntity playerModel)
        {
            await hubContext.Clients.Group(SignalRHub.GameBoardGroup(playerModel.GameStateId)).PlayerReady(playerModel.PlayerId);
        }

        public async Task SwitchTeamGroupsAsync(PlayerTableEntity playerModel)
        {
            if (playerModel.TeamNumber == 1)
            {
                await hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 2));
                await hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 1));
            }
            else
            {
                await hubContext.Groups.RemoveFromGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 1));
                await hubContext.Groups.AddToGroupAsync(playerModel.ConnectionId, SignalRHub.TeamGroup(playerModel.GameStateId, 2));
            }
        }
    }
}
