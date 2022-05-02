﻿using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System;

namespace PicturePanels.Services.Authentication
{
    public class KeyVaultProvider
    {

        public SecretClient SecretClient { get; }

        public KeyVaultProvider()
        {
            var options = new DefaultAzureCredentialOptions();
            options.VisualStudioTenantId = "f6c0e524-fbeb-44d7-851f-48fcaa6c6044";

            SecretClient =  new SecretClient(vaultUri: new Uri("https://picturepanels.vault.azure.net/"), 
                credential: new DefaultAzureCredential(options));
        }
    }
}
