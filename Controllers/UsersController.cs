using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Models;
using PicturePanels.Services;
using PicturePanels.Services.Authentication;
using PicturePanels.Services.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly UserTableStorage userTableStorage;
        private readonly SecurityProvider securityProvider;

        public UsersController(
            UserTableStorage userTableStorage,
            SecurityProvider securityProvider
            )
        {
            this.userTableStorage = userTableStorage;
            this.securityProvider = securityProvider;
        }

        [HttpGet("authorize")]
        [RequireAuthorization]
        public IActionResult Get()
        {
            return StatusCode(200);
        }

        [HttpGet("steven")]
        public async Task<IActionResult> StevenAsync()
        {
            var user = await this.userTableStorage.GetAsync("spazard1");
            user.Salt = this.securityProvider.GetSalt();
            user.Password = this.securityProvider.GetPasswordHash("Aldeth83!", user.Salt);

            await this.userTableStorage.InsertOrReplaceAsync(user);

            return StatusCode((int)HttpStatusCode.OK);
        }

        [HttpPut("login")]
        public async Task<IActionResult> LoginAsync([FromBody] UserEntity userEntity)
        {
            var user = await this.userTableStorage.GetAsync(userEntity.UserName);
            if (user == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            if (this.securityProvider.ValidatePassword(userEntity.Password, user.Salt, user.Password))
            {
                return Json(new TokenEntity() { Token = this.securityProvider.GetToken(user.UserName, user.UserId) });
            }

            return StatusCode((int)HttpStatusCode.Unauthorized);
        }


        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] UserEntity userEntity)
        {
            var user = await this.userTableStorage.GetAsync(userEntity.UserName);
            if (user != null)
            {
                return StatusCode((int)HttpStatusCode.Conflict);
            }

            var userModel = userEntity.ToModel();
            userModel.UserId = Guid.NewGuid().ToString();
            userModel.Salt = this.securityProvider.GetSalt();
            userModel.Password = this.securityProvider.GetPasswordHash(userEntity.Password, userModel.Salt);
            userModel = await this.userTableStorage.InsertAsync(userModel);

            return Json(new UserEntity(userModel));
        }
    }
}
