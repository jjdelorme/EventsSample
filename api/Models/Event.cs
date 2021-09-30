namespace EventsSample
{
    public class Event
    {
        // [BsonId]
        // [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        // [BsonElement("Name")]
        public string Type { get; set; }

        public string Date { get; set; }

        public string Product { get; set; }

        public string Description { get; set; }
    }
}