namespace Aurora.Models.DTOs
{
    public class RelevantUserInformation
    {

        public string? Id {get;set;} 
        public string? Nick{get;set;} 

        public string? Email{get;set;}
        public string? ProfilePicture{get;set;}
        public string? ProfileDescription{get;set;}
        public virtual ICollection<CategoryUser>? Interests {get;set;}

    }
}