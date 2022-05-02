using PicturePanels.Services;
using PicturePanels.Services.Authentication;

namespace PicturePanels.Services
{
    public class ConnectionStringProvider : IConnectionStringProvider
    {
        public ConnectionStringProvider(SecretProvider secretProvider)
        {
            this.ConnectionString = secretProvider.LoadSecretAsync("picturegame-storageaccount").Result;
        }

        public string ConnectionString { get; }

        public string AccountKey {
            get {
                var startIndex = ConnectionString.IndexOf("AccountKey=") + "AccountKey=".Length;
                var length = ConnectionString.IndexOf(";", startIndex) - startIndex;
                return ConnectionString.Substring(startIndex, length);
            }
        }
    }
}
