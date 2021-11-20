using Text = System.Text;
using Google.Cloud.PubSub.V1;
using Google.Api.Gax.ResourceNames;
using Grpc.Core;
using Microsoft.AspNetCore.SignalR;

namespace EventsSample
{
    /// <summary>
    /// Responsible for subscribing to a pub/sub topic and notifying the 
    /// signalR service when a message is sent to the topic.
    /// <summary>
    /// <remarks>
    /// The primary purpose of this class is to demonstrate subscribing to
    /// a Goolge pub/sub topic and acting on messages. 
    /// </remarks>
    public class SubscriberService : IHostedService
    {
        private ILogger<SubscriberService> _log;
        private IHubContext<NotifyHub> _hub;        
        private string _projectId;
        private string _topicId;
        private string _subscriptionId;
        private SubscriptionName _subscriptionName;
        private SubscriberClient _subscriber;
        private Task _processorTask;

        public SubscriberService(ILogger<SubscriberService> log, 
            IConfiguration config, IHubContext<NotifyHub> hub)
        {
            _log = log;
            _hub = hub;
            _topicId = config["TopicId"];
            _projectId = config["ProjectId"];

            if (_topicId == null || _projectId == null)
                throw new ArgumentNullException(
                    "You must configure values for PubSub `TopicId`, `ProjectId`");

            _subscriptionId = $"{_topicId}_{Guid.NewGuid().ToString()}";
        }

        /// <summary>
        /// Automatically called by ASP.NET on startup.  Creates a subscription to
        /// the configured PubSub topic and listens in "Pull" mode to the subscription.
        /// </summary>
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            TopicName topic = GetTopic();
            
            CreateSubscription(topic);
            
            _subscriber = await SubscriberClient.CreateAsync(_subscriptionName);
            
            _processorTask = _subscriber.StartAsync(ProcessMessageAsync);
        }

        /// <summary>
        /// Automatically called by ASP.NET on shutdown.  
        /// </summary>
        public async Task StopAsync(CancellationToken cancellationToken)
        {
            if (_subscriber != null)
            {
                await _subscriber.StopAsync(CancellationToken.None);
            }
            
            DeleteSubscription();
        }

        /// <summary>
        /// Creates a unique subscription for this service to listen to the topic which
        /// is intended to exist only for the duration of this service instance.
        /// </summary>
        private void CreateSubscription(TopicName topicName)
        {
            SubscriberServiceApiClient subscriber = SubscriberServiceApiClient.Create();

            _subscriptionName = SubscriptionName.FromProjectSubscription(
                _projectId, _subscriptionId);

            try
            {
                subscriber.CreateSubscription(
                    _subscriptionName, topicName, pushConfig: null, ackDeadlineSeconds: 60);
                
                _log.LogInformation($"Created subscription: {_subscriptionId}");
                
            }
            catch (RpcException e) when (e.Status.StatusCode == StatusCode.AlreadyExists)
            {
                // Already exists.  That's fine.
            }
        }

        /// <summary>
        /// Deletes the subscription.  This subscription is intended to only exist
        /// while this instance of the service is running.
        /// </summary>
        private void DeleteSubscription()
        {
            SubscriberServiceApiClient subscriber = SubscriberServiceApiClient.Create();
            subscriber.DeleteSubscription(_subscriptionName);      
            _log.LogInformation($"Deleted subscription: {_subscriptionId}");      
        }

        /// <summary>
        /// Get the existing PubSub topic, or create if it does not exist.
        /// </summary>
        private TopicName GetTopic()
        {
            TopicName topicName = TopicName.FromProjectTopic(_projectId, _topicId);

            PublisherServiceApiClient publisher = PublisherServiceApiClient.Create();
            ProjectName projectName = ProjectName.FromProject(_projectId);
            IEnumerable<Topic> topics = publisher.ListTopics(projectName);

            Topic topic = topics.FirstOrDefault(t => t.TopicName.TopicId == _topicId);
            
            if (topic == default(Topic))
            {
                // No topic exists, create new topic
                topic = publisher.CreateTopic(new Topic { 
                    Name = _topicId,
                    TopicName = topicName });

                _log.LogInformation($"Created new '{_topicId}' topic.");
            }

            return topicName;
        }

        /// <summary>
        /// Invoked when a new message is delivered to the subscription.
        /// Parses the message and notifies all the registered web clients.
        /// </summary>
        private async Task<SubscriberClient.Reply> ProcessMessageAsync(
            PubsubMessage message, 
            CancellationToken cancel)
        {
            SubscriberClient.Reply reply = SubscriberClient.Reply.Nack;

            if (cancel.IsCancellationRequested)
            {
                return reply;
            }

            try
            {               
                string json = Text.Encoding.UTF8.GetString(message.Data.ToArray());
                
                _log.LogInformation($"Received message id:{message.MessageId}, " +
                    $"Body:{json}");

                // Send a message to all signalR clients connected.
                await _hub.Clients.All.SendAsync("newEventMessage", json);

                reply = SubscriberClient.Reply.Ack;
            }
            catch (Exception e)
            {
                _log.LogError($"Error reading message {message.MessageId}.", e);
            }
            
            return reply;
        }
   }
}