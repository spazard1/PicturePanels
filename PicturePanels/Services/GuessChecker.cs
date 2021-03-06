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

        public static double GetRatio(string guess, string answer)
        {
            guess = Prepare(guess);
            Levenshtein lev = new Levenshtein(guess);

            double totalLength = answer.Length + guess.Length;
#if DEBUG
            Debug.WriteLine("Ratio: " + (totalLength - lev.DistanceFrom(answer)) / totalLength);
#endif
            
            return (totalLength - lev.DistanceFrom(answer)) / totalLength;
        }

        public static double GetRatio(string guess, IEnumerable<string> answers)
        {
            guess = Prepare(guess);
            Levenshtein lev = new Levenshtein(guess);

            var maxRatio = double.MinValue;

            foreach (var answer in answers)
            {
                double totalLength = answer.Length + guess.Length;
#if DEBUG
                Debug.WriteLine("Ratio: " + (totalLength - lev.DistanceFrom(answer)) / totalLength);
#endif
                maxRatio = Math.Max(maxRatio, (totalLength - lev.DistanceFrom(answer)) / totalLength);
            }

            return maxRatio;
        }

        public static bool IsMatch(string guess1, string guess2)
        {
            guess1 = Prepare(guess1);
            guess2 = Prepare(guess2);
            Levenshtein lev = new Levenshtein(guess1);

            double totalLength = guess1.Length + guess2.Length;
#if DEBUG
            Debug.WriteLine("Ratio: " + (totalLength - lev.DistanceFrom(guess2)) / totalLength);
#endif
            if ((totalLength - lev.DistanceFrom(guess2)) / totalLength > CorrectRatio)
            {
                return true;
            }
            return false;
        }

        public static bool IsMatch(string guess, IEnumerable<string> answers)
        {
            guess = Prepare(guess);
            Levenshtein lev = new Levenshtein(guess);

            foreach (var answer in answers)
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
