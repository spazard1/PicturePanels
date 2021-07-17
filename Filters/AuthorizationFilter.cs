using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using System.Linq;

namespace PicturePanels.Filters
{
    public class AuthorizationFilter : IAuthorizationFilter
    {
        public const string AuthorizedKey = "Authorized";

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (context.HttpContext.Request.Headers.TryGetValue("Authorization", out StringValues authorization) == true)
            {
                if (authorization == "RainForest83!")
                {
                    context.HttpContext.Items[AuthorizedKey] = true;
                    return;
                }
            }
            context.HttpContext.Items[AuthorizedKey] = false;

            var aequireAuthorizationAttribute = context.ActionDescriptor.FilterDescriptors
            .Select(x => x.Filter).OfType<RequireAuthorization>().FirstOrDefault();

            if (aequireAuthorizationAttribute != null)
            {
                context.Result = new StatusCodeResult(401);
            }
        }
    }
}
