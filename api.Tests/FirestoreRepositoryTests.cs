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
    private User _testUser;

    public FirestoreRepositoryTests()
    {
        _repository = CreateRepository();
        _testUser = new User
        {
            Email = "test@test.com",
            Name = "Test Tester",
            IsAdmin = true,
            // LastLogin = DateTime.UtcNow
        };
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
        var user = await _repository.GetUserAsync(_testUser.Email);
        Assert.NotNull(user);
        Assert.True(user.Email == _testUser.Email);
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
        await _repository.CreateUserAsync(_testUser);
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
            new Mock<ILogger<FirestoreRepository>>().Object);

        return repository;        
    }    
}