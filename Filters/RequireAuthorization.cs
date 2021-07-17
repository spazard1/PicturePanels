using System;
using Microsoft.AspNetCore.Mvc.Filters;

namespace PicturePanels.Filters
{
    public class RequireAuthorization : Attribute, IFilterMetadata
    {
    }
}
