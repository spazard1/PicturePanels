using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace PicturePanels.Services.Authentication
{
	public class SecurityProvider
	{
        private readonly CertificateProvider certificateProvider;

        public SecurityProvider(CertificateProvider certificateProvider)
        {
            this.certificateProvider = certificateProvider;
        }

		public string GetToken(string username)
        {
			return this.GetToken(new List<Claim>() { new Claim("username", username) });
        }

        public string GetToken(List<Claim> claims)
		{
			var cert = this.certificateProvider.GetCertificate();

			var handler = new JwtSecurityTokenHandler();
			var credentials = new X509SigningCredentials(cert, SecurityAlgorithms.RsaSha256);
			var token = new JwtSecurityToken("https://picturepanels.net", "https://picturepanels.net", claims, DateTime.UtcNow, DateTime.UtcNow.AddDays(1), credentials);
			return handler.WriteToken(token);
		}

		public bool TryValidateToken(string tokenString, out SecurityToken securityToken, out ClaimsPrincipal claimsPrincipal)
		{
			var cert = this.certificateProvider.GetCertificate();

			TokenValidationParameters validationParameters = new TokenValidationParameters()
			{
				ValidIssuer = "https://picturepanels.net",
				ValidAudience = "https://picturepanels.net",
				IssuerSigningKey = new X509SecurityKey(cert),
			};

			JwtSecurityTokenHandler recipientTokenHandler = new JwtSecurityTokenHandler();

			try {
				claimsPrincipal = recipientTokenHandler.ValidateToken(tokenString, validationParameters, out securityToken);
			} catch (Exception) {
				securityToken = null;
				claimsPrincipal = null;
				return false;
			}
			return true;
		}

		public string GetSalt()
        {
			return GetSalt(70);
        }

		private string GetSalt(int nSalt)
		{
			var saltBytes = new byte[nSalt];

			using var provider = new RNGCryptoServiceProvider();
			provider.GetNonZeroBytes(saltBytes);

			return Convert.ToBase64String(saltBytes);
		}

		private string HashPassword(string password, string salt, int nIterations, int nHash)
		{
			var saltBytes = Convert.FromBase64String(salt);

            using var rfc2898DeriveBytes = new Rfc2898DeriveBytes(password, saltBytes, nIterations);
            return Convert.ToBase64String(rfc2898DeriveBytes.GetBytes(nHash));
        }

		public string GetPasswordHash(string password, string salt)
        {
			return HashPassword(password, salt, 10101, 70);
		}

		public bool ValidatePassword(string password, string salt, string hash)
        {
			return GetPasswordHash(password, salt) == hash;
        }
	}
}
