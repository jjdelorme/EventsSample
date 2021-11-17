namespace EventsSample
{   
    public class AuthenticationSettings
    {
        public static string Section = "JwtBearerOptions";
        public const string AdminRole = "Admin";

        public AuthenticationSettings()
        {}

        public string ValidIssuer { get; set; } = "";
        public string ValidAudience { get; set; } = "";
        public string PublicKeyPemFile { get; set; } = "";
        public string PrivateKeyPemFile { get; set; } = "";
        public string GoogleClientId { get; set; } = "";
    }
}                    