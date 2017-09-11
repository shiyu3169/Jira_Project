
$(document).ready(function () {
    //-------------------------
    // Variables 
    //-------------------------
    var InvoiceID = $("#InvoiceID").val();
    var energyType = "";
    var isDuplicate = $("#Invoice_ShowAddDuplicate").val() == "True";

    //-------------------------
    // Starting Code
    //-------------------------
    InitializeFields();

    //-------------------------
    // Change Events
    //-------------------------
    $("#Invoice_QA_Checked").change(function () {
        SetQAControls();
        SetQAUserAndDate();
    });

    $("#Invoice_AccountID").change(function () {
        GetEnergyType();
    });

    $("#QA_Checked").change(function () {
        InitializeFields();

        SetQAUserAndDate();
    });

    $('.total-data-field').on('blur', (function () {
        UpdateTotalCharges();
    }));

    //-------------------------
    // Custom Functions
    //-------------------------
    function InitializeFields() {
        //Show/Hide fields depending on if the invoices is being created or edited
        if (InvoiceID > 0) {
            $('#Invoice_AccountID').attr('disabled', 'disabled');

            SetQAControls();

            GetEnergyType();

            UpdateTotalCharges();
        }
            //New record being created
        else {

            if(!isDuplicate)
                $("#Invoice_InvoiceDate").val("");

            ShowHidFields();

            //Hide and lock QA controls
            $('.qa-area').hide();
            $('#Invoice_QA_Checked').attr('disabled', 'disabled');
            $('#Invoice_QA_Pass_Fail').attr('disabled', 'disabled');
            $('#Invoice_QA_Comment').attr('disabled', 'disabled');

        }
    }

    function UpdateTotalCharges() {
        var totalVal = 0;
        var tempString = "";

        if (energyType == "Water") {
            var deliveryTotal = 0;
            if ($('#Invoice_WT_Sewer_Cost').val() != '') {
                deliveryTotal += parseFloat($('#Invoice_WT_Sewer_Cost').val());
            }
            if ($('#Invoice_WT_Water_Cost').val() != '') {
                deliveryTotal += parseFloat($('#Invoice_WT_Water_Cost').val());
            }
            $('#Invoice_DeliveryServiceCharge').val(deliveryTotal.toFixed(2));
        }

        if ($('#Invoice_DeliveryServiceCharge').val() != '') {
            totalVal = totalVal + parseFloat($('#Invoice_DeliveryServiceCharge').val());
        }

        if ($('#Invoice_SupplyServiceCharge').val() != '') {
            totalVal = totalVal + parseFloat($('#Invoice_SupplyServiceCharge').val());
        }

        if ($('#Invoice_OtherCharge').val() != '') {
            totalVal = totalVal + parseFloat($('#Invoice_OtherCharge').val());
        }

        $('#TotalCharges').val(totalVal.toFixed(2));
    }

    function GetEnergyType() {
        var accountID = $("#Invoice_AccountID > option:selected").attr("value");

        //Set Energy Type
        $.post(RootURL + 'EnergyType/GetEnergyTypeNameForAccount/' + accountID, function (data) {

            energyType = data;

            ShowHidFields();
        });
    }

    function SetQAUserAndDate() {

        //QA Checked just clicked and set to true 
        if ($("#Invoice_QA_Checked").is(':checked')) {

            //Set QA Date                
            $.post(RootURL + 'Home/GetServerDateTime/', function (data) {
                $('#Invoice_QA_Date').val(data);
            });

            //Set QA User                                
            $.post(RootURL + 'Home/GetCurrentUserName/', function (data) {
                $('#Invoice_QA_UserID').val(data);
            });
        }
        else {
            $('#Invoice_QA_UserID').val("");
            $('#Invoice_QA_Date').val("");
        }
    }

    function SetQAControls() {
        //Enable/Disable certain QA fields depending on if QA Checked is enabled
        if ($("#Invoice_QA_Checked").is(':checked')) {
            //Enable QA fields
            $('#Invoice_QA_Pass_Fail').removeAttr('disabled');
            $('#Invoice_QA_Comment').removeAttr('disabled');

        }
        else {
            //Disable QA fields
            $('#Invoice_QA_Pass_Fail').attr('disabled', 'disabled');
            $('#Invoice_QA_Comment').attr('disabled', 'disabled');
            $('#Invoice_QA_Pass_Fail').attr('checked', false);
            $('#Invoice_QA_Comment').val("");
            $('#Invoice_QA_UserID').val("");
            $('#Invoice_QA_Date').val("");
        }
    }

    function ShowHidFields() {
        //Main Invoice Controls
        if ($("#Invoice_AccountID > option:selected").attr("value") == "") {
            //Hide and lock Invoice controls
            $('.main-invoice-area').hide();
            $('#Invoice_InvoiceNumber').attr('disabled', 'disabled');
            $('#Invoice_InvoiceDate').attr('disabled', 'disabled');
            $('#Invoice_ReadType').attr('disabled', 'disabled');
            $('#Invoice_DeliveryDate').attr('disabled', 'disabled');
            $('#Invoice_FromDate').attr('disabled', 'disabled');
            $('#Invoice_ToDate').attr('disabled', 'disabled');
            $('#Invoice_OtherCharge').attr('disabled', 'disabled');
            $('#Invoice_LateFees').attr('disabled', 'disabled');
            $('#Invoice_ScanNumber').attr('disabled', 'disabled');
            $('#Invoice_DeliveryServiceCharge').attr('disabled', 'disabled');
            $('#Invoice_SupplyServiceCharge').attr('disabled', 'disabled');
            $('#Invoice_WT_Sewer_Cost').attr('disabled', 'disabled');
            $('#Invoice_WT_Water_Cost').attr('disabled', 'disabled');
            $('#Invoice_WT_Usage').attr('disabled', 'disabled');
            $('#Invoice_CHW_Usage').attr('disabled', 'disabled');
            $('#Invoice_CHW_Capacity_Usage').attr('disabled', 'disabled');
            $('#Invoice_CHW_Capacity_Charge').attr('disabled', 'disabled');
            $('#Invoice_STM_Usage').attr('disabled', 'disabled');
            $('#Invoice_STM_Capacity_Usage').attr('disabled', 'disabled');
            $('#Invoice_STM_Capacity_Charge').attr('disabled', 'disabled');
        } else {
            //Show and unlock Invoice controls
            $('.main-invoice-area').show(1000);
            $('#Invoice_InvoiceNumber').removeAttr('disabled');
            $('#Invoice_InvoiceDate').removeAttr('disabled');
            $('#Invoice_ReadType').removeAttr('disabled');
            $('#Invoice_DeliveryDate').removeAttr('disabled');
            $('#Invoice_FromDate').removeAttr('disabled');
            $('#Invoice_ToDate').removeAttr('disabled');
            $('#Invoice_OtherCharge').removeAttr('disabled');
            $('#Invoice_LateFees').removeAttr('disabled');
            $('#Invoice_ScanNumber').removeAttr('disabled');
            $('#Invoice_DeliveryServiceCharge').removeAttr('disabled');
            $('#Invoice_SupplyServiceCharge').removeAttr('disabled');
            $('#Invoice_WT_Sewer_Cost').removeAttr('disabled');
            $('#Invoice_WT_Water_Cost').removeAttr('disabled');
            $('#Invoice_WT_Usage').removeAttr('disabled');
            $('#Invoice_CHW_Usage').removeAttr('disabled');
            $('#Invoice_CHW_Capacity_Usage').removeAttr('disabled');
            $('#Invoice_CHW_Capacity_Charge').removeAttr('disabled');
            $('#Invoice_STM_Usage').removeAttr('disabled');
            $('#Invoice_STM_Capacity_Usage').removeAttr('disabled');
            $('#Invoice_STM_Capacity_Charge').removeAttr('disabled');
        }

        //Natural Gas
        if (energyType == "Natural Gas") {
            //Show and unlock controls
            $('.gas-area').show(1000);
            $('#Invoice_NG_PeakDayDemand').removeAttr('disabled');
            $('#Invoice_NG_GasUsed').removeAttr('disabled');
        }
        else {
            //Hide and lock controls
            $('.gas-area').hide();
            $('#Invoice_NG_PeakDayDemand').attr('disabled', 'disabled');
            $('#Invoice_NG_GasUsed').attr('disabled', 'disabled');

            //Wipe controls
            $('#Invoice_NG_PeakDayDemand').val("");
            $('#Invoice_NG_GasUsed').val("");
        }

        //Electricity
        if (energyType == "Electricity") {
            //Show and unlock controls
            $('.electric-area').show(1000);
            $('#Invoice_EL_DemandOnPeak').removeAttr('disabled');
            $('#Invoice_EL_DemandOffPeak').removeAttr('disabled');
            $('#Invoice_EL_DemandShoulder').removeAttr('disabled');
            $('#Invoice_EL_OnPeakkWh').removeAttr('disabled');
            $('#Invoice_EL_OffPeakkWh').removeAttr('disabled');
            $('#Invoice_EL_ShoulderkWh').removeAttr('disabled');
        }
        else {
            //Hide and lock controls
            $('.electric-area').hide();
            $('#Invoice_EL_DemandOnPeak').attr('disabled', 'disabled');
            $('#Invoice_EL_DemandOffPeak').attr('disabled', 'disabled');
            $('#Invoice_EL_DemandShoulder').attr('disabled', 'disabled');
            $('#Invoice_EL_OnPeakkWh').attr('disabled', 'disabled');
            $('#Invoice_EL_OffPeakkWh').attr('disabled', 'disabled');
            $('#Invoice_EL_ShoulderkWh').attr('disabled', 'disabled');

            //Wipe controls
            $('#Invoice_EL_DemandOnPeak').val("");
            $('#Invoice_EL_DemandOffPeak').val("");
            $('#Invoice_EL_DemandShoulder').val("");
            $('#Invoice_EL_OnPeakkWh').val("");
            $('#Invoice_EL_OffPeakkWh').val("");
            $('#Invoice_EL_ShoulderkWh').val("");
        }

        //"Chilled Water"
        if (energyType == "Chilled Water") {
            //Show and unlock controls
            $('.chilled-water-area').show(1000);
            $('#Invoice_CHW_Usage').removeAttr('disabled');
            $('#Invoice_CHW_Capacity_Usage').removeAttr('disabled');
            $('#Invoice_CHW_Capacity_Charge').removeAttr('disabled');
        } else {
            //Hide and lock controls
            $('.chilled-water-area').hide();
            $('#Invoice_CHW_Usage').attr('disabled', 'disabled');
            $('#Invoice_CHW_Capacity_Usage').attr('disabled', 'disabled');
            $('#Invoice_CHW_Capacity_Charge').attr('disabled', 'disabled');
        }

        //"Water"
        if (energyType == "Water") {
            //Show and unlock controls
            $('.water-area').show(1000);
            $('#Invoice_WT_Sewer_Cost').removeAttr('disabled');
            $('#Invoice_WT_Water_Cost').removeAttr('disabled');
            $('#Invoice_WT_Usage').removeAttr('disabled');
            $('#Invoice_DeliveryServiceCharge').attr('disabled', 'disabled');
        } else {
            //Hide and lock controls
            $('.water-area').hide();
            $('#Invoice_WT_Sewer_Cost').attr('disabled', 'disabled');
            $('#Invoice_WT_Water_Cost').attr('disabled', 'disabled');
            $('#Invoice_WT_Usage').attr('disabled', 'disabled');
        }

        //Steam
        if (energyType.indexOf("Steam") != -1) {
            //Show and unlock controls
            $('.steam-area').show(1000);
            $('#Invoice_STM_Usage').removeAttr('disabled');
            $('#Invoice_STM_Capacity_Usage').removeAttr('disabled');
            $('#Invoice_STM_Capacity_Charge').removeAttr('disabled');
        } else {
            //Hide and lock controls
            $('.steam-area').hide();
            $('#Invoice_STM_Usage').attr('disabled', 'disabled');
            $('#Invoice_STM_Capacity_Usage').attr('disabled', 'disabled');
            $('#Invoice_STM_Capacity_Charge').attr('disabled', 'disabled');
        }

        //Oil Etc.
        if (energyType == "2 Oil" || energyType == "4 Oil" || energyType == "6 Oil" || energyType == "Propane" || energyType == "Kerosene" || energyType == "Diesel") {
            //Show and unlock controls
            $('.oil-area').show(1000);
            $('#Invoice_HO_QtyDelivered').removeAttr('disabled');
            $('#Invoice_HO_UnitCost').removeAttr('disabled');
        }
        else {
            //Hide and lock controls
            $('.oil-area').hide();
            $('#Invoice_HO_QtyDelivered').attr('disabled', 'disabled');
            $('#Invoice_HO_UnitCost').attr('disabled', 'disabled');

            //Wipe controls
            $('#Invoice_HO_QtyDelivered').val("");
            $('#Invoice_HO_UnitCost').val("");
        }
    };
});

