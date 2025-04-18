using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.InteropServices.JavaScript;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity.UI.Services; 
using Aurora.Services; 
using System.Web; 

using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;
namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly IAppEmailSender _emailSender;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            IAppEmailSender emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _emailSender = emailSender;
        }

[HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel loginData)
    {
        if (loginData == null || string.IsNullOrEmpty(loginData.Email) || string.IsNullOrEmpty(loginData.Password))
        {
            return BadRequest("Missing email or password.");
        }

        var user = await _userManager.FindByEmailAsync(loginData.Email);

        if (user == null || !user.EmailConfirmed)
        {
            _logger.LogWarning($"Login attempt failed. Email confirmed: {user?.EmailConfirmed ?? false}");
            return Unauthorized("Invalid credentials or email not confirmed.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginData.Password, false);

        if (!result.Succeeded)
        {
            return Unauthorized("Invalid credentials.");
        }


        var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

        var userRoles = await _userManager.GetRolesAsync(user);
        foreach (var role in userRoles)
        {
            authClaims.Add(new Claim(ClaimTypes.Role, role));
        }

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpireMinutes"])),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        var expiresIn = (int)TimeSpan.FromMinutes(int.Parse(_configuration["Jwt:ExpireMinutes"])).TotalSeconds;

        return Ok(new
        {
            accessToken = accessToken,
            refreshToken = Guid.NewGuid(),
            expiresIn = expiresIn
        });
    }



    [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                Nickname = model.Nickname,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                _logger.LogError($"Registration failed for {model.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(result.Errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "User");
            if (!roleResult.Succeeded)
            {
                _logger.LogError($"Failed to assign role to {user.Email}: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                return BadRequest(roleResult.Errors);
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var expirationTime = DateTime.UtcNow.AddDays(1);
            var encodedToken = HttpUtility.UrlEncode(token);

            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? $"{Request.Scheme}://{Request.Host.Value}";

            var apiUrl = _configuration["AppSettings:ApiUrl"] ?? $"{Request.Scheme}://{Request.Host.Value}";
            var confirmationLink = $"{apiUrl}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

            await _emailSender.SendEmailAsync(
                user.Email,
                "Confirm your email",
                $"Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.");

            return Ok(new
            {
                message = "Registration successful. Please check your email to confirm your account.",
                confirmationLink = confirmationLink 
            });
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("Invalid parameters.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                _logger.LogError($"Email confirmation failed for user {userId}: {errors}");
                return BadRequest($"Failed to confirm email: {errors}");
            }

            return Ok("Email confirmed successfully.");
        }



        [Authorize]
        [HttpGet("check-email-status")]
        public async Task<IActionResult> CheckEmailStatus()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return BadRequest("User not found");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var emailStatus = new
            {
                EmailConfirmed = user.EmailConfirmed,
                Email = user.Email
            };

            return Ok(emailStatus);
        }

        //
        [HttpPost("resendConfirmationEmail")]
        public async Task<IActionResult> ResendConfirmationEmail([FromBody] ResendConfirmationRequestModel request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
                return BadRequest("No user found with that email.");

            if (user.EmailConfirmed)
                return BadRequest("Email already confirmed.");

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);

            var apiUrl = _configuration["AppSettings:ApiUrl"] ?? $"{Request.Scheme}://{Request.Host.Value}";
            var confirmationLink = $"{apiUrl}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

            await _emailSender.SendEmailAsync(user.Email, "Confirm your email",
                $"Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.");

            return Ok("Confirmation email resent.");
        }



        [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            var roles = await _userManager.GetRolesAsync(user);
            var rolesJson = new
            {
                Roles = roles
            };
            return Ok(rolesJson);
        }
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
            _logger.LogInformation("Delete account endpoint hit");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Delete account failed: User ID claim not found");
                return BadRequest(new { message = "User identity not found" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning($"Delete account failed: User with ID {userId} not found");
                return NotFound(new { message = "User not found" });
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                _logger.LogError($"Error deleting user {userId}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(new { message = "Error deleting account", errors = result.Errors });
            }

            _logger.LogInformation($"User {userId} deleted successfully");
            return Ok(new { message = "Account deleted successfully" });
        }
    }
}