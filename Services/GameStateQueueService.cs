using Azure.Messaging.ServiceBus;

namespace PicturePanels.Services
{
    public class GameStateQueueService
    {
        public ServiceBusSender Sender { get; }
        public ServiceBusReceiver Receiver { get; }

        public GameStateQueueService()
        {
            var client = new ServiceBusClient("Endpoint=sb://picturepanels.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=TJLwj1a8CdqLrFrJeBaAGuUwulEbe9GbhHwK8WhQGdQ=");

            Sender = client.CreateSender("gamestateupdates");
            Receiver = client.CreateReceiver("gamestateupdates");
        }
    }
}
