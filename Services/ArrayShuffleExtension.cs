using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public static class ArrayShuffleExtension
    {
        public static void Shuffle<T>(this T[] array)
        {
            var rng = new Random();

            int n = array.Length;
            while (n > 1)
            {
                int k = rng.Next(n--);
                T temp = array[n];
                array[n] = array[k];
                array[k] = temp;
            }
        }
    }
}
