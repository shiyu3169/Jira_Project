using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using JiraActivityChecker.Properties;

namespace JiraActivityChecker
{
    public class JiraActivityDownloader
    {
        public async Task<IEnumerable<FeedEntry>> DownloadAsync()
        {
            var settings = Settings.Default;
            var userAndPass = "{0}:{1}".FormatWith(settings.UserName, settings.Password);
            var startAt = DateTime.Now.Add(settings.CutoffDate).Date;
            var url = string.Concat(Settings.Default.FeedUrl, "&maxResults=", settings.MaxResults, "&startAt=", startAt);

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", userAndPass.ToBase64String());

                var response = await client.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                    throw new Exception("Unexpected error downloading the jira activity feed with the following url, ".Append(url));
                
                var bytes = await response.Content.ReadAsByteArrayAsync();
                
                using (var memoryStream = new MemoryStream(bytes))
                {
                    var reader = new XmlTextReader(memoryStream);
                    var serializer = new XmlSerializer(typeof(feed));
                    var feed = (feed)serializer.Deserialize(reader);
                    var simpleEntries = (from x in feed.entry
                        orderby x.updated
                        select new FeedEntry
                        {
                            Updated = x.updated,
                            Author = x.author.name
                        });

                    return simpleEntries;
                }
            }
        }
    }
}
