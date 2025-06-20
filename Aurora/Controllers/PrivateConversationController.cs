
using Aurora.Data;
using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using System.Security.Claims;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using NuGet.Protocol.Core.Types;
using System.Xml;

namespace Aurora.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class PrivateConversationController : Controller
    {
        private readonly ApplicationDbContext db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public PrivateConversationController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager
        )
        {
            db = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        // Metoda care verifica daca exista o conversatie intre doi utilizatori
        [HttpGet("checkPM")]
        public async Task<ActionResult<int>> PMExists(string userId1, string userId2)
        {

            // Verificam daca userid2 este id-ul unui user

            var user2 = db.ApplicationUsers.Find(userId2);
            if (user2 == null)
            {
                return BadRequest();
            }

            string userFirst, userSecond;
            int res = string.Compare(userId1, userId2);
            if (res == 0)
            {
                // Nu poti sa faci PM cu tine insuti?
                return BadRequest();
            }

            if (res < 0)
            {
                userFirst = userId1;
                userSecond = userId2;
            }

            else
            {
                userFirst = userId2;
                userSecond = userId1;
            }

            var pmId = await db.PrivateConversations.Where(m => m.User1 == userFirst && m.User2 == userSecond).Select(m => m.Id).ToListAsync();
            if (pmId.Count == 0)
            {
                return Ok(-1);
            }
            if (pmId.Count > 1)
            {
                var pmIdFake = await db.PrivateConversations.Where(m => m.Id == pmId[1]).FirstOrDefaultAsync();
                db.PrivateConversations.Remove(pmIdFake);
                db.SaveChanges();
            }
            return Ok(pmId[0]);
        }

        // Metoda care creaza o conversatie privata intre doi useri
        [HttpPost("new")]
        public async Task<ActionResult<int>> NewPM(string userId1, string userId2)
        {
            string userFirst, userSecond;
            int res = string.Compare(userId1, userId2);
            if (res == 0)
            {
                // Nu poti sa faci PM cu tine insuti?
                return BadRequest();
            }

            if (res < 0)
            {
                userFirst = userId1;
                userSecond = userId2;
            }

            else
            {
                userFirst = userId2;
                userSecond = userId1;
            }
            // Totusi daca se apeleaza asta si exista deja un PM sa nu se mai faca altul
            var pmId = await db.PrivateConversations.Where(m => m.User1 == userFirst && m.User2 == userSecond).Select(m => m.Id).FirstOrDefaultAsync();
            if (pmId != null)
            {
                return BadRequest();
            }

            PrivateConversation pm = new()
            {
                User1 = userFirst,
                User2 = userSecond
            };
            db.PrivateConversations.Add(pm);
            db.SaveChanges();

            // si acuma luam id-ul pm-ului

            var nouPmId = await db.PrivateConversations.Where(m => m.User1 == userFirst && m.User2 == userSecond).Select(m => m.Id).FirstOrDefaultAsync();

            return Ok(nouPmId);
        }




    }

}