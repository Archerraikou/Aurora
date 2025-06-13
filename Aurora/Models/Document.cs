using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class Document
    {
        [Key]
        public int? Id { get; set; }
        public int GroupId { get; set; }
        //public virtual Group Group { get; set; }
        public string? Content { get; set; }
        public string? Title { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
