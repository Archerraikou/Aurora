using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class UserEvent
    {
        [Key]
        public int? Id { get; set; }
        public string? UserId { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public int? EventId { get; set; }
        public virtual Event? Event { get; set; }
    }
}
