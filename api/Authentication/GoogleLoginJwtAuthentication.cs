using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace EventsSample.Authentication
{
    public static class GoogleLoginJwtAuthentication
    {
        public static void AddGoogleLoginJwt(this IServiceCollection services)
        {
            services.AddAuthentication(ConfigureAuthentication)
                .AddJwtBearer();
            services.AddSingleton<IConfigureOptions<JwtBearerOptions>, ConfigureJwtBearerOptions>();
            services.AddAuthorization();
        }
        
        static void ConfigureAuthentication(Microsoft.AspNetCore.Authentication.AuthenticationOptions options)
        {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }
    }
}