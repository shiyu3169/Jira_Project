//-------------------------
// Variables Functions
//-------------------------
var delayTime = 600;
var isSystemAdministrator = "True";
var groupName = "";
var _startDate = "";
var _endDate = "";
var _accountType = "";
var _energyType = "";
var _energyUoM = "";
var chartTypeCaption = "Cost";
var dateRangeText = "";
var isInitialized = false;
var selectedECA = "";
var selectedGroup = "";
var selectedUsagePeriod = "";
var selectedEnergyType = "";
var selectedEnergyUoM = "";
var isFirstCallback = true;

//-----------------------
// javascript
//-----------------------
function OnBeginCallback(s, e) {
    e.customArgs["usagePeriod"] = selectedUsagePeriod;
    e.customArgs["groupName"] = selectedGroup;
    e.customArgs["ecaName"] = selectedECA;
    e.customArgs["accountType"] = _accountType;
    e.customArgs["energyType"] = _energyType;
    e.customArgs["energyUoM"] = _energyUoM;
}

function OnEndCallback(s, e) {
    if (isFirstCallback == true)
        isFirstCallback = false;
    else {
        $('#usageDataOverallArea').slideDown(800);
        $("#UsageDataSettingsLabel").text("Invoices for " + selectedUsagePeriod);
        
        //Remove "Loading" overlay
        loader.remove();
    }
}

function cbp_usagePeriodData_OnBeginCallback(s, e) {
}

function cbp_usagePeriodData_OnEndCallback(s, e) {
    //Remove "Loading" overlay
    loader.remove();
}

function groupClickProcessing(e) {
    loader = new ajaxLoader($('#loadingArea'));

    $.get(RootURL + 'InvoiceReporting/ECACharts/?chartType=' + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
        + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate + '&groupName=' + escape(e.point.name), function (data) {
        $.get(RootURL + "InvoiceReporting/GetChartTotal/?valueType=" + $('#dlTypes').val()+ "&accountType=" + _accountType  + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM 
            + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate + '&groupName=' + escape(e.point.name), function (totalData) {

            var totalValue;

            totalValue = numberPrecision(totalData, 0);
            totalValue = addCommas(totalValue);

            if ($('#dlTypes').val() == "cost") {
                totalValue = "$" + totalValue;
            }

            $('#usageDataOverallArea').hide();

            var accountTypeText = '';
            if (_accountType != "--All--") {
                accountTypeText = ' for ' + _accountType + ' accounts';
            }
                
            var energyTypeText = '';
            if (_energyType != "--All--") {
                energyTypeText = ' for ' + _energyType;
            }
                
            var energyUoMText = '';
            if (_energyUoM != "--All--") {
                energyUoMText = '/' + _energyUoM;
            }
                
            var htmlString = "";
            htmlString = "<div id='ECAChartSettingsLabel' class='collArrow expArrow' title='Click to show/hide chart'>";
            htmlString = htmlString + chartTypeCaption + " by ECA for " + e.point.name + dateRangeText + accountTypeText + energyTypeText + energyUoMText + " - Total: " + addCommas(totalValue) + "</div>";

            $('#periodChartArea').html("<div></div>");
            $('#ecaChartArea').html(htmlString + "<div id='ecaChartActual'>" + data + "</div>");

            //Hide previous area
            //ToggleGroupChartArea();

            selectedGroup = e.point.name;
                
            //Remove "Loading" overlay
            loader.remove();
           
        });
    });
}

