using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace PicturePanels.Entities
{
    public class ImageIdEntity
    {

        public ImageIdEntity(IImageIdTableEntity tableEntity)
        {
            this.ImageId = tableEntity.ImageId;
        }

        public string ImageId { get; set; }

    }
}
