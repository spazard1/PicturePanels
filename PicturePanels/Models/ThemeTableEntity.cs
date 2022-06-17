using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Cosmos.Table;

namespace PicturePanels.Models
{
    public class ThemeTableEntity : TableEntity
    {
        public const string DefaultPartitionKey = "themes";

        public ThemeTableEntity()
        {
            this.PartitionKey = DefaultPartitionKey;
        }

        public string Name
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string Css { get; set; }

        public List<string> PlayerJoinSounds { get; set; }

        public List<string> TurnStartSounds { get; set; }

        public List<string> CountdownSounds { get; set; }

        public List<string> OpenPanelSounds { get; set; }

        public List<string> PlayerReadySounds { get; set; }

        public List<string> BothTeamsPassSounds { get; set; }

        public List<string> CorrectSounds { get; set; }

        public List<string> IncorrectSounds { get; set; }

        public List<string> EndGameSounds { get; set; }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.PlayerJoinSounds)))
            {
                this.PlayerJoinSounds = properties[nameof(this.PlayerJoinSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.TurnStartSounds)))
            {
                this.TurnStartSounds = properties[nameof(this.TurnStartSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.CountdownSounds)))
            {
                this.CountdownSounds = properties[nameof(this.CountdownSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.OpenPanelSounds)))
            {
                this.OpenPanelSounds = properties[nameof(this.OpenPanelSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.PlayerReadySounds)))
            {
                this.PlayerReadySounds = properties[nameof(this.PlayerReadySounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.BothTeamsPassSounds)))
            {
                this.BothTeamsPassSounds = properties[nameof(this.BothTeamsPassSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.CorrectSounds)))
            {
                this.CorrectSounds = properties[nameof(this.CorrectSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.IncorrectSounds)))
            {
                this.IncorrectSounds = properties[nameof(this.IncorrectSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.EndGameSounds)))
            {
                this.EndGameSounds = properties[nameof(this.EndGameSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.PlayerJoinSounds != null)
            {
                result[nameof(this.PlayerJoinSounds)] = new EntityProperty(string.Join(",", this.PlayerJoinSounds));
            }

            if (this.TurnStartSounds != null)
            {
                result[nameof(this.TurnStartSounds)] = new EntityProperty(string.Join(",", this.TurnStartSounds));
            }

            if (this.CountdownSounds != null)
            {
                result[nameof(this.CountdownSounds)] = new EntityProperty(string.Join(",", this.CountdownSounds));
            }

            if (this.OpenPanelSounds != null)
            {
                result[nameof(this.OpenPanelSounds)] = new EntityProperty(string.Join(",", this.OpenPanelSounds));
            }

            if (this.PlayerReadySounds != null)
            {
                result[nameof(this.PlayerReadySounds)] = new EntityProperty(string.Join(",", this.PlayerReadySounds));
            }

            if (this.BothTeamsPassSounds != null)
            {
                result[nameof(this.BothTeamsPassSounds)] = new EntityProperty(string.Join(",", this.BothTeamsPassSounds));
            }

            if (this.CorrectSounds != null)
            {
                result[nameof(this.CorrectSounds)] = new EntityProperty(string.Join(",", this.CorrectSounds));
            }

            if (this.IncorrectSounds != null)
            {
                result[nameof(this.IncorrectSounds)] = new EntityProperty(string.Join(",", this.IncorrectSounds));
            }

            if (this.EndGameSounds != null)
            {
                result[nameof(this.EndGameSounds)] = new EntityProperty(string.Join(",", this.EndGameSounds));
            }

            return result;
        }
    }
}
