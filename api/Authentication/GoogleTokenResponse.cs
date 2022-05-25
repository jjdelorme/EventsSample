/*
{
    "access_token": "ya29.a0ARrdaM-lybM2p-XQGNo0kCxQyaYhN9MrrM4wOLABeSO69jCK7ElIXVZLUf2D23HvyQIJ7p9lbpvn5GZjG5p4onBurBHlaJO5Ninma01yYnP90b6wyv9EJ_qgkv-JhvgEifg1t-UkM0VHpGYs5DA015QBopkD",
    "expires_in": 3599,
    "refresh_token": "1//0dxROh0A74Dp7CgYIARAAGA0SNwF-L9IrQTNPOkp-7vmXggURLQFr847uv4g4rW9XXve4IAxxyUfkN3HomFm3dLswke4XdAxQZ9Q",
    "scope": "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    "token_type": "Bearer",
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4NmYxNjQ4MjAwNWEyY2RhZjI2ZDkyMTQwMThkMDI5Y2E0NmZiNTYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NDIyNTgzMzY0OTgtMWc0dWdwczRrbDk5ZXZ2NnV0OGZtcmE1cDJsbHQydnEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NDIyNTgzMzY0OTgtMWc0dWdwczRrbDk5ZXZ2NnV0OGZtcmE1cDJsbHQydnEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg5ODQzNzMzNzI5NTY4NjI4MTEiLCJoZCI6Imphc29uZGVsLmFsdG9zdHJhdC5jb20iLCJlbWFpbCI6ImFkbWluQGphc29uZGVsLmFsdG9zdHJhdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Ii1yV2IyTF9xRDhRZW9HcGJPdV95N1EiLCJuYW1lIjoiSmFzb24gRGUgTG9ybWUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFUWEFKemJ6UGRKQnROVC1mOThIbmdIWHdBcmhxVFVWY2czdmdlU1JWQm49czk2LWMiLCJnaXZlbl9uYW1lIjoiSmFzb24iLCJmYW1pbHlfbmFtZSI6IkRlIExvcm1lIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NTMwNDA4OTcsImV4cCI6MTY1MzA0NDQ5N30.kBGbGVX6fNT3CVeoDw_ugaRl1DdOCioP3y60DGYshQAuTV6ogI-I5hBGYh71jTHJUUPu763BJM6bMY8HkquHyGhjr_xeUeV8dVgJerreQZVmf7K5EBy-6wJRb2fZkH3Rxee1O2_gQj0J9GJ71lN3x3hh3IO_XIkac6ucLsigAtLnEtMC2dv0-yRQaUjXknaEGcO3IYSvuNMwrkARSbclB6XMAX7xNfJmfif15nIsNPfrs-PNC0xklVZLcYkW6E8QGLqtCwtCQjPzi9MP30HsXHhKybsOQMh3XTOUvjnISRfCbZEfUxI5y_3gqxShvUgF1-hsL9WauoA9S3KUOOvFKw"
  }%   
  */
using System.Text.Json.Serialization;

namespace EventsSample.Authentication
{
    public class GoogleTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }
        
        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
        
        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }
        
        [JsonPropertyName("scope")]
        public string Scope { get; set; }
        
        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }
        
        [JsonPropertyName("id_token")]
        public string IdToken { get; set; }
    }
}