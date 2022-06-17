using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class ThemeEntity
    {

        public ThemeEntity()
        {

        }

        public ThemeEntity(ThemeTableEntity themeTableEntity)
        {
            this.Name = themeTableEntity.Name;
            this.Css = themeTableEntity.Css;
            this.PlayerJoinSounds = themeTableEntity.PlayerJoinSounds;
            this.TurnStartSounds = themeTableEntity.TurnStartSounds;
            this.CountdownSounds = themeTableEntity.CountdownSounds;
            this.OpenPanelSounds = themeTableEntity.OpenPanelSounds;
            this.PlayerReadySounds = themeTableEntity.PlayerReadySounds;
            this.BothTeamsPassSounds = themeTableEntity.BothTeamsPassSounds;
            this.CorrectSounds = themeTableEntity.CorrectSounds;
            this.IncorrectSounds = themeTableEntity.IncorrectSounds;
            this.EndGameSounds = themeTableEntity.EndGameSounds;
        }

        public string Name { get; set; }

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
    }
}
