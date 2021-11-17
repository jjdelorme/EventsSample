namespace EventsSample
{   
    public class MongoDbSettings
    {
        public static string Section = "MongoDb";

        public MongoDbSettings()
        {}

        public string ConnectionString { get; set; } = "";
        public string DatabaseName { get; set; } = "";
        public string EventsCollectionName { get; set; } = "";
        public string UsersCollectionName { get; set; } = "";
    }
}                    