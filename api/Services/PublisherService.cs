using System.Text.Json;
using Google.Cloud.PubSub.V1;

namespace EventsSample
{
    /// <summary>
    /// Responsible for publishing an <see ref="EventsSample.Event"/> as a message
    /// to a pub/sub topic.
    /// <summary>
    /// <remarks>
    /// The primary purpose of this class is to demonstrate publishing a message to
    /// a Goolge pub/sub topic. 
    /// </remarks>    
    public class PublisherService
    {
        private ILogger<PublisherService> _log;
        private PublisherClient _publisher;
     
        public PublisherService(IConfiguration config, ILogger<PublisherService> log)
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

        /// <summary>
        /// Publishes new Event messages to the configured PubSub topic.
        /// </summary>
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