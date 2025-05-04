namespace Aurora.Models.DTOs
{
    public class TokenRefreshRequest
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
