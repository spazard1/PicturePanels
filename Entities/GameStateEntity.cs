using CloudStorage.Models;
using System.Collections.Generic;

namespace PictureGame.Entities
{
    public class GameStateEntity
    {
        public GameStateEntity()
        {

        }

        public GameStateEntity(GameStateTableEntity tableEntity)
        {
            this.Id = tableEntity.Id;
            this.BlobContainer = tableEntity.BlobContainer;
            this.ThemeCss = tableEntity.ThemeCss;
            this.OpenTileTime = tableEntity.OpenTileTime;
            this.GuessTime = tableEntity.GuessTime;
            this.RoundNumber = tableEntity.RoundNumber;
            this.TeamTurn = tableEntity.TeamTurn;
            this.TurnType = tableEntity.TurnType;
            this.CaptainStatus = tableEntity.CaptainStatus;
            this.TeamFirstTurn = tableEntity.TeamFirstTurn;
            this.ImageId = tableEntity.ImageId;
            this.RevealedTiles = tableEntity.RevealedTiles;
            this.TeamOneName = tableEntity.TeamOneName;
            this.TeamOneCaptain = tableEntity.TeamOneCaptain;
            this.TeamOneScore = tableEntity.TeamOneScore;
            this.TeamOneIncorrectGuesses = tableEntity.TeamOneIncorrectGuesses;
            this.TeamOneOuterTiles = tableEntity.TeamOneOuterTiles;
            this.TeamOneInnerTiles = tableEntity.TeamOneInnerTiles;
            this.TeamTwoName = tableEntity.TeamTwoName;
            this.TeamTwoCaptain = tableEntity.TeamTwoCaptain;
            this.TeamTwoScore = tableEntity.TeamTwoScore;
            this.TeamTwoIncorrectGuesses = tableEntity.TeamTwoIncorrectGuesses;
            this.TeamTwoOuterTiles = tableEntity.TeamTwoOuterTiles;
            this.TeamTwoInnerTiles = tableEntity.TeamTwoInnerTiles;
        }

        public string Id { get; set; }

        public string BlobContainer { get; set; }

        public string ThemeCss { get; set; }

        public int? OpenTileTime { get; set; }

        public int? GuessTime { get; set; }

        public int? RoundNumber { get; set; }

        public int? TeamTurn { get; set; }

        public string TurnType { get; set; }

        public string CaptainStatus { get; set; }

        public int? TeamFirstTurn { get; set; }

        public string ImageId { get; set; }

        public IList<string> RevealedTiles { get; set; }

        public string TeamOneName { get; set; }

        public string TeamOneCaptain { get; set; }

        public int? TeamOneScore { get; set; }

        public int? TeamOneIncorrectGuesses { get; set; }

        public int? TeamOneOuterTiles { get; set; }

        public int? TeamOneInnerTiles { get; set; }

        public string TeamTwoName { get; set; }

        public string TeamTwoCaptain { get; set; }

        public int? TeamTwoScore { get; set; }

        public int? TeamTwoIncorrectGuesses { get; set; }

        public int? TeamTwoOuterTiles { get; set; }

        public int? TeamTwoInnerTiles { get; set; }

        public GameStateTableEntity ToModel(GameStateTableEntity currentModel)
        {
            return new GameStateTableEntity
            {
                RevealedTiles = currentModel.RevealedTiles,
                BlobContainer = this.BlobContainer ?? currentModel.BlobContainer,
                ThemeCss = this.ThemeCss ?? currentModel.ThemeCss,
                OpenTileTime = this.OpenTileTime ?? currentModel.OpenTileTime,
                GuessTime = this.GuessTime ?? currentModel.GuessTime,
                RoundNumber = this.RoundNumber ?? currentModel.RoundNumber,
                TeamTurn = this.TeamTurn ?? currentModel.TeamTurn,
                TurnType = this.TurnType ?? currentModel.TurnType,
                CaptainStatus = this.CaptainStatus ?? currentModel.CaptainStatus,
                TeamFirstTurn = this.TeamFirstTurn ?? currentModel.TeamFirstTurn,
                ImageId = this.ImageId ?? currentModel.ImageId,
                TeamOneName = this.TeamOneName ?? currentModel.TeamOneName,
                TeamOneCaptain = this.TeamOneCaptain ?? currentModel.TeamOneCaptain,
                TeamOneScore = this.TeamOneScore ?? currentModel.TeamOneScore,
                TeamOneIncorrectGuesses = this.TeamOneIncorrectGuesses ?? currentModel.TeamOneIncorrectGuesses,
                TeamOneInnerTiles = this.TeamOneInnerTiles ?? currentModel.TeamOneInnerTiles,
                TeamOneOuterTiles = this.TeamOneOuterTiles ?? currentModel.TeamOneOuterTiles,
                TeamTwoName = this.TeamTwoName ?? currentModel.TeamTwoName,
                TeamTwoCaptain = this.TeamTwoCaptain ?? currentModel.TeamTwoCaptain,
                TeamTwoScore = this.TeamTwoScore ?? currentModel.TeamTwoScore,
                TeamTwoIncorrectGuesses = this.TeamTwoIncorrectGuesses ?? currentModel.TeamTwoIncorrectGuesses,
                TeamTwoInnerTiles = this.TeamTwoInnerTiles ?? currentModel.TeamTwoInnerTiles,
                TeamTwoOuterTiles = this.TeamTwoOuterTiles ?? currentModel.TeamTwoOuterTiles
            };
        }
    }
}
