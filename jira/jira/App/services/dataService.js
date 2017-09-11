define(['durandal/system', 'services/logger'], function (system, logger, settingsObj) {

    var defaults = {
        serviceBaseUrl: '/Api/'
    };

    var settings = {};

    $.extend(settings, defaults, settingsObj);

        var cachedResults = {};
        var currentRequests = {};

        var copy = function(item) {
            if (typeof item === "object") {
                if (Object.prototype.toString.call(item) === "[object Array]") {
                    if (item) {
                        item = item.slice(0);
                        for (var i = 0; i < item.length; i++) {
                            item[i] = copy(item[i]);
                        }
                        return item;
                    }
                    return null;
                }
                return $.extend(true, {}, item);
            }
            return item;
        };

        var abortRequest = function(path) {
            if (currentRequests[path] && currentRequests[path].abort != undefined) {
                currentRequests[path].abort();
            }
        };

        var createDeferred = function(df) {

            return $.Deferred(function(deferred) {
                df.done(function(xhr, textStatus, errorThrown) {

                    deferred.resolve(xhr, textStatus, errorThrown);
                }).fail(function(xhr, textStatus, errorThrown) {

                    deferred.reject(xhr, textStatus, errorThrown);
                });
            }).promise();
        };

        var get = function(path) {
            path = settings.serviceBaseUrl + path;         

            if (cachedResults[path] != null) {
                var df = $.Deferred();

                window.setTimeout(function() {
                    df.resolve(copy(cachedResults[path]));
                }, 0); // async

                return df.promise();
            }

            abortRequest(path);

            return $.Deferred(function (deferred) {
                currentRequests[path] = $.ajax({
                    url: path
                }).done(function(xhr, textStatus, errorThrown) {
                    cachedResults[path] = copy(xhr);
                    deferred.resolve(xhr, textStatus, errorThrown);
                }).always(function () {
                    delete currentRequests[path];
                });
            }).promise();
        };

        var entriesByPerson = {
            getEntriesByPerson: function () {
                return createDeferred(get('entryByPerson'));
            }
        };

        var entriesByDay = {
            getEntriesByDay: function() {
                return createDeferred(get('entryByDay'));
            }
        };
        
        var people = {
            getPeople: function () {
                return createDeferred(get('person'));
            }
        };
        var dataservice = {
            entriesByPerson: entriesByPerson,
            entriesByDay: entriesByDay,
            people: people
        };

        return dataservice;
});