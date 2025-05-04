using Microsoft.AspNetCore.Identity;
using Aurora.Models;
using Aurora.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity.UI.Services;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text.Json.Serialization;
using Aurora.Services;
using Aurora.Controllers;


var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddTransient<IAppEmailSender, AppEmailSender>();


builder.Services.AddControllers()
    .AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        // Remove the Authority if you're not using an external Identity provider
        // options.Authority = "https://localhost:7242"; // Only needed if you have an identity provider

        // Set the Audience to match the 'aud' claim in the JWT
        options.Audience = "https://localhost:7242"; // Must match the 'aud' in your token

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true, // Ensure the audience is validated
            ValidateIssuer = true, // Ensure the issuer is validated
            ValidateLifetime = true, // Ensure the token lifetime is validated
            ValidateIssuerSigningKey = true, // Ensure the signing key is validated
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSecretKey")) // Use the same secret used for signing
        };
    });


builder.Services.AddAuthorization();
builder.Services.AddHttpClient();

builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.CustomSchemaIds(id => id.FullName!.Replace('+', '-'));
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Enter your JWT token here",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        BearerFormat = "JWT"
    };
    o.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    var securityRequirement = new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = JwtBearerDefaults.AuthenticationScheme
                }
            },
            new string[] { }
        }
    };
    o.AddSecurityRequirement(securityRequirement);
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policyBuilder =>
    {
        policyBuilder
            .WithOrigins("http://localhost:5173") // Frontend URL
            .AllowAnyHeader() // Allow all headers
            .AllowAnyMethod() // Allow all HTTP methods (GET, POST, etc.)
            .AllowCredentials(); // Allow cookies and credentials (like tokens)
    });
});


builder.Services.AddIdentityApiEndpoints<ApplicationUser>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.Zero; // Disable lockout
    options.Lockout.MaxFailedAccessAttempts = 100;
})
.AddRoles<IdentityRole>() // ? Add this line to enable roles
.AddEntityFrameworkStores<ApplicationDbContext>();


builder.Services.AddScoped<GroupsController>();

//builder.Services.AddSingleton<IEmailSender, NullEmailSender>();
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await AppSeedRoles.SeedRoles(roleManager);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapIdentityApi<ApplicationUser>();

app.UseCors("CorsPolicy");

app.UseStaticFiles();



app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();