using Microsoft.AspNetCore.SignalR;

public class DocumentHub : Hub
{    // Un dicționar static care stochează conținutul documentelor, unde cheia este documentId, iar valoarea e conținutul
    private static readonly Dictionary<string, string> DocumentStore = new();
    
    public async Task JoinDocument(string documentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, documentId);
        if (DocumentStore.TryGetValue(documentId, out var content))
        {       // Adaugă conexiunea clientului în grupul specific documentului
            await Clients.Caller.SendAsync("ReceiveDocumentUpdate", content);
        }
    }

    public async Task UpdateDocumentContent(string documentId, string content)
    {   // Actualizează conținutul documentului în dicționarul intern
        DocumentStore[documentId] = content;
        // Trimite actualizarea către toți ceilalți clienți din grupul documentului, în afară de cel care a trimis update-ul
        await Clients.OthersInGroup(documentId).SendAsync("ReceiveDocumentUpdate", content);
    }
}
