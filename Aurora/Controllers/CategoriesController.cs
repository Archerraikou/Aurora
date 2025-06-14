
using System.Security.Claims;
using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            //Stergem FK-urile
            var groupCategs = db.CategoryGroups.Where(cg => cg.CategoryId == id);
            foreach(var cg in groupCategs)
            {
                db.CategoryGroups.Remove(cg);
            }
            var userCategs = db.CategoryUsers.Where(cu => cu.CategoryId == id);
            foreach (var cu in userCategs)
            {
                db.CategoryUsers.Remove(cu);
            }
            //Stergem categoria
            db.Categorys.Remove(category);
            db.SaveChanges();
            return Ok();
        }
        [Authorize]
        [HttpGet("getCategories")]
        public async Task<ActionResult<Category>> GetCategories()
        {
            //Luam toate categoriile
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var categs = db.Categorys.Include(c=>c.Users);
            var results = new List<Category>();           
            foreach(var cat in categs)
            {
                if(cat.Users!=null)
                {
                    foreach(var user in cat.Users)
                    {
                        if(user.UserId == userId)
                        {
                            results.Append(cat);
                        }
                    }
                }
            }
            return Ok(results);
        }

    }
}
