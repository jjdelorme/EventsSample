using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.IO;

namespace EventsSample.Authentication
{   
    public class ConfigureJwtBearerOptions : IConfigureNamedOptions<JwtBearerOptions>
    {
        private readonly AuthenticationSettings _authOptions;
        private readonly ILogger<ConfigureJwtBearerOptions> _log;

        public ConfigureJwtBearerOptions(IConfiguration config, ILogger<ConfigureJwtBearerOptions> log)
        {
            _log = log;
            _authOptions = config.GetSection(AuthenticationSettings.Section)
                .Get<AuthenticationSettings>();
        }

        public void Configure(JwtBearerOptions options)
        {
            Configure("", options);
        }

        public void Configure(string name, JwtBearerOptions options)
        {
            string ValidIssuer = _authOptions.ValidIssuer;
            string ValidAudience = _authOptions.ValidAudience;
            
            RSA rsa = GetPublicKey();

            options.IncludeErrorDetails = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new RsaSecurityKey(rsa),
                ValidateIssuer = true,
                ValidIssuer = ValidIssuer,
                ValidateAudience = true,
                ValidAudience = ValidAudience,
                CryptoProviderFactory = new CryptoProviderFactory()
                {
                    CacheSignatureProviders = false
                }
            };
        }

        private RSA GetPublicKey()
        {
            try 
            {
                var pem = File.ReadAllText(_authOptions.PublicKeyPemFile);

                RSA rsa = RSA.Create();
                rsa.ImportFromPem(pem);

                return rsa;
            }
            catch (Exception e)
            {
                _log.LogError("Unable to load public key.", e);
                throw;
            }
        }
    }
}