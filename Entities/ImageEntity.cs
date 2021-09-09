using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

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
            AlternativeNames = tableEntity.AlternativeNames;
            Tags = tableEntity.AlternativeNames;
            UploadedBy = tableEntity.UploadedBy;
            UploadComplete = tableEntity.UploadComplete;
            UploadCompleteTime = tableEntity.UploadCompleteTime;
        }

        public string Id { get; set; }


        [Required]
        [MinLength(2)]
        [MaxLength(100)]
        public string Name { get; set; }

        public List<string> AlternativeNames { get; set; }

        public List<string> Tags { get; set; }

        [Required]
        [MinLength(2)]
        [MaxLength(14)]
        public string UploadedBy { get; set; }

        public bool UploadComplete { get; internal set; }

        public DateTime? UploadCompleteTime { get; internal set; }

        public string PlayedTime { get; internal set; }

        public ImageTableEntity ToTableEntity()
        {
            return new ImageTableEntity()
            {
                Id = this.Id,
                Name = this.Name,
                AlternativeNames = this.AlternativeNames,
                Tags = this.AlternativeNames,
                UploadedBy = this.UploadedBy,
                UploadComplete = this.UploadComplete,
                UploadCompleteTime = this.UploadCompleteTime
            };
        }

        public int CompareTo([AllowNull] ImageEntity other)
        {
            return this.Name.GetHashCode() - other.Name.GetHashCode();
        }
    }
}
