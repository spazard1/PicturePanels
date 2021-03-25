using System;
using Microsoft.AspNetCore.Mvc.Filters;

namespace PictureGame.Filters
{
    public class RequireAuthorization : Attribute, IFilterMetadata
    {
    }
}
