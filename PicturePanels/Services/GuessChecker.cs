using Fastenshtein;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PicturePanels.Services
{
    public class GuessChecker
    {

        private static readonly string[] WordList = { "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now" };

        private static readonly Dictionary<string, string> NumberDict = new Dictionary<string, string>() {
            { "ii", "two" }, { "iii", "three" }, { "iv", "four" }, { "v", "five" }, { "vi", "six" }, { "vii", "seven" }, { "viii", "eight" }, { "ix", "nine" }, { "x", "ten" },
            { "0", "zero" }, { "1", "one" }, { "2", "two" }, { "3", "three" }, { "4", "four" }, { "5", "five" }, { "6", "six" }, { "7", "seven" }, { "8", "eight" }, { "9", "nine" } };

        private static readonly Regex LettersNumbersOnly = new(@"[^\w\s]");

        private static readonly Regex MultipleSpaces = new(@"\s+");

        private const double CorrectRatio = .9;

        public static bool IsCorrect(string guess, IEnumerable<string> answers)
        {
            guess = Prepare(guess);
            Levenshtein lev = new Levenshtein(guess);

            foreach (var answer in answers.Select(a => Prepare(a)))
            {
                double totalLength = answer.Length + guess.Length;
                #if DEBUG
                    Debug.WriteLine("Ratio: " + (totalLength - lev.DistanceFrom(answer)) / totalLength);
                #endif
                if ((totalLength - lev.DistanceFrom(answer)) / totalLength > CorrectRatio) {
                    return true;
                }
            }
            return false;
        }

        public static async Task<bool> IsCorrectAsync(string guess, IAsyncEnumerable<string> answers)
        {
            guess = Prepare(guess);
            Levenshtein lev = new Levenshtein(guess);

            await foreach (var answer in answers.Select(a => Prepare(a)))
            {
                double totalLength = answer.Length + guess.Length;
#if DEBUG
                Debug.WriteLine("Ratio: " + (totalLength - lev.DistanceFrom(answer)) / totalLength);
#endif
                if ((totalLength - lev.DistanceFrom(answer)) / totalLength > CorrectRatio)
                {
                    return true;
                }
            }
            return false;
        }

        public static IEnumerable<string> Prepare(IEnumerable<string> strings)
        {
            return strings.Select(s => Prepare(s));
        }

        public static string Prepare(string s)
        {
            var result = s.Trim();
            result = result.ToLower();
            result = LettersNumbersOnly.Replace(result, "");
            result = MultipleSpaces.Replace(result, " ");
            result = result.Split(' ').Where(x => !WordList.Contains(x)).DefaultIfEmpty().Select(next =>
            {
                if (next != null && NumberDict.ContainsKey(next))
                {
                    next = NumberDict[next];
                }
                return next;
            }).Aggregate((current, next) => current + " " + next);

            return result ?? s;
        }
    }
}
