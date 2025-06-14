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

        // Obține notificările pentru utilizatorul autentificat
        // Parametrul unreadOnly filtrează doar notificările necitite, dacă e true
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetNotifications(bool unreadOnly = false)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (unreadOnly)
            {
                var notifications = await _context.Notifications.Where(n => n.UserId == userId && n.IsRead==false)
                 .OrderByDescending(n => n.NotificationDate)
                 .ToListAsync();
                return Ok(notifications);
            }
            else
            {
                var notifications = await _context.Notifications.Where(n => n.UserId == userId)
                .OrderByDescending(n => n.NotificationDate)
                .ToListAsync();
                return Ok(notifications);
            }
        }

        // Obține o notificare specifică după ID și o marchează ca citită
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

        // Marchează toate notificările utilizatorului ca fiind citite
        [HttpPut("mark-all-read")]
        [Authorize]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // Găsește toate notificările necitite ale utilizatorului   
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

        // Șterge o notificare specifică după ID, dacă aparține utilizatorului
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
            {
                return NotFound();// Notificarea nu există sau nu aparține utilizatorului
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
