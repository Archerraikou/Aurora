using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserGroupsController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext db;

        public UserGroupsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            db = context;
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _logger = logger;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> Index(int groupId)
        {
            var usId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var us = await db.ApplicationUsers.Include("UserGroups").Where(u => u.Id == usId).FirstAsync();
            var usGroup = us.UserGroups.Where(ug => ug.GroupId == groupId && ug.UserId == usId).FirstOrDefault();
            if (usGroup == null)
            {
                return BadRequest(new { message = "You are not in the group." });
            }
            var users = await db.ApplicationUsers.Include(u => u.UserGroups).ToListAsync();
            var result = new List<object>();
            
            result.Add(usGroup.IsAdmin==true?"Admin":"User");
            foreach (var user in users)
            {
                if (user.UserGroups != null)
                {
                    foreach (var userGroup in user.UserGroups)
                    {
                        if (userGroup.GroupId == groupId)
                        {
                            result.Add(new
                            {
                                Id = user.Id,
                                Nickname = user.Nickname,
                                Desc = user.ProfileDescription,
                                Pic = user.ProfilePicture,
                                Role = userGroup.IsAdmin==true?"Admin":"User",
                                Email = user.Email,
                                Groupid= groupId,
                                Iscurrent = usId == user.Id
                            });
                            break;
                        };
                    }
                }
            }
            return Ok(result);
        }

        [Authorize]
        [HttpPatch]
        public async Task<IActionResult> ChangeRole(string userId, int groupId, string role)
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == id)
                return BadRequest(new { message = "You are not allowed to change your own role!" });
            var user = await _userManager.FindByIdAsync(id);
            var ceva = groupId;
            var currentUserGroup= await db.UserGroups.FirstOrDefaultAsync(ug=> ug.GroupId== groupId && ug.UserId== id && ug.IsAdmin== true);
            if (currentUserGroup == null) {
                return BadRequest(new {message= "You are not the admin of this group." });
            }
            var userGroup = db.UserGroups.Where(ug => ug.UserId == userId && ug.GroupId == groupId).FirstOrDefault();
            if (userGroup != null)
            {
                if (role.Equals("Admin"))
                {
                    userGroup.IsAdmin = true;
                }
                else
                {
                    userGroup.IsAdmin = false;
                    var group= await db.Groups.FindAsync(groupId);
                    var otherAdmins = group.Users?.Where(ug =>ug.IsAdmin == true).ToList();
                    if (otherAdmins == null || otherAdmins.Count == 0)
                    {
                        var others = group.Users?.Where(ug => ug.UserId != user.Id).ToList();
                        if(others==null || others.Count == 0)
                        {
                            userGroup.IsAdmin = true;
                            return BadRequest(new {message= "You are the last user, you can't stop being the admin."});
                        }
                        var last = others.First();
                        group.UserId = last.UserId;
                        last.IsAdmin = true;
                    }
                }
                db.SaveChanges();
                return Ok();
            }
            return NotFound(new { message = "There is no such user in the group or there is no such group." });
        }

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> EjectUser(string userId)
        {
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Get the current admin user ID

            // Find all groups where the current user is an admin
            var adminUserGroups = await db.UserGroups
                .Where(ug => ug.UserId == adminUserId && ug.IsAdmin == true)
                .ToListAsync();

            if (adminUserGroups.Count == 0)
            {
                return BadRequest(new { message = "You are not an admin of any group." });
            }

            // Find the user group association for the specified user (the one to be ejected)
            var userGroup = await db.UserGroups
                .Where(ug => ug.UserId == userId)
                .FirstOrDefaultAsync();

            if (userGroup == null)
            {
                return NotFound(new { message = "User not found in any group." });
            }

            // Find the group that the user is part of
            var group = await db.Groups
                .Where(g => g.Id == userGroup.GroupId)
                .Include(g => g.Users) // Include users for removal from the group
                .FirstOrDefaultAsync();

            if (group == null)
            {
                return NotFound(new { message = "Group not found." });
            }

            // Check if the current admin is an admin of this group
            var isAdminOfGroup = adminUserGroups.Any(ug => ug.GroupId == group.Id);

            if (!isAdminOfGroup)
            {
                return BadRequest(new { message = "You are not the admin of this group." });
            }

            // Remove the user from the group
            db.UserGroups.Remove(userGroup);

            // Remove the user from the group's users collection
            var groupUser = group.Users.FirstOrDefault(ug => ug.UserId == userId);
            if (groupUser != null)
            {
                group.Users.Remove(groupUser);
            }

            // Send a notification to the user that they were removed from the group
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                // Check if the group ID is not null before passing it
                int groupId = group.Id ?? 0; // Default to 0 if groupId is null. Adjust if needed.

                await SendNotification(
                    adminUserId: adminUserId,
                    userEmail: user.Email,
                    groupId: groupId, // Now passing a non-nullable int
                    message: $"You have been removed from the group with ID '{group.Id}' by an administrator."
                );
            }

            // Save changes to the database
            await db.SaveChangesAsync();

            return Ok(new { message = "User has been ejected from the group." });
        }

        private async Task SendNotification(string adminUserId, string userEmail, int groupId, string message)
        {
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null) return;

            var notification = new Notification
            {
                UserId = user.Id,
                SentId = adminUserId,
                Type = "Group Expulsion",
                NotificationContent = message,
                NotificationDate = DateTime.UtcNow,
                IsRead = false
            };

            db.Notifications.Add(notification);
            await db.SaveChangesAsync();
        }





    }
}
