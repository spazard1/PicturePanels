using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public class PlayerTableEntity : TableEntity
    {
        public const string Players = "Players";

        public PlayerTableEntity()
        {
            this.PartitionKey = "Players";
        }

        public string PlayerId {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string Name { get; set; }

        public int TeamNumber { get; set; }

        public List<string> SelectedPanels { get; set; }

        public string Color { get; set; }

        public DateTime LastPingTime { get; set; }

        public bool IsAdmin { get; set; }

        public string ConnectionId { get; set; }

        public string TeamGuessVote { get; set; }

        public string SignalRGroup {
           get
           {
                return TeamNumber == 1 ? SignalRHub.TeamOneGroup : SignalRHub.TeamTwoGroup;
           }
        }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.SelectedPanels)))
            {
                this.SelectedPanels = properties[nameof(this.SelectedPanels)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.SelectedPanels != null)
            {
                result[nameof(this.SelectedPanels)] = new EntityProperty(string.Join(",", this.SelectedPanels));
            }

            return result;
        }
    }
}
