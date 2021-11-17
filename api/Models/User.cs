namespace EventsSample
{
    public class User 
    {
        public string Id => Email;
        public string Email { get; set; }
        public string Name { get; set; }
        public string PictureUrl { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime LastLogin { get; set; }
    }
}