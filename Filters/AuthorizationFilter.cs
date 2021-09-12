using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using PicturePanels.Services.Authentication;
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
            if (context.HttpContext.Request.Headers.TryGetValue("Authorization", out StringValues authorization) == true)
            {
                if (this.securityProvider.TryValidateToken(authorization, out SecurityToken securityToken, out ClaimsPrincipal claimsPrincipal))
                {
                    context.HttpContext.Items[SecurityProvider.UserNameKey] = claimsPrincipal.Claims.First(c => c.Type == SecurityProvider.UserNameKey);
                    return;
                }
            }

            context.HttpContext.Items[SecurityProvider.UserNameKey] = string.Empty;

            var aequireAuthorizationAttribute = context.ActionDescriptor.FilterDescriptors
            .Select(x => x.Filter).OfType<RequireAuthorization>().FirstOrDefault();

            if (aequireAuthorizationAttribute != null)
            {
                context.Result = new StatusCodeResult(401);
            }
        }
    }
}
