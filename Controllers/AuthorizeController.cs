using CloudStorage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PicturePanels.Entities;
using PicturePanels.Filters;
namespace PicturePanels.Controllers
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
