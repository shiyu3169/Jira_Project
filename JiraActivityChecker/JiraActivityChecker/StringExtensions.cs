using System;
using System.Text;

namespace JiraActivityChecker
{
    public static class StringExtensions
    {
        public static string Append(this string baseText, string newText)
        {
            return string.Concat(baseText, newText);
        }

        public static string ToBase64String(this string text)
        {
            var bytes = Encoding.ASCII.GetBytes(text);

            return Convert.ToBase64String(bytes);
        }

        public static string FormatWith(this string format, params object[] arguments)
        {
            return string.Format(format, arguments);
        }
    }
}
