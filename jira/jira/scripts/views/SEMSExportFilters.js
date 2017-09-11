;

(function ($, window, document, undefined) {

    $.namespace('SEMS.Utils.ExportFilters');

    window.SEMS.ExportFilters = new function () {

        var settings = {};

        var defaults = {

        };

        function showOverlay() {
            window.SEMS.Overlay.show();
        }

        var createExportTypeCombobox = function () {

            $(settings.exportOptionDivSelector).kendoComboBox({
                change: window.SEMS.Export.exportType_onChanged,
                dataSource: settings.dataExport, 
                dataTextField: settings.exportOptionsTextField,
                dataValueField: settings.exportOptionsValueField,
                suggest: true,
                value: settings.defaultValue,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
            });
        };

        var createComboBoxes = function (hasData) {
            if (!hasData) {
                return;
            }
            createExportTypeCombobox();
        };

        var init = function (settingsObj) {
            $.extend(settings, defaults, settingsObj);
            settings.dataExport = $.parseJSON(settings.dataExport);
            settings.defaultValue = settings.exportOptionUrlId;
            if (!settings.defaultValue && settings.dataExport.length > 0) {
                settings.defaultValue = settings.dataExport[0].Id;
            }
            createComboBoxes(settings.dataExport);
        };

        return {
            exportType_onChanged: function (e) {
                submit(e.sender.element);
            },
            showOverlay: showOverlay,
            init: init
        };
    };
})(jQuery, window, document);