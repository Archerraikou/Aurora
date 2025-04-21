namespace Aurora.Models.DTOs
{
    public class EventModel
    {
        public string? Title { get; set; }
        public DateTime? Date { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }
        public List<string>? UserIds { get; set; }
        public int? GroupId { get; set; }
    }
}
