;

(function($, window, document, undefined) {
    
    jQuery.namespace('SEMS');

    window.SEMS.Dashboard = new function () {
        var urls = null;
            
        var getWebPart = function (url, dockPanelId) {
            dockPanelId = '#' + dockPanelId;

            var panel = $(dockPanelId);

            panel.mask("Loading");

            $.get(url, function (data) {
                panel.replaceWith(data);
                window.SEMS.Dashboard.enableWebPartButtons($(dockPanelId)); // the content changed, update our object
                panel.unmask();
            }).error(function () {
                var content = panel.find(".widget-content");

                content.empty();
                content.append($("<span class='error'>Error loading</span>"));
                panel.unmask();
            });
        };

        var enableDragAndDrop = function () {
            $(".grid-12").sortable({
                connectWith: ".grid-12",
                items: '.widget:not(.nodrag)',
                handle: '.widget-header',
                cancel: 'a, input',
                cursor: 'move',
                appendTo: 'body',
                opacity: 0.8,
                revert: true,
                tolerance: 'pointer',
                placeholder: "ui-state-highlight",
                start: function (event, ui) {
                    try {
                        $(ui.placeholder).slideUp();

                        var webPart = ui.item;
                        var dockZone = webPart.parent();
                        var dockZoneId = dockZone[0].id;

                        webPart.oldDockZoneId = dockZoneId;
                        webPart.webPanelIndex = webPart.index();

                        ui.placeholder.height(ui.item.height());
                    } catch (e) {
                        console.log(e);
                    }
                },
                change: function (event, ui) {
                    try {
                        $(ui.placeholder).slideDown();
                    } catch (e) {
                        console.log(e);
                    }
                },
                stop: function (event, ui) {
                    try {
                        var webPart = ui.item;
                        var dockZone = webPart.parent();
                        var newDockZoneId = dockZone[0].id;
                        var oldDockZoneId = ui.item.oldDockZoneId;
                        var webPanelId = webPart[0].id;
                        var newOrder = webPart.index() + 1;
                        var oldOrder = webPart.webPanelIndex + 1;

                        if (newDockZoneId == oldDockZoneId && newOrder == oldOrder)
                            return;

                        moveWebPart(oldDockZoneId, newDockZoneId, webPanelId, newOrder, oldOrder);
                    } catch (e) {
                        console.log(e);
                    }
                }
            });

            $(".grid-12").disableSelection();
        };

        var addMenuLinks = function () {
            var showWebPartCatalogLink = $('#showWebPartCatalogLink');

            showWebPartCatalogLink.click(function () {
                showWebPartCatalog();

                return false;
            });

            var resetDashboardLink = $('<li><a id="resetDashboardLink" href="javascript:void(0)">Reset Dashboard</a></li>');

            resetDashboardLink.appendTo($("#menuProfile").find("ul"));

            resetDashboardLink.click(function () {
                resetDashboard();

                return false;
            });
        };

        var showWebPartCatalog = function (event) {
            var url = urls.webPartCatalog + "?popup=true&disableSessionStorage=true";
            var webPartWindow = $('#WebPartCatalog').data('kendoWindow');

            var openOnRefresh = function (e) {
                window.SEMS.Overlay.hide();
                e.sender.open();
                e.sender.setOptions({
                    width: 800,
                    height: 500
                });
                e.sender.center();
            };

            if (webPartWindow) {
                window.SEMS.Overlay.show();
                webPartWindow.refresh();
            } else {
                window.SEMS.Overlay.show();
                $('#WebPartCatalog').kendoWindow({
                    iframe: true,
                    content: url,
                    title: 'Web Part Catalog',
                    modal: true,
                    refresh: openOnRefresh,
                    visible: false
                }).data('kendoWindow');

            }
            

            if (event && event.preventDefault)
                event.preventDefault();

            return false;
        };

        var showSettings = function (url) {
            window.openDialog({ url: url + "&popup=true&disableSessionStorage=true", title: 'Settings' });

            if (event && event.preventDefault)
                event.preventDefault();

            return false;
        };

        var enableWebPartButtons = function (element) {
            element.find(".widget-settings-button").click(function () {
                var settingsButton = $(this);
                var url = settingsButton.attr("SettingsViewPath");

                showSettings(url);

                return false;
            });

            element.find(".widget-close-button").click(function () {
                var webPart = $(this).closest(".widget");

                removeWebPart(webPart);

                return false;
            });
        };

        $(function () {
            enableDragAndDrop();
            addMenuLinks();
        });

        var doServiceCall = function (jsonUrl, request, callBack) {
            $.getJSON(
                jsonUrl,
                request,
                function (response, textStatus, jqXHR) {
                    if (!response.Success) {
                        handleServiceFailure(response);

                        return;
                    }

                    callBack(response);
                }
            );
        };

        var handleServiceFailure = function (response) {
            alert('Service call failed: ' + response.Message);
        };

        var resetDashboard = function () {
            doServiceCall(urls.resetDashboard, null, function (response) {
                window.SEMS.Overlay.show();
                window.location = window.location;
            });
        };

        var removeWebPart = function (webPart) {
            var webPanelId = webPart[0].id;
            var request = { webPanelId: webPanelId };

            doServiceCall(urls.removeWebPanel, request, function (response) {
                webPart.fadeOut("slow", function () {
                    $(this).remove();
                });
            });
        };

        var moveWebPart = function (oldDockZoneId, newDockZoneId, webPanelId, newOrder, oldOrder) {
            var request = { oldDockZoneId: oldDockZoneId, newDockZoneId: newDockZoneId, webPanelId: webPanelId, NewOrder: newOrder, oldOrder: oldOrder };

            doServiceCall(urls.moveWebPart, request, function (response) {
                // do nothing it's already moved
            });
        };

        var bindAddCatalogButtons = function () {
            $("button[name='webPartIdToAdd'").click(function () {
                var button = $(this);
                var webPartId = button.val();

                $.modal.close();
                window.SEMS.Overlay.show();

                var request = { webPartId: webPartId };

                doServiceCall(urls.addWebPart, request, function (response) {
                    window.location = window.location;
                });
            });
        };

        var init = function(settings) {

            urls = settings;
        };

        return {
            showWebPartCatalog: showWebPartCatalog,
            removeWebPart: removeWebPart,
            moveWebPart: moveWebPart,
            bindAddCatalogButtons: bindAddCatalogButtons,
            enableWebPartButtons: enableWebPartButtons,
            getWebPart: getWebPart,
            init: init
        };
    };

})(jQuery, window, document);