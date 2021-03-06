using PicturePanels.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Entities
{
    public class UserEntity
    {

        public UserEntity()
        {

        }

        public UserEntity(UserTableEntity userModel)
        {
            this.UserId = userModel.UserId;
            this.UserName = userModel.UserName;
            this.DisplayName = userModel.DisplayName;
        }

        public string UserId { get; set; }

        public string UserName { get; set; }

        public string DisplayName { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        public UserTableEntity ToModel()
        {
            return new UserTableEntity()
            {
                UserId = this.UserId,
                UserName = this.UserName
            };
        }
    }
}
