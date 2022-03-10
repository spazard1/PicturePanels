using Microsoft.AspNetCore.Mvc;
using PicturePanels.Entities;
using PicturePanels.Filters;
using PicturePanels.Services.Authentication;
using PicturePanels.Services.Storage;
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

        [Route("/newUser")]
        public IActionResult NewUser()
        {
            ViewData["Title"] = "New User";
            return View();
        }

        [Route("/editUser")]
        public IActionResult EditUser()
        {
            ViewData["Title"] = "Edit User";
            return View();
        }

        [Route("/upload")]
        public IActionResult Upload()
        {
            ViewData["Title"] = "Upload";
            return View();
        }

        [HttpPut("login")]
        public async Task<IActionResult> LoginAsync([FromBody] UserEntity userEntity)
        {
            var userModel = await this.userTableStorage.GetAsync(userEntity.UserName);
            if (userModel == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            if (this.securityProvider.ValidatePassword(userEntity.Password, userModel.Salt, userModel.Password))
            {
                return Json(new UserTokenEntity()
                {
                    User = new UserEntity(userModel),
                    UserToken = this.securityProvider.GetToken(userModel.UserName, userModel.UserId)
                });
            }

            return StatusCode((int)HttpStatusCode.Unauthorized);
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] NewUserEntity userEntity)
        {
            var userModel = await this.userTableStorage.GetAsync(userEntity.UserName);
            if (userModel != null)
            {
                return StatusCode((int)HttpStatusCode.Conflict);
            }

            userModel = await this.userTableStorage.NewUserAsync(userEntity.UserName, userEntity.DisplayName, userEntity.Password);

            return Json(new UserEntity(userModel));
        }

        [HttpGet]
        [RequireAuthorization]
        public async Task<IActionResult> GetAsync()
        {
            var userModel = await this.userTableStorage.GetAsync(HttpContext.Items[SecurityProvider.UserIdKey].ToString());
            if (userModel == null)
            {
                return StatusCode(404);
            }

            return Json(new UserEntity(userModel));
        }

        [HttpPut]
        public async Task<IActionResult> PutAsync([FromBody] EditUserEntity userEntity)
        {
            var userModel = await this.userTableStorage.GetAsync(userEntity.UserName);
            if (userModel == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            if (!this.securityProvider.ValidatePassword(userEntity.ExistingPassword, userModel.Salt, userModel.Password))
            {
                return StatusCode((int)HttpStatusCode.Forbidden);
            }

            userModel = await this.userTableStorage.EditUserAsync(userModel, userEntity.DisplayName, userEntity.Password);

            return Json(new UserEntity(userModel));
        }
    }
}
