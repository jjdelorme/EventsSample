namespace EventsSample
{
    public interface IRepository
    {
        Task<IEnumerable<Event>> GetEventsAsync();
        Task<Event> GetEventAsync(string id);
        Task<Event> CreateEventAsync(Event eventItem);
        Task DeleteEventAsync(string id);
        Task<User> GetUserAsync(string email);
        Task CreateUserAsync(User user);
    }
}
