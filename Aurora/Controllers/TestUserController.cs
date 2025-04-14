using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aurora.Controllers
{
    [ApiController]
    [Authorize(Roles ="User")]
    [Route("/api/[controller]")]
    public class TestUserController : Controller
    {
        [HttpGet("test")]
        public IActionResult Get()
        {
            return Ok("Worked");
        }
    }
}
