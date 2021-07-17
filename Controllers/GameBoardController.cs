using Microsoft.AspNetCore.Mvc;

namespace PicturePanels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameBoardController : Controller
    {
        [Route("/gameboard")]
        public IActionResult Index()
        {
            ViewData["Title"] = "Game Board";
            return View();
        }
    }
}
