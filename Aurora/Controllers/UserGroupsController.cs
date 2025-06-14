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
        public async Task<IActionResult> EjectUser(string userId, int groupId)
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Verifică dacă utilizatorul curent este admin în grupul specificat
            
            var currentUserGroup = await db.UserGroups.FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == id && ug.IsAdmin == true);
            if (currentUserGroup == null)
            {
                return BadRequest(new { message = "You are not the admin of this group." });
            }
            var userGroup = db.UserGroups.Where(ug => ug.UserId == userId && ug.GroupId == groupId).FirstOrDefault();
            if (userGroup == null)
            {
                return NotFound(new { message = "There is no such user in the group or there is no such group." });
            }
            var user = await db.ApplicationUsers.Include("UserGroups").Where(u => u.Id == userId).FirstAsync();

            // Elimină relația utilizator-grup pentru a-l scoate din grup

            user.UserGroups.Remove(userGroup);


            // Încarcă grupul împreună cu lista utilizatorilor (Users)

            var group = await db.Groups.Include("Users").Where(g => g.Id == groupId).FirstAsync();
            group.Users.Remove(userGroup);
            if (user != null)
            {
                // Trimite notificare către utilizatorul eliminat

                await SendNotification(
                    adminUserId: id,
                    userEmail: user.Email,
                    groupId: groupId,
                    message: $"You have been removed from the group with ID '{group.Id}' by an administrator."
                );
            }

            await db.SaveChangesAsync();
                
            return Ok(new { message = "User has been ejected from the group." });
         }
        // Funcție privată pentru trimiterea unei notificări către utilizator
        private async Task SendNotification(string adminUserId, string userEmail, int groupId, string message)
        {    // Găsește utilizatorul după email
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null) return;

            // Creează o nouă notificare cu detalii

            var notification = new Notification
            {
                UserId = user.Id,
                SentId = adminUserId,
                Type = "Group Expulsion",
                NotificationContent = message,
                NotificationDate = DateTime.UtcNow,
                IsRead = false
            };
            // Adaugă notificarea în baza de date

            db.Notifications.Add(notification);

            // Salvează modificările

            await db.SaveChangesAsync();
        }





    }
}
