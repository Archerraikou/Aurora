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
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity.Data;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Injectarea serviciilor necesare: manageri de utilizatori, configurare, logare, trimitere email, etc. 
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly IAppEmailSender _emailSender;
        private readonly IHostEnvironment _environment;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            IAppEmailSender emailSender, IHostEnvironment environment, RoleManager<IdentityRole> roleManager,
            IHttpClientFactory factory,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _emailSender = emailSender;
            _environment = environment;
            _roleManager = roleManager;
<<<<<<< HEAD
            _httpClientFactory = factory;
            _config = config;
=======
>>>>>>> Radu
        }
       
        // Endpoint pentru înregistrarea unui nou utilizator

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterModel formUser)
        {
            try
            {  
                // Validare câmpuri lipsă

                if (formUser == null)
                {
                    return BadRequest("All fields are required");
                }
                string nickname = formUser.Nickname;
                string email = formUser.Email;
                string password = formUser.Password;
                var errors = new List<string>();
                // Validare email și parolă
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

                // Verificare dacă utilizatorul există deja
                var existingUser = await _userManager.FindByEmailAsync(email);
                if (existingUser != null)
                {
                    return BadRequest(new
                    {
                        Message = "Registration failed",
                        Errors = new List<string> { "Email already registered." }
                    });
                }
                var basePath = Path.GetFullPath(Path.Combine("wwwroot\\images\\defaultpp.jpg"));
                // Creare utilizator nou
                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    Nickname = nickname,
                    ProfileDescription = "",
                    EmailConfirmed = false,
                    ProfilePicture = basePath
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

                // Atribuire rol implicit
                try
                {
                    if (_userManager.Users.Count() == 0)
                    {
                        await _userManager.AddToRoleAsync(user, "Admin");
                    }
                    else
                    {
                        const string defaultRole = "User";
                        await _userManager.AddToRoleAsync(user, defaultRole);
                    }
                }
                catch (Exception roleEx)
                {
                    _logger.LogWarning(roleEx, "Failed to assign default role to user");
                }

                // Generare și trimitere email de confirmare
                try
                {
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    var encodedToken = WebUtility.UrlEncode(token);  // codifică tokenul pentru a putea fi transmis în URL

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
                        ConfirmationLink = _environment.IsDevelopment() ? confirmationLink : null 
                    });
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send confirmation email");

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

        // Endpoint pentru confirmarea emailului prin token

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
        // Verifică dacă utilizatorul are emailul confirmat

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
        // Retrimiterea emailului de confirmare

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
        // Test pentru trimiterea emailurilor

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
        // Returnează rolurile utilizatorului curent

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
        // Șterge contul utilizatorului curent

        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
<<<<<<< HEAD
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
=======
            _logger.LogInformation("Delete account endpoint hit");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);// extrage ID-ul utilizatorului autentificat din JWT claims
>>>>>>> Radu
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

        [HttpGet("login/google")]
        public IActionResult LoginGoogle()
        {
            var props = _signInManager.ConfigureExternalAuthenticationProperties("Google", "/Auth/callback");
            return Challenge(props, "Google");
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            return Ok();
        }

    }
}
