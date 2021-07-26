using PicturePanels.Services;

namespace PicturePanels.Services
{
    public class ConnectionStringProvider : IConnectionStringProvider
    {
        public string ConnectionString => "DefaultEndpointsProtocol=https;AccountName=picturegame;AccountKey=3gzq80T8YC4vGwWg9PbrbIdKng0nDxnDgjt43XKKrxM9NXzCDWyZGW+iTbk4bKDlx7aqvzh2Yr853KkMQ6DSvw==;EndpointSuffix=core.windows.net";

        public string AccountKey {
            get {
                var startIndex = ConnectionString.IndexOf("AccountKey=") + "AccountKey=".Length;
                var length = ConnectionString.IndexOf(";", startIndex) - startIndex;
                return ConnectionString.Substring(startIndex, length);
            }
        }
    }
}
