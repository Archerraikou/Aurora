using Microsoft.AspNetCore.SignalR;

public class DocumentHub : Hub
{
    private static readonly Dictionary<string, string> DocumentStore = new();

    public async Task JoinDocument(string documentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, documentId);
        if (DocumentStore.TryGetValue(documentId, out var content))
        {
            await Clients.Caller.SendAsync("ReceiveDocumentUpdate", content);
        }
    }

    public async Task UpdateDocumentContent(string documentId, string content)
    {
        DocumentStore[documentId] = content;
        await Clients.OthersInGroup(documentId).SendAsync("ReceiveDocumentUpdate", content);
    }
}
