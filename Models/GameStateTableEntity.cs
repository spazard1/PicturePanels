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
        public const string ActionOpenTile = "OpenTile";
        public const string ActionPass = "Pass";
        public const string ActionIncorrect = "Incorrect";
        public const string ActionCorrect = "Correct";
        public const string ActionEndRound = "EndRound";

        public const string TurnTypeWelcome = "Welcome";
        public const string TurnTypeOpenTile = "OpenTile";
        public const string TurnTypeOpenFreeTile = "OpenFreeTile";
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

        public int OpenTileTime { get; set; }

        public int GuessTime { get; set; }

        public int RoundNumber { get; set; }

        public int TeamTurn { get; set; }

        public string TurnType { get; set; }

        public string CaptainStatus { get; set; }

        public int TeamFirstTurn { get; set; }

        public string ImageId { get; set; }

        public IList<string> RevealedTiles { get; set; }

        public string TeamOneName { get; set; }

        public string TeamOneCaptain { get; set; }

        public int TeamOneScore { get; set; }

        public int TeamOneIncorrectGuesses { get; set; }

        public int TeamOneOuterTiles { get; set; }

        public int TeamOneInnerTiles { get; set; }

        public string TeamTwoName { get; set; }

        public string TeamTwoCaptain { get; set; }

        public int TeamTwoScore { get; set; }

        public int TeamTwoIncorrectGuesses { get; set; }

        public int TeamTwoOuterTiles { get; set; }

        public int TeamTwoInnerTiles { get; set; }

        public void SetTurnType(string action)
        {
            switch (action)
            {
                case ActionNewRound:
                    TurnType = OpenTileOrMakeGuess();
                    break;
                case ActionEndRound:
                    TurnType = TurnTypeEndRound;
                    break;
                case ActionCorrect:
                    TurnType = TurnTypeCorrect;
                    break;
                case ActionIncorrect:
                    TurnType = TurnTypeOpenFreeTile;
                    break;
                case ActionOpenTile:
                    if (TurnType == TurnTypeOpenFreeTile)
                    {
                        TurnType = OpenTileOrMakeGuess();
                    }
                    else
                    {
                        TurnType = TurnTypeMakeGuess;
                    }
                    break;
                case ActionPass:
                    TurnType = OpenTileOrMakeGuess();
                    break;
            }
        }

        public void UpdateTileCount(string tileId)
        {     
            if (GameStateTableEntity.IsInnerTile(tileId))
            {
                if (TeamTurn == 1)
                {
                    TeamOneInnerTiles = Math.Max(0, TeamOneInnerTiles - 1);
                }
                else
                {
                    TeamTwoInnerTiles = Math.Max(0, TeamTwoInnerTiles - 1);
                }
            }
            else
            {
                if (TeamTurn == 1)
                {
                    TeamOneOuterTiles = Math.Max(0, TeamOneOuterTiles - 1);
                }
                else
                {
                    TeamTwoOuterTiles = Math.Max(0, TeamTwoOuterTiles - 1);
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

        private string OpenTileOrMakeGuess()
        {
            if (TeamTurn == 1)
            {
                if (TeamOneOuterTiles == 0 && TeamOneInnerTiles == 0)
                {
                    return TurnTypeMakeGuess;
                }
                else
                {
                    return TurnTypeOpenTile;
                }
            }
            else
            {
                if (TeamTwoOuterTiles == 0 && TeamTwoInnerTiles == 0)
                {
                    return TurnTypeMakeGuess;
                }
                else
                {
                    return TurnTypeOpenTile;
                }
            }
        }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.RevealedTiles)))
            {
                this.RevealedTiles = properties[nameof(this.RevealedTiles)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.RevealedTiles == null)
            {
                this.RevealedTiles = new List<string>();
            }

            result[nameof(this.RevealedTiles)] = new EntityProperty(string.Join(",", this.RevealedTiles));

            return result;
        }

        private static readonly List<string> innerTiles = new List<string>() { "7", "8", "9", "12", "13", "14" };

        public static bool IsInnerTile(string tileId)
        {
            return innerTiles.Contains(tileId);
        }
    }
}
