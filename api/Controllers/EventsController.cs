using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventsSample
{
    [Route("[controller]")]
    public class EventsController : Controller
    {
        private readonly ILogger<EventsController> _log;
        private readonly IRepository _repository;

        public EventsController(ILogger<EventsController> log, 
            IRepository respository)
        {
            _log = log;
            _repository = respository;
        }

        [HttpGet]
        public async Task<IEnumerable<Event>> Get()
        {
            return await _repository.GetEventsAsync();
        }

        [Authorize]
        [HttpPost]
        public async Task CreateAsync([FromBody]Event eventItem)
        {
            var http = this.HttpContext;

            if (!http.Request.HasJsonContentType() || eventItem == null || 
                    eventItem.Id == null)
            {
                http.Response.StatusCode = StatusCodes.Status415UnsupportedMediaType;
                return;
            }
                       
            if (eventItem != null)
            {
                await _repository.CreateEventAsync(eventItem);
                await http.Response.WriteAsJsonAsync(eventItem);    
            }
            else
            {
                http.Response.StatusCode = StatusCodes.Status400BadRequest;
                return;
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
         public async Task Delete(string id) 
        {
            await _repository.DeleteEventAsync(id);
            _log.LogInformation($"Deleted id {id}");
            this.HttpContext.Response.StatusCode = StatusCodes.Status200OK;            
        }
    }
}