using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace PicturePanels.Entities
{
    public class ImageIdNameListEntity
    {
        public string QueryString { get; set; }

        public IEnumerable<ImageIdNameEntity> ImageIds { get; set; }

    }
}
