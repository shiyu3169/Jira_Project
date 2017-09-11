;

(function($, window, document, undefined) {
   
    $.namespace('SEMS');
    
    window.SEMS.UserManagement = function (settings) {
        var $dom = {
            gridView: null,
            createLogin: null,
            deleteLogin: null,
            updateTenant: null
        };

        var ds = null;
        var trace = new window.SEMS.Trace(false);

        var handleServiceFailure = function (response) {
            var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
            console.log(response);

            var message = errorMessage + '<br/>';

            window.toastr.error(message);
        };

        var dataSource = function (settings) {
            var cachedResults = null;
            var request = null;

            var abortRequest = function () {
                if (request && request.abort != undefined) {
                    request.abort();
                }
            };


            var getUsers = function () {
                trace.info("dataSource.getdata called");

                if (cachedResults != null) {
                    var deferred = $.Deferred();

                    window.setTimeout(function () {
                        deferred.resolve(cachedResults);
                    }, 0); // async

                    return deferred.promise();
                }

                abortRequest();

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        url: settings.getUsersUrl
                    }).done(function (xhr, textStatus, errorThrown) {
                        cachedResults = xhr;
                        trace.info("dataSource.getdata.result.Success = " + xhr.Success);

                        if (xhr.Success) {
                            deferred.resolve(xhr, textStatus, errorThrown);

                            return;
                        }

                        handleServiceFailure({ Message: xhr.Message });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).fail(function (xhr, textStatus, errorThrown) {
                        handleServiceFailure({ Message: xhr.responseText });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).always(function () {
                        request = null;
                    });
                }).promise();
            };

            var createUser = function (postData) {
                abortRequest();

                var jsonData = JSON.stringify(postData);

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        type: "post",
                        url: settings.createUserUrl,
                        dataType: 'json',
                        data: jsonData,
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (xhr, textStatus, errorThrown) {
                        cachedResults = xhr;

                        if (xhr.Success) {
                            deferred.resolve(xhr, textStatus, errorThrown);

                            return;
                        }

                        handleServiceFailure({ Message: xhr.Message });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).fail(function (xhr, textStatus, errorThrown) {
                        handleServiceFailure({ Message: xhr.responseText });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).always(function () {
                        request = null;
                    });
                }).promise();
            };

            var updateUser = function (postData) {

                abortRequest();
                var jsonData = JSON.stringify(postData);

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        type: "post",
                        url: settings.updateUserUrl,
                        dataType: 'json',
                        data: jsonData,
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (xhr, textStatus, errorThrown) {
                        cachedResults = xhr;

                        if (xhr.Success) {
                            deferred.resolve(xhr, textStatus, errorThrown);

                            return;
                        }

                        handleServiceFailure({ Message: xhr.Message });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).fail(function (xhr, textStatus, errorThrown) {
                        handleServiceFailure({ Message: xhr.responseText });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).always(function () {
                        request = null;
                    });
                }).promise();


            };



        };


        

    };
    
})(jQuery, window, document)