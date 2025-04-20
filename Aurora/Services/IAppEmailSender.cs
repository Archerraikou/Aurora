using System.Threading.Tasks;

namespace Aurora.Services
{
    public interface IAppEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    }
}
