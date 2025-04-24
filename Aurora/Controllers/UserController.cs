using Aurora.Data;
using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace Aurora.Controllers
{


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
                ProfilePicturePath = u.ProfilePicture,
                ProfileDescription = u.ProfileDescription
                // ,Interests = u.Interests
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
                ProfilePicturePath = u.ProfilePicture,
                ProfileDescription = u.ProfileDescription
                // ,Interests = u.Interests
            });

            var user = await query.SingleOrDefaultAsync();
            if(user == null)
            {
                return NotFound();
            }

            user.ProfilePicturePath ??= "wwwroot/images/user-pictures/defaultapp.png";

            
            return Ok(user);
        }

        [HttpPost("edit/{userId}")]
        public async Task<ActionResult<ApplicationUser>> Edit(string userId, [FromForm] RelevantUserInformation RUI, IFormFile? ProfilePicture = null)
        {
            try
            {
                var user = await _context.ApplicationUsers.FindAsync(userId);
                if(user==null)
                    return NotFound("User not found");

                if(ProfilePicture!=null)
                {
                    user.ProfilePicture = await UploadProfilePictureAsync(ProfilePicture);
                }
                if(user.ProfilePicture == null)
                {
                    user.ProfilePicture = "wwwroot/images/user-pictures/defaultpp.png";
                }
                Console.WriteLine(user.ProfilePicture);
                user.Nickname = RUI.Nick;
                user.ProfileDescription = RUI.ProfileDescription;
                // user.Interests = Interests;
                
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpDelete("delete/{userId}")]
        public async Task<ActionResult<ApplicationUser>> Delete(string userId)
        {
            try{

                var user = await _context.ApplicationUsers.FindAsync(userId);
                if(user==null)
                {
                    return NotFound("User not Found");
                }
                _context.ApplicationUsers.Remove(user);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");
            }

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
            // return Path.Combine("uploads", fileName);
            return filePath;
        }
        [HttpGet("pfp/{userId}")]
        public IActionResult GetImage(string userId)
        {

            var user = _context.ApplicationUsers.Find(userId);
            if(user==null)
                return NotFound("User not found");
            if(user.ProfilePicture==null)
            {
                return PhysicalFile("E:/Aurora/Aurora/wwwroot/images/user-pictures/defaultpp.png", "image/png", enableRangeProcessing:true);
            }
            var basePath = Path.GetFullPath(Path.Combine("wwwroot\\images"));
            var fullPath = Path.GetFullPath(user.ProfilePicture);
            
            Console.WriteLine(fullPath);
            if(!fullPath.StartsWith(basePath))
            {

                return BadRequest("Invalid Image Path");
            }
            if(!System.IO.File.Exists(fullPath))
            {
                return NotFound();
            }
            var contentType = GetContentType(fullPath);

            return PhysicalFile(fullPath, contentType, enableRangeProcessing:true);

        }
        private string GetContentType(string path)
        {
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(path, out var contentType))
                contentType = "application/octet-stream"; // Fallback type
            
            return contentType;
        }
    }
}
