
$(document).ready(function () {
    //-------------------------
    // Variables 
    //-------------------------
    var BudgetID = $("#AccountBudgetEstimate_BudgetID").val();

    //-------------------------
    // Starting Code
    //-------------------------
    InitializeFields();

    //---------------------
    // Click event handlers
    //---------------------
    $('#EditBudget').click(function () {
        var selectedAccount = $('#AccountBudgetEstimate_AccountID').val();
        var selectedYear = $('#AccountBudgetEstimate_Year').val();

        if (selectedAccount != 0 && selectedYear != 0) {
            window.location.href = RootURL + 'InvoiceReporting/CallBudgetReportFromEdit?accountId=' + selectedAccount + '&year=' + selectedYear;
        }
    });

    //---------------------
    // Change event handlers
    //---------------------
    $('[id*=Cost]').change(function () {
        $(this).val(numberPrecision($(this).val(), 2));
        SetFields('UpdateTotals');
    });
    
    $('[id*=Usage]').change(function () {
        $(this).val(numberPrecision($(this).val(), 0));
        SetFields('UpdateTotals');
    });
    
    //-------------------------
    // Custom Functions
    //-------------------------
    function InitializeFields() {
        SetFields('SetZeros');
        
        //Show/Hide fields depending on if the record is being created or edited
        if (BudgetID > 0) {
            $('#AccountBudgetEstimate_Year').attr('disabled', 'disabled');

            SetFields('DisableFields');
            $('#mock-table').removeAttr('hidden');
            $('#mock-table').show();

            SetFields('SetDecimalPlaces');
            SetFields('UpdateTotals');
        }
            //New record being created
        else {
            $('#mock-table').hide();

            var theDate = new Date();
            var defaultYear = theDate.getFullYear() + 1;
            $('#AccountBudgetEstimate_Year').val(defaultYear);
        }
    }

    function SetFields(type) {
        var EstimatedCostTotal;
        var EstimatedUsageTotal;
        var ActualCostTotal;
        var ActualUsageTotal;
        var ActualCostProjectedTotal;
        var ActualUsageProjectedTotal;

        EstimatedCostTotal = 0;
        EstimatedUsageTotal = 0;
        ActualCostTotal = 0;
        ActualUsageTotal = 0;
        ActualCostProjectedTotal = 0;
        ActualUsageProjectedTotal = 0;

        //Loop 12 times to grab all the fields for each month
        for (var i = 1; i < 13; i++) {
            var j = '0';

            if (i < 10) {
                j = "0" + i;
            } else {
                j = i;
            }

            //--------------
            // Disable Budget Actual fields
            //--------------
            if (type == 'DisableFields') {
                //Cost
                $('#AccountBudgetActual_Cost' + j).attr('disabled', 'disabled');

                //Usage
                $('#AccountBudgetActual_Usage' + j).attr('disabled', 'disabled');
            }
            //--------------
            // Set Zeros for all Actual fields if null.  This is the easiest workaround for the Required field issue, even though we aren't setting the fields through the viewmodel
            //--------------
            else if (type == 'SetZeros') {
                //Cost
                if ($('#AccountBudgetActual_Cost' + j).val() == '' || $('#AccountBudgetActual_Cost' + j).val() == null) {
                    $('#AccountBudgetActual_Cost' + j).val("0.00");
                }
                //Usage
                if ($('#AccountBudgetActual_Usage' + j).val() == '' || $('#AccountBudgetActual_Usage' + j).val() == null) {
                    $('#AccountBudgetActual_Usage' + j).val("0");
                }
            }
            //--------------
            // Set decimal place format for all values
            //--------------
            else if (type == 'SetDecimalPlaces') {
                $('#AccountBudgetEstimate_Cost' + j).val(numberPrecision($('#AccountBudgetEstimate_Cost' + j).val(), 2));
                $('#AccountBudgetActual_Cost' + j).val(numberPrecision($('#AccountBudgetActual_Cost' + j).val(), 2));
                $('#AccountBudgetEstimate_Usage' + j).val(numberPrecision($('#AccountBudgetEstimate_Usage' + j).val(), 0));
                $('#AccountBudgetActual_Usage' + j).val(numberPrecision($('#AccountBudgetActual_Usage' + j).val(), 0));
            }
            //--------------
            // Get Totals
            //--------------
            else if (type == 'UpdateTotals') {
                EstimatedCostTotal = EstimatedCostTotal + parseFloat($('#AccountBudgetEstimate_Cost' + j).val());
                EstimatedUsageTotal = EstimatedUsageTotal + parseFloat($('#AccountBudgetEstimate_Usage' + j).val());
                ActualCostTotal = ActualCostTotal + parseFloat($('#AccountBudgetActual_Cost' + j).val());
                ActualUsageTotal = ActualUsageTotal + parseFloat($('#AccountBudgetActual_Usage' + j).val());

                //If Actuals don't have a values, use Estimates to get projections
                if ($('#AccountBudgetActual_Cost' + j).val() == '' || $('#AccountBudgetActual_Cost' + j).val() == null || $('#AccountBudgetActual_Cost' + j).val() == 0) {
                    ActualCostProjectedTotal = ActualCostProjectedTotal + parseFloat($('#AccountBudgetEstimate_Cost' + j).val());
                } else {
                    ActualCostProjectedTotal = ActualCostProjectedTotal + parseFloat($('#AccountBudgetActual_Cost' + j).val());
                }

                if ($('#AccountBudgetActual_Usage' + j).val() == '' || $('#AccountBudgetActual_Usage' + j).val() == null || $('#AccountBudgetActual_Usage' + j).val() == 0) {
                    ActualUsageProjectedTotal = ActualUsageProjectedTotal + parseFloat($('#AccountBudgetEstimate_Usage' + j).val());
                } else {
                    ActualUsageProjectedTotal = ActualUsageProjectedTotal + parseFloat($('#AccountBudgetActual_Usage' + j).val());
                }
            }
        }

        //--------------
        // Set Totals
        //--------------
        if (type == 'UpdateTotals') {
            $("#EstimatedCost_Total").val(numberPrecision(EstimatedCostTotal, 2));
            $("#EstimatedUsage_Total").val(numberPrecision(EstimatedUsageTotal, 0));
            $("#ActualCost_Total").val(numberPrecision(ActualCostTotal, 2));
            $("#ActualUsage_Total").val(numberPrecision(ActualUsageTotal, 0));
            $("#ActualCost_ProjectedTotal").val(numberPrecision(ActualCostProjectedTotal, 2));
            $("#ActualUsage_ProjectedTotal").val(numberPrecision(ActualUsageProjectedTotal, 0));
        }
    }
});