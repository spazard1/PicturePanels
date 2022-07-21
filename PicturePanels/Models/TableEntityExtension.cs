using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PicturePanels.Models
{
    public static class TableEntityExtension
    {
        public static List<string> Deserialize(string value)
        {
            try
            {
                return JsonConvert.DeserializeObject<List<string>>(value);
            }
            catch
            {
                return value.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList();
            }
        }
    }
}
