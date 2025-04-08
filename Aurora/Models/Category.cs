using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class Category
    {
        [Key]
        public int? Id { get; set; }
        [Required]
        public string? CategoryName { get; set; }
        public string? CategoryDescription { get; set; }
        public virtual ICollection<CategoryGroups>? Groups { get; set; }
        public virtual ICollection<CategoryUser>? Users { get; set; }
    }
}
