using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class ImageTagEntity
    {
        public ImageTagEntity()
        {

        }

        public ImageTagEntity(ImageTagTableEntity tableEntity)
        {
            this.Tag = tableEntity.Tag;
        }

        public string Tag { get; set; }

    }
}
