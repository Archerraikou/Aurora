using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Aurora.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? Nickname { get; set; }
        public string? ProfilePicture { get; set; }
        public string? ProfileDescription { get; set; }
        public virtual ICollection<CategoryUser>? Interests { get; set; }
        public virtual ICollection<GroupMessage>? GroupMessages { get; set; }
        public virtual ICollection<PrivateConversation>? PrivateConversations { get; set; }
        public virtual ICollection<Notification>? Notifications { get; set; }
        public int? ScheduleId { get; set; }
        public virtual Schedule? Schedule { get; set; }
        public virtual ICollection<UserGroup>? UserGroups { get; set; }
        [NotMapped]
        public IEnumerable<SelectListItem>? AllRoles { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

    }
}