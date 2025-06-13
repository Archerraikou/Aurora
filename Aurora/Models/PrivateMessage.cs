namespace Aurora.Models
{
    public class PrivateMessage : Message
    {
        
        public int? pmId { get; set; }
        public virtual PrivateConversation? PM{ get; set; }
    }
}
