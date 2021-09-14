﻿using PicturePanels.Models;
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
            AlternativeNames = string.Join(",", tableEntity.AlternativeNames ?? new List<string>());
            Tags = string.Join(",", tableEntity.Tags ?? new List<string>());
        }

        public string Id { get; set; }


        [Required]
        [MinLength(2)]
        [MaxLength(100)]
        public string Name { get; set; }

        public string AlternativeNames { get; set; }

        public string Tags { get; set; }

        public string UploadedBy { get; internal set; }

        public void CopyProperties(ImageTableEntity tableEntity)
        {
            tableEntity.Id = this.Id;
            tableEntity.Name = this.Name;
            tableEntity.AlternativeNames = this.AlternativeNames?.Split(",").ToList();
            tableEntity.Tags = this.Tags?.Split(",").ToList();
        }

        public int CompareTo([AllowNull] ImageEntity other)
        {
            return this.Name.GetHashCode() - other.Name.GetHashCode();
        }
    }
}
