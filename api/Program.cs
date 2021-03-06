using EventsSample;
using EventsSample.Authentication;
using Google.Cloud.Logging.Console;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction()) 
{
    await GoogleMetadata.SetConfigAsync(builder.Configuration);
    builder.Logging.AddGoogleCloudConsole();
}

// Services
builder.Services.AddSignalR();
builder.Services.AddHostedService<SubscriberService>();
builder.Services.AddSingleton<PublisherService>();
builder.Services.AddScoped<IRepository, FirestoreRepository>();
builder.Services.AddHttpClient();

// Controllers
builder.Services.AddControllers();

// AuthN/AuthZ
builder.Services.AddGoogleLoginJwt();

// Swagger/OpenAPI
builder.Services.AddSwaggerGen(options => 
    options.CustomOperationIds(api => GoogleMetadata.GetOperationId(api)));

#if DEBUG
builder.Services.AddCors(o => o.AddDefaultPolicy(builder => {
    builder.AllowAnyMethod();
    builder.AllowAnyHeader();
    builder.AllowAnyOrigin();
}));
#endif

var app = builder.Build();

#if DEBUG
app.UseCors();
#endif

app.MapControllers();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSwagger(GoogleMetadata.ConfigureSwagger);
app.UseSwaggerUI();

// signalR endpoint
app.MapHub<NotifyHub>("/notifyhub");

try 
{
    app.Run();
}
catch (Exception e)
{
    app.Logger.LogCritical(e, "Unhandled exception");
}