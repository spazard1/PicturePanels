using CloudStorage.Services;

namespace CloudStorage.Services
{
    public class ConnectionStringProvider : IConnectionStringProvider
    {
        public string ConnectionString => "***REMOVED***";

        public string AccountKey {
            get {
                var startIndex = ConnectionString.IndexOf("AccountKey=") + "AccountKey=".Length;
                var length = ConnectionString.IndexOf(";", startIndex) - startIndex;
                return ConnectionString.Substring(startIndex, length);
            }
        }
    }
}
