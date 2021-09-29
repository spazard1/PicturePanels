using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace PicturePanels.Entities
{
    public class GameStateEntity
    {
        public GameStateEntity()
        {

        }

        public GameStateEntity(GameStateTableEntity tableEntity)
        {
            this.GameStateId = tableEntity.GameStateId;
            this.Tags = string.Join(",", tableEntity.Tags ?? new List<string>());
            this.ThemeCss = tableEntity.ThemeCss;
            this.OpenPanelTime = tableEntity.OpenPanelTime;
            this.GuessTime = tableEntity.GuessTime;
            this.RoundNumber = tableEntity.RoundNumber;
            this.FinalRoundNumber = tableEntity.FinalRoundNumber;
            this.TeamTurn = tableEntity.TeamTurn;
            this.TurnType = tableEntity.TurnType;
            this.TurnStartTime = tableEntity.TurnStartTime;
            this.TurnEndTime = tableEntity.TurnEndTime.HasValue ? tableEntity.TurnEndTime.Value : null;
            this.RevealedPanels = tableEntity.RevealedPanels;
            this.TeamOneName = tableEntity.TeamOneName;
            this.TeamOneScore = tableEntity.TeamOneScore;
            this.TeamOneIncorrectGuesses = tableEntity.TeamOneIncorrectGuesses;
            this.TeamOneInnerPanels = tableEntity.TeamOneInnerPanels;
            this.TeamOneCorrect = tableEntity.TeamOneCorrect;
            this.TeamTwoName = tableEntity.TeamTwoName;
            this.TeamTwoScore = tableEntity.TeamTwoScore;
            this.TeamTwoIncorrectGuesses = tableEntity.TeamTwoIncorrectGuesses;
            this.TeamTwoInnerPanels = tableEntity.TeamTwoInnerPanels;
            this.TeamTwoCorrect = tableEntity.TeamTwoCorrect;

            if (tableEntity.ShouldShowGuesses())
            {
                this.TeamOneGuessStatus = tableEntity.TeamOneGuessStatus;
                this.TeamTwoGuessStatus = tableEntity.TeamTwoGuessStatus;
                this.TeamOneGuess = tableEntity.TeamOneGuess;
                this.TeamTwoGuess = tableEntity.TeamTwoGuess;
            }
            else
            {
                this.TeamOneGuessStatus = !string.IsNullOrWhiteSpace(tableEntity.TeamOneGuessStatus) ? "Ready" : string.Empty;
                this.TeamTwoGuessStatus = !string.IsNullOrWhiteSpace(tableEntity.TeamTwoGuessStatus) ? "Ready" : string.Empty;
            }
        }

        public string GameStateId { get; set; }

        public string Tags { get; set; }

        public string ThemeCss { get; set; }

        [Range(0, 120)]
        public int? OpenPanelTime { get; set; }

        [Range(0, 300)]
        public int? GuessTime { get; set; }

        public int? RoundNumber { get; set; }

        public int? FinalRoundNumber { get; set; }

        public int? TeamTurn { get; set; }

        public string TurnType { get; set; }

        public DateTime TurnStartTime { get; internal set; }

        public DateTime? TurnEndTime { get; internal set; }

        public double TurnTimeRemaining { get; set; }

        public IList<string> RevealedPanels { get; set; }

        [MaxLength(30)]
        public string TeamOneName { get; set; }

        public int? TeamOneScore { get; set; }

        public int? TeamOneIncorrectGuesses { get; set; }

        public int? TeamOneInnerPanels { get; set; }

        public string TeamOneGuess { get; set; }

        public bool TeamOneCorrect { get; set; }

        public string TeamOneGuessStatus { get; set; }

        [MaxLength(30)]
        public string TeamTwoName { get; set; }

        public int? TeamTwoScore { get; set; }

        public int? TeamTwoIncorrectGuesses { get; set; }

        public int? TeamTwoInnerPanels { get; set; }

        public string TeamTwoGuess { get; set; }

        public bool TeamTwoCorrect { get; set; }

        public string TeamTwoGuessStatus { get; set; }

        public void CopyProperties(GameStateTableEntity currentModel)
        {
            currentModel.ThemeCss = this.ThemeCss ?? currentModel.ThemeCss;
            currentModel.OpenPanelTime = this.OpenPanelTime ?? currentModel.OpenPanelTime;
            currentModel.GuessTime = this.GuessTime ?? currentModel.GuessTime;
            currentModel.RoundNumber = this.RoundNumber ?? currentModel.RoundNumber;
            currentModel.FinalRoundNumber = this.FinalRoundNumber ?? currentModel.FinalRoundNumber;
            currentModel.TeamTurn = this.TeamTurn ?? currentModel.TeamTurn;
            currentModel.TurnType = this.TurnType ?? currentModel.TurnType;
            currentModel.TeamOneName = this.TeamOneName ?? currentModel.TeamOneName;
            currentModel.TeamOneScore = this.TeamOneScore ?? currentModel.TeamOneScore;
            currentModel.TeamOneIncorrectGuesses = this.TeamOneIncorrectGuesses ?? currentModel.TeamOneIncorrectGuesses;
            currentModel.TeamOneInnerPanels = this.TeamOneInnerPanels ?? currentModel.TeamOneInnerPanels;
            currentModel.TeamTwoName = this.TeamTwoName ?? currentModel.TeamTwoName;
            currentModel.TeamTwoScore = this.TeamTwoScore ?? currentModel.TeamTwoScore;
            currentModel.TeamTwoIncorrectGuesses = this.TeamTwoIncorrectGuesses ?? currentModel.TeamTwoIncorrectGuesses;
            currentModel.TeamTwoInnerPanels = this.TeamTwoInnerPanels ?? currentModel.TeamTwoInnerPanels;
        }
    }
}
