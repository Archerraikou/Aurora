using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Aurora.Hubs
{
    public class VideoHub : Hub
    {
        // Useri in fiecare camera
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _roomUsers = new();

        
        private static readonly ConcurrentDictionary<string, UserInfo> _connections = new();

        private class UserInfo
        {
            public string UserId { get; set; }
            public string RoomId { get; set; }
        }

        
        public async Task SendSignal(string roomId, string fromUserId, string toUserId, string data)
        {
            
            if (!string.IsNullOrEmpty(toUserId))
            {
                
                string targetConnectionId = _roomUsers.TryGetValue(roomId, out var users)
                    ? users.FirstOrDefault(u => u.Key == toUserId).Value
                    : null;

                if (!string.IsNullOrEmpty(targetConnectionId))
                {
                    await Clients.Client(targetConnectionId).SendAsync("ReceiveSignal", fromUserId, data);
                }
            }
            else
            {
                
                await Clients.Group(roomId).SendAsync("ReceiveSignal", fromUserId, data);
            }
        }

        public async Task JoinRoom(string roomId)
        {
            string connectionId = Context.ConnectionId;
            string userId = Context.GetHttpContext()?.Request.Query["userId"].ToString() ?? Guid.NewGuid().ToString();

            
            await Groups.AddToGroupAsync(connectionId, roomId);

            
            _connections[connectionId] = new UserInfo { UserId = userId, RoomId = roomId };

            
            if (!_roomUsers.ContainsKey(roomId))
            {
                _roomUsers[roomId] = new ConcurrentDictionary<string, string>();
            }

            
            _roomUsers[roomId][userId] = connectionId;

            
            await Clients.Group(roomId).SendAsync("UserJoined", userId);

            
            if (_roomUsers.TryGetValue(roomId, out var users))
            {
                List<string> existingUsers = users.Keys.Where(id => id != userId).ToList();
                await Clients.Caller.SendAsync("ExistingUsers", existingUsers);
            }
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

           
            if (_connections.TryRemove(Context.ConnectionId, out UserInfo userInfo) &&
                _roomUsers.TryGetValue(roomId, out var users))
            {
                if (users.TryRemove(userInfo.UserId, out _))
                {
                    
                    await Clients.Group(roomId).SendAsync("UserLeft", userInfo.UserId);
                }

                
                if (users.IsEmpty)
                {
                    _roomUsers.TryRemove(roomId, out _);
                }
            }
        }

        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            if (_connections.TryRemove(Context.ConnectionId, out UserInfo userInfo))
            {
                string roomId = userInfo.RoomId;
                string userId = userInfo.UserId;

                if (_roomUsers.TryGetValue(roomId, out var users))
                {
                    if (users.TryRemove(userId, out _))
                    {
                        
                        await Clients.Group(roomId).SendAsync("UserLeft", userId);
                    }

                    
                    if (users.IsEmpty)
                    {
                        _roomUsers.TryRemove(roomId, out _);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}