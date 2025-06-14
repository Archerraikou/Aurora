﻿
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
            // Găsește utilizatorul după e-mail
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                return;
            }

            // Creează o nouă notificare
            var notification = new Notification
            {
                UserId = user.Id,
                SentId = adminUserId,

                Type = "Group Request Approval",

                NotificationContent = $"{notificationMessage} Admin's response: {adminResponse}",

                NotificationDate = DateTime.UtcNow,
                // Notificarea e necitită inițial
                IsRead = false
            };

            db.Notifications.Add(notification);
            await db.SaveChangesAsync();
        }

        [HttpGet("index")]
        public async Task<IActionResult> Index()
        {
            var groups = await db.Groups.Include("GroupCategory").ToListAsync();
            var usId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            //Daca utilizatorul este logat, vom lua doar grupurile in care nu face parte
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
            //Pentru fiecare grup luam doar informatiile care ne intereseaza
            foreach (var g in groups)
            {
                if (usId != null)
                {
                    var inGroup = db.UserGroups.Where(ug => ug.GroupId == g.Id && ug.UserId == usId).FirstOrDefault();
                    if (inGroup != null && inGroup.IsApproved == true) continue;
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
        //Metoda asemanatoare cu index, dar care ia toate grupurile din care face parte utilizatorul
        //daca acesta este logat
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
            else return Ok();
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
            //Luam doar informatiile care ne intereseaza
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
        //Metoda care returneaza rolul unui utilizator dintr-un grup
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
            //Daca nu are poza o punem pe cea default
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
            //Daca user-ul care incearca sa editeze nu este admin nu are voie sa editeze
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
            var group = await db.Groups.Where(g => g.Id == id).FirstAsync();
            var admin = await _userManager.FindByIdAsync(group.UserId);
            var adminsId = await db.UserGroups.Where(ug => ug.GroupId == group.Id && ug.IsAdmin == true).ToListAsync();
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
            //Stergem toate obiectele care depind de grup
            var userGroups = await db.UserGroups.Where(ug => ug.GroupId == group.Id).ToListAsync();
            var groupCategs = await db.CategoryGroups.Where(cg => cg.GroupId == group.Id).ToListAsync();
            var messages = await db.GroupMessages.Where(m => m.GroupId == group.Id).ToListAsync();
            var events = await db.Events.Where(e => e.GroupId == group.Id).ToListAsync();
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
            var documents = await db.Documents.Where(d => d.GroupId == group.Id).ToListAsync();
            foreach (var document in documents)
            {
                db.Documents.Remove(document);
            }
            foreach (var ev in events)
            {
                var userEvents = await db.UserEvents.Where(ue => ue.EventId == ev.Id).ToListAsync();
                foreach (var userEvent in userEvents)
                {
                    db.UserEvents.Remove(userEvent);
                }
                db.Events.Remove(ev);
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
            //Daca nu trimitem poza o punem pe cea default
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
            //Adaugam utilizatorul care a facut grupul in grup
            group = db.Groups.Where(g => g.CreatedDate == group.CreatedDate && g.GroupName == group.GroupName).FirstOrDefault();
            UserGroup user1 = new UserGroup
            {
                UserId = userId,
                GroupId = group.Id,
                IsAdmin = true,
                IsApproved = true,
                IsRequested = false
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
        //Metoda care adauga un utilizator in grup
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
                IsApproved = true,
                IsRequested = false
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
        [HttpDelete("leave")]
        //Metoda care scoate un utilizator din grup
        public async Task<IActionResult> Leave(int id)
        {
            Group group = db.Groups.Where(g => g.Id == id).First();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            var userGroup = db.UserGroups.Where(ug => ug.GroupId == id && ug.UserId == userId).FirstOrDefault();
            if (userGroup != null && group.UserId != userId)
            {
                db.UserGroups.Remove(userGroup);
                db.SaveChanges();
                return Ok();
            }
            return BadRequest(405);
        }
        [Authorize]

        [HttpGet("request")]
        public async Task<IActionResult> Request(int id)
        {// Obține ID-ul utilizatorului curent autentificat
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var group = await db.Groups.FindAsync(id);

            if (group == null)
                return BadRequest("Group not found.");

            if (!group.IsPrivate.HasValue || !group.IsPrivate.Value)
                return BadRequest("This group is not private.");

            var existingRequest = await db.UserGroups
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GroupId == id && ug.IsRequested);

            if (existingRequest != null)
                return BadRequest("You have already requested to join this group.");

            var userGroupRequest = new UserGroup
            {
                UserId = userId,
                GroupId = id,
                IsRequested = true,
                IsApproved = false
            };

            db.UserGroups.Add(userGroupRequest);
            await db.SaveChangesAsync();

            // Trimite notificări tuturor adminilor grupului
            var admins = await db.UserGroups
                .Where(ug => ug.GroupId == id && ug.IsAdmin == true)
                .Select(ug => ug.UserId)
                .ToListAsync();

            foreach (var adminId in admins)
            {
                var notification = new Notification
                {
                    UserId = adminId,
                    SentId = userId,
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
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var group = await db.Groups.FindAsync(groupId);
            if (group == null)
            {
                return BadRequest("Group not found.");
            }

            // Verifică dacă utilizatorul curent este admin al grupului
            var isAdmin = await db.UserGroups.AnyAsync(ug => ug.UserId == adminUserId && ug.GroupId == groupId && ug.IsAdmin == true);
            if (!isAdmin)
            {
                return BadRequest("You do not have permission to approve or reject requests for this group.");
            }

            // Găsește utilizatorul care a trimis cererea
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
            // Actualizează starea cererii (aprobat sau respins)

            userGroupRequest.IsApproved = isApproved;
            userGroupRequest.IsRequested = false;

            await db.SaveChangesAsync();

            var notificationMessage = isApproved ? "Your request to join the group has been approved." : "Your request to join the group has been rejected.";
            await SendNotification(adminUserId, userEmail, groupId, notificationMessage, adminResponse);

            return Ok(new { message = isApproved ? "Request approved." : "Request rejected." });
        }


        [HttpPost("rejectRequest")]
        [Authorize]
        public async Task<IActionResult> RejectRequest(int groupId, string userEmail, string adminResponse)
        {
            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var group = await db.Groups.FindAsync(groupId);
            if (group == null)
            {
                return BadRequest("Group not found.");
            }

            // Verifică dacă user-ul are dreptul de a respinge cereri
            var user = await _userManager.FindByIdAsync(adminUserId);

            var isAdmin = await db.UserGroups.AnyAsync(ug => ug.UserId == user.Id && ug.GroupId == groupId && ug.IsAdmin == true);
            if (!isAdmin)
            {
                return BadRequest("You do not have permission to approve or reject requests for this group.");
            }

            // Găsește utilizatorul care a trimis cererea
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

            // Respingerea cererii (fără aprobare)
            userGroupRequest.IsApproved = false;
            userGroupRequest.IsRequested = false;

            await db.SaveChangesAsync();

            await SendNotification(adminUserId, userEmail, groupId, "Your request to join the group has been rejected.", adminResponse);

            return Ok(new { message = "Request rejected." });
        }


        [Authorize]
        [HttpGet("search")]

        public async Task<IActionResult> Search(string? search, int param = 0)
        {
            if (search == null) return await Index();
            var groupsId = new List<int?>();
            var result = new List<object>();
            //Cautam dupa grupuri daca param==0
            if (param == 0)
            {
                groupsId = db.Groups.Where(g => g.GroupName.Contains(search) || g.GroupDescription.Contains(search)).Select(g => g.Id).ToList();
            }
            //Altfel cautam dupa categorii
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
                //Returnam informatiile importante
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
            //Punem poza si salvam path-ul catre ea
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