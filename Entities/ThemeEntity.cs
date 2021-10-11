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
            this.OpenPanelSounds = themeTableEntity.OpenPanelSounds;
            this.CorrectSounds = themeTableEntity.CorrectSounds;
            this.IncorrectSounds = themeTableEntity.IncorrectSounds;
        }

        public string Name { get; set; }

        public string Css { get; set; }

        public List<string> PlayerJoinSounds { get; set; }

        public List<string> OpenPanelSounds { get; set; }

        public List<string> CorrectSounds { get; set; }

        public List<string> IncorrectSounds { get; set; }
    }
}
