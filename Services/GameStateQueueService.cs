using Azure.Messaging.ServiceBus;

namespace PicturePanels.Services
{
    public class GameStateQueueService
    {
        public ServiceBusSender Sender { get; }
        public ServiceBusReceiver Receiver { get; }

        public GameStateQueueService()
        {
            var client = new ServiceBusClient("***REMOVED***");

            Sender = client.CreateSender("gamestateupdates");
            Receiver = client.CreateReceiver("gamestateupdates");
        }
    }
}
