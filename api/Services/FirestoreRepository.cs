using Google.Cloud.Firestore;

namespace EventsSample
{
    public class FirestoreRepository : IRepository
    {
        private readonly ILogger<FirestoreRepository> _log;
        private readonly FirestoreDb _firestore;
        private readonly string _eventsCollection;
        private readonly string _usersCollection;

        public FirestoreRepository(IConfiguration config, ILogger<FirestoreRepository> log)
        {
            _eventsCollection = config.GetSection("MongoDb")["EventsCollectionName"];
            _usersCollection = config.GetSection("MongoDb")["UsersCollectionName"];
            _log = log;

            _firestore = new FirestoreDbBuilder
            {
                ProjectId = config["ProjectId"],
                ConverterRegistry = new ConverterRegistry
                {
                    new GenericFirestoreConverter<Event>("Id"),
                    new GenericFirestoreConverter<User>("Email")
                }
            }.Build();
        }

        public async Task<Event> CreateEventAsync(Event eventItem)
        {
            await _firestore.Collection(_eventsCollection)
                .Document(eventItem.Id)
                .SetAsync(eventItem);

            return eventItem;
        }

        public async Task<IEnumerable<Event>> GetEventsAsync()
        {
            Query query = _firestore.CollectionGroup(_eventsCollection);
            QuerySnapshot querySnapshot = await query.GetSnapshotAsync();

            IEnumerable<Event> events = querySnapshot.Documents
                .Select(d => d.ConvertTo<Event>());

            _log.LogDebug($"Found {events.Count()} events.");

            return events;
        }

        public async Task<Event> GetEventAsync(string id)
        {
            var docRef = _firestore.Collection(_eventsCollection)
                .Document(id);

            var snapshot = await docRef.GetSnapshotAsync();

            if (snapshot != null)
                return snapshot.ConvertTo<Event>();
            else
                return null;
        }

        public async Task DeleteEventAsync(string id)
        {
            var doc = _firestore.Collection(_eventsCollection)
                .Document(id);
            await doc.DeleteAsync();
        }

        public async Task<User> GetUserAsync(string id)
        {
            var doc = _firestore.Collection(_usersCollection)
                .Document(id);
            var snapshot = await doc.GetSnapshotAsync();

            if (snapshot != null)
                return snapshot.ConvertTo<User>();
            else
                return null;
        }

        public async Task CreateUserAsync(User user)
        {
            await _firestore.Collection(_usersCollection)
                .Document(user.Email)
                .SetAsync(user);
        }        
    }
}