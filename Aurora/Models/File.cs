using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class File
    {
        [Key]
        public string Id { get; set; }
        [Required]
        public string? Location { get; set; }
        public int? MessageId { get; set; }
        public virtual Message? Message { get; set; }
    }
}
