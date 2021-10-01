using MongoDB.Driver;

namespace EventsSample
{
    public class EventRespository
    {
        private readonly IMongoCollection<Event> _events;
        private readonly ILogger<EventRespository> _log;
        private readonly PublisherService _publisher;

        public EventRespository(IConfiguration config,
            ILogger<EventRespository> log, 
            PublisherService publisher)
        {
            _log = log;
            _publisher = publisher;

            var connectionString = config["ConnectionString"];
            var databaseName = config["DatabaseName"];
            var collectionName = config["CollectionName"];

            if (string.IsNullOrEmpty(connectionString) || 
                string.IsNullOrEmpty(databaseName) ||
                string.IsNullOrEmpty(collectionName))
            {
                throw new ApplicationException("You must configure ConnectionString, DatabaseName, CollectionName");
            }

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _events = database.GetCollection<Event>(collectionName);
        }

        public IEnumerable<Event> Get() =>
            _events.Find(book => true).ToList();

        public Event Get(string id) =>
            _events.Find<Event>(e => e.Id == id).FirstOrDefault();

        public async Task<Event> CreateAsync(Event eventItem)
        {
            _events.InsertOne(eventItem);
            
            _log.LogInformation($"Created event id:{eventItem.Id}");
            
            await _publisher.PublishAsync(eventItem);

            return eventItem;
        }

        public void Delete(string id) =>
            _events.DeleteOne(eventItem => eventItem.Id == id);
    }
}