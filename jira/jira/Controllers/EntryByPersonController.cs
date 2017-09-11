using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Jira.Models;
using JiraActivityChecker;

namespace Jira.Controllers
{
    public class EntryByPersonController : ApiController
    {
        readonly List<EntriesByPerson> _entriesReal;
        public EntryByPersonController()
        {
            _entriesReal = new List<EntriesByPerson>();
        }

        //Get Api/entry
        public async Task<IEnumerable<EntriesByPerson>> Get()
        {
            var activityDownloader = new JiraActivityDownloader();
            var results = await activityDownloader.DownloadAsync();

            foreach (var entry in results)
            {
                if (_entriesReal.Exists(x => x.Author == entry.Author))
                {
                    var entry1 = entry;
                    foreach (var t in _entriesReal.Where(t => t.Author == entry1.Author))
                    {
                        t.Entries++;
                    }
                }
                else
                {
                    _entriesReal.Add(new EntriesByPerson { Entries = 1, Author = entry.Author });
                }

            }
            return _entriesReal;
        }
    }
}
