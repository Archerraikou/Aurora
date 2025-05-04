using System.Diagnostics.CodeAnalysis;
using Aurora.Data;
using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize]
        [HttpPost("send")]
        public async Task<ActionResult<int>> SendMessage([FromForm] MessageModel mes, IFormFile? attachment)
        {
            GroupMessage newMessage = new();
            try
            {
                var user = await _context.ApplicationUsers.FindAsync(mes.UserId);
                if(user==null)
                {
                    return BadRequest("User Doesn't Exist");
                }
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

                _context.GroupMessages.Add(newMessage);
                await _context.SaveChangesAsync();
                return Ok(newMessage.Id);
            }
            catch(Exception e)
            {

                return BadRequest(e.Message);
            }
        }
        [Authorize]
        [HttpGet("Show/{messageId}")]
        public async Task<ActionResult<GroupMessage>> getMessage(int messageId)
        {
            //maybe this will work when we actually have everything sorted out for now its commented
            var message = await _context.GroupMessages.Where(m=>m.Id == messageId).Include("User").FirstOrDefaultAsync();

            if(message!=null)
            {
                return Ok(message);
            }
            else
            {
                Console.Write(message);
                return StatusCode(500);
            }

        }
        [Authorize]
        [HttpGet("getPage")]
        public async Task<ActionResult<List<GroupMessage>>> getPage(int groupId, int pageNumber)
        {
            const int noMesssagesPage = 20;
            var loadAllMessages = await _context.GroupMessages.Where(m=>m.GroupId == groupId).OrderByDescending(m=>m.Date).Skip((pageNumber-1)*noMesssagesPage).Take(noMesssagesPage).ToListAsync();
            return Ok(loadAllMessages);

        }

        
    }
}