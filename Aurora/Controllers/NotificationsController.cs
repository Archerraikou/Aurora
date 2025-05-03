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
        [Authorize]
        public async Task<IActionResult> GetNotifications(bool unreadOnly = false)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = _context.Notifications.AsQueryable();

            if (unreadOnly)
            {
                query = query.Where(n => n.UserId == userId && !n.IsRead);
            }
            else
            {
                query = query.Where(n => n.UserId == userId);
            }

            var notifications = await query
                .OrderByDescending(n => n.NotificationDate)
                .ToListAsync();

            return Ok(notifications);
        }

        // Get and mark a single notification as read
        [HttpGet("showNotification")]
        [Authorize]
        public async Task<IActionResult> ShowNotification([FromQuery] int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound();

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(notification);
        }

        // Mark all notifications as read
        [HttpPut("mark-all-read")]
        [Authorize]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Delete a single notification
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
            {
                return NotFound();
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
