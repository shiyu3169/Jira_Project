using System;
using System.Threading.Tasks;

namespace JiraActivityChecker
{
    class Program
    {
        public static void Main(string[] args)
        {
            var task = MainAsync(args);

            task.Wait();
        }

        private static async Task MainAsync(string[] args)
        {
            var activityDownloader = new JiraActivityDownloader();
            var results = await activityDownloader.DownloadAsync();

            foreach (var feedEntry in results)
            {
                Console.WriteLine(feedEntry.Author);
            }

            Console.ReadLine();
        }
    }
}


//var serializer = new XmlSerializer(typeof(feed));
//var solutionPath = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);

//if (solutionPath == null)
//    throw new Exception("Path not found");

//var filePath = Path.Combine(solutionPath, @"Feed.xml");

//using (var file = new FileStream(filePath, FileMode.Open))
//{
//    var reader = new XmlTextReader(file);
//    var feed = (feed) serializer.Deserialize(reader);
//    var updatedAt = (feed).entry[0].updated;
//    var simpleFeed = (from x in feed.entry
//        orderby x.updated
//        select new
//        {
//            x.updated,
//            x.author.name
//        }).ToList();
//}
