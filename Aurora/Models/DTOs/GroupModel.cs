using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Aurora.Models.DTOs
{
    public class GroupModel
    {
        [Key]
        public int? Id { get; set; }
        [Required]
        public string? GroupName { get; set; }
        public string? GroupDescription { get; set; }
        public string? GroupPicture { get; set; }
        public virtual ICollection<int>? GroupCategory { get; set; }
        public bool? IsPrivate { get; set; }
    }
}
