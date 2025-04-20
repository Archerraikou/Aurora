using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Aurora.Services
{
    public class AppEmailSender : IAppEmailSender
    {
        private readonly IConfiguration _configuration;

        public AppEmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            // Fetch config values with null checks
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPortStr = _configuration["EmailSettings:SmtpPort"];
            var smtpUser = _configuration["EmailSettings:SmtpUser"];
            var smtpPass = _configuration["EmailSettings:SmtpPass"];
            var fromEmail = _configuration["EmailSettings:FromEmail"];

            // Validate required settings
            if (string.IsNullOrWhiteSpace(smtpHost) ||
                string.IsNullOrWhiteSpace(smtpPortStr) ||
                string.IsNullOrWhiteSpace(smtpUser) ||
                string.IsNullOrWhiteSpace(smtpPass) ||
                string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new Exception("Email configuration is missing required values.");
            }

            if (!int.TryParse(smtpPortStr, out int smtpPort))
            {
                throw new Exception("Invalid SMTP port number in configuration.");
            }

            var mail = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            using var smtp = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            await smtp.SendMailAsync(mail);
        }

    }
}
