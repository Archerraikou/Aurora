﻿using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Aurora.Models.DTOs
{
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}