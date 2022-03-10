using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace PicturePanels.Entities
{
    public class ImageIdNameEntity
    {

        public ImageIdNameEntity(IImageIdNameTableEntity tableEntity)
        {
            this.ImageId = tableEntity.ImageId;
            this.Name = tableEntity.Name;
        }

        public string ImageId { get; set; }

        public string Name { get; set; }

    }
}
