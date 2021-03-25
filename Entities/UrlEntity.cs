using CloudStorage.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace CloudStorage.Entities
{
    public class UrlEntity
    {
        public UrlEntity()
        {

        }

        public string Url { get; set; }
    }
}
