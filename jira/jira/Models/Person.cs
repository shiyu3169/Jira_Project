using System.Collections.Generic;

namespace Jira.Models
{
    public class Person
    {
        public string Author { get; set; }
        public List<EntriesByDay> EntryByDay { get; set; }
    }
}