function ecaClickProcessing(e) {
    loader = new ajaxLoader($('#loadingArea'));
    
    $.get(RootURL + 'InvoiceReporting/PeriodCharts/?chartType=' + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
            + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate + '&groupName=' + escape(selectedGroup) + '&ecaName=' + escape(e.point.name), function (data) {
                $.get(RootURL + "InvoiceReporting/GetChartTotal/?valueType=" + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
                    + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate + '&groupName=' + escape(selectedGroup) + '&ecaName=' + escape(e.point.name), function (totalData) {
                        
        var totalValue;

        totalValue = numberPrecision(totalData, 0);
        totalValue = addCommas(totalValue);

        if ($('#dlTypes').val() == "cost") {
            totalValue = "$" + totalValue;
        }

        $('#usageDataOverallArea').hide();

            var accountTypeText = '';
            if (_accountType != "--All--") {
                accountTypeText = ' for ' + _accountType + ' accounts';
            }
                        
            var energyTypeText = '';
            if (_energyType != "--All--") {
                energyTypeText = ' for ' + _energyType;
            }
                        
            var energyUoMText = '';
            if (_energyUoM != "--All--") {
                energyUoMText = '/' + _energyUoM;
            }

            var htmlString = "";
            htmlString = "<div id='PeriodChartSettingsLabel' class='collArrow expArrow' title='Click to show/hide chart'>";
            htmlString = htmlString + chartTypeCaption + " by Usage Period for " + e.point.name + dateRangeText + accountTypeText + energyTypeText + energyUoMText + " - Total: " + addCommas(totalValue) + "</div>";

            $('#periodChartArea').html(htmlString + "<div id='periodChartActual'>" + data + "</div>");

            //Hide previous area
            //ToggleECAChartArea();

            selectedECA = e.point.name;
                        
            //Remove "Loading" overlay
            loader.remove();
        });
    });
}

function periodClickProcessing(e) {
    
//    //Date
//    debug.log(e.point.category);
//    
//    //Value
//    debug.log(e.point.config);
    selectedUsagePeriod = e.point.category;

    loader = new ajaxLoader($('#loadingArea'));
    
    cbp_usagePeriodData.PerformCallback();
    
}

//-------------------------
// Custom Functions
//-------------------------
$(function () {
    $("#dataTabs").tabs();
});

function InitializeFields() {
    //$("#ReportSettings").hide();
    $("#ReportSettingsLabel").toggleClass("collArrow");
    $('#usageDataOverallArea').hide();
    
    $.get(RootURL + "Home/GetServerDateTime", function (data) {
        var currentDate = dateFormat(data, "m/d/yyyy");
        var initialStartPeriod = dateFormat(new Date(currentDate).add(-425).days(), "m/d/yyyy");
        var initialEndPeriod = dateFormat(new Date(currentDate).add(-60).days(), "m/d/yyyy");

        $('#UsagePeriodFrom').val(initialStartPeriod);
        $('#UsagePeriodTo').val(initialEndPeriod);

        $("#GetDataButton").click();
    });
};

function ToggleSettings() {
    $("#ReportSettings").toggle("blind", "", delayTime);
    $("#ReportSettingsLabel").toggleClass("collArrow");
};

function ToggleGroupChartArea() {
    $("#groupChartArea").toggle("blind", "", 1000);
    $("#GroupChartSettingsLabel").toggleClass("collArrow");
};

function ToggleECAChartArea() {
    $("#ecaChartActual").toggle("blind", "", 1000);
    $("#ECAChartSettingsLabel").toggleClass("collArrow");
};

function TogglePeriodChartArea() {
    $("#periodChartActual").toggle("blind", "", 1000);
    $("#PeriodChartSettingsLabel").toggleClass("collArrow");
};

function ToggleUsageDataArea() {
    $("#usageDataArea").toggle("blind", "", 1000);
    $("#UsageDataSettingsLabel").toggleClass("collArrow");
};

