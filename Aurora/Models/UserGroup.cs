﻿using System.ComponentModel.DataAnnotations;

namespace Aurora.Models
{
    public class UserGroup
    {
        [Key]
        public int? Id { get; set; }
        public string? UserId { get; set; }
        public virtual ApplicationUser? User { get; set; }
        public int? GroupId { get; set; }
        public virtual Group? Group { get; set; }
        public string? Color { get; set; }
        public bool? IsAdmin { get; set; }
        public bool IsRequested { get; set; } // New field to track if the user has requested to join
        public bool IsApproved { get; set; }
    }
}
