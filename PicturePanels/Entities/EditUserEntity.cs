using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class EditUserEntity
    {

        [Required]
        [MinLength(6)]
        public string UserName { get; set; }

        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        [MinLength(6)]
        public string ExistingPassword { get; set; }

        [MinLength(2)]
        public string DisplayName { get; set; }
    }
}
