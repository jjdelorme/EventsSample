using System.Text.Json;
using Google.Cloud.PubSub.V1;
using Google.Api.Gax.Grpc.GrpcNetClient;
using Google.Protobuf;

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
        private PublisherServiceApiClient _publisher;
        private TopicName _topicName;
     
        public PublisherService(IConfiguration config, ILogger<PublisherService> log)
        {
            _log = log;
            string topicId = config["TopicId"];
            string projectId = config["ProjectId"];

            if (topicId == null || projectId == null)
                throw new ArgumentNullException(
                    "You must configure values for PubSub `TopicId`, `ProjectId`");

            _topicName = TopicName.FromProjectTopic(projectId, topicId);

            _publisher = new PublisherServiceApiClientBuilder
            {
                GrpcAdapter = GrpcNetClientAdapter.Default
            }.Build();

            // _publisher.CreateTopic(_topicName);
        }

        /// <summary>
        /// Publishes new Event messages to the configured PubSub topic.
        /// </summary>
        public async Task PublishAsync(Event item)
        {
            string data = JsonSerializer.Serialize<Event>(item,
                new JsonSerializerOptions
                    { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            try
            {
                // Publish a message to the topic.
                PubsubMessage message = new PubsubMessage
                {
                    // The data is any arbitrary ByteString. Here, we're using text.
                    Data = ByteString.CopyFromUtf8(data)
                };
                var response = await _publisher.PublishAsync(_topicName, new[] { message });
                string messageId = response.MessageIds.FirstOrDefault();
                
                _log.LogDebug($"Published message: {messageId}");
            }
            catch (Exception exception)
            {
                _log.LogError($"An error ocurred when publishing message {data}: " +
                    $"{exception.Message}");
            }                        
        }
    }
}