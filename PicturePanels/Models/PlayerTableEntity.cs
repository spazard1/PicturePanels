using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public class PlayerTableEntity : TableEntity
    {
        public string GameStateId
        {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public string PlayerId {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string Name { get; set; }

        public int TeamNumber { get; 
            set; }

        public List<string> SelectedPanels { get; set; }

        public string Guess { get; set; }

        public List<string> PreviousGuesses { get; set; }

        public int Confidence { get; set; }

        public string GuessVoteId { get; set; }

        public bool IsReady { get; set; }

        public List<string> Colors { get; set; }

        public string Dot { get; set; }

        public DateTime LastPingTime { get; set; }

        public bool IsAdmin { get; set; }

        public string ConnectionId { get; set; }

        public string SignalRTeamGroupName {
           get
           {
                return SignalRHub.TeamGroup(GameStateId, TeamNumber);
           }
        }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.SelectedPanels)))
            {
                this.SelectedPanels = properties[nameof(this.SelectedPanels)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.PreviousGuesses)))
            {
                this.PreviousGuesses = properties[nameof(this.PreviousGuesses)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.Colors)))
            {
                this.Colors = properties[nameof(this.Colors)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.SelectedPanels != null)
            {
                result[nameof(this.SelectedPanels)] = new EntityProperty(string.Join(",", this.SelectedPanels));
            }

            if (this.PreviousGuesses != null)
            {
                result[nameof(this.PreviousGuesses)] = new EntityProperty(string.Join(",", this.PreviousGuesses));
            }

            if (this.Colors != null)
            {
                result[nameof(this.Colors)] = new EntityProperty(string.Join(",", this.Colors));
            }

            return result;
        }
    }
}
