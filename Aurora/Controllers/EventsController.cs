using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventsController : Controller
    {
        private readonly ApplicationDbContext db;
        public EventsController(ApplicationDbContext context)
        {
            db = context;
        }

        [HttpGet("index")]
        public async Task<IActionResult> Index()
        {
            var events = await db.Events.Include("UserEvents").Include("Group").ToListAsync();
            return Ok(events);
        }

        [HttpGet("show/{id}")]
        public async Task<IActionResult> Show(int id)
        {
            var events = await db.Events.Include(e => e.UserEvents).Include("Group").FirstOrDefaultAsync(e => e.Id == id);
            if (events == null)
            {
                return BadRequest(new { message = "There is no event that has the id " + id.ToString() });
            }
            else
            {
                return Ok(events);
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Edit(int id, JsonElement future)
        {
            var old = await db.Events.Include(e => e.UserEvents).Include("Group").FirstOrDefaultAsync(e => e.Id == id);
            if (old == null)
            {
                return BadRequest(new { message = "There is no event that has the id " + id.ToString() });
            }
            if (future.TryGetProperty("Title", out var title))
            {
                old.Title = title.GetString();
            }
            if (future.TryGetProperty("Description", out var description))
            {
                old.Description = description.GetString();
            }
            if (future.TryGetProperty("Color", out var color))
            {
                old.Color = color.GetString();
            }
            if (future.TryGetProperty("Date", out var date))
            {
                old.Date = DateTime.Parse(date.GetString());
                old.Date= DateTime.SpecifyKind((DateTime)old.Date, DateTimeKind.Utc);
            }
            await db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> New([FromBody] Event newEvent)
        {
            if (newEvent == null)
            {
                return BadRequest(new { message = "Creating an event that is null is now allowed!" });
            }
            newEvent.Date = DateTime.SpecifyKind((DateTime)newEvent.Date, DateTimeKind.Utc);
            db.Events.Add(newEvent);
            await db.SaveChangesAsync();

            return CreatedAtAction(nameof(New), new { id = newEvent.Id }, newEvent);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var events = await db.Events.Include(e => e.UserEvents).Include("Group").FirstOrDefaultAsync(e => e.Id == id);
            if (events == null)
            {
                return BadRequest(new { message = "There is no event that has the id " + id.ToString() });
            }
            else
            {
                db.Events.Remove(events);
                await db.SaveChangesAsync();
                return NoContent();
            }
        }
    }
}
