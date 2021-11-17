using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Google.Apis.Auth;
using EventsSample.Authentication;

namespace EventsSample
{
    [Route("[controller]")]
    public class UserController : Controller
    {
        public class AuthenticateRequest
        {
            [Required]
            public string IdToken { get; set; } = "";
        }

        private readonly JwtGenerator _jwtGenerator;
        private readonly IRepository _repository;
        private readonly ILogger<UserController> _log;
        private readonly string _googleClientId;

        public UserController(ILogger<UserController> log, 
                IConfiguration config, IRepository repository)
        {
            var jwtConfig = config.GetSection(AuthenticationSettings.Section)
                .Get<AuthenticationSettings>();

            _log = log;
            _repository = repository;
            _jwtGenerator = new JwtGenerator(jwtConfig);
            _googleClientId = jwtConfig.GoogleClientId;
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] AuthenticateRequest data)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            settings.Audience = new string[] { _googleClientId };
            
            var payload = GoogleJsonWebSignature.ValidateAsync(
                data.IdToken, settings).Result;

            User user = await _repository.GetUserAsync(payload.Email);

            if (user == null)
            {
                _log.LogError($"Unable to find a user with email {payload.Email} in repository.");
                return Unauthorized();
            }

            return Ok(new { 
                AuthToken = _jwtGenerator.CreateUserAuthToken(user),
                Name = payload.Name,
                Picture = payload.Picture,
                IsAdmin = user.IsAdmin 
            });
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
    }
}