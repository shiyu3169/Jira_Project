;

(function ($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.WebPartCatalog = new function () {
        var urls = null;
        var container = null;

        $(function () {
            bindAddCatalogButtons();

            $("#cancelButton").click(function () {
                window.parent.$(container).data('kendoWindow').close();
            });
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

        var bindAddCatalogButtons = function () {
            console.log("Binding Buttons");
            $("button[name='webPartIdToAdd']").click(function () {
                var button = $(this);
                var webPartId = button.val();

                window.SEMS.Overlay.show();

                var request = { webPartId: webPartId };

                doServiceCall(urls.addWebPart, request, function (response) {
                    reloadParentWindow();
                });
            });
        };

        var reloadParentWindow = function () {
            try {
                window.top.ReloadTopPage();
            } catch (e) {
                console.log(e);
            }
        };

        var init = function (settings, id) {

            urls = settings;
            container = '#' + id;
        };

        return {
            init: init,
            bindAddCatalogButtons: bindAddCatalogButtons,
            reloadParentWindow: reloadParentWindow
        };
    };

})(jQuery, window, document)