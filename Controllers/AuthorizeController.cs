using CloudStorage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PictureGame.Entities;
using PictureGame.Filters;
namespace PictureGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorizeController : Controller
    {

        public AuthorizeController()
        {

        }

        [HttpGet]
        [RequireAuthorization]
        public IActionResult Get()
        {
            return StatusCode(200);
        }
    }
}
