using System.Text.Json;
using Google.Cloud.PubSub.V1;

namespace EventsSample
{
    public class NotificationService
    {
        private ILogger<NotificationService> _log;
        private PublisherClient _publisher;
     
        public NotificationService(IConfiguration config, ILogger<NotificationService> log)
        {
            _log = log;
            string topicId = config["TopicId"];
            string projectId = config["ProjectId"];

            if (topicId == null || projectId == null)
                throw new ArgumentNullException(
                    "You must configure values for PubSub `TopicId`, `ProjectId`");

            TopicName topicName = TopicName.FromProjectTopic(projectId, topicId);
            _publisher = PublisherClient.Create(topicName);
        }

        public async Task PublishAsync(Event item)
        {
            string message = JsonSerializer.Serialize<Event>(item,
                new JsonSerializerOptions
                    { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            try
            {
                string messageId = await _publisher.PublishAsync(message);
                _log.LogDebug($"Published message: {messageId}");
            }
            catch (Exception exception)
            {
                _log.LogError($"An error ocurred when publishing message {message}: " +
                    $"{exception.Message}");
            }                        
        }
    }
}