using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.StaticFiles;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationUsersController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly GroupsController _groupsController;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext db;

        public ApplicationUsersController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            GroupsController groupsController,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            db = context;
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _groupsController = groupsController;
            _configuration = configuration;
            _logger = logger;
        }
        [Authorize(Roles ="Admin")]
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var users= _userManager.Users.ToList();
            var usId= User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = new List<Object>();
            foreach(var user in users) {
                result.Add(new {
                    Id= user.Id,
                    Nickname = user.Nickname,
                    Desc = user.ProfileDescription,
                    Pic= user.ProfilePicture,
                    Role= (await _userManager.GetRolesAsync(user)).FirstOrDefault(),
                    Email= user.Email,
                    Iscurrent= usId==user.Id
                });
            };
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount(string? id)
        {
            _logger.LogInformation("Delete account endpoint hit");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Delete account failed: User ID claim not found");
                return BadRequest(new { message = "User identity not found" });
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (id != null)
            {
                var roles= await _userManager.GetRolesAsync(user);
                if (!roles.Contains("Admin"))
                    return BadRequest(new { message ="The user is not an Admin"});
                user= await _userManager.FindByIdAsync(id);
            }
            if (user == null)
            {
                _logger.LogWarning($"Delete account failed: User with ID {(id!=null?id:userId)} not found");
                return NotFound(new { message = "User not found" });
            }

            var groups = await db.Groups.Include(g => g.Users).
                                Where(x => x.UserId == user.Id).ToListAsync();
            foreach (var group in groups)
            {
                var otherAdmins = group.Users?.Where(ug => ug.UserId != user.Id && ug.IsAdmin == true).ToList();
                if (otherAdmins != null && otherAdmins.Count!=0)
                {
                    group.UserId = otherAdmins.First().UserId;
                }
                else
                {
                    var others= group.Users?.Where(ug=> ug.UserId!= user.Id).ToList();
                    if (others!= null && others.Count!= 0)
                    {
                        var last = others.First();
                        group.UserId = last.UserId;
                        last.IsAdmin = true;
                    }
                    else
                    {
                        await _groupsController.Delete(group.Id.Value);
                    }
                }
            }

            var interests = db.CategoryUsers.Where(x => x.UserId == user.Id);
            db.CategoryUsers.RemoveRange(interests);
            var privateConversations = db.PrivateConversations.Where(x => x.User1 == user.Id || x.User2 == user.Id);
            db.PrivateConversations.RemoveRange(privateConversations);

            var notifications = db.Notifications.Where(x => x.UserId == user.Id);
            db.Notifications.RemoveRange(notifications);

            var userEvents = db.UserEvents.Where(x => x.UserId == user.Id);
            db.UserEvents.RemoveRange(userEvents);

            var userGroups = db.UserGroups.Where(x => x.UserId == user.Id);
            db.UserGroups.RemoveRange(userGroups);

            db.SaveChanges();
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                _logger.LogError($"Error deleting user {userId}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(new { message = "Error deleting account", errors = result.Errors });
            }

            _logger.LogInformation($"User {userId} deleted successfully");
            return Ok(new { message = "Account deleted successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("changeRole")]
        public async Task<IActionResult> ChangeRole(string id, string newrole) {
            var usId= User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (usId == id)
                return BadRequest(new {message= "You are not allowed to demote yourself!" });
            var user = db.Users.Find(id);
            if (user != null)
            {
                user.AllRoles = GetAllRoles();
                var roles = db.Roles.ToList();
                foreach (var role in roles)
                {
                    await _userManager.RemoveFromRoleAsync(user, role.Name);
                }
                var roleName = await _roleManager.FindByNameAsync(newrole);
                if (roleName != null)
                {
                    await _userManager.AddToRoleAsync(user, roleName.ToString());
                    db.SaveChanges();
                    return Ok();
                }
                return BadRequest(new { message = $"There is no role called {newrole}." });
            }
            return NotFound(new {message= $"There is no user with the ID {id}."});
        }
        [NonAction]
        public IEnumerable<SelectListItem> GetAllRoles()
        {
            var selectList = new List<SelectListItem>();
            var roles = from role in db.Roles select role;
            foreach (var role in roles)
            {
                selectList.Add(new SelectListItem
                {
                    Value = role.Id.ToString(),
                    Text = role.Name.ToString()
                });
            }
            return selectList;
        }
        [HttpGet("{userId}")]
        public async Task<ActionResult<ApplicationUser>> Show(string userId)
        {
            var query = db.ApplicationUsers.Where(u=> u.Id == userId).Select(u=> new RelevantUserInformation{ 
                Id = u.Id,
                Nick = u.Nickname,
                Email = u.Email,
                ProfilePicturePath = u.ProfilePicture,
                ProfileDescription = u.ProfileDescription
                // ,Interests = u.Interests
            });

            var user = await query.SingleOrDefaultAsync();
            if(user == null)
            {
                return NotFound();
            }

            user.ProfilePicturePath ??= "wwwroot/images/user-pictures/defaultapp.png";

            
            return Ok(user);
        }

        [HttpPost("edit/{userId}")]
        public async Task<ActionResult<ApplicationUser>> Edit(string userId, [FromForm] RelevantUserInformation RUI, IFormFile? ProfilePicture = null)
        {
            try
            {
                var user = await db.ApplicationUsers.FindAsync(userId);
                if(user==null)
                    return NotFound("User not found");

                if(ProfilePicture!=null)
                {
                    user.ProfilePicture = await UploadProfilePictureAsync(ProfilePicture);
                }
                if(user.ProfilePicture == null)
                {
                    user.ProfilePicture = "wwwroot/images/user-pictures/defaultpp.png";
                }
                Console.WriteLine(user.ProfilePicture);
                user.Nickname = RUI.Nick;
                user.ProfileDescription = RUI.ProfileDescription;
                // user.Interests = Interests;
                
                await db.SaveChangesAsync();
                return NoContent();
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");
            }
        }
        private async Task<string> UploadProfilePictureAsync(IFormFile file)
        {
            if (!Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images")))
            {
                Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images"));
            }
            if (file == null || file.Length == 0)
                throw new Exception("No file uploaded");
            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images"), fileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }
            return filePath;
        }
        [HttpGet("pfp/{userId}")]
        public IActionResult GetImage(string userId)
        {

            var user = db.ApplicationUsers.Find(userId);
            if (user == null)
                return NotFound("User not found");
            if (user.ProfilePicture == null)
            {
                return PhysicalFile("E:/Aurora/Aurora/wwwroot/images/user-pictures/defaultpp.png", "image/png", enableRangeProcessing: true);
            }
            var basePath = Path.GetFullPath(Path.Combine("wwwroot\\images"));
            var fullPath = Path.GetFullPath(user.ProfilePicture);

            Console.WriteLine(fullPath);
            if (!fullPath.StartsWith(basePath))
            {

                return BadRequest("Invalid Image Path");
            }
            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound();
            }
            var contentType = GetContentType(fullPath);

            return PhysicalFile(fullPath, contentType, enableRangeProcessing: true);

        }
        private string GetContentType(string path)
        {
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(path, out var contentType))
                contentType = "application/octet-stream"; // Fallback type

            return contentType;
        }
    }
}
