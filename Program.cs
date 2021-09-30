using EventsSample;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddHostedService<MessagingService>();
builder.Services.AddSingleton<NotificationService>();
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

app.MapPost("/events", async (HttpContext http, EventService eventService) => {
    if (!http.Request.HasJsonContentType())
    {
        http.Response.StatusCode = StatusCodes.Status415UnsupportedMediaType;
        return;
    }
    
    var eventItem = await http.Request.ReadFromJsonAsync<Event>();
    await eventService.CreateAsync(eventItem);
    
    await http.Response.WriteAsJsonAsync(eventItem);    
});

app.Run();