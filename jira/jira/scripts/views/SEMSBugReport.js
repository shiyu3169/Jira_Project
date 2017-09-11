;

(function($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.BugReport = function(settings) {

        var $elements = {
            window: null,
            link: null,
            attachTo: null
        };

        var createWindowOptions = function() {

            var template = kendo.template($('#bugDataTemplate').html());
            var options = {
                actions: ["Close"],
                modal: true,
                resizable: false,
                title: "Report an issue",
                maxHeight: 500,
                maxWidth: 550,
                minHeight: 475,
                minWidth: 525,
                content: {
                    template: template(viewModel)
                }
             
            };
            return options;

        };

        var reBind = function(model) {
            kendo.bind($($elements.window), model);
        };


        var viewModel = (function () {

            var open = function () {
                var kwindow = $($elements.window).data('kendoWindow');
                if (!kwindow) {
                    kwindow = $($elements.window).kendoWindow(createWindowOptions()).data('kendoWindow');
                }
                reBind(viewModel);
                kwindow.center().open();
            };

            var dataSource = (function () {
                var abortRequest = function () {
                    if (request && request.abort != undefined) {
                        request.abort();
                    }
                };
                var request = null;
                
                var create = function(bugReport) {
                    abortRequest();

                    return $.Deferred(function(deferred) {
                        request = $.ajax({
                            type: "POST",
                            url: settings.createUrl,
                            dataType: 'json',
                            data: JSON.stringify(bugReport),
                            contentType: 'application/json; charset=utf-8',
                            beforeSend: function() {
                                kendo.ui.progress($($elements.window), true);
                            }                            
                        }).done(function (response, textStatus, jqXHR) {
                            if (response.Success) {
                                deferred.resolve(response, textStatus, jqXHR);
                                return;
                            }

                            handleFailure(data);
                            deferred.reject(data, textStatus, jqXHR);
                        }).fail(function (response, textStatus, jqXHR) {
                            var data = $.parseJSON(response.responseText);
                            handleFailure(data);
                            deferred.reject(data, textStatus, jqXHR);
                        }).always(function () {
                            kendo.ui.progress($($elements.window), false);
                            request = null;
                        });
                    }).promise();
                };

                return {
                  createTicket: function(data, callback) {
                      create(data).done(function(data, textStatus, jqXHR) {
                          callback(data);
                      });
                  }  
                };
            })();

            var handleFailure = function(result) {
                $('.messageBar').addClass("bugReportError");
                var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
                console.log(result);

                var newModel = $.extend({}, viewModel, errorMessage);
                newModel.CreateEnabled = true;
                reBind(newModel);
            };

            var sendData = function() {
                dataSource.createTicket(this, function (response) {
                    $('.messageBar').addClass("bugReportSuccess");
                    var newModel = $.extend({}, viewModel, response);
                    newModel.CreateEnabled = false;
                    reBind(newModel);
                    
                });
            };
            
            var close = function () {
                $('.messageBar').removeClass("bugReportError bugReportSuccess");
                $($elements.window).data('kendoWindow').close();
            };

            
            return {
                open: open,
                Response: "Please describe the issue you've encountered.",
                Description: "",
                Summary: "",
                Success: false,
                CreateEnabled: true,
                create: sendData,
                close: close,
                DataIssue: true
            };

        })();

        var loadTemplates = function(url, element) {
            $(element).load(url, function() {
                bindLinkAction($elements.link);
            });
        };

        var init = function () {
            $elements.window = settings.windowId;
            $elements.link = settings.linkId;
            $elements.attachTo = settings.attachTemplatesTo;
            loadTemplates(settings.templatesUrl, $elements.attachTo);
        };

        var bindLinkAction = function(id) {

            $(id).on('click', viewModel.open);
        };

        return {
          init: init  
        };

    };    


})(jQuery, window, document);