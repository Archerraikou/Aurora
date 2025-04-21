using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Aurora.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace Aurora.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>();
            builder.HasDefaultSchema("identity");
        }
        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<Category> Categorys { get; set; }
        public DbSet<CategoryGroups> CategoryGroups { get; set; }
        public DbSet<CategoryUser> CategoryUsers { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Models.File> Files { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<PrivateConversation> PrivateConversations { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<UserGroup> UserGroups { get; set; }
        public DbSet<UserEvent> UserEvents { get; set; }
    }
}