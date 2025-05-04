using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class Notification
    {
        [Key]
        public int? Id { get; set; }
        [Required]
        public string? Type { get; set; }
        public string? SentId { get; set; }
        public string? UserId { get; set; }
        public int? GroupId { get; set; } 
        public virtual Group? Group { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public DateTime? NotificationDate { get; set; }
        public string? NotificationContent { get; set; }
        public bool IsRead { get; set; } = false;
    }
}
