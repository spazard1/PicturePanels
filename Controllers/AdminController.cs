﻿using Microsoft.AspNetCore.Mvc;

namespace PictureGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : Controller
    {
        [Route("/admin")]
        public IActionResult Index()
        {
            ViewData["Title"] = "Admin";
            return View();
        }

        [Route("/upload")]
        public IActionResult Upload()
        {
            ViewData["Title"] = "Upload";
            return View();
        }

        [Route("/listimages")]
        public IActionResult ListImages()
        {
            ViewData["Title"] = "List Images";
            return View();
        }

        [Route("/setup")]
        public IActionResult Setup()
        {
            ViewData["Title"] = "Setup";
            return View();
        }
    }
}
