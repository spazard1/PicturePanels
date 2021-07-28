using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class GameStateTableEntity : TableEntity
    {
        public const string GameStatePartitionKey = "GameState";
        public const string GameStateDefaultId = "Default";

        public const string ActionNewRound = "NewRound";
        public const string ActionNextTurn = "NextTurn";
        public const string ActionOpenPanel = "OpenPanel";
        public const string ActionGuessesMade = "GuessesMade";
        public const string ActionEndRound = "EndRound";

        public const string TurnTypeWelcome = "Welcome";
        public const string TurnTypeOpenPanel = "OpenPanel";
        public const string TurnTypeMakeGuess = "MakeGuess";
        public const string TurnTypeGuessesMade = "GuessesMade";
        public const string TurnTypeEndRound = "EndRound";

        public const string CaptainStatusPass = "Pass";
        public const string CaptainStatusGuess = "Guess";

        public GameStateTableEntity()
        {
            this.PartitionKey = GameStatePartitionKey;
            this.Id = GameStateDefaultId;
        }

        public string Id
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string BlobContainer { get; set; }

        public string ThemeCss { get; set; }

        public int OpenPanelTime { get; set; }

        public int GuessTime { get; set; }

        public int RoundNumber { get; set; }

        public int TeamTurn { get; set; }

        public string TurnType { get; set; }

        public int TeamFirstTurn { get; set; }

        public string ImageId { get; set; }

        public IList<string> RevealedPanels { get; set; }

        public string TeamOneName { get; set; }

        public string TeamOneCaptain { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamOneIncorrectGuesses { get; set; }

        public int TeamOneInnerPanels { get; set; }

        public string TeamOneGuess { get; set; }

        public bool TeamOneCorrect { get; set; }

        public string TeamOneCaptainStatus { get; set; }

        public string TeamTwoName { get; set; }

        public string TeamTwoCaptain { get; set; }

        public int TeamTwoScore { get; set; }

        public int TeamTwoIncorrectGuesses { get; set; }

        public int TeamTwoInnerPanels { get; set; }

        public string TeamTwoGuess { get; set; }

        public bool TeamTwoCorrect { get; set; }

        public string TeamTwoCaptainStatus { get; set; }


        public void SetTurnType(string action)
        {
            switch (action)
            {
                case ActionNewRound:
                    TurnType = TurnTypeOpenPanel;
                    break;
                case ActionEndRound:
                    TurnType = TurnTypeEndRound;
                    break;
                case ActionGuessesMade:
                    TurnType = TurnTypeGuessesMade;
                    break;
                case ActionOpenPanel:
                    TurnType = TurnTypeMakeGuess;
                    break;
                case ActionNextTurn:
                    TurnType = TurnTypeOpenPanel;
                    break;
            }
        }

        public void OpenPanel(string panelId, bool force = false)
        {
            RevealedPanels.Add(panelId);

            if (!force && IsInnerPanel(panelId))
            {
                if (TeamTurn == 1)
                {
                    TeamOneInnerPanels = Math.Max(0, TeamOneInnerPanels - 1);
                }
                else
                {
                    TeamTwoInnerPanels = Math.Max(0, TeamTwoInnerPanels - 1);
                }
            }
        }

        public void SwitchTeamTurn()
        {
            if (TeamTurn == 1)
            {
                TeamTurn = 2;
            }
            else
            {
                TeamTurn = 1;
            }
        }

        public void SwitchTeamFirstTurn()
        {
            if (TeamFirstTurn == 1)
            {
                TeamFirstTurn = 2;
            }
            else
            {
                TeamFirstTurn = 1;
            }
        }

        public void ClearGuesses()
        {
            TeamOneGuess = string.Empty;
            TeamOneCaptainStatus = string.Empty;
            TeamOneCorrect = false;
            TeamTwoGuess = string.Empty;
            TeamTwoCaptainStatus = string.Empty;
            TeamTwoCorrect = false;
        }

        public bool IsRoundOver()
        {
            return TurnType == GameStateTableEntity.TurnTypeEndRound ||
                   (TurnType == GameStateTableEntity.TurnTypeGuessesMade && (TeamOneCorrect || TeamTwoCorrect));
        }

        public bool ShouldShowGuesses()
        {
            return TurnType == GameStateTableEntity.TurnTypeEndRound || TurnType == GameStateTableEntity.TurnTypeGuessesMade;
        }

        public void IncrementScores()
        {
            if (TeamOneCorrect && TeamTwoCorrect)
            {
                if (TeamTurn == 1)
                {
                    TeamOneScore += 5;
                    TeamTwoScore += 2;
                }
                else 
                {
                    TeamOneScore += 2;
                    TeamTwoScore += 5;
                }
            }
            else if (TeamOneCorrect)
            {
                TeamOneScore += 5;
            }
            else if (TeamTwoCorrect)
            {
                TeamTwoScore += 5;
            }
            
            if (!TeamOneCorrect && TeamOneCaptainStatus == GameStateTableEntity.CaptainStatusGuess)
            {
                TeamOneIncorrectGuesses += 1;
                TeamOneScore -= 1;
            }
            if (!TeamTwoCorrect && TeamTwoCaptainStatus == GameStateTableEntity.CaptainStatusGuess)
            {
                TeamTwoIncorrectGuesses += 1;
                TeamTwoScore -= 1;
            }
        }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.RevealedPanels)))
            {
                this.RevealedPanels = properties[nameof(this.RevealedPanels)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.RevealedPanels == null)
            {
                this.RevealedPanels = new List<string>();
            }

            result[nameof(this.RevealedPanels)] = new EntityProperty(string.Join(",", this.RevealedPanels));

            return result;
        }

        private static readonly List<string> innerPanels = new List<string>() { "7", "8", "9", "12", "13", "14" };

        public static bool IsInnerPanel(string panelId)
        {
            return innerPanels.Contains(panelId);
        }
    }
}
