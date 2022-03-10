using Microsoft.AspNetCore.Mvc;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameBoardController : Controller
    {
        [Route("/gameboard")]
        [Route("/play")]
        public IActionResult Index()
        {
            ViewData["Title"] = "Game Board";
            return View();
        }
    }
}
