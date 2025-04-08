using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class PrivateConversation
    {
        [Key]
        public int? Id { get; set; }
        public string? User1 { get; set; }
        public string? User2 { get; set; }
        public virtual ApplicationUser? RefUser1 { get; set; }
        public virtual ICollection<GroupMessage>? Messages { get; set; }
    }
}