//-------------------------
// jQuery
//-------------------------
$(document).ready(function () {
    //-------------------------
    // Starting Code
    //-------------------------
    //isSystemAdministrator = $("#IsSystemAdministrator").val();
    groupName = $("#GroupName").val();

    InitializeFields();

    $('#UsagePeriodFrom').on('blur focusout change', (function () {
        // JC-2013-06-11: not sure this is needed anymore
        var start = $(this).val();
        var end = $("#UsagePeriodTo").val();

        //Check if data is a valid date
        if (start != null && start != "") {
            if (isValidDate(start)) {
                //Check if data for the matching field is a valid date
                if (end != null && end != "") {
                    if (isValidDate(end)) {
                        //If start date is greater than end date
                        if (new Date(start) > new Date(end)) {
                            //Wipe start date
                            $(this).val('');
                            var msg = "The From date can not be greater than the To date.  Please try a different date.";
                            var title = "From Date Greater Than To Date";
                            dialogOKOnly(false, title, msg);
                        }
                    }
                }
            }
            else {
                //Wipe start date
                $(this).val('');
            }
        };
    }));

    $('#UsagePeriodTo').on('blur focusout change', (function () {
        // JC-2013-06-11: not sure this is needed anymore
        var start = $("#UsagePeriodFrom").val();
        var end = $(this).val();

        //Check if data is a valid date
        if (start != null && start != "") {
            if (isValidDate(start)) {
                //Check if data for the matching field is a valid date
                if (end != null && end != "") {
                    if (isValidDate(end)) {
                        var newStart = new Date(start);
                        var newEnd = new Date(end);
                        //If start date is greater than end date
                        if (new Date(start) > new Date(end)) {
                            //Wipe start date
                            $(this).val('');
                            var msg = "The To date can not be less than the From date.  Please try a different date.";
                            var title = "To Date Less Than From Date";
                            dialogOKOnly(false, title, msg);
                        }
                    }
                }
            }
            else {
                //Wipe end date
                $(this).val('');
            }
        };
    }));

    //-------------------------
    // Click Events
    //-------------------------
    //ReportSettingsLabel
    $("#ReportSettingsLabel").click(function () {
        ToggleSettings();
    });

    $('#GroupChartSettingsLabel').on('click', (function () {
        ToggleGroupChartArea();
    }));

    $('#ECAChartSettingsLabel').on('click', (function () {
        ToggleECAChartArea();
    }));

    $('#PeriodChartSettingsLabel').on('click', (function () {
        TogglePeriodChartArea();
    }));

    $('#UsageDataSettingsLabel').on('click', (function () {
        ToggleUsageDataArea();
    }));

    //PrintButton
    $('#PrintButton').click(function () {
        var printPreview = window.open('about:blank', 'print_preview');
        var printDocument = printPreview.document;

        printDocument.open();
        printDocument.write("<!DOCTYPE html><html>" + $('#PrintArea').html() + "</html>");
        printPreview.focus();
        printDocument.close();
        printPreview.print();
        printPreview.onfocus = function () {
            printPreview.close();
            window.focus();
        };
    });
    
    //GetDataButton
    $("#GetDataButton").click(function () {
        switch ($('#dlTypes').val()) {
            case 'cost': chartTypeCaption = "Cost"; break;
            case 'mmbtu': chartTypeCaption = "MMBTU"; break;
            case 'lbs_co2': chartTypeCaption = "lbs/CO2"; break;
            case 'usage': chartTypeCaption = "Usage"; break;
        }
        
        //Set parameters to global variables
        _startDate = $('#UsagePeriodFrom').val();
        _endDate = $('#UsagePeriodTo').val();
        _accountType = $('#dlAccountTypes').val();
        _energyType = $('#dlEnergyTypes').val();
        _energyUoM = $('#EnergyUoMs').val();

        var newStart = new Date(_startDate);
        var newEnd = new Date(_endDate);

        newStart = new Date(newStart.getFullYear(), newStart.getMonth());
        newEnd = new Date(newEnd.getFullYear(), newEnd.getMonth());

        _startDate = dateFormat(newStart, "m/d/yyyy");
        _endDate = dateFormat(newEnd, "m/d/yyyy");

        //$(debug.log('isSystemAdministrator = ' + isSystemAdministrator));
        
        //$(debug.log(_startDate));
        //$(debug.log(_endDate));
        //$(debug.log(_energyType));
        //$(debug.log(_energyUoM));
        //$(debug.log($('#dlTypes').val()));
        
        loader = new ajaxLoader($('#loadingArea'));
        
        if (isSystemAdministrator == "True")
            
            $.get(RootURL + "InvoiceReporting/GroupCharts/?chartType=" + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
                + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate, function (data) {
                    $.get(RootURL + "InvoiceReporting/GetChartTotal/?valueType=" + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
                    + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate, function (totalData) {

                    if (dateFormat(_startDate, "m/d/yyyy") == '1/1/1900' && dateFormat(_endDate, "m/d/yyyy") == '1/1/2200') {
                        dateRangeText = " for all Usage Periods";
                    } else {
                        dateRangeText = " from " + dateFormat(_startDate, "m/yyyy") + " to " + dateFormat(_endDate, "m/yyyy");
                    }

                    var totalValue;

                    totalValue = numberPrecision(totalData, 0);
                    totalValue = addCommas(totalValue);

                    if ($('#dlTypes').val() == "cost") {
                        totalValue = "$" + totalValue;
                    }

                    var accountTypeText = '';
                    if (_accountType != "--All--") {
                        accountTypeText = ' for ' + _accountType + ' accounts';
                    }
                        
                    var energyTypeText = '';
                    if (_energyType != "--All--") {
                        energyTypeText = ' for ' + _energyType;
                    }
                   
                    var energyUoMText = '';
                    if (_energyUoM != "--All--") {
                        energyUoMText = '/' + _energyUoM;
                    }
                        
                    $('#usageDataOverallArea').hide();
                    $('#periodChartArea').html("<div></div>");
                    $('#ecaChartArea').html("<div></div>");
                    $("#groupChartArea").show();
                    $('#groupChartArea').html(data);
                    $("#GroupChartSettingsLabel").html(chartTypeCaption + " by Group " + dateRangeText + accountTypeText + energyTypeText + energyUoMText + " - Total: " + addCommas(totalValue));

                    //Remove "Loading" overlay
                    loader.remove();
                });
            });
        else {
            $.get(RootURL + 'InvoiceReporting/ECACharts/?chartType=' + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
                + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate + '&groupName=' + groupName, function (data) {
                $.get(RootURL + "InvoiceReporting/GetChartTotal/?valueType=" + $('#dlTypes').val() + "&accountType=" + _accountType + "&energyType=" + _energyType + "&energyUoM=" + _energyUoM
                    + "&startDateIn=" + _startDate + "&endDateIn=" + _endDate + '&groupName=' + groupName, function (totalData) {
                        
                    var totalValue;

                    totalValue = numberPrecision(totalData, 0);
                    totalValue = addCommas(totalValue);

                    if ($('#dlTypes').val() == "cost") {
                        totalValue = "$" + totalValue;
                    }

                    if (dateFormat(_startDate, "m/d/yyyy") == '1/1/1900' && dateFormat(_endDate, "m/d/yyyy") == '1/1/2200') {
                        dateRangeText = " for all Usage Periods";
                    } else {
                        dateRangeText = " from " + dateFormat(_startDate, "m/yyyy") + " to " + dateFormat(_endDate, "m/yyyy");
                    }

                    var accountTypeText = '';
                    if (_accountType != "--All--") {
                        accountTypeText = ' for ' + _accountType + ' accounts';
                    }
                        
                    var energyTypeText = '';
                    if (_energyType != "--All--") {
                        energyTypeText = ' for ' + _energyType;
                    }
                        
                    var energyUoMText = '';
                    if (_energyUoM != "--All--") {
                        energyUoMText = '/' + _energyUoM;
                    }
                        
                    var htmlString = "";
                    htmlString = "<div id='ECAChartSettingsLabel' class='collArrow expArrow' title='Click to show/hide chart'>";
                    htmlString = htmlString + chartTypeCaption + " by ECA for " + groupName + dateRangeText + accountTypeText + energyTypeText + energyUoMText + " - Total: " + addCommas(totalValue) + "</div>";

                    $('#usageDataOverallArea').hide();
                    $('#periodChartArea').html("<div></div>");
                    $('#ecaChartArea').html(htmlString + "<div id='ecaChartActual'>" + data + "</div>");

                    $("#groupChartArea").hide();
                    $("#GroupChartSettingsLabel").hide();

                    selectedGroup = groupName;
                        
                    //Remove "Loading" overlay
                    loader.remove();
                });
            });
        }

        if (isInitialized == true) {
            //Show/Hide settings area if checkbox is Hide Settings checked/unchecked
            if ($('#HideSettings').is(':checked')) {
                $(ToggleSettings());

            }
        } else {
            isInitialized = true;
        }
    });
    
    //---------------------
    // Change event handlers
    //---------------------
    //Energy Type
    $('#dlEnergyTypes').change(function () {
        //Fill Energy UoM
        getValueList(0, 'EnergyUoM', $('#dlEnergyTypes').val());
        
        $('#EnergyUoMs').val("--All--");
    });
});
    
