using PicturePanels.Models;
using System;
using System.Diagnostics.CodeAnalysis;

namespace PicturePanels.Entities
{
    public class BlobContainerEntity : IComparable<BlobContainerEntity>
    {
        public BlobContainerEntity()
        {

        }

        public string Name { get; set; }

        public int CompareTo([AllowNull] BlobContainerEntity other)
        {
            return this.Name.CompareTo(other.Name);
        }
    }
}
