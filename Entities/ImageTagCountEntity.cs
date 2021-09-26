using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class ImageTagCountEntity
    {
        public ImageTagCountEntity()
        {

        }

        public ImageTagCountEntity(ImageTagTableEntity tableEntity)
        {
            this.Tag = tableEntity.Tag;
            this.Count = tableEntity.Count;
            this.IsHidden = tableEntity.IsHidden;
        }

        public string Tag { get; set; }

        public int Count { get; set; }

        public bool IsHidden { get; set; }

    }
}
