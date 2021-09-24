using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Models
{
    public interface IImageIdNameTableEntity : IImageIdTableEntity
    {
        string Name { get; set; }
    }
}
