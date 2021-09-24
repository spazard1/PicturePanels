using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Models
{
    public interface IImageIdTableEntity
    {
        string ImageId { get; }

        string Name { get; set; }
    }
}
