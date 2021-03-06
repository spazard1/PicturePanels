using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class ScratchImageEntity
    {
        public string ImageId { get; set; }

        public string Url { get; set; }

        public string Error { get; set; }
    }
}
