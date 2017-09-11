define(['durandal/system', 'services/dataService'], function (system, service) {
    var title = 'Activity';
    var self = this;

    self.entriesByPerson = ko.observableArray();
    self.people = ko.observableArray();
    self.entriesByDay = ko.observableArray();
    
    self.isLoading = ko.observable(false);
    self.spinner = ko.observable(true);
    var loadEntriesByPerson = function () {
        return service.entriesByPerson.getEntriesByPerson().done(function (data) {
            self.entriesByPerson(data);
        });
    };
    
    var loadEntriesByDay = function () {
        return service.entriesByDay.getEntriesByDay().done(function(data) {
            self.entriesByDay(data);
        });
    };

    var loadPeople = function () {
        return service.people.getPeople().done(function (data) {
            self.people(data);
        });
    };


    function refresh() {
        $.when(loadEntriesByPerson(), loadEntriesByDay(), loadPeople()).then(function () {
            self.isLoading(true);
            self.spinner(false);
            return true;
        });
    }
    
    function attached() {
        return refresh();
    }
 
    var vm = function () {
        this.isLoading = isLoading;
        this.spinner = spinner;
        this.attached = attached;
        this.title = title;
        this.entriesByPerson = entriesByPerson;
        this.people = people;
        this.entriesByDay = entriesByDay;
    };
    
    return vm;
});