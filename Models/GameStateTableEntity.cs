using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class GameStateTableEntity : TableEntity
    {
        public const string GameStatePartitionKey = "GameState";

        public const string TurnTypeWelcome = "Welcome";
        public const string TurnTypeOpenPanel = "OpenPanel";
        public const string TurnTypeMakeGuess = "MakeGuess";
        public const string TurnTypeGuessesMade = "GuessesMade";
        public const string TurnTypeEndRound = "EndRound";
        public const string TurnTypeEndGame = "EndGame";

        public const string TeamGuessStatusPass = "Pass";
        public const string TeamGuessStatusGuess = "Guess";

        public const string UpdateTypeNewRound = "NewRound";
        public const string UpdateTypeNewTurn = "NewTurn";

        public const int RoundStartDelayTime = 10;
        public const int TurnStartDelayTime = 5;

        public const int TurnEndTimeGracePeriod = 10;

        public static readonly IEnumerable<string> OuterPanels = new List<string>() { "1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20" };
        public static readonly IEnumerable<string> InnerPanels = new List<string>() { "7", "8", "9", "12", "13", "14" };
        public static readonly IEnumerable<string> AllPanels = OuterPanels.Concat(InnerPanels);

        public const int GuessesMadeTimeIncorrect = 25;
        public const int GuessesMadeTimeCorrect = 40;
        public const int EndRoundTime = 30;

        public const int DefaultOpenPanelTime = 30;
        public const int DefaultMakeGuessTime = 120;

        public const int MaxOpenPanels = 10;

        public const int MaxRounds = 10;

        public GameStateTableEntity()
        {
            this.PartitionKey = GameStatePartitionKey;
        }

        public string GameStateId
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string CreatedBy { get; set; }

        public List<string> Tags { get; set; }

        public string ThemeCss { get; set; }

        public int OpenPanelTime { get; set; }

        public int GuessTime { get; set; }

        public int RoundNumber { get; set; }

        public int FinalRoundNumber { get; set; }

        public int TurnNumber { get; set; }

        public int TeamTurn { get; set; }

        public string TurnType { get; set; }

        public DateTime TurnStartTime { get; set; }

        public DateTime? TurnEndTime { get; set; }

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

        public bool IsUpdateAllowed(GameStateUpdateMessage gameStateUpdate)
        {
            return RoundNumber == gameStateUpdate.RoundNumber &&
                TurnType == gameStateUpdate.TurnType &&
                TurnNumber == gameStateUpdate.TurnNumber &&
                TurnEndTime == gameStateUpdate.TurnEndTime;
        }

        public static GameStateTableEntity NewGameState()
        {
            return new GameStateTableEntity()
            {
                GameStateId = GenerateGameStateId(),
                TurnType = GameStateTableEntity.TurnTypeWelcome,
                TurnStartTime = DateTime.UtcNow,
                TurnNumber = 1,
                TeamTurn = 1,
                TeamOneName = "Team 1",
                TeamTwoName = "Team 2",
                RoundNumber = 1,
                TeamOneScore = 0,
                TeamTwoScore = 0,
                TeamOneIncorrectGuesses = 0,
                TeamTwoIncorrectGuesses = 0,
                TeamOneInnerPanels = 5,
                TeamTwoInnerPanels = 5,
                RevealedPanels = new List<string>()
            };
        }

        private static char[] gameStateIdLetters = { 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Z' };

        private static string GenerateGameStateId()
        {
            var rand = new Random();
            var stringBuilder = new StringBuilder();

            for (var i = 0; i < 4; i++)
            {
                stringBuilder.Append(gameStateIdLetters[rand.Next(0, gameStateIdLetters.Length)]);
            }

            return stringBuilder.ToString();
        }

        public void NewRound()
        {
            this.RoundNumber++;
            this.TeamTurn = this.RoundNumber % 2 == 0 ? 2 : 1;
            this.RevealedPanels = new List<string>();
            this.ClearGuesses();
            if (RoundNumber > this.FinalRoundNumber)
            {
                this.NewTurnType(GameStateTableEntity.TurnTypeEndGame);
            }
            else
            {
                this.NewTurnType(GameStateTableEntity.TurnTypeOpenPanel);
            }
            this.TurnNumber = 1;
        }

        public void StartGame()
        {
            this.RoundNumber = 1;
            this.TeamTurn = 1;
            this.RevealedPanels = new List<string>();
            this.ClearGuesses();
            this.NewTurnType(GameStateTableEntity.TurnTypeOpenPanel);
            this.TurnNumber = 1;
        }

        public void NewTurnType(string turnType)
        {
            this.TurnNumber++;
            this.TurnType = turnType;

            switch (TurnType)
            {
                case GameStateTableEntity.TurnTypeOpenPanel:
                    this.ClearGuesses();
                    if (!this.RevealedPanels.Any())
                    {
                        this.TurnStartTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.RoundStartDelayTime);
                        this.TurnEndTime = this.TurnStartTime.AddSeconds(this.OpenPanelTime);
                    }
                    else
                    {
                        this.TurnStartTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.TurnStartDelayTime);
                        this.TurnEndTime = this.TurnStartTime.AddSeconds(this.OpenPanelTime);
                    }
                    break;
                case GameStateTableEntity.TurnTypeMakeGuess:
                    this.TurnStartTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.TurnStartDelayTime);
                    this.TurnEndTime = this.TurnStartTime.AddSeconds(this.GuessTime);
                    break;
                case GameStateTableEntity.TurnTypeGuessesMade:
                    this.TurnStartTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.TurnStartDelayTime);
                    if (this.TeamOneCorrect || this.TeamTwoCorrect)
                    {
                        this.TurnEndTime = this.TurnStartTime.AddSeconds(GameStateTableEntity.GuessesMadeTimeCorrect);
                    }
                    else
                    {
                        this.TurnEndTime = this.TurnStartTime.AddSeconds(GameStateTableEntity.GuessesMadeTimeIncorrect);
                    }
                    break;
                case GameStateTableEntity.TurnTypeEndRound:
                    this.TurnStartTime = DateTime.UtcNow.AddSeconds(GameStateTableEntity.TurnStartDelayTime);
                    this.TurnEndTime = this.TurnStartTime.AddSeconds(GameStateTableEntity.EndRoundTime);
                    break;
                case GameStateTableEntity.TurnTypeEndGame:
                    this.TurnStartTime = DateTime.UtcNow;
                    this.TurnEndTime = this.TurnStartTime;
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
            TeamOneScore = GetTeamScoreChange(1);
            TeamTwoScore = GetTeamScoreChange(2);

            if (!TeamOneCorrect && TeamOneGuessStatus == GameStateTableEntity.TeamGuessStatusGuess)
            {
                TeamOneIncorrectGuesses += 1;
            }
            if (!TeamTwoCorrect && TeamTwoGuessStatus == GameStateTableEntity.TeamGuessStatusGuess)
            {
                TeamTwoIncorrectGuesses += 1;
            }
        }

        public int GetTeamScoreChange(int teamNumber)
        {
            if (TeamOneCorrect && TeamTwoCorrect)
            {
                if (teamNumber == TeamTurn)
                {
                    return 5;
                }
                else
                {
                    return 2;
                }
            }
            else if (TeamOneCorrect && teamNumber == 1)
            {
                return 5;
            }
            else if (TeamTwoCorrect && teamNumber == 2)
            {
                return 5;
            }
            else
            {
                return 0;
            }
        }

        public void Pass(int teamNumber)
        {
            if (teamNumber == 1)
            {
                this.TeamOneGuess = string.Empty;
                this.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusPass;
            }
            else
            {
                this.TeamTwoGuess = string.Empty;
                this.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusPass;
            }
        }

        public void Guess(int teamNumber, string guess)
        {
            if (teamNumber == 1)
            {
                this.TeamOneGuess = guess;
                this.TeamOneGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
            }
            else
            {
                this.TeamTwoGuess = guess;
                this.TeamTwoGuessStatus = GameStateTableEntity.TeamGuessStatusGuess;
            }
        }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.RevealedPanels)))
            {
                this.RevealedPanels = properties[nameof(this.RevealedPanels)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.Tags)))
            {
                this.Tags = properties[nameof(this.Tags)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.RevealedPanels == null)
            {
                this.RevealedPanels = new List<string>();
            }

            if (this.Tags == null)
            {
                this.Tags = new List<string>();
            }

            result[nameof(this.RevealedPanels)] = new EntityProperty(string.Join(",", this.RevealedPanels));
            result[nameof(this.Tags)] = new EntityProperty(string.Join(",", this.Tags));

            return result;
        }

        public static bool IsInnerPanel(string panelId)
        {
            return InnerPanels.Contains(panelId);
        }
    }
}
