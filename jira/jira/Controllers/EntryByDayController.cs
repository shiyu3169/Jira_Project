using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Jira.Models;
using JiraActivityChecker;

namespace Jira.Controllers
{
    public class EntryByDayController : ApiController
    {
        readonly List<EntriesByDay> _entriesReal;

        public EntryByDayController()
        {
            _entriesReal = new List<EntriesByDay>();
        }

        public async Task<IEnumerable<EntriesByDay>> Get()
        {
            var activityDownloader = new JiraActivityDownloader();
            var results = await activityDownloader.DownloadAsync();

            foreach (var date in results.Select(entry => entry.Updated))
            {
                if (_entriesReal.Exists(x => x.Day == date.ToString("MMM dd, yyyy")))
                {
                    var date1 = date;
                    foreach (var e in _entriesReal.Where(e => e.Day == date1.ToString("MMM dd, yyyy")))
                    {
                        e.Entries++;
                    }
                }

                else
                {
                    _entriesReal.Add(new EntriesByDay {Entries = 1, Day = date.ToString("MMM dd, yyyy")});
                }
            }
            return _entriesReal;
        }
    }
}
