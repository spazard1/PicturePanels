using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System;

namespace PicturePanels.Services.Authentication
{
    public class KeyVaultProvider
    {

        public SecretClient SecretClient { get; }

        public KeyVaultProvider()
        {
            SecretClient=  new SecretClient(vaultUri: new Uri("https://picturepanels.vault.azure.net/"), 
                credential: new DefaultAzureCredential());
        }
    }
}
