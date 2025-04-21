
using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : Controller
    {
        private readonly ApplicationDbContext db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public CategoriesController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager
        )
        {
            db = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        [HttpGet("index")]
        public async Task<IActionResult> Index()
        {
            var categories = db.Categorys;
            return Ok(categories);
        }
        [Authorize(Roles ="Admin")]
        [HttpPost("new")]
        public async Task<IActionResult> New(Category category)
        {
            db.Categorys.Add(category);
            db.SaveChanges();
            return Ok();
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = db.Categorys.FirstOrDefault(c => c.Id == id);
            db.Categorys.Remove(category);
            db.SaveChanges();
            return Ok();
        }
    }
}
