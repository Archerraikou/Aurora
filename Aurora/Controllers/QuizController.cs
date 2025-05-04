using Aurora.Models;
using Aurora.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public QuizController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
    }

    [HttpPost("generate")]
    [Authorize]
    public async Task<IActionResult> GenerateQuiz([FromBody] QuizModel request)
    {
        var prompt = "You are an API generating quiz questions for a web app.Return between 10-15 multiple choice questions in this strict JSON format:[  {   \"question\": \"<text>\",    \"options\": [\"<option1>\", \"<option2>\", \"<option3>\", \"<option4>\"],    \"correct\": <index_of_correct_option>  },  ...]Do not include any text before or after the JSON array.The topic is: " + request.Topic + ". Keep each question short and factual. Make incredibly sure the answers are correct";

        var requestBody = new
        {
            model = "mistral",
            prompt = prompt,
            stream = false,
            format = "json" // Optional: only works with supported models
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );

        try
        {
            Console.WriteLine("[LLM] Sending prompt to Ollama...");

            var response = await _httpClient.PostAsync("http://localhost:11434/api/generate", jsonContent);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine("[LLM] Raw response body:");
            Console.WriteLine(responseBody);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Failed to get a response from the model.");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var raw = doc.RootElement.GetProperty("response").GetString();

            if (string.IsNullOrWhiteSpace(raw))
            {
                return BadRequest("The model returned an empty response.");
            }

            // Try to extract the array manually
            var start = raw.IndexOf('[');
            var end = raw.LastIndexOf(']');
            if (start == -1 || end == -1 || end <= start)
            {
                Console.WriteLine("Could not find a complete JSON array in response.");
                return BadRequest("The model's output was not valid JSON.");
            }

            var questionsJson = raw.Substring(start, end - start + 1);

            Console.WriteLine("[LLM] Extracted JSON block:");
            Console.WriteLine(questionsJson);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var questions = JsonSerializer.Deserialize<List<QuizQuestion>>(questionsJson, options);

            return Ok(new { questions });
        }
        catch (JsonException jex)
        {
            Console.WriteLine("[Error] JSON parsing failed: " + jex.Message);
            return StatusCode(500, "Could not parse the quiz output.");
        }
        catch (Exception ex)
        {
            Console.WriteLine("[Error] Unexpected: " + ex.Message);
            return StatusCode(500, "Error generating quiz.");
        }
    }
}