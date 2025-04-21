using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aurora.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Fetch notifications for a logged-in user
        [HttpGet]
        [Authorize] // Only allow logged-in users
        public async Task<IActionResult> GetNotifications(bool unreadOnly = false)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);


            var query = _context.Notifications.AsQueryable();

            if (unreadOnly)
            {
                query = query.Where(n => n.UserId == userId && !n.IsRead); // Fetch unread notifications
            }
            else
            {
                query = query.Where(n => n.UserId == userId); // Fetch all notifications for the user
            }

            var notifications = await query
                .OrderByDescending(n => n.NotificationDate)
                .ToListAsync();

            return Ok(notifications);
        }

        // Get a single notification (for detail page)
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetNotification(int id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null)
                return NotFound();

            return Ok(notification);
        }

        // Mark a notification as read
        [HttpPost("mark-as-read/{id}")]
        [Authorize]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            // Mark as read
            notification.IsRead = true;

            // Save changes to the database
            await _context.SaveChangesAsync();

            return NoContent(); // No content to return, just a success response
        }
    }
}