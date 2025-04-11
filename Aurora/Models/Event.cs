using System.ComponentModel.DataAnnotations;
using System.Drawing;

namespace Aurora.Models
{
    public class Event
    {
        [Key]
        public int? Id { get; set; }
        public string? Title {  get; set; }
        public DateTime? Date { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }

    }
}
