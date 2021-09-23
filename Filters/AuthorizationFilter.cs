using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using PicturePanels.Services.Authentication;
using System;
using System.Linq;
using System.Security.Claims;

namespace PicturePanels.Filters
{
    public class AuthorizationFilter : IAuthorizationFilter
    {
        private readonly SecurityProvider securityProvider;

        public AuthorizationFilter(SecurityProvider securityProvider)
        {
            this.securityProvider = securityProvider;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context.HttpContext.Request.Query.TryGetValue("uid", out StringValues userId) == true &&
                context.HttpContext.Request.Query.TryGetValue("ct", out StringValues createdTime) == true &&
                context.HttpContext.Request.Query.TryGetValue("sig", out StringValues signature) == true)
            {
                if (DateTime.TryParse(createdTime, out DateTime createdDateTime))
                {
                    if (createdDateTime.AddDays(1) >= DateTime.UtcNow)
                    {
                        var queryString = this.securityProvider.GetUserQueryString(context.HttpContext.Request.Query);
                        var result = this.securityProvider.VerifyString(this.securityProvider.GetUserQueryString(context.HttpContext.Request.Query), signature);
                        if (result)
                        {
                            context.HttpContext.Items[SecurityProvider.UserIdKey] = userId;
                            return;
                        }
                    }
                }
            }

            if (context.HttpContext.Request.Headers.TryGetValue("Authorization", out StringValues authorization) == true)
            {
                if (this.securityProvider.TryValidateToken(authorization, out SecurityToken securityToken, out ClaimsPrincipal claimsPrincipal))
                {
                    context.HttpContext.Items[SecurityProvider.UserNameKey] = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == SecurityProvider.UserNameKey)?.Value;
                    context.HttpContext.Items[SecurityProvider.UserIdKey] = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == SecurityProvider.UserIdKey)?.Value;
                    return;
                }
            }

            context.HttpContext.Items[SecurityProvider.UserNameKey] = string.Empty;

            var requireAuthorizationAttribute = context.ActionDescriptor.FilterDescriptors
            .Select(x => x.Filter).OfType<RequireAuthorization>().FirstOrDefault();

            if (requireAuthorizationAttribute != null)
            {
                context.Result = new StatusCodeResult(401);
            }
        }
    }
}
