using Microsoft.AspNetCore.Mvc;

namespace Aurora.Controllers
{
    public class EventController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
