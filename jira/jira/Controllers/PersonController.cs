using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Jira.Models;
using JiraActivityChecker;

namespace Jira.Controllers
{
    public class PersonController : ApiController
    {
        readonly List<Person> _entriesReal;
        public PersonController()
        {
            _entriesReal = new List<Person>();
        }



        //Get Api/entry
        public async Task<IEnumerable<Person>> Get()
        {
            var activityDownloader = new JiraActivityDownloader();
            var results = await activityDownloader.DownloadAsync();

            foreach (var entry in results)
            {
                var date = entry.Updated;
                if (_entriesReal.Exists(x => x.Author == entry.Author))
                {
                    var entry1 = entry;
                    foreach (var p in _entriesReal.Where(p => p.Author == entry1.Author))
                    {
                        if (p.EntryByDay.Exists(x => x.Day == date.ToString("MMM dd, yyyy")))
                        {
                            foreach (var e in p.EntryByDay.Where(e => e.Day == date.ToString("MMM dd, yyyy")))
                            {
                                e.Entries++;
                            }
                        }
                        else
                        {
                            p.EntryByDay.Add(new EntriesByDay
                                {
                                    Day = date.ToString("MMM dd, yyyy"),
                                    Entries = 1
                                });
                        }
                    }
                }
                else
                {
                    var enb = new List<EntriesByDay>
                        {
                            new EntriesByDay
                                {
                                    Day = date.ToString("MMM dd, yyyy"),
                                    Entries = 1
                                }
                        };
                    _entriesReal.Add(new Person
                        {
                            Author = entry.Author,
                            EntryByDay = enb
                        });
                }

            }
            return _entriesReal;
        }
    }
}
