
$(document).ready(function () {
    //-------------------------
    // Variables Functions
    //-------------------------
    var AccountID = $("#AccountID").val();

    //-------------------------
    // Starting Code
    //-------------------------
    InitializeFields();

    //-------------------------
    // Change Events
    //-------------------------
    $("#Account_AccountType").change(function () {
        ShowHidFields(false);
    });

    //-------------------------
    // Custom Functions
    //-------------------------
    function InitializeFields() {
        ShowHidFields(true);
    }

    function ShowHidFields(initialize) {
        if ($("#Account_AccountType").val() == "Supply") {
            if (initialize == true) {
                $(".AccountID_LDC_area").show();
            }
            else {
                $(".AccountID_LDC_area").show('fade', { direction: 'left' }, 500);
            }
        }
        else {
            if (initialize == true) {
                $(".AccountID_LDC_area").hide();
                $("#Account_AccountID_LDC").val("");
            }
            else {
                $(".AccountID_LDC_area").hide('fade', { direction: 'left' }, 500);
                $("#Account_AccountID_LDC").val("");
            }
        }
    };
});
    
