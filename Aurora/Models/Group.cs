using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.Json.Serialization;

namespace Aurora.Models
{
    public class Group
    {
        internal bool? isPrivate;

        [Key]
        public int? Id { get; set; }
        [Required]
        public string? GroupName { get; set; }
        public string? GroupDescription { get; set; }
        public string? GroupPicture { get; set; }
        public virtual ICollection<CategoryGroups>? GroupCategory { get; set; }
        public string? UserId { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public virtual ICollection<UserGroup>? Users { get; set; }
        public DateTime? CreatedDate { get; set; }
        public virtual ICollection<GroupMessage>? Messages { get; set; }
        public bool? IsPrivate { get; set; }
        public virtual ICollection<Document>? Documents { get; set; }
        public virtual ICollection<Event>? Events { get; set; }
    }
}
