﻿using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class TeamGuessEntity
    {
        public TeamGuessEntity()
        {

        }

        public TeamGuessEntity(TeamGuessTableEntity tableEntity)
        {
            this.Guess = tableEntity.Guess;
            this.Ticks = tableEntity.CreatedTime.Ticks.ToString();
        }

        public string Guess { get; set; }

        public string Ticks { get; set; }

        public int VoteCount { get; internal set; }
    }
}
