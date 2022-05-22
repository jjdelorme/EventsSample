using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Google.Apis.Auth;
using EventsSample.Authentication;
using Microsoft.Net.Http.Headers;
using System.Text.Json;

namespace EventsSample
{
    [Route("[controller]")]
    public class UserController : Controller
    {
        private readonly JwtGenerator _jwtGenerator;
        private readonly IRepository _repository;
        private readonly ILogger<UserController> _log;
        private readonly AuthenticationSettings _authConfig;
        private readonly IHttpClientFactory _httpClientFactory;

        public UserController(ILogger<UserController> log, 
                IConfiguration config, IRepository repository,
                IHttpClientFactory httpClientFactory)
        {
            _authConfig = config.GetSection(AuthenticationSettings.Section)
                .Get<AuthenticationSettings>();

            _log = log;
            _repository = repository;
            _jwtGenerator = new JwtGenerator(_authConfig);
            _httpClientFactory = httpClientFactory;
        }

        [AllowAnonymous]
        [HttpGet("/user/clientid")]
        public string GoogleClientId()
        {
            return _authConfig.Enabled ? _authConfig.GoogleClientId : "";
        }

        [AllowAnonymous]
        [HttpGet("/users")]
        public async Task<IEnumerable<User>> ListUsers()
        {
            return await _repository.GetUsersAsync();
        }

        [AllowAnonymous]
        [HttpGet("authenticate")]
        public async Task<IActionResult> AuthCode([FromQuery] GoogleCodeResponse codeResponse)
        {
            User user = null;
            GoogleJsonWebSignature.Payload payload = null;

            try
            {
                if (_authConfig.Enabled)
                {
                    var tokenResponse = await ExchangeCodeForTokensAsync(codeResponse.code);

                    var validationSettings = new GoogleJsonWebSignature.ValidationSettings();
                    validationSettings.Audience = new string[] { _authConfig.GoogleClientId };

                    payload = GoogleJsonWebSignature.ValidateAsync(
                            tokenResponse.IdToken, validationSettings).Result;                
                    
                    // save refresh_token
                    #warning TODO: implement saving refresh token

                    user = await _repository.GetUserAsync(payload.Email);
                }
                else
                {
                    user = new User { Email = "noemail@noemail.com", IsAdmin = true };
                    payload = new GoogleJsonWebSignature.Payload();
                }

                return Ok(new { 
                    AuthToken = _jwtGenerator.CreateUserAuthToken(user),
                    Name = payload.Name,
                    Picture = payload.Picture,
                    IsAdmin = user.IsAdmin 
                });
            }
            catch (Exception e)
            {
                string error = $"Unable to exchange auth code for token"; 
                _log.LogError(error, e);
                
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

        [Authorize(Roles = AuthenticationSettings.AdminRole)]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody]User user)
        {
            try
            {
                await _repository.CreateUserAsync(user);
                return Ok(user);
            }
            catch (Exception e)
            {
                string error = $"Unable to create user {user.Email}"; 
                _log.LogError(error, e);
                
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

        private async Task<GoogleTokenResponse> ExchangeCodeForTokensAsync(string authCode)
        {
            const string tokenUrl = "https://oauth2.googleapis.com/token";
            GoogleTokenResponse tokenResponse = null;

            var formContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("code", authCode),
                new KeyValuePair<string, string>("client_id", _authConfig.GoogleClientId),
                new KeyValuePair<string, string>("client_secret", _authConfig.GoogleClientSecret),
                new KeyValuePair<string, string>("redirect_uri", _authConfig.RedirectUri),
                new KeyValuePair<string, string>("grant_type", "authorization_code")
            });

            var httpClient = _httpClientFactory.CreateClient();
            var httpResponseMessage = await httpClient.PostAsync(tokenUrl, formContent);

            if (httpResponseMessage.IsSuccessStatusCode)
            {
                using var contentStream =
                    await httpResponseMessage.Content.ReadAsStreamAsync();
                
                tokenResponse = await JsonSerializer.DeserializeAsync<GoogleTokenResponse>(
                    contentStream);
            }
            else
            {
                var error = await httpResponseMessage.Content.ReadAsStringAsync();
                _log.LogError($"Unable to exchange code for token: {error}");
            }

            return tokenResponse;
        }
    }
}