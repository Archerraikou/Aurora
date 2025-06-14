using Aurora.Data;
using Aurora.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{    // Injectarea contextului bazei de date
    private readonly ApplicationDbContext _context;

    public DocumentController(ApplicationDbContext context)
    {
        _context = context;
    }
    // Returnează documentul asociat unui anumit grup.

    [HttpGet("group/{groupId}")]
    public async Task<IActionResult> GetDocumentByGroup(int groupId)
    {   // Caută primul document asociat cu groupId
        var doc = await _context.Documents.FirstOrDefaultAsync(d => d.GroupId == groupId);
        if (doc == null) return NotFound();
        return Ok(doc);
    }
    // Creează un nou document (accesibil doar pentru Admini).
    [HttpPost("create")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDocument([FromBody] Document document)
    {
        // Setează data curentă ca dată de creare
        document.CreatedDate = DateTime.UtcNow;
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return Ok(document);
    }
    // Actualizează un document existent.
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDocument(int id, [FromBody] Document updatedDoc)
    {
        var existing = await _context.Documents.FindAsync(id);
        if (existing == null) return NotFound();
        // Actualizează câmpurile esențiale
        existing.Title = updatedDoc.Title;
        existing.Content = updatedDoc.Content;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }
    // Șterge un document (doar Admin).
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var doc = await _context.Documents.FindAsync(id);
        if (doc == null) return NotFound();

        _context.Documents.Remove(doc);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
