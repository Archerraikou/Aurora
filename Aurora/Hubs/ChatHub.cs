using Microsoft.AspNetCore.SignalR;

namespace SignalRChat.Hubs
{
    public class ChatHub : Hub
    {
    
        public async Task JoinGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }

        public async Task LeaveGroup(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }
        public async Task SendMessageToGroup(string messageId, string groupId)
        {
            Console.Write("Message ID: " + messageId);
            Console.Write("Group ID: " + groupId);
            await Clients.Group(groupId).SendAsync("ReceiveMessage", messageId);
        }
    }
}