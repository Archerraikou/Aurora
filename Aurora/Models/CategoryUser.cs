using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class CategoryUser
    {
        [Key]
        public int? Id { get; set; }
        public string? UserId { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public int? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
    }
}
