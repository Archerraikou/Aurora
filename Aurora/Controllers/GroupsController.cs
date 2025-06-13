
using Aurora.Data;
using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using System.Security.Claims;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class GroupsController : Controller
    {
        private readonly ApplicationDbContext db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public GroupsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager
        )
        {
            db = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        private async Task SendNotification(string adminUserId, string userEmail, int groupId, string notificationMessage, string adminResponse = null)
        {
            // Find the user by email
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                return;
            }

            // Create a new notification
            var notification = new Notification
            {
                // Set the UserId to the recipient user's Id
                UserId = user.Id,

                // Set the SentId to the admin's Id (who is sending the notification)
                SentId = adminUserId,

                // Define the type of notification (e.g., "Group Request Approval")
                Type = "Group Request Approval",  // You can make this dynamic based on the action

                // Set the message for the notification
                NotificationContent = $"{notificationMessage} Admin's response: {adminResponse}",

                // Set the notification date to the current time
                NotificationDate = DateTime.UtcNow,

                // Set the notification as unread by default
                IsRead = false
            };

            // Save the notification to the database
            db.Notifications.Add(notification);
            await db.SaveChangesAsync();
        }

        [HttpGet("index")]
        public async Task<IActionResult> Index()
        {
            var groups = await db.Groups.Include("GroupCategory").ToListAsync();
            var usId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (usId != null)
            {
                var us = await db.ApplicationUsers.Include(u => u.Interests).Where(u => u.Id == usId).FirstAsync();
                var interests = us.Interests.Select(cu => cu.CategoryId).ToList();
                var newGroups = groups.Where(g => g.GroupCategory.Any(gc => interests.Contains(gc.CategoryId))).ToList();
                groups = groups.Except(newGroups).ToList();
                newGroups.AddRange(groups);
                groups = newGroups;
            }
            var result = new List<object>();

            foreach (var g in groups)
            {
                if (usId != null)
                {
                    var inGroup = db.UserGroups.Where(ug => ug.GroupId == g.Id && ug.UserId == usId).FirstOrDefault();
                    if (inGroup != null && inGroup.IsApproved==true) continue;
                }
                var admin = await _userManager.FindByIdAsync(g.UserId);
                var categs = new List<int>();
                if (g.GroupCategory != null && g.GroupCategory.Count > 0)
                {
                    foreach (var cg in g.GroupCategory)
                    {
                        categs.Add((int)cg.CategoryId);
                    }
                }
                result.Add(new
                {
                    Id = g.Id,
                    Name = g.GroupName,
                    Description = g.GroupDescription,
                    Picture = g.GroupPicture,
                    Categories = categs,
                    Admin = admin?.Nickname,
                    Date = g.CreatedDate,
                    isPrivate = g.IsPrivate
                });
            }
            return Ok(result);
        }
        [HttpGet("notIndex")]
        public async Task<IActionResult> NotIndex()
        {
            var groups = await db.Groups.Include("GroupCategory").ToListAsync();
            var usId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (usId != null)
            {
                var us = await db.ApplicationUsers.Include(u => u.Interests).Where(u => u.Id == usId).FirstAsync();
                var interests = us.Interests.Select(cu => cu.CategoryId).ToList();
                var newGroups = groups.Where(g => g.GroupCategory.Any(gc => interests.Contains(gc.CategoryId))).ToList();
                groups = groups.Except(newGroups).ToList();
                newGroups.AddRange(groups);
                groups = newGroups;
            }
            var result = new List<object>();

            foreach (var g in groups)
            {
                if (usId != null)
                {
                    var inGroup = db.UserGroups.Where(ug => ug.GroupId == g.Id && ug.UserId == usId).FirstOrDefault();
                    if (!(inGroup != null && inGroup.IsApproved == true)) continue;
                }
                var admin = await _userManager.FindByIdAsync(g.UserId);
                var categs = new List<int>();
                if (g.GroupCategory != null && g.GroupCategory.Count > 0)
                {
                    foreach (var cg in g.GroupCategory)
                    {
                        categs.Add((int)cg.CategoryId);
                    }
                }
                result.Add(new
                {
                    Id = g.Id,
                    Name = g.GroupName,
                    Description = g.GroupDescription,
                    Picture = g.GroupPicture,
                    Categories = categs,
                    Admin = admin?.Nickname,
                    Date = g.CreatedDate,
                    isPrivate = g.IsPrivate
                });
            }
            return Ok(result);
        }
        [Authorize]
        [HttpGet("showGroup")]
        public async Task<IActionResult> Show(int Id)
        {
            var group = await db.Groups
                .Include(g => g.GroupCategory)
                .ThenInclude(gc => gc.Category)
                .Where(g => g.Id == Id)
                .FirstOrDefaultAsync();
            if (group == null)
            {
                return BadRequest();
            }
            var admin = await _userManager.FindByIdAsync(group.UserId);
            var categs = new List<int>();
            if (group.GroupCategory != null && group.GroupCategory.Count > 0)
            {
                foreach (var cg in group.GroupCategory)
                {
                    categs.Add((int)cg.CategoryId);
                }
            }
            var result = new
            {
                Id = group.Id,
                Name = group.GroupName,
                Description = group.GroupDescription,
                Picture = group.GroupPicture,
                Categories = categs,
                Admin = admin?.Nickname,
                Date = group.CreatedDate,
                IsPrivate = group.IsPrivate
            };
            Console.Write(result);
            return Ok(result);
        }
        [Authorize]
        [HttpGet("role")]
        public async Task<IActionResult> GetRole(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var ug = db.UserGroups.Where(ug => ug.UserId == userId && ug.GroupId == id).FirstOrDefault();
            if (ug == null)
            {
                var resp = new
                {
                    Role = "None"
                };
                return Ok(resp);
            }
            else
            {
                var resp = new
                {
                    Role = ug.IsAdmin == true ? "Admin" : "User"
                };
                return Ok(resp);
            }

        }
        [Authorize]
        [HttpPost("editGroup")]
        public async Task<IActionResult> Edit([FromForm] GroupModel groupModel, int id, IFormFile? Picture = null)
        {
            var group = await db.Groups
                .Include(g => g.GroupCategory)
                .ThenInclude(gc => gc.Category)
                .Where(g => g.Id == id)
                .FirstOrDefaultAsync();
            var admin = await _userManager.FindByIdAsync(group.UserId);
            var adminsId = db.UserGroups.Where(ug => ug.GroupId == group.Id && ug.IsAdmin == true).ToList();
            var admins = new List<ApplicationUser>();
            if (Picture == null || Picture.Length == 0)
            {
                groupModel.GroupPicture = "wwwroot/images/group-pictures/default.jpg";
            }
            else groupModel.GroupPicture = await UploadProfilePictureAsync(Picture);
            foreach (var ad in adminsId)
            {
                ApplicationUser? item = await _userManager.FindByIdAsync(ad.UserId);
                admins.Add(item);
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            if (user != admin && admins.IndexOf(user) == -1)
            {
                return StatusCode(401);
            }
            group.GroupDescription = groupModel.GroupDescription;
            group.GroupName = groupModel.GroupName;
            group.GroupPicture = groupModel.GroupPicture;
            group.IsPrivate = groupModel.IsPrivate;
            var groupCategs = db.CategoryGroups.Where(cg => cg.GroupId == group.Id);
            foreach (var categs in groupCategs)
            {
                db.CategoryGroups.Remove(categs);
            }
            if (groupModel.GroupCategory != null && groupModel.GroupCategory.Count != 0)
            {
                foreach (var categ in groupModel.GroupCategory)
                {
                    var cg = new CategoryGroups
                    {
                        GroupId = group.Id,
                        CategoryId = categ
                    };
                    db.CategoryGroups.Add(cg);
                    group.GroupCategory.Add(cg);
                }
            }
            db.Groups.Update(group);
            db.SaveChanges();
            return Ok();
        }
        [Authorize]
        [HttpDelete("deleteGroup")]
        public async Task<IActionResult> Delete(int id)
        {
            var group = db.Groups.Where(g => g.Id == id).First();
            var admin = await _userManager.FindByIdAsync(group.UserId);
            var adminsId = db.UserGroups.Where(ug => ug.GroupId == group.Id && ug.IsAdmin == true).ToList();
            var admins = new List<ApplicationUser>();
            foreach (var ad in adminsId)
            {
                ApplicationUser? item = await _userManager.FindByIdAsync(ad.UserId);
                admins.Add(item);
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            var roles = await _userManager.GetRolesAsync(user);
            if (user != admin && admins.IndexOf(user) == -1 && roles.IndexOf("Admin") == -1)
            {
                return StatusCode(401);
            }
            var userGroups = db.UserGroups.Where(ug => ug.GroupId == group.Id);
            var groupCategs = db.CategoryGroups.Where(cg => cg.GroupId == group.Id);
            var messages = db.GroupMessages.Where(m => m.GroupId == group.Id);
            foreach (var categs in groupCategs)
            {
                db.CategoryGroups.Remove(categs);
            }
            foreach (var userG in userGroups)
            {
                db.UserGroups.Remove(userG);
            }
            foreach (var msg in messages)
            {
                db.GroupMessages.Remove(msg);
            }
            db.Groups.Remove(group);
            db.SaveChanges();
            return Ok("Succesfully deleted");
        }
        [Authorize]
        [HttpPost("newGroup")]
        public async Task<IActionResult> New([FromForm] GroupModel groupModel, IFormFile? Picture = null)
        {
            if (groupModel == null)
            {
                return BadRequest("Group data is required");
            }
            if (Picture == null || Picture.Length == 0)
            {
                groupModel.GroupPicture = "https://localhost:7242/images/defaultgp.jpg";
            }
            else groupModel.GroupPicture = await UploadProfilePictureAsync(Picture);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Group group = new Group
            {
                GroupName = groupModel.GroupName,
                GroupPicture = groupModel.GroupPicture,
                GroupDescription = groupModel.GroupDescription,
                IsPrivate = groupModel.IsPrivate,
                GroupCategory = []
            };
            if (groupModel.GroupCategory != null && groupModel.GroupCategory.Count != 0)
            {
                foreach (var categ in groupModel.GroupCategory)
                {
                    var cg = new CategoryGroups
                    {
                        GroupId = group.Id,
                        CategoryId = categ
                    };
                    db.CategoryGroups.Add(cg);
                    group.GroupCategory.Add(cg);
                }
            }
            group.CreatedDate = DateTime.UtcNow;
            group.UserId = userId;
            db.Groups.Add(group);
            await db.SaveChangesAsync();
            group = db.Groups.Where(g => g.CreatedDate == group.CreatedDate && g.GroupName == group.GroupName).FirstOrDefault();
            UserGroup user1 = new UserGroup
            {
                UserId = userId,
                GroupId = group.Id,
                IsAdmin = true,
                IsApproved= true,
                IsRequested= false
            };
            group.Users = new List<UserGroup>();
            group.Users.Add(user1);
            db.Groups.Update(group);
            db.UserGroups.Add(user1);
            db.SaveChanges();
            return Ok();
        }
        [Authorize]
        [HttpGet("join")]
        public async Task<IActionResult> Join(int id)
        {
            Group group = db.Groups.Where(g => g.Id == id).First();
            if (group.isPrivate == true)
            {
                return await Request(id);
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            UserGroup ug = new UserGroup
            {
                GroupId = id,
                UserId = userId,
                IsApproved= true,
                IsRequested=false
            };
            db.UserGroups.Add(ug);
            if (user.UserGroups == null)
            {
                user.UserGroups = new List<UserGroup>();
            }
            user.UserGroups.Add(ug);
            if (group.Users == null)
            {
                group.Users = new List<UserGroup>();
            }
            group.Users.Add(ug);
            db.SaveChanges();
            return Ok();
        }
        [Authorize]
        [Authorize]
        [HttpGet("request")]
        public async Task<IActionResult> Request(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var group = await db.Groups.FindAsync(id);

            if (group == null)
                return BadRequest("Group not found.");

            if (!group.IsPrivate.HasValue || !group.IsPrivate.Value)
                return BadRequest("This group is not private.");

            // Check if the user has already requested to join
            var existingRequest = await db.UserGroups
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GroupId == id && ug.IsRequested);

            if (existingRequest != null)
                return BadRequest("You have already requested to join this group.");

            // Create the request
            var userGroupRequest = new UserGroup
            {
                UserId = userId,
                GroupId = id,
                IsRequested = true,
                IsApproved = false
            };

            db.UserGroups.Add(userGroupRequest);
            await db.SaveChangesAsync();

            // NOW send a notification to all admins
            var admins = await db.UserGroups
                .Where(ug => ug.GroupId == id && ug.IsAdmin == true)
                .Select(ug => ug.UserId)
                .ToListAsync();

            foreach (var adminId in admins)
            {
                var notification = new Notification
                {
                    UserId = adminId, // Admin is the receiver
                    SentId = userId,  // Requesting user is the sender
                    Type = "Group Join Request",
                    NotificationContent = $"User {User.Identity.Name} requested to join your group (ID: {id}).",
                    NotificationDate = DateTime.UtcNow,
                    IsRead = false
                };

                db.Notifications.Add(notification);
            }

            await db.SaveChangesAsync();

            return Ok("Request sent successfully.");
        }



        [HttpPost("approveRequest")]
        [Authorize]
        public async Task<IActionResult> ApproveRequest(int groupId, string userEmail, bool isApproved, string adminResponse)
        {
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Get the admin's userId

            var group = await db.Groups.FindAsync(groupId);
            if (group == null)
            {
                return BadRequest("Group not found.");
            }

            // Ensure the user is an admin of the group
            var isAdmin = await db.UserGroups.AnyAsync(ug => ug.UserId == adminUserId && ug.GroupId == groupId && ug.IsAdmin == true);
            if (!isAdmin)
            {
                return BadRequest("You do not have permission to approve or reject requests for this group.");
            }

            // Find the request by user email
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var userGroupRequest = await db.UserGroups
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == user.Id && ug.IsRequested == true);

            if (userGroupRequest == null)
            {
                return BadRequest("No request found for this user.");
            }

            // Approve or reject the request
            userGroupRequest.IsApproved = isApproved;
            userGroupRequest.IsRequested = false; // Remove the pending request status

            // Save changes to the database
            await db.SaveChangesAsync();

            // Send notification to the user
            var notificationMessage = isApproved ? "Your request to join the group has been approved." : "Your request to join the group has been rejected.";
            await SendNotification(adminUserId, userEmail, groupId, notificationMessage, adminResponse);

            return Ok(new { message = isApproved ? "Request approved." : "Request rejected." });
        }


        // Reject a group request
        [HttpPost("rejectRequest")]
        [Authorize]
        public async Task<IActionResult> RejectRequest(int groupId, string userEmail, string adminResponse)
        {
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Get the admin's userId

            var group = await db.Groups.FindAsync(groupId);
            if (group == null)
            {
                return BadRequest("Group not found.");
            }

            // Ensure the user is an admin of the group
            var user = await _userManager.FindByIdAsync(adminUserId); // Get the admin user

            var isAdmin = await db.UserGroups.AnyAsync(ug => ug.UserId == user.Id && ug.GroupId == groupId && ug.IsAdmin == true); // Check if the admin has permission
            if (!isAdmin)
            {
                return BadRequest("You do not have permission to approve or reject requests for this group.");
            }

            // Find the request by user email
            var userToReject = await _userManager.FindByEmailAsync(userEmail);
            if (userToReject == null)
            {
                return BadRequest("User not found.");
            }

            var userGroupRequest = await db.UserGroups
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == userToReject.Id && ug.IsRequested);
            if (userGroupRequest == null)
            {
                return BadRequest("No request found for this user.");
            }

            // Reject the request (no need to approve)
            userGroupRequest.IsApproved = false;
            userGroupRequest.IsRequested = false; // Remove the pending request status

            // Save changes to the database
            await db.SaveChangesAsync();

            // Send notification to the user
            await SendNotification(adminUserId, userEmail, groupId, "Your request to join the group has been rejected.", adminResponse);

            return Ok(new { message = "Request rejected." });
        }


        [Authorize]
        [HttpGet("search")]

        public async Task<IActionResult> Search(string ?search, int param = 0)
        {
            if (search == null) return await Index();
            var groupsId = new List<int?>();
            var result = new List<object>();
            if (param == 0)
            {
                groupsId = db.Groups.Where(g => g.GroupName.Contains(search) || g.GroupDescription.Contains(search)).Select(g => g.Id).ToList();
            }
            else
            {
                var categoryIds = db.Categorys.Where(c => c.CategoryName.Contains(search) || c.CategoryDescription.Contains(search)).Select(c => c.Id).ToList();
                foreach (var category in categoryIds)
                {
                    var ids = db.CategoryGroups.Where(cg => cg.CategoryId == category).Select(cg => cg.GroupId).ToList();
                    groupsId.AddRange(ids);
                }
            }
            var groups = db.Groups.Where(g => groupsId.Contains(g.Id)).Include(g => g.GroupCategory).ThenInclude(gc => gc.Category).ToList();
            foreach (var g in groups)
            {
                var categs = new List<int?>();
                var admin = await _userManager.FindByIdAsync(g.UserId);
                foreach (var cg in g.GroupCategory)
                {
                    categs.Add((int)cg.CategoryId);
                }
                result.Add(new
                {
                    Id = g.Id,
                    Name = g.GroupName,
                    Description = g.GroupDescription,
                    Picture = g.GroupPicture,
                    Categories = categs,
                    Admin = admin?.Nickname,
                    Date = g.CreatedDate,
                    isPrivate = g.IsPrivate
                });
            }
            return Ok(result);
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
            return "https://localhost:7242/images/" + fileName;
        }
    }
}