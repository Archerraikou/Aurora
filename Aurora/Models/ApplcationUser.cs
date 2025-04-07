using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Aurora.Models
{
    public class ApplicationUser : IdentityUser
    {
        [NotMapped]
        public IEnumerable<SelectListItem>? AllRoles { get; set; }
    }
}