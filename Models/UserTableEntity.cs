using Microsoft.Azure.Cosmos.Table;
using PicturePanels.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public class UserTableEntity : TableEntity
    {
        public string UserId {
            get { return this.PartitionKey; }
            set { this.PartitionKey = value; }
        }

        public string UserName
        {
            get { return this.RowKey; }
            set { this.RowKey = value; }
        }

        public string DisplayName { get; set; }

        public string Password { get; set; }

        public string Salt { get; set; }

        public string QueryString { get; set; }

        public DateTime? QueryStringCreateTime { get; set; }
    }
}
