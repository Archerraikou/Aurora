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
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventsController : Controller
    {
        private readonly ApplicationDbContext db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public EventsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager
        )
        {
            db = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [Authorize]
        [HttpGet("role")]
        public async Task<IActionResult> GetRole(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var ug = db.UserGroups.Where(ug => ug.UserId == userId && ug.GroupId == id).First();
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
        [HttpGet("index")]
        public async Task<IActionResult> Index()
        {
            var events = await db.Events.Include("UserEvents").Include("Group").ToListAsync();
            var result = new List<object>();
            // Getting current's user id
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // Adding all the Events in which the current user has to take part into and return them
            var ue = db.UserEvents.Where(ug => ug.UserId == userId);
            foreach (var variable in events)
            {
                foreach (var e in ue)
                {
                    if (e.EventId == variable.Id)
                    {
                        result.Add(variable);
                    }
                }
            }
            return Ok(result);
        }

        [Authorize]
        [HttpGet("show")]
        public async Task<IActionResult> Show(int id)
        {
            // Getting current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Get event + user events
            var events = await db.Events
                .Include(e => e.UserEvents)
                .Include(e => e.Group)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (events == null)
            {
                return BadRequest(new { message = "There is no event that has the id " + id });
            }

            // Getting the id of the event with the id received as parameter
            // if ther eis no such entry, throws BadRequest
            var isPartOfEvent = await db.UserEvents.AnyAsync(ue => ue.EventId == id && ue.UserId == userId);
            if (!isPartOfEvent)
            {
                return BadRequest(new { message = "There is no event for this user that has the id " + id });
            }

            var us = new List<object>();
            if (events.UserEvents != null && events.UserEvents.Count > 0)
            {
                var userIds = events.UserEvents.Select(ue => ue.UserId).ToList();
                // Getting the list with all the users that take part in the event
                var users = await db.ApplicationUsers
                    .Where(u => userIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.Nickname })
                    .ToListAsync();

                us.AddRange(users);
            }
            // Set result
            var result = new
            {
                Id = events.Id,
                Title = events.Title,
                Description = events.Description,
                Date = events.Date,
                Color = events.Color,
                GroupId = events.GroupId,
                Users = us
            };

            return Ok(result);
        }

        [Authorize]
        [HttpPatch]
        public async Task<IActionResult> Edit(int id, [FromBody] EventModel dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid request." });
            }

            // Searching for the specific event
            var eventToUpdate = await db.Events
                .Include(e => e.UserEvents)
                .Include(e => e.Group)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventToUpdate == null)
            {
                return NotFound(new { message = "Event not found." });
            }

            var creatorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // Separating all the received data and putting it into the new event
            eventToUpdate.Title = dto.Title;
            eventToUpdate.Description = dto.Description;
            eventToUpdate.Color = dto.Color;
            eventToUpdate.Date = DateTime.SpecifyKind((DateTime)dto.Date, DateTimeKind.Utc);

            var oldUserEvents = db.UserEvents.Where(ue => ue.EventId == eventToUpdate.Id);
            db.UserEvents.RemoveRange(oldUserEvents);

            eventToUpdate.UserEvents = new List<UserEvent>();
            
            // Getting all the userEvents that the old event had to add them into the new one
            var allUserIds = dto.UserIds?.Distinct().ToList() ?? new List<string>();
            if (!allUserIds.Contains(creatorId))
                allUserIds.Add(creatorId);

            var users = await db.ApplicationUsers
                .Include(u => u.UserEvents)
                .Where(u => allUserIds.Contains(u.Id))
                .ToListAsync();

            foreach (var user in users)
            {
                var userEvent = new UserEvent { UserId = user.Id, Event = eventToUpdate };
                eventToUpdate.UserEvents.Add(userEvent);

                if (user.UserEvents == null)
                {
                    user.UserEvents = new List<UserEvent>();
                }
                user.UserEvents.Add(userEvent);

                db.UserEvents.Add(userEvent);
            }

            db.SaveChanges();
            return Ok(eventToUpdate);
        }

        [Authorize]
        [HttpPost("new")]
        public async Task<IActionResult> New(EventModel dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid request." });
            }
            // Getting current user
            var creatorId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var group = await db.Groups
                .Include(g => g.Events)
                .FirstOrDefaultAsync(g => g.Id == dto.GroupId);

            if (group == null)
            {
                return NotFound(new { message = "Group not found." });
            }

            var date = dto.Date == null ? DateTime.UtcNow : dto.Date;
            // Creating the body of the new event
            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                Color = dto.Color,
                Date = DateTime.SpecifyKind((DateTime)date, DateTimeKind.Utc),
                GroupId = dto.GroupId,
                UserEvents = new List<UserEvent>()
            };

            //Adding the event into the group's ICollection
            if (group.Events == null)
            {
                group.Events = new List<Event>();
            }
            group.Events.Add(newEvent);

            var allUserIds = dto.UserIds?.Distinct().ToList() ?? new List<string>();
            if (!allUserIds.Contains(creatorId))
                allUserIds.Add(creatorId);

            var users = await db.ApplicationUsers
                .Include(u => u.UserEvents)
                .Where(u => allUserIds.Contains(u.Id))
                .ToListAsync();
            //  Creating the necessary entries in UserGroups and also sending
                //  the notifications for being added into a group 
            foreach (var user in users)
            {
                var userEvent = new UserEvent { UserId = user.Id, Event = newEvent };
                newEvent.UserEvents.Add(userEvent);
                if (user.UserEvents == null)
                {
                    user.UserEvents = new List<UserEvent>();
                }
                user.UserEvents.Add(userEvent);
                db.UserEvents.Add(userEvent);
                var notification = new Notification
                {
                    UserId = user.Id,
                    NotificationContent = $"You have been added to a new event: {newEvent.Title}",
                    NotificationDate = DateTime.UtcNow,
                    Type = "Event",
                    IsRead = false
                };
                db.Notifications.Add(notification);
            }

            db.Events.Add(newEvent);
            db.SaveChanges();

            return Ok("GOOD");
        }

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            // Getting the event with said id and also the id of the current user plus the UserEvent entry
            var events = await db.Events.Include(e => e.UserEvents).Include(e=> e.Group).FirstOrDefaultAsync(e => e.Id == id);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var ue = db.UserEvents.Where(ug => ug.UserId == userId && ug.EventId == id).First();
            // If events or ue are empty, then it means that the DELETE request should not be allowed
            if (events == null)
            {
                return BadRequest(new { message = "There is no event that has the id " + id.ToString() });
            }
            if (ue == null)
            {
                return BadRequest(new { message = "There is no event in the user's event list that has the id " + id.ToString() });
            }
            // Deleting the entries from the ICollections from the group and the users.
            // Plus the entries from UserGroups
            var userEvents = await db.UserEvents.Where(u => u.EventId == id).ToListAsync();
            var users = await db.ApplicationUsers.ToListAsync();
            foreach (var userEvent in userEvents) { 
                foreach(var user in users)
                {
                    if (user.Id == userEvent.UserId)
                    {
                        user.UserEvents.Remove(userEvent);
                    }
                }
                db.UserEvents.Remove(userEvent);
            }
            var group = await db.Groups.Include(g => g.Events).FirstOrDefaultAsync(g => g.Id == events.Group.Id);
            if(group!=null)
            { 
                group.Events.Remove(events); 
            }
            db.Events.Remove(events);
            db.SaveChanges();
            return Ok("GOOD");
        }
    }
}
