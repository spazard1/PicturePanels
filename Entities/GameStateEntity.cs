using CloudStorage.Models;
using System.Collections.Generic;

namespace PicturePanels.Entities
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
            this.OpenPanelTime = tableEntity.OpenPanelTime;
            this.GuessTime = tableEntity.GuessTime;
            this.RoundNumber = tableEntity.RoundNumber;
            this.TeamTurn = tableEntity.TeamTurn;
            this.TurnType = tableEntity.TurnType;
            this.CaptainStatus = tableEntity.CaptainStatus;
            this.TeamFirstTurn = tableEntity.TeamFirstTurn;
            this.ImageId = tableEntity.ImageId;
            this.RevealedPanels = tableEntity.RevealedPanels;
            this.TeamOneName = tableEntity.TeamOneName;
            this.TeamOneCaptain = tableEntity.TeamOneCaptain;
            this.TeamOneScore = tableEntity.TeamOneScore;
            this.TeamOneIncorrectGuesses = tableEntity.TeamOneIncorrectGuesses;
            this.TeamOneOuterPanels = tableEntity.TeamOneOuterPanels;
            this.TeamOneInnerPanels = tableEntity.TeamOneInnerPanels;
            this.TeamTwoName = tableEntity.TeamTwoName;
            this.TeamTwoCaptain = tableEntity.TeamTwoCaptain;
            this.TeamTwoScore = tableEntity.TeamTwoScore;
            this.TeamTwoIncorrectGuesses = tableEntity.TeamTwoIncorrectGuesses;
            this.TeamTwoOuterPanels = tableEntity.TeamTwoOuterPanels;
            this.TeamTwoInnerPanels = tableEntity.TeamTwoInnerPanels;
        }

        public string Id { get; set; }

        public string BlobContainer { get; set; }

        public string ThemeCss { get; set; }

        public int? OpenPanelTime { get; set; }

        public int? GuessTime { get; set; }

        public int? RoundNumber { get; set; }

        public int? TeamTurn { get; set; }

        public string TurnType { get; set; }

        public string CaptainStatus { get; set; }

        public int? TeamFirstTurn { get; set; }

        public string ImageId { get; set; }

        public IList<string> RevealedPanels { get; set; }

        public string TeamOneName { get; set; }

        public string TeamOneCaptain { get; set; }

        public int? TeamOneScore { get; set; }

        public int? TeamOneIncorrectGuesses { get; set; }

        public int? TeamOneOuterPanels { get; set; }

        public int? TeamOneInnerPanels { get; set; }

        public string TeamTwoName { get; set; }

        public string TeamTwoCaptain { get; set; }

        public int? TeamTwoScore { get; set; }

        public int? TeamTwoIncorrectGuesses { get; set; }

        public int? TeamTwoOuterPanels { get; set; }

        public int? TeamTwoInnerPanels { get; set; }

        public GameStateTableEntity ToModel(GameStateTableEntity currentModel)
        {
            return new GameStateTableEntity
            {
                RevealedPanels = currentModel.RevealedPanels,
                BlobContainer = this.BlobContainer ?? currentModel.BlobContainer,
                ThemeCss = this.ThemeCss ?? currentModel.ThemeCss,
                OpenPanelTime = this.OpenPanelTime ?? currentModel.OpenPanelTime,
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
                TeamOneInnerPanels = this.TeamOneInnerPanels ?? currentModel.TeamOneInnerPanels,
                TeamOneOuterPanels = this.TeamOneOuterPanels ?? currentModel.TeamOneOuterPanels,
                TeamTwoName = this.TeamTwoName ?? currentModel.TeamTwoName,
                TeamTwoCaptain = this.TeamTwoCaptain ?? currentModel.TeamTwoCaptain,
                TeamTwoScore = this.TeamTwoScore ?? currentModel.TeamTwoScore,
                TeamTwoIncorrectGuesses = this.TeamTwoIncorrectGuesses ?? currentModel.TeamTwoIncorrectGuesses,
                TeamTwoInnerPanels = this.TeamTwoInnerPanels ?? currentModel.TeamTwoInnerPanels,
                TeamTwoOuterPanels = this.TeamTwoOuterPanels ?? currentModel.TeamTwoOuterPanels
            };
        }
    }
}
