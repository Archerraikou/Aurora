using Aurora.Data;
using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace Aurora.Controllers
{

    // Am facut o clasa pentru a trimite doar informatiile relevante care trebuie sa fie publice
    // sau vizibile cand vizualizezi o pagina a unui utilizator.
    // In caz ca lipseste ceva trebuie adaugat aici
    public class RelevantUserInformation
    {

        public string Id {get;set;} 
        public string? Nick{get;set;} 

        public string? Email{get;set;}
        public string? ProfilePicture{get;set;}
        public string? ProfileDescription{get;set;}
        public virtual ICollection<CategoryUser>? Interests {get;set;}

    }

    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApplicationUser>>> Index()
        {
            
            var query = _context.ApplicationUsers.Select(u=> new RelevantUserInformation{ 
                Id = u.Id,
                Nick = u.Nickname,
                Email = u.Email,
                ProfilePicture = u.ProfilePicture,
                ProfileDescription = u.ProfileDescription,
                Interests = u.Interests
            });
            var users = await query.ToListAsync();
            return Ok(users);
        }
        [HttpGet("{userId}")]
        public async Task<ActionResult<ApplicationUser>> Show(string userId)
        {
            var query = _context.ApplicationUsers.Where(u=> u.Id == userId).Select(u=> new RelevantUserInformation{ 
                Id = u.Id,
                Nick = u.Nickname,
                Email = u.Email,
                ProfilePicture = u.ProfilePicture,
                ProfileDescription = u.ProfileDescription,
                Interests = u.Interests
            });
            var user = await query.ToListAsync();
            if(user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost("{userId}")]
        public async Task<ActionResult<ApplicationUser>> Edit(string userId, [FromBody] RelevantUserInformation RUI)
        {
            try
            {
                var user = await _context.ApplicationUsers.FindAsync(userId);
                if(user==null)
                    return NotFound("User not found");
                // Depinde ce anume vrem sa schimbam la cont, o sa le pun pe toate si doar le scoatem pe cele care consideram ca nu trebuie sa poata fi modificate
                user.Nickname = RUI.Nick;
                // Maybe nu email
                user.ProfilePicture = RUI.ProfilePicture;
                user.ProfileDescription = RUI.ProfileDescription;
                user.Interests = RUI.Interests;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}
