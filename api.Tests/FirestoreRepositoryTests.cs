using System;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using EventsSample;
using Xunit;
using Moq;

namespace api.Tests;

public class FirestoreRepositoryTests
{
    private readonly IRepository _repository;

    public FirestoreRepositoryTests()
    {
        _repository = CreateRepository();
    }

    [Fact]
    public async Task TestCreateEventAsync()
    {
        Event item = new Event() {
            Id = Guid.NewGuid().ToString(),
            Type = "Test",
            Date = DateTime.Now.ToString(),
            Product = "Test Shoes",
            Description = "Testing"
        };
        
        await _repository.CreateEventAsync(item);
    }

    [Fact]
    public async Task TestGetUser()
    {
        var user = await _repository.GetUserAsync("test@gmail.com");
        Assert.NotNull(user);
        Assert.True(user.Email == "test@gmail.com");
    }

    [Fact]
    public async Task TestGetEvents()
    {
        var events = await _repository.GetEventsAsync();
        var list = events.ToList();

        var count = list.Count();
        Assert.True(count >= 1);
        
        var item = events.First();

        Assert.NotNull(item);
    }

    [Fact]
    public async Task TestCreateUserAsync()
    {
        var user = new User
        {
            Email = "test@gmail.com",
            Name = "Test Tester",
            IsAdmin = true,
            // LastLogin = DateTime.UtcNow
        };

        await _repository.CreateUserAsync(user);
    }

    private IRepository CreateRepository()
    {
        var configDir = Path.Combine(
            Directory.GetCurrentDirectory(),
            "../../../../api");

        var config = new ConfigurationBuilder()
                .SetBasePath(configDir)
                .AddJsonFile("appsettings.json")
                .AddJsonFile("appsettings.Development.json", optional: false)
                .Build();

        var publisher = new Mock<PublisherService>(
            config, 
            new Mock<ILogger<PublisherService>>().Object
        ).Object;
        
        IRepository repository = new FirestoreRepository(config, 
            new Mock<ILogger<FirestoreRepository>>().Object, 
            publisher);

        return repository;        
    }    
}