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
using System.ComponentModel.DataAnnotations;

using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;
using System.Net;
using System.Text.Json;
using System.Security.Cryptography;

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
        private readonly IHostEnvironment _environment;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            IAppEmailSender emailSender, IHostEnvironment environment, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _emailSender = emailSender;
            _environment = environment;
            _roleManager = roleManager;// Store it
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] JsonElement data)
        {
            try
            {
                // Validate incoming JSON fields with proper null checks
                if (!data.TryGetProperty("nickname", out JsonElement nickProp) || nickProp.ValueKind == JsonValueKind.Null ||
                    !data.TryGetProperty("email", out JsonElement emailProp) || emailProp.ValueKind == JsonValueKind.Null ||
                    !data.TryGetProperty("password", out JsonElement passProp) || passProp.ValueKind == JsonValueKind.Null)
                {
                    return BadRequest(new
                    {
                        Message = "Missing required fields",
                        Errors = new List<string> { "nickname, email, and password are required." }
                    });
                }

                // Safely get string values with fallbacks
                string nickname = nickProp.GetString()?.Trim() ?? string.Empty;
                string email = emailProp.GetString()?.Trim() ?? string.Empty;
                string password = passProp.GetString() ?? string.Empty;

                var errors = new List<string>();

                if (string.IsNullOrWhiteSpace(email))
                    errors.Add("Email is required.");
                else if (!new EmailAddressAttribute().IsValid(email))
                    errors.Add("Please enter a valid email address.");

                if (string.IsNullOrWhiteSpace(password))
                    errors.Add("Password is required.");
                else if (password.Length < 6)
                    errors.Add("Password must be at least 6 characters.");

                if (errors.Any())
                {
                    return BadRequest(new
                    {
                        Message = "Validation failed",
                        Errors = errors
                    });
                }

                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(email);
                if (existingUser != null)
                {
                    return BadRequest(new
                    {
                        Message = "Registration failed",
                        Errors = new List<string> { "Email already registered." }
                    });
                }

                // Create new user
                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    Nickname = !string.IsNullOrWhiteSpace(nickname) ? nickname : email.Split('@')[0],
                    ProfileDescription = "wwwroot/images/user-pictures/defaultpp.png",
                    EmailConfirmed = false
                };

                var result = await _userManager.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        Message = "Registration failed",
                        Errors = result.Errors.Select(e => e.Description).ToList()
                    });
                }

                // Assign default role with error handling
                try
                {
                    const string defaultRole = "User";

                    if (!await _roleManager.RoleExistsAsync(defaultRole))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(defaultRole));
                    }

                    await _userManager.AddToRoleAsync(user, defaultRole);
                }
                catch (Exception roleEx)
                {
                    _logger.LogWarning(roleEx, "Failed to assign default role to user");
                }

                // Generate and send confirmation email
                try
                {
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    var encodedToken = WebUtility.UrlEncode(token);

                    var apiUrl = _configuration["AppSettings:ApiUrl"] ?? $"{Request.Scheme}://{Request.Host}";
                    var confirmationLink = $"{apiUrl}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

                    await _emailSender.SendEmailAsync(
                        email,
                        "Confirm your email",
                        $"Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.");

                    return Ok(new
                    {
                        Success = true,
                        Message = "Registration successful! Please check your email to confirm your account.",
                        UserId = user.Id,
                        // Only include in development
                        ConfirmationLink = _environment.IsDevelopment() ? confirmationLink : null // Modified line
                    });
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send confirmation email");

                    // User was created but email failed - allow them to request another email
                    return Ok(new
                    {
                        Success = true,
                        Message = "Account created but confirmation email failed. Please use the resend confirmation option.",
                        UserId = user.Id
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration error");
                return StatusCode(500, new
                {
                    Message = "An error occurred during registration",
                    Error = ex.Message
                });
            }
        }


        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("Invalid parameters");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            // Confirm email
            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded)
                return BadRequest("Invalid confirmation token");

            return Ok("Email confirmed successfully. You can now login.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // Find user
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized("Invalid credentials");

            // Check email confirmation
            if (!user.EmailConfirmed)
                return Unauthorized("Please confirm your email first");

            // Check password
            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
                return Unauthorized("Invalid credentials");

            // Generate token (only if email confirmed)
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email)
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])),
                    SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo
            });
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

        [HttpGet("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            try
            {
                await _emailSender.SendEmailAsync("your@email.com", "Test Email", "This is a test email");
                return Ok("Email sent successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to send email: {ex}");
            }
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
