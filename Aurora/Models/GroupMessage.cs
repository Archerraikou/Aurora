namespace Aurora.Models
{
    public class GroupMessage : Message
    {
        public int? GroupId { get; set; }
        public virtual Group Group { get; set; }
    }
}
