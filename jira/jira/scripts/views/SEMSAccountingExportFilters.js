;

(function ($, window, document, undefined) {
    
    $.namespace('SEMS.Utils.AccountExportFilters');

    window.SEMS.AccountingExportFilters = new function () {

        var settings = {};

        var defaults = {
            
        };

        function showOverlay() {
            window.SEMS.Overlay.show();
        }

        function refresh() {
            showOverlay();
            window.location = window.location;
        }

        function submit(element) {
            showOverlay();
            $(element).closest('form').submit();
        }

        var monthOnChanged = function(e) {
            submit(e.sender.element);
        };

        var yearOnChanged = function(e) {
            submit(e.sender.element);
        };

        var utilityOnChanged = function (e) {
            
            submit(e.sender.element);
        };

        $(document).ready(function () {
            $('#refreshButton').click(function () {
                refresh();
            });
        });
        

        var createUtilityCombo = function() {

            $(settings.utilityDivSelector).kendoComboBox({
                change: utilityOnChanged,
                dataSource: settings.utilityTypes,
                dataTextField: 'Name',
                dataValueField: 'ID',
                suggest: true,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
            }).data('kendoComboBox').select(function(dataItem) {
                var contains = false;
                
                for (var i = 1; i < settings.utilityTypes.length; i++) {
                    if (settings.utilityTypes[i].ID == settings.selectedUtilityType) {
                        contains = true;
                        break;
                    }
                }
                if (!contains) {
                    return true;
                }
                
                return dataItem.ID == settings.selectedUtilityType;    
                
            });

        };

        var createYearCombo = function() {

            $(settings.yearDivSelector).kendoComboBox({
                change: yearOnChanged,
                dataSource: settings.years,
                suggest: true,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
            }).data('kendoComboBox').select(function(dataItem) {
                if (!$.inArray(settings.selectedYear, settings.years)) {
                    return true;
                }
                return dataItem == settings.selectedYear;
            });
        };

        var createMonthCombo = function() {

            $(settings.monthDivSelector).kendoComboBox({
                change: monthOnChanged,
                dataSource: settings.months,
                suggest: true,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
            }).data('kendoComboBox').select(function(dataItem) {
                if (!$.inArray(settings.selectedMonth, settings.months)) {
                    return true;
                }
                return dataItem == settings.selectedMonth;
            });
        };

        var createComboBoxes = function (hasData) {
            if (!hasData) {
                return;
            }
            
            if (settings.showEnergyType) {
                createUtilityCombo();
            }
            createYearCombo();
            createMonthCombo();
        };

        var init = function(settingsObj) {
            $.extend(settings, defaults, settingsObj);
            settings.months = $.parseJSON(settings.months);
            settings.years = $.parseJSON(settings.years);
            settings.showEnergyType = /^True/.test(settings.showEnergyType);
            settings.hasData = /^True/.test(settings.hasData);
            if (settings.showEnergyType) {
                settings.utilityTypes = $.parseJSON(settings.utilityTypes);
            }

            createComboBoxes(settings.hasData);

        };

        return {
            month_onChanged: function (e) {
                submit(e.sender.element);
            },
            year_onChanged: function (e) {
                submit(e.sender.element);
            },
            Utility_onChanged: function (e) {
                submit(e.sender.element);
            },
            refresh: refresh,
            showOverlay: showOverlay,
            init: init
        };
    };
})(jQuery, window, document);