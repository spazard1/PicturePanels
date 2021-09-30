using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using PicturePanels.Models;

namespace PicturePanels.Services.Authentication
{
	public class SecurityProvider
	{
		public const string UserNameKey = "username";

		public const string UserIdKey = "userid";

		private readonly CertificateProvider certificateProvider;

        public SecurityProvider(CertificateProvider certificateProvider)
        {
            this.certificateProvider = certificateProvider;
        }

		public string GetToken(string username, string userId)
        {
			return this.GetToken(new List<Claim>() { new Claim(UserNameKey, username), new Claim(UserIdKey, userId) });
        }

        private string GetToken(List<Claim> claims)
		{
			var cert = this.certificateProvider.GetCertificate();

			var handler = new JwtSecurityTokenHandler();
			var credentials = new X509SigningCredentials(cert, SecurityAlgorithms.RsaSha256);
			var token = new JwtSecurityToken("https://picturepanels.net", "https://picturepanels.net", claims, DateTime.UtcNow, DateTime.UtcNow.AddDays(30), credentials);
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

		public string SignString(string data)
        {
			var cert = this.certificateProvider.GetCertificate();
			var rsa = cert.GetRSAPrivateKey();

			var dataToSignBytes = Encoding.UTF8.GetBytes(data);
			var signature = rsa.SignData(dataToSignBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
			return Convert.ToBase64String(signature);
		}

		public bool VerifyString(string data, string signature)
        {
			var cert = this.certificateProvider.GetCertificate();
			var rsa = cert.GetRSAPrivateKey();

			byte[] dataToSignBytes = Encoding.UTF8.GetBytes(data);
			var signatureBytes = Convert.FromBase64String(signature);
			return rsa.VerifyData(dataToSignBytes, signatureBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
		}

		public string GetSignedQueryStringUrlEncoded(string userId)
		{
			var now = DateTime.UtcNow;
			var userQueryString = GetUserQueryStringToSign(userId, now);
			var signature = SignString(userQueryString);
			return GetUserQueryStringEncoded(userId, now) + "&sig=" + HttpUtility.UrlEncode(signature);
		}

		public string GetUserQueryStringToSign(string userId, DateTime now)
        {
			return "uid=" + userId + "&ct=" + now.ToString("o");
		}

		public string GetUserQueryStringEncoded(string userId, DateTime now)
		{
			return "uid=" + userId + "&ct=" + HttpUtility.UrlEncode(now.ToString("o"));
		}

		public string GetUserQueryString(IQueryCollection query)
		{
			return "uid=" + query["uid"] + "&ct=" + HttpUtility.UrlDecode(query["ct"]);
		}
	}
}
