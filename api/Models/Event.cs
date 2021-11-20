namespace EventsSample
{
    public class InventoryEvent
    {
        public int Units { get; set; }
        public DateTime Timestamp { get; set; }
        public User User { get; set; }
    }

    public class Product
    {
        public string Name { get; set; }
        public string Sku { get; set; }
        public IEnumerable<InventoryEvent> History { get; set; }
    }
    public class Event
    {
        public string Id { get; set; }

        public string Type { get; set; }

        public string Date { get; set; }

        public string Product { get; set; }
        
        public Product ProductObject { get; set; }

        public string Description { get; set; }
    }
}