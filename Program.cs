using EventsSample;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddHostedService<MessagingService>();
builder.Services.AddSingleton<EventService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

app.UseEndpoints(endpoints =>
    endpoints.MapHub<NotifyHub>("/notifyhub")
);

app.MapGet("/events", (HttpContext http, EventService eventService) => 
    eventService.Get()
);

app.MapPost("/events", (context) => {
    Console.WriteLine("Got id: " + context.Request.Form["id"]);
    return null;
});

app.Run();