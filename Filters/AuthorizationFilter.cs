using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using PicturePanels.Services.Authentication;
using PicturePanels.Services.Storage;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PicturePanels.Filters
{
    public class AuthorizationFilter : IAsyncAuthorizationFilter
    {
        private readonly SecurityProvider securityProvider;
        private readonly UserTableStorage userTableStorage;

        public AuthorizationFilter(SecurityProvider securityProvider, UserTableStorage userTableStorage)
        {
            this.securityProvider = securityProvider;
            this.userTableStorage = userTableStorage;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var authorized = false;

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
                            authorized = true;
                        }
                    }
                }
            }

            if (!authorized && context.HttpContext.Request.Headers.TryGetValue("Authorization", out StringValues authorization) == true)
            {
                if (this.securityProvider.TryValidateToken(authorization, out SecurityToken securityToken, out ClaimsPrincipal claimsPrincipal))
                {
                    context.HttpContext.Items[SecurityProvider.UserNameKey] = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == SecurityProvider.UserNameKey)?.Value;
                    context.HttpContext.Items[SecurityProvider.UserIdKey] = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == SecurityProvider.UserIdKey)?.Value;
                    authorized = true;
                }
            }

            if (!authorized)
            {
                context.HttpContext.Items[SecurityProvider.UserNameKey] = string.Empty;
            }

            var requireAuthorizationAttribute = context.ActionDescriptor.FilterDescriptors
                .Select(x => x.Filter).OfType<RequireAuthorization>().FirstOrDefault();
            var requireAdminAttribute = context.ActionDescriptor.FilterDescriptors
                .Select(x => x.Filter).OfType<RequireAdmin>().FirstOrDefault();

            if (!authorized && (requireAuthorizationAttribute != null || requireAdminAttribute != null))
            {
                context.Result = new StatusCodeResult(401);
                return;
            }

            if (requireAdminAttribute != null)
            {
                var user = await this.userTableStorage.GetAsync(context.HttpContext.Items[SecurityProvider.UserNameKey].ToString());
                if (user == null || !user.IsAdmin)
                {
                    context.Result = new StatusCodeResult(403);
                }
            }
        }
    }
}
