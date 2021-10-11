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

        public List<string> OpenPanelSounds { get; set; }

        public List<string> CorrectSounds { get; set; }

        public List<string> IncorrectSounds { get; set; }
        

        public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext)
        {
            base.ReadEntity(properties, operationContext);

            if (properties.ContainsKey(nameof(this.PlayerJoinSounds)))
            {
                this.PlayerJoinSounds = properties[nameof(this.PlayerJoinSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.OpenPanelSounds)))
            {
                this.OpenPanelSounds = properties[nameof(this.OpenPanelSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.CorrectSounds)))
            {
                this.CorrectSounds = properties[nameof(this.CorrectSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            if (properties.ContainsKey(nameof(this.IncorrectSounds)))
            {
                this.IncorrectSounds = properties[nameof(this.IncorrectSounds)].StringValue.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }

        public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext)
        {
            var result = base.WriteEntity(operationContext);

            if (this.PlayerJoinSounds != null)
            {
                result[nameof(this.PlayerJoinSounds)] = new EntityProperty(string.Join(",", this.PlayerJoinSounds));
            }

            if (this.OpenPanelSounds != null)
            {
                result[nameof(this.OpenPanelSounds)] = new EntityProperty(string.Join(",", this.OpenPanelSounds));
            }

            if (this.CorrectSounds != null)
            {
                result[nameof(this.CorrectSounds)] = new EntityProperty(string.Join(",", this.CorrectSounds));
            }

            if (this.IncorrectSounds != null)
            {
                result[nameof(this.IncorrectSounds)] = new EntityProperty(string.Join(",", this.IncorrectSounds));
            }

            return result;
        }
    }
}
