using MongoDB.Driver;

namespace EventsSample
{
    public class MongoDbRepository : IRepository
    {
        private readonly IMongoCollection<Event> _events;
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<MongoDbRepository> _log;
        private readonly PublisherService _publisher;

        public MongoDbRepository(IConfiguration config,
            ILogger<MongoDbRepository> log, 
            PublisherService publisher)
        {
            _log = log;
            _publisher = publisher;

            var mongoConfig = config.GetSection(MongoDbSettings.Section)
                .Get<MongoDbSettings>();

            var client = new MongoClient(mongoConfig.ConnectionString);
            var database = client.GetDatabase(mongoConfig.DatabaseName);
            _events = database.GetCollection<Event>(mongoConfig.EventsCollectionName);
            _users = database.GetCollection<User>(mongoConfig.UsersCollectionName);
        }

        #region Events
        public async Task<IEnumerable<Event>> GetEventsAsync() 
        {
            var events = await _events.FindAsync<Event>(e => true);
            return events.ToEnumerable<Event>();
        }

        public async Task<Event> GetEventAsync(string id)
        {
            var result = await _events.FindAsync<Event>(e => e.Id == id);
            return result.FirstOrDefault();
        }

        public async Task<Event> CreateEventAsync(Event eventItem)
        {
            _events.InsertOne(eventItem);
            
            _log.LogInformation($"Created event id:{eventItem.Id}");
            
            await _publisher.PublishAsync(eventItem);

            return eventItem;
        }

        public async Task DeleteEventAsync(string id) 
        {
            await _events.DeleteOneAsync<Event>(eventItem => eventItem.Id == id);
        }
        #endregion

        #region Users
        public async Task<User> GetUserAsync(string email) 
        {
            var result = await _users.FindAsync<User>(e => e.Email == email);
            return result.FirstOrDefault();
        }
        
        public async Task CreateUserAsync(User user)
        {
             await _users.InsertOneAsync(user);
            
            _log.LogInformation($"Created user:{user.Email}");
        }
        #endregion
    }
}
