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

        public const string TurnTypeWelcome = "Welcome";
        public const string TurnTypeOpenPanel = "OpenPanel";
        public const string TurnTypeMakeGuess = "MakeGuess";
        public const string TurnTypeGuessesMade = "GuessesMade";
        public const string TurnTypeEndRound = "EndRound";

        public const string TeamGuessStatusPass = "Pass";
        public const string TeamGuessStatusGuess = "Guess";

        public static readonly IEnumerable<string> OuterPanels = new List<string>() { "1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20" };
        public static readonly IEnumerable<string> InnerPanels = new List<string>() { "7", "8", "9", "12", "13", "14" };
        public static readonly IEnumerable<string> AllPanels = OuterPanels.Concat(InnerPanels);

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

        public int TeamOneScore { get; set; }

        public int TeamOneIncorrectGuesses { get; set; }

        public int TeamOneInnerPanels { get; set; }

        public string TeamOneGuess { get; set; }

        public bool TeamOneCorrect { get; set; }

        public string TeamOneGuessStatus { get; set; }

        public string TeamTwoName { get; set; }

        public int TeamTwoScore { get; set; }

        public int TeamTwoIncorrectGuesses { get; set; }

        public int TeamTwoInnerPanels { get; set; }

        public string TeamTwoGuess { get; set; }

        public bool TeamTwoCorrect { get; set; }

        public string TeamTwoGuessStatus { get; set; }

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
            TeamOneGuessStatus = string.Empty;
            TeamOneCorrect = false;
            TeamTwoGuess = string.Empty;
            TeamTwoGuessStatus = string.Empty;
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
            
            if (!TeamOneCorrect && TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess)
            {
                TeamOneIncorrectGuesses += 1;
            }
            if (!TeamTwoCorrect && TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess)
            {
                TeamTwoIncorrectGuesses += 1;
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

        public static bool IsInnerPanel(string panelId)
        {
            return InnerPanels.Contains(panelId);
        }
    }
}
