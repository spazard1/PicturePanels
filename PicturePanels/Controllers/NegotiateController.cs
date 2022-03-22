using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.SignalR.Management;
using Microsoft.Extensions.Configuration;

namespace NegotiationServer.Controllers
{
    public class NegotiateController 
    {
        private readonly IServiceManager _serviceManager;

        public NegotiateController(IConfiguration configuration)
        {
            _serviceManager = new ServiceManagerBuilder()
                .WithOptions(o => o.ConnectionString = "Endpoint=https://picturegame.service.signalr.net;AccessKey=fNOKa6i5nAL7Vjcz+UsP2QoMDJT77Ml7zFVmbpA6Nj0=;Version=1.0;")
                .Build();
        }

        //[HttpPost("{hub}/negotiate")]
        public ActionResult Index(string hub, string user)
        {
            if (string.IsNullOrEmpty(user))
            {
                //return BadRequest("User ID is null or empty.");
            }

            return new JsonResult(new Dictionary<string, string>()
            {
                { "url", _serviceManager.GetClientEndpoint(hub) },
                { "accessToken", _serviceManager.GenerateClientAccessToken(hub, user) }
            });
        }
    }
}