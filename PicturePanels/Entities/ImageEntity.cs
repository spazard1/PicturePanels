using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace PicturePanels.Entities
{
    public class ImageEntity : IComparable<ImageEntity>
    {
        public ImageEntity()
        {

        }

        public ImageEntity(ImageTableEntity tableEntity)
        {
            Id = tableEntity.Id;
            Name = tableEntity.Name;
            IsHidden = tableEntity.IsHidden;
            AlternativeNames = tableEntity.AlternativeNames ?? new List<string>();
            Tags = tableEntity.Tags ?? new List<string>();
            UploadedBy = tableEntity.UploadedBy;
        }

        public string Id { get; set; }


        [Required]
        [MinLength(2)]
        [MaxLength(100)]
        public string Name { get; set; }

        public bool IsHidden { get; set; }

        public List<string> AlternativeNames { get; set; }

        public List<string> Tags { get; set; }

        public string UploadedBy { get; internal set; }

        public bool IsPlayed { get; internal set; }

        public void CopyProperties(ImageTableEntity tableEntity)
        {
            tableEntity.Name = this.Name;
            tableEntity.AlternativeNames = this.AlternativeNames;
            tableEntity.Tags = this.Tags;
            tableEntity.IsHidden = this.IsHidden;
        }

        public int CompareTo([AllowNull] ImageEntity other)
        {
            return this.Name.GetHashCode() - other.Name.GetHashCode();
        }
    }
}
