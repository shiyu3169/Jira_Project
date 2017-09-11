(function ($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.UsageProfilesView = new function () {
        var $dom = {
            nextWeek: null,
            nextMonth: null,
            nextYear: null,
            previousWeek: null,
            previousMonth: null,
            previousYear: null,
            endDate: null,
            startDate: null,
            scale: null,
            meters: null,
            combineMeters: null,
            chartType: null,
            filtersForm: null,
            metersList: null,
        };

        var $templates = {
            container: null,
            metersHeaderTemplate: null,
            metersBodyTemplate: null,
            meterGroupsHeaderTemplate: null,
            meterGroupsBodyTemplate: null,
            meterFormTemplate: null,
            meterGroupFormTemplate: null
        };

        var labels = {
            meterGroupSelection: 'Meter Group Selection',
            meterSelection: 'Meter Selection'
        };

        var startDate = null;
        var endDate = null;

        var mySubmit = function () {
            $('#filtersForm').submit();
        };

        var settings = {};

        var defaults = {
            aggregateTypes: [
                {
                    Id: 1,
                    Name: "Show Separately"
                },
                {
                    Id: 0,
                    Name: "Combine"
                }],

            zoomLevels: [
                {
                    Id: 1,
                    Name: "15 Minute"
                },
                {
                    Id: 2,
                    Name: "Hourly"
                },
                {
                    Id: 3,
                    Name: "Daily"
                },
                {
                    Id: 4,
                    Name: "Monthly"
                },
                {
                    Id: 5,
                    Name: "Yearly"
                }],
            chartTypes: [
                {
                    Id: 0,
                    Name: "Stacked Bars"
                },
                {
                    Id: 1,
                    Name: "Separate Bars"
                }
            ]
        };

        var previousMonth = function () {
            startDate.setMonth(startDate.getMonth() - 1);
            endDate.setMonth(endDate.getMonth() - 1);
            $dom.endDate.val(endDate.toString("M/d/yyyy"));
            $dom.startDate.val(startDate.toString("M/d/yyyy"));
            mySubmit();
        };

        var nextMonth = function () {
            startDate.setMonth(startDate.getMonth() + 1);
            endDate.setMonth(endDate.getMonth() + 1);
            $dom.endDate.val(endDate.toString("M/d/yyyy"));
            $dom.startDate.val(startDate.toString("M/d/yyyy"));
            mySubmit();
        };

        var previousWeek = function () {
            startDate.setDate(startDate.getDate() - 7);
            endDate.setDate(endDate.getDate() - 7);
            $dom.endDate.val(endDate.toString("M/d/yyyy"));
            $dom.startDate.val(startDate.toString("M/d/yyyy"));
            mySubmit();
        };

        var nextWeek = function () {
            startDate.setDate(startDate.getDate() + 7);
            endDate.setDate(endDate.getDate() + 7);
            $dom.endDate.val(endDate.toString("M/d/yyyy"));
            $dom.startDate.val(startDate.toString("M/d/yyyy"));
            mySubmit();
        };

        var nextYear = function () {
            startDate.setFullYear(startDate.getFullYear() + 1);
            endDate.setFullYear(endDate.getFullYear() + 1);
            $dom.endDate.val(endDate.toString("M/d/yyyy"));
            $dom.startDate.val(startDate.toString("M/d/yyyy"));
            mySubmit();
        };

        var previousYear = function () {
            startDate.setFullYear(startDate.getFullYear() - 1);
            endDate.setFullYear(endDate.getFullYear() - 1);
            $dom.endDate.val(endDate.toString("M/d/yyyy"));
            $dom.startDate.val(startDate.toString("M/d/yyyy"));
            mySubmit();
        };

        var processDates = function () {
            var startDateText = $dom.startDate.val();
            var endDateText = $dom.endDate.val();

            var currYearAsString = new Date().toString("yy");
            var currYearAsInt = parseInt(currYearAsString, 10);

            var startDateParts = startDateText.split(/[/-]/);
            var startYearString = startDateParts[2];

            if (startYearString.length == 2) {
                var startYearValue = parseInt(startYearString, 10);
                if (startYearValue <= currYearAsInt) {
                    startDate = new Date(startDateParts[0] + "/" + startDateParts[1] + "/20" + startDateParts[2]);
                } else {
                    startDate = new Date(startDateText);
                }
            } else {
                startDate = new Date(startDateText);
            }

            var endDateParts = endDateText.split(/[/-]/);
            var endYearString = endDateParts[2];

            if (endYearString.length == 2) {
                var endYearValue = parseInt(endYearString, 10);
                if (endYearValue <= currYearAsInt) {
                    endDate = new Date(endDateParts[0] + "/" + endDateParts[1] + "/20" + endDateParts[2]);
                } else {
                    endDate = new Date(endDateText);
                }
            } else {
                endDate = new Date(endDateText);
            }

        };

        var createScaleComboBox = function () {
            $dom.scale.kendoComboBox({
                dataValueField: 'Id',
                dataTextField: 'Name',
                suggest: true,
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,

                dataSource: { data: defaults.zoomLevels }

            }).data('kendoComboBox').select(function (dataItem) {

                return dataItem.Id == settings.scaleData;
            });
        };

        var createMetersComboBox = function () {

            $dom.meters.kendoComboBox({
                suggest: true,
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,

                select: function (e) {
                    e.preventDefault();
                },
                open: function () {
                    settings.allowClose = false;
                },
                headerTemplate: settings.isMeterGroups ? $templates.meterGroupsHeaderTemplate.html() : $templates.metersHeaderTemplate.html(),
                template: ''
            }).data('kendoComboBox');
            kendo.bind($('#meters-list table:first > tbody > tr > td'), kendo.observable(settings));
            var list = $('#meters-list ul');
            list.attr('data-bind', 'source: data').attr('data-template', settings.isMeterGroups ? 'meterGroupsTableBodyTemplate' : 'metersTableBodyTemplate');;
            kendo.bind($('#meters-list ul'), kendo.observable({ data: settings.isMeterGroups ? settings.meterGroupsData : settings.metersData }));
            bindCheckBoxClick();
            metersControl.init();
            meterGroupControl.init();
        };
        
        var initializeForm = function () {
            settings.metersData.forEach(function (element, index) {
                element.Index = index;
            });
            
            meterInput.create(settings.metersData);

            settings.meterGroupsData.forEach(function (element, index) {
                element.Index = index;
            });
            
            meterGroupInput.create(settings.meterGroupsData);
        };

        var meterGroupInput = (function () {
            var inputs = {};
            return {
                create: function (data) {
                    var list = $('#meterGroupFormList');
                    var listNode = $($.trim(list.html()));
                    $dom.filtersForm.append(listNode);
                    kendo.bind(listNode, { data: data });
                    $('input[name*="MeterGroups"]').filter('input[name$="Selected"]').each(function () {
                        var that = $(this);
                        inputs[that.data('index')] = that;
                    });
                },
                select: function (id) {
                    settings.allMeters = false;
                    meterInput.unselectAll();
                    inputs[id].val(true);
                },
                selectAll: function () {
                    settings.allMeters = false;
                    settings.allMeterGroups = true;
                    meterInput.unselectAll();
                    for (var input in inputs) {
                        inputs[input].val(true);
                    }
                },
                unselect: function (id) {
                    settings.allMeterGroups = false;
                    meterInput.unselectAll();
                    inputs[id].val(false);
                },
                unselectAll: function () {
                    settings.allMeterGroups = false;
                    for (var input in inputs) {
                        inputs[input].val(false);
                    }
                }

            };
        })();

        var meterInput = (function () {
            var inputs = {};
            return {
                create: function (data) {
                    var list = $('#metersFormList');
                    var listNode = $($.trim(list.html()));
                    $dom.filtersForm.append(listNode);
                    kendo.bind(listNode, { data: data });
                    $('input[name*="Meters"]').filter('input[name$="Selected"]').each(function () {
                        var that = $(this);
                        inputs[that.data('index')] = that;
                    });

                },
                select: function (id) {
                    settings.allMeterGroups = false;
                    meterGroupInput.unselectAll();
                    inputs[id].val(true);
                },
                selectAll: function () {
                    settings.allMeterGroups = false;
                    settings.allMeters = true;
                    meterGroupInput.unselectAll();
                    for (var input in inputs) {
                        inputs[input].val(true);
                    }
                },
                unselect: function (id) {
                    settings.allMeters = false;
                    inputs[id].val(false);

                },
                unselectAll: function () {
                    settings.allMeters = false;
                    for (var input in inputs) {
                        inputs[input].val(false);
                    }
                }
            };
        })();
        
        //For some reason when i updated the bound data the checkboxes wouldn't updated and i was frustrated so this stuff does it....I bet i missed somethig obvious
        var metersControl = (function () {
            var inputs = {};

            return {
                init: function() {
                    $('.meterClickBind').each(function () {
                        var that = $(this);
                        inputs[that.data('index')] = that;
                    });
                },
                select: function (index) {
                    inputs[index].prop('checked', true);
                    settings.metersData[index].Selected = true;
                },
                selectAll: function () {
                    settings.metersData.forEach(function(element, index) {
                        inputs[index].prop('checked', true);
                        settings.metersData[index].Selected = true;
                    });
                },
                unselect: function (index) {
                    settings.metersData[index].Selected = false;
                    inputs[index].prop('checked', false);
                },
                unselectAll: function () {
                    settings.metersData.forEach(function (element, index) {
                        inputs[index].prop('checked', false);
                        settings.metersData[index].Selected = false;
                    });
                }
            };
        })();

        var meterGroupControl = (function () {
            var inputs = {};

            return {
                init: function () {
                    $('.meterGroupClickBind').each(function () {
                        var that = $(this);
                        inputs[that.data('index')] = that;
                    });
                },
                select: function (index) {
                    inputs[index].prop('checked', true);
                    settings.meterGroupsData[index].Selected = true;
                },
                selectAll: function () {
                    settings.meterGroupsData.forEach(function (element, index) {
                        inputs[index].prop('checked', true);
                        settings.meterGroupsData[index].Selected = true;
                    });
                },
                unselect: function (index) {
                    inputs[index].prop('checked', false);
                    settings.meterGroupsData[index].Selected = false;
                },
                unselectAll: function () {
                    settings.meterGroupsData.forEach(function (element, index) {
                        inputs[index].prop('checked', false);
                        settings.meterGroupsData[index].Selected = false;
                    });
                }
            };
        })();

        var bindCheckBoxClick = function () {

            var meterCheckboxes = $('.meterClickBind');
            meterCheckboxes.on('click', function () {
                var me = $(this);
                var index = me.data('index');
                var isChecked = me.is(':checked');
                if (isChecked) {
                    meterInput.select(index);
                    metersControl.select(index);
                    return;
                }
                meterInput.unselect(index);
                metersControl.unselect(index);
            });

            var meterGroupCheckboxes = $('.meterGroupClickBind');
            meterGroupCheckboxes.on('click', function () {
                var me = $(this);
                var index = me.data('index');
                var isChecked = me.is(':checked');
                if (isChecked) {
                    meterGroupInput.select(index);
                    meterGroupControl.select(index);
                    return;
                }
                meterGroupInput.unselect(index);
                meterGroupControl.unselect(index);
            });

            var meterGroupSelectAll = $('.meterGroupSelectAll');
            meterGroupSelectAll.on('click', function () {
                var me = $(this);
                var isChecked = me.is(':checked');
                if (isChecked) {
                    meterGroupInput.selectAll();
                    meterGroupControl.selectAll();
                    return;
                }
                meterGroupInput.unselectAll();
                meterGroupControl.unselectAll();
            });

            var meterSelectAll = $('.metersSelectAll');
            meterSelectAll.on('click', function () {
                var me = $(this);
                var isChecked = me.is(':checked');
                if (isChecked) {
                    meterInput.selectAll();
                    metersControl.selectAll();
                    return;
                }
                meterInput.unselectAll();
                metersControl.unselectAll();
            });

        };
        
        var createAggregateComboBox = function () {
            if (settings.isSettingsView) {
                return;
            }
            $dom.aggregate.kendoComboBox({
                dataValueField: 'Id',
                dataTextField: 'Name',
                suggest: true,
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,

                dataSource: { data: defaults.aggregateTypes }

            }).data('kendoComboBox').select(function (dataItem) {

                return dataItem.Id == settings.aggregateData;
            });
        };

        var createChartTypeComboBox = function () {
            $dom.chartType.kendoComboBox({
                dataValueField: 'Id',
                dataTextField: 'Name',
                suggest: true,
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,

                dataSource: { data: defaults.chartTypes }

            }).data('kendoComboBox').select(function (dataItem) {

                return dataItem.Id == settings.chartTypeData;
            });
        };

        var createComboBoxes = function () {
            createScaleComboBox();
            createMetersComboBox();
            if (settings.isSettingsView) {
                return;
            }
            createAggregateComboBox();
            createChartTypeComboBox();
        };

        var bindMeterOrMeterGroupClick = function () {
            var meterRadios = $(settings.meterOrMeterGroupContainer + ' input[type="radio"]');
            var meters = $(meterRadios[0]);
            var meterGroups = $(meterRadios[1]);

            meters.on('click', function () {
                settings.isMeterGroups = false;
                meterGroupControl.unselectAll();
                meterGroupInput.unselectAll();
                $dom.meters.data('kendoComboBox').destroy();
                $dom.meters.val(labels.meterSelection);
                createMetersComboBox();
            });

            meterGroups.on('click', function () {
                settings.isMeterGroups = true;
                metersControl.unselectAll();
                meterInput.unselectAll();
                $dom.meters.data('kendoComboBox').destroy();
                $dom.meters.val(labels.meterGroupSelection);
                createMetersComboBox();
            });

        };

        var bindClickHandlers = function () {
            bindMeterOrMeterGroupClick();
        };

        var init = function (settingsObj) {
            settings = $.extend(settings, defaults, settingsObj);
            $dom.nextWeek = $(settings.nextWeek).on('click', nextWeek);
            $dom.nextMonth = $(settings.nextMonth).on('click', nextMonth);
            $dom.nextYear = $(settings.nextYear).on('click', nextYear);
            $dom.previousMonth = $(settings.previousMonth).on('click', previousMonth);
            $dom.previousYear = $(settings.previousYear).on('click', previousYear);
            $dom.previousWeek = $(settings.previousWeek).on('click', previousWeek);
            $dom.endDate = $(settings.endDate);
            $dom.startDate = $(settings.startDate);
            
            if (settings.form) {
                $dom.filtersForm = $(settings.form);
            } else {
                $dom.filtersForm = $('form');
            }

            $dom.metersList = $('#meters-list');
            $('[name="submitButton"]').not(".noOverlay").click(function () {
                window.SEMS.Overlay.show();
            });
            settings.scaleData = $.parseJSON(settings.scaleData);
            settings.metersData = settings.metersData;

            settings.meterGroupsData = settings.meterGroupsData;

            settings.selectedMeters = settings.selectedMeters;
            settings.isMeterGroups = /^True/.test(settings.isMeterGroups);
            settings.isSettingsView = /^True/.test(settings.isSettingsView);
            settings.allMeterGroups = /^True/.test(settings.allMeterGroups);
            settings.allMeters = /^True/.test(settings.allMeters);
            $templates.metersHeaderTemplate = $('#metersHeaderTemplate');
            $templates.metersBodyTemplate = $('#metersTableBodyTemplate');
            $templates.meterGroupsHeaderTemplate = $('#meterGroupsHeaderTemplate');
            $templates.meterGroupsBodyTemplate = $('#meterGroupsTableBodyTemplate');
            $templates.meterFormTemplate = $('#meterFormsTemplate');
            $templates.meterGroupFormTemplate = $('#meterGroupsFormsTemplate');

            $dom.scale = $(settings.scale);
            $dom.meters = $(settings.meters);
            $dom.aggregate = $(settings.aggregate);
            $dom.chartType = $(settings.chartType);
            $dom.meters.val(settings.isMeterGroups ? labels.meterGroupSelection : labels.meterSelection);
            
            initializeForm();
            createComboBoxes();
            bindClickHandlers();

            if (settings.isSettingsView) {
                return;
            }
            
            processDates();
        };

        return {
            init: init
        };
    };
})(jQuery, window, document);