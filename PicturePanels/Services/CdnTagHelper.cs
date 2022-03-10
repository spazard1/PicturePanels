using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Services
{

    [HtmlTargetElement("script")]
    [HtmlTargetElement("link")]

    public class CdnTagHelper : TagHelper
    {
        private readonly IWebHostEnvironment webHostEnvironment;

        public CdnTagHelper(IWebHostEnvironment webHostEnvironment)
        {
            this.webHostEnvironment = webHostEnvironment;
        }

        public override int Order
        {
            get { return int.MaxValue; }
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (webHostEnvironment.IsDevelopment()) {
                return;
            }

            if (context.AllAttributes["src"] != null)
            {
                var originalSrc = context.AllAttributes["src"].Value.ToString();

                if (originalSrc.StartsWith("~"))
                {
                    var modifiedSrc = output.Attributes["src"];

                    output.Attributes.SetAttribute("src", "https://picturepanels.azureedge.net" + modifiedSrc.Value);
                }
            }
            else if (context.AllAttributes["href"] != null)
            {
                var originalHref = context.AllAttributes["href"].Value.ToString();

                if (originalHref.StartsWith("~"))
                {
                    var modifiedHref = output.Attributes["href"];

                    output.Attributes.SetAttribute("href", "https://picturepanels.azureedge.net" + modifiedHref.Value);
                }
                return;
            }
        }
    }
}
