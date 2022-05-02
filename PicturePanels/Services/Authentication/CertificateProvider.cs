﻿using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System;
using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace PicturePanels.Services.Authentication
{
    public class CertificateProvider
    {
        private X509Certificate2 certificate;

        private async Task<X509Certificate2> LoadCertificateAsync()
        {
            try
            {
                var client = new SecretClient(vaultUri: new Uri("https://picturepanels.vault.azure.net/"), credential: new DefaultAzureCredential());
                var certificateWithPolicy = await client.GetSecretAsync("tokensigning");
                var cert = new X509Certificate2(
                    Convert.FromBase64String(certificateWithPolicy.Value.Value),
                    (string)null,
                    X509KeyStorageFlags.MachineKeySet);
                return cert;
            }
            catch(Exception ex)
            {
                Debug.WriteLine(ex);
                throw;
            }
        }

        public X509Certificate2 GetCertificate()
        {
            if (certificate == null)
            {
                lock (this)
                {
                    if (certificate == null)
                    {
                        certificate = LoadCertificateAsync().Result;
                    }
                }
            }

            return certificate;
        }
    }
}
