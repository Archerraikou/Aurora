using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class CategoryGroups
    {
        [Key]
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
        public int? GroupId { get; set; }
        public virtual Group? Group { get; set; }
    }
}
