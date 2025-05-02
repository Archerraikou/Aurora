using Aurora.Data;
using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aurora.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpPost("send")]
        public async Task<ActionResult<int>> SendMessage([FromForm] MessageModel mes, IFormFile? attachment)
        {
            GroupMessage newMessage = new();
            try
            {
                newMessage.UserId = mes.UserId;
                newMessage.Content = mes.Content;
                newMessage.Date = DateTime.UtcNow;
                // O sa adaug un path la fisier in modelul de mesaje, dar trebuie vorbit
                // also trebuie facuta o metoda care sa uploadeze fisierele care nu sunt imagini
                // if(attachment != null)
                // {
                        // newMessage.AttachmentPath = uploadFile(attachment);
                // }
                newMessage.WasEdited = false;
                newMessage.GroupId = mes.GroupId;
                _context.Messages.Add(newMessage);
                await _context.SaveChangesAsync();
                return Ok(newMessage.Id);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        
    }
}