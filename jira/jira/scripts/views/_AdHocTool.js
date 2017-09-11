//-------------------------
// Variables Functions
//-------------------------
var delayTime = 600;
var isSystemAdministrator = false;

//-----------------------
// javascript
//-----------------------
function OnBeginCallback(s, e) {
    e.customArgs["startDate"] = $("#UsagePeriodFrom").val();
    e.customArgs["endDate"] = $("#UsagePeriodTo").val();
    e.customArgs["query"] = $("#dlItems").val();
    e.customArgs["groupId"] = $("#GroupID").val();
    e.customArgs["account"] = $("#Account").val();
    e.customArgs["summaryAccount"] = $("#SummaryAccount").val();
    e.customArgs["town"] = $("#Town").val();
}

function OnEndCallback(s, e) {
    //Remove "Loading" overlay
    loader.remove();
    }

function cbp_OnBeginCallback(s, e) {
    e.customArgs["startDate"] = $("#UsagePeriodFrom").val();
    e.customArgs["endDate"] = $("#UsagePeriodTo").val();
    e.customArgs["query"] = $("#dlItems").val();
    e.customArgs["groupId"] = $("#GroupID").val();
    e.customArgs["account"] = $("#Account").val();
    e.customArgs["summaryAccount"] = $("#SummaryAccount").val();
    e.customArgs["town"] = $("#Town").val();
}

function cbp_OnEndCallback(s, e) {
    $("#dataArea").show(delayTime);

    //Show/Hide settings area if checkbox is Hide Settings checked/unchecked
    if ($('#HideSettings').is(':checked')) {
        $(ToggleSettings());
    }

    //Remove "Loading" overlay
    loader.remove();
}

//-------------------------
// Custom Functions
//-------------------------
$(function () {
    $("#dataTabs").tabs();
});

function InitializeFields() {
    $('.itemArea').hide();
    $('#dataArea').hide();
    $('.hideSettingsArea').hide();
    $('.filterFieldArea').hide();
    $('#GetDataButton').hide();
}

function SetFilters() {
    //Show the filter fields for the selected view
    switch ($("#dlItems").val()) {
        case (""):
            $('.filterFieldArea').hide(delayTime);
            $('#GetDataButton').hide();
            $('.filterField').val('');
            break;
        case ("vw_InvoicesByGroup_Electric"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            
            break;
        case ("vw_InvoicesByGroup_NatGas"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_InvoicesByGroup_Water"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_InvoicesByGroup_Steam"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_InvoicesByGroup_CHW"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_InvoicesByGroup_Oil"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_InvoicesByGroup_All_Types"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("UDF_Missing_Invoices_No_Param"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').hide(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_Group_Location_Asset_Electric"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_Group_Location_Asset_NatGas"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_Group_Location_Asset_All_Types"):
            $('#usagePeriodFilter').show(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_Account_ECA_Alloc"):
            $('#usagePeriodFilter').hide(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_ECA_DetailsList"):
            $('#usagePeriodFilter').hide(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').hide(delayTime);
            $('#GetDataButton').show();
            break;
        case ("vw_AccountDetailsList"):
            $('#usagePeriodFilter').hide(delayTime);
            $('#groupFilter').show(delayTime);
            $('#townFilter').show(delayTime);
            $('#summaryAccountFilter').show(delayTime);
            $('#accountFilter').show(delayTime);
            $('#GetDataButton').show();
            break;
        case ("PortfolioManagementExport"):
            $('#usagePeriodFilter').show(delayTime);
            $('#GetDataButton').show();
            
            if (isSystemAdministrator == 'True') {
                $('#groupFilter').show(delayTime);
            }

            break;
        default:
            $('.filterFieldArea').hide(delayTime);
            $('#GetDataButton').hide();
            $('.filterField').val('');
    }
}

function ToggleSettings() {
    $("#ReportSettings").toggle("blind", "", delayTime);
    $("#ReportSettingsLabel").toggleClass("collArrow");
};

//-------------------------
// jQuery
//-------------------------
$(document).ready(function () {
    //-------------------------
    // Starting Code
    //-------------------------
    isSystemAdministrator = $("#IsSystemAdministrator").val();

    InitializeFields();

    //-------------------------
    // Blur, Lose Focus, Change Events
    //-------------------------
    $('.filterOption').on('change', (function () {
        $('#dataArea').hide(delayTime);
    }));
       
    $('.datepicker').on('blur focusout change', (function () {
        var value = $(this).val();

        if (value != null && value != "") {
            if (isValidDate(value)) {
                $(this).val(dateFormat(value, "m/d/yyyy"));
            }
        };
    }));

    $('#UsagePeriodFrom').on('blur focusout change', (function () {
        var start = $(this).val();
        var end = $("#UsagePeriodTo").val();

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
    //GetDataButton
    $("#GetDataButton").click(function () {
        //Create "Loading" overlay
        loader = new ajaxLoader($('#loadingArea'));
        
        //Set hidden text boxes for the export parameters
        $('#queryName').val($("#dlItems").val());
        $('#startDate').val($("#UsagePeriodFrom").val());
        $('#endDate').val($("#UsagePeriodTo").val());
        $('#account_hidden').val($("#Account").val());
        $('#summaryAccount_hidden').val($("#SummaryAccount").val());
        $('#town_hidden').val($("#Town").val());
        $('#group_hidden').val($("#GroupID").val());

        if ($("#dlItems").val() != "PortfolioManagementExport") {
            //Set hidden text boxes for the export parameters
            $('#queryName').val($("#dlItems").val());
            $('#startDate').val($("#UsagePeriodFrom").val());
            $('#endDate').val($("#UsagePeriodTo").val());

            cbp.PerformCallback();
        } else {
            //Remove "Loading" overlay
            loader.remove();
            
            $('#dataArea').hide();

            excelWindow = window.open(RootURL + "InvoiceReporting/EIAExport/?startDateIn=" + $('#UsagePeriodFrom').val() + "&endDateIn=" + $('#UsagePeriodTo').val() + "&groupIDIn=" + $('#GroupID').val());
            excelWindow.blur();
        }
    });

    //-------------------------
    // Change Events
    //-------------------------
    //dlQueries
    $("#dlQueries").change(function () {
        //Create "Loading" overlay
        loader = new ajaxLoader($('#loadingArea'));
        
        $('.filterFieldArea').hide(delayTime);
        $('.filterField').val('');
        $('#GetDataButton').hide();
        $("#dlItems").html();

        $.getJSON(RootURL + "InvoiceReporting/GetItemListForCategory/?category=" + $("#dlQueries").val(), function(data) {

            var options = "";
            $.each(data, function(i, term) {
                options += "<option value='" + term.Value + "'>" + term.Text + "</option>";

            });

            //Items were found for the selected category
            if (options != null && options != "") {
                $(".itemArea").show(delayTime);
                $(".hideSettingsArea").show(delayTime);
                $("#dlItems").html(options);
            } else {
                $('.itemArea').hide(delayTime);
                $('.hideSettingsArea').hide(delayTime);
            }

        }).complete(function() {
            //Remove "Loading" overlay
            loader.remove();
        });
    });
    //dlItems
    $("#dlItems").change(function () {
        $('.filterArea').slideDown(delayTime);
        SetFilters();
    });
});
    
