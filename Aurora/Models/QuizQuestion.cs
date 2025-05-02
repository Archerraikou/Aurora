namespace Aurora.Models
{
    public class QuizQuestion
    {
        public string Question { get; set; }
        public List<string> Options { get; set; }
        public int Correct { get; set; }
    }
}
