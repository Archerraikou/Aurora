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
using Microsoft.Build.Framework;

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

        [Authorize]
        [HttpGet("currentUser")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Function to obtain the id of the current user. It is greatly used in the frontend.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Getting user failed");
                return BadRequest(new { message = "User identity not found" });
            }
            var user = await _userManager.FindByIdAsync(userId);
            var result = new
            {
                Id = user.Id
            };
            return Ok(result);
        }
        [Authorize(Roles ="Admin")]
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // Showing the details of all the users that are registered
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
                    // Another verification that helps in the frontend
                    Iscurrent= usId==user.Id
                });
            };
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount(string? id)
        {
            // If the function doesn't receive any parameter, then it means that
                // the current user is trying to delete theire own account, otherwise,
                // verify if the the current user is an Admin,
                // because only admins are allowed to delete other people's accounts 
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
                // In this area is solved the problem of whether there any more admins in the groups.
                    // If there are not, then make a random member an admin. If there are
                    // no more members, then delete that group.
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
                        _groupsController.ControllerContext = this.ControllerContext;
                        await _groupsController.Delete(group.Id.Value);
                    }
                }
            }

            // Delete all the entries of this user from all ICollections that they were in
            var interests = db.CategoryUsers.Where(x => x.UserId == user.Id);
            db.CategoryUsers.RemoveRange(interests);
            var privateConversations = db.PrivateConversations.Include("Messages").Where(x => x.User1 == user.Id || x.User2 == user.Id);
            foreach (var privateConversation in privateConversations)
            {
                db.Messages.RemoveRange(privateConversation.Messages);
            }
            var messages = db.Messages.Where(m => m.UserId == userId);
            db.Messages.RemoveRange(messages);
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
            // Getting the current user so that it is verified that they don't change their own role
            var usId= User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (usId == id)
                return BadRequest(new {message= "You are not allowed to demote yourself!" });
            var user = db.Users.Find(id);
            if (user != null)
            {
                // Get all roles that that user has (normaly just one), delete them, and replace it
                    // with an entry of the opposite role
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
            // Method to get all the possible roles on the platform
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
        [Authorize]
        [HttpGet("{userId}")]
        public async Task<ActionResult<ApplicationUser>> Show(string userId)
        {
            // Showing the details of a specific user account. Usually, used in a view profile
                // type situation 
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

        [Authorize]
        [HttpPost("edit/{userId}")]
        public async Task<ActionResult<ApplicationUser>> Edit(string userId, [FromForm] RelevantUserInformation RUI, IFormFile? ProfilePicture = null)
        {
            // Editing an user (it should only be allowed to be capable to edit just one's own profile)
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

                var deleteInterests = await db.CategoryUsers.Where(u=>u.UserId == userId).ToListAsync();
                db.CategoryUsers.RemoveRange(deleteInterests);

                if(RUI.Interests[0] != null)
                {
                    string[] result = RUI.Interests[0].Split(',');
                    var interestQueryIds = await db.Categorys.Where(u=> result.Contains(u.CategoryName)).Select(c=>c.Id).ToListAsync();
                    var newUserInterests = new List<CategoryUser>();
                    foreach(var inte in interestQueryIds)
                    {
                        newUserInterests.Add(new CategoryUser{UserId = userId, CategoryId = inte});
                    }
                    db.CategoryUsers.AddRange(newUserInterests);

                }
                
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
            // Saving the profile picture of a user
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
            // Getting the profile picture of a user
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

        [Authorize]
        [HttpGet("GetUserCategory/{userId}")]

        public async Task<ActionResult<List<string>>> GetUserCategories(string userId)
        {

            var user = db.ApplicationUsers.Find(userId);
            if (user == null)
            {
                return NotFound();
            }
            var categories = await db.CategoryUsers.Where(m => m.UserId == userId).Select(m => m.Category.CategoryName).ToListAsync();

            if (categories == null)
            {
                return NotFound();
            }
            return Ok(categories);
        }
        private string GetContentType(string path)
        {
            // Method useful when there are differnt type of files sent or used
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(path, out var contentType))
                contentType = "application/octet-stream"; // Fallback type

            return contentType;
        }
    }
}
