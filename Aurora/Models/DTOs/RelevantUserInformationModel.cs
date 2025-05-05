namespace Aurora.Models.DTOs
{
    public class RelevantUserInformation
    {

        public string? Id {get;set;} 
        public string? Nick{get;set;} 

        public string? Email{get;set;}
        public string? ProfilePicturePath{get;set;}
        public string? ProfileDescription{get;set;}
        public List<string>? Interests {get;set;}

    }
}