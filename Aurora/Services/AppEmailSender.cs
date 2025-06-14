using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Aurora.Services
{
    public class AppEmailSender : IAppEmailSender
    {
        private readonly IConfiguration _configuration;

        // Constructor care primește configurația aplicației (de exemplu, din appsettings.json)

        public AppEmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            // Preluăm din configurație parametrii necesari pentru SMTP (server, port, user, parolă, email expeditor)
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPortStr = _configuration["EmailSettings:SmtpPort"];
            var smtpUser = _configuration["EmailSettings:SmtpUser"];
            var smtpPass = _configuration["EmailSettings:SmtpPass"];
            var fromEmail = _configuration["EmailSettings:FromEmail"];

            // Verificăm dacă toate setările sunt prezente; dacă lipsește vreuna, aruncăm excepție
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
            // Construim obiectul MailMessage cu datele email-ului
            var mail = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            // Configurăm clientul SMTP pentru trimiterea email-ului
            using var smtp = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };
            // Trimiterea efectivă a email-ului, asincron
            await smtp.SendMailAsync(mail);
        }

    }
}
