using CloudStorage.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace CloudStorage.Entities
{
    public class ImageEntity : IComparable<ImageEntity>
    {
        public ImageEntity()
        {

        }

        public ImageEntity(ImageTableEntity tableEntity)
        {
            BlobContainer = tableEntity.BlobContainer;
            Id = tableEntity.Id;
            BlobName = tableEntity.BlobName;
            Name = tableEntity.Name;
            UploadedBy = tableEntity.UploadedBy;
            UploadComplete = tableEntity.UploadComplete;
            UploadCompleteTime = tableEntity.UploadCompleteTime;
            if (tableEntity.PlayedTime.HasValue)
            {
                PlayedTime = tableEntity.PlayedTime.Value.ToShortDateString();
            }
            else
            {
                PlayedTime = string.Empty;
            }
        }

        public string BlobContainer { get; set; }

        public string Id { get; set; }


        public string BlobName { get; internal set; }

        [Required]
        [MinLength(2)]
        [MaxLength(30)]
        public string Name { get; set; }

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
                BlobContainer = this.BlobContainer,
                Id = this.Id,
                BlobName = this.BlobName,
                Name = this.Name,
                UploadedBy = this.UploadedBy,
                UploadComplete = this.UploadComplete,
                UploadCompleteTime = this.UploadCompleteTime,
                PlayedTime = null
            };
        }

        public int CompareTo([AllowNull] ImageEntity other)
        {
            return this.Name.GetHashCode() - other.Name.GetHashCode();
        }
    }
}
