using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Cosmos.Table;

namespace CloudStorage.Models
{
    public class GameStateTableEntity : TableEntity
    {
        public const string GameStatePartitionKey = "GameState";
        public const string GameStateDefaultId = "Default";

        public const string ActionNewRound = "NewRound";
        public const string ActionOpenPanel = "OpenPanel";
        public const string ActionPass = "Pass";
        public const string ActionIncorrect = "Incorrect";
        public const string ActionCorrect = "Correct";
        public const string ActionEndRound = "EndRound";

        public const string TurnTypeWelcome = "Welcome";
        public const string TurnTypeOpenPanel = "OpenPanel";
        public const string TurnTypeOpenFreePanel = "OpenFreePanel";
        public const string TurnTypeMakeGuess = "MakeGuess";
        public const string TurnTypeCorrect = "Correct";
        public const string TurnTypeEndRound = "EndRound";

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

        public string CaptainStatus { get; set; }

        public int TeamFirstTurn { get; set; }

        public string ImageId { get; set; }

        public IList<string> RevealedPanels { get; set; }

        public string TeamOneName { get; set; }

        public string TeamOneCaptain { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamOneIncorrectGuesses { get; set; }

        public int TeamOneOuterPanels { get; set; }

        public int TeamOneInnerPanels { get; set; }

        public string TeamTwoName { get; set; }

        public string TeamTwoCaptain { get; set; }

        public int TeamTwoScore { get; set; }

        public int TeamTwoIncorrectGuesses { get; set; }

        public int TeamTwoOuterPanels { get; set; }

        public int TeamTwoInnerPanels { get; set; }

        public void SetTurnType(string action)
        {
            switch (action)
            {
                case ActionNewRound:
                    TurnType = OpenPanelOrMakeGuess();
                    break;
                case ActionEndRound:
                    TurnType = TurnTypeEndRound;
                    break;
                case ActionCorrect:
                    TurnType = TurnTypeCorrect;
                    break;
                case ActionIncorrect:
                    TurnType = TurnTypeOpenFreePanel;
                    break;
                case ActionOpenPanel:
                    if (TurnType == TurnTypeOpenFreePanel)
                    {
                        TurnType = OpenPanelOrMakeGuess();
                    }
                    else
                    {
                        TurnType = TurnTypeMakeGuess;
                    }
                    break;
                case ActionPass:
                    TurnType = OpenPanelOrMakeGuess();
                    break;
            }
        }

        public void UpdatePanelCount(string panelId)
        {     
            if (GameStateTableEntity.IsInnerPanel(panelId))
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
            else
            {
                if (TeamTurn == 1)
                {
                    TeamOneOuterPanels = Math.Max(0, TeamOneOuterPanels - 1);
                }
                else
                {
                    TeamTwoOuterPanels = Math.Max(0, TeamTwoOuterPanels - 1);
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

        public void Incorrect()
        {
            if (TeamTurn == 1)
            {
                TeamOneIncorrectGuesses++;
            }
            else
            {
                TeamTwoIncorrectGuesses++;
            }
        }

        public void Correct()
        {
            if (TeamTurn == 1)
            {
                TeamOneScore++;
            }
            else
            {
                TeamTwoScore++;
            }
        }

        private string OpenPanelOrMakeGuess()
        {
            if (TeamTurn == 1)
            {
                if (TeamOneOuterPanels == 0 && TeamOneInnerPanels == 0)
                {
                    return TurnTypeMakeGuess;
                }
                else
                {
                    return TurnTypeOpenPanel;
                }
            }
            else
            {
                if (TeamTwoOuterPanels == 0 && TeamTwoInnerPanels == 0)
                {
                    return TurnTypeMakeGuess;
                }
                else
                {
                    return TurnTypeOpenPanel;
                }
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
