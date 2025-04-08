using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class Message
    {
        [Key]
        public int? Id { get; set; }
        public string? UserId { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public string? Content { get; set; }
        public virtual ICollection<File>? Files { get; set; }
        public DateTime? Date { get; set; }
        public bool? WasEdited { get; set; }
    }
}
