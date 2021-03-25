using Microsoft.Azure.Cosmos.Table;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CloudStorage.Models
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

        public List<string> SelectedTiles { get; set; }

        public string Color { get; set; }

        public DateTime LastPingTime { get; set; }

        public bool IsAdmin { get; set; }

        public string ConnectionId { get; set; }

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.SelectedTiles)))
            {
                this.SelectedTiles = properties[nameof(this.SelectedTiles)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.SelectedTiles != null)
            {
                result[nameof(this.SelectedTiles)] = new EntityProperty(string.Join(",", this.SelectedTiles));
            }

            return result;
        }
    }
}
