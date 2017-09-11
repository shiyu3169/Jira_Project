function confirmBox() {
    var answer = confirm("Are you sure you want to delete the Association?");
    if (answer) {
        return true;
    }
    else {
        return false;
    }
}

$(document).ready(function () {
    //-------------------------
    // Variables Functions
    //-------------------------
    var tempStringArray = new Array();
    var builtJSON = "";

    //-------------------------
    // Starting Code
    //-------------------------
    UpdateTotal();

    //-------------------------
    // Events
    //-------------------------    
    $('span').on('click', (function () {
        var foundID = ($(this).attr('id'));

        //The Add buton was pressed
        if (foundID.search("add_") != -1) {

            $.ajax(
             {
                 type: 'GET',
                 contentType: 'application/json; charset=utf-8',
                 url: RootURL + 'Accounts/GetBlankECALinksForm/',
                 success: function (result) {
                     $('#add_area').append('<div class="tempAdd"></div>')
                     $('#add_area > .tempAdd').hide();
                     $('#add_area > .tempAdd').append(result);
                     $('#add_area > .tempAdd').slideDown(1000);
                     $('#add_area > .tempAdd').removeClass('tempAdd');

                     Init();
                 }
             });
        }

        //One of the Delete butons was pressed
        if (foundID.search("delete_") != -1) {
            //remove text from ID and just leave the number
            var foundNum = foundID.replace("delete_", "");

            //If nothing was entered yet, delete section without prompt
            if ($('#ECAName' + foundNum).val() == "") {
                $('#Allocation' + foundNum).val(0);
                UpdateTotal();

                //Hide selected association and then remove it from the page
                $('#area_' + foundNum).slideUp(1000, function () {
                    $('#area_' + foundNum).remove();
                });
            }
                //delete, with prompt
            else {
                if (confirmBox()) {
                    $('#Allocation' + foundNum).val(0);
                    UpdateTotal();

                    //Hide selected association and then remove it from the page
                    $('#area_' + foundNum).slideUp(1000, function () {

                        $('#area_' + foundNum).remove();

                    });
                }
            }
        }

    }));

    Init();

    function Init() {
        $('.allocation-field').off('blur').on('blur', (function () {
            UpdateTotal();
        }));

        $('.ECAName-field').off('blur').on('blur', (function () {
            CheckUniqueECAs($(this).val(), $(this).attr('id'));
        }));

    }

    function RemoveEmptySections() {
        var sectionsWereRemoved = false;

        $('.ECAName-field').each(function (index) {
            //Get id of the current field area
            var foundID = ($(this).attr('id'));

            //remove text from ID and just leave the number
            var foundNum = foundID.replace("ECAName", "");

            CheckUniqueECAs($(this).val(), $(this).attr('id'));

            if ($(this).val() == 0) {
                $('#Allocation' + foundNum).val(0);
                UpdateTotal();
                sectionsWereRemoved = true;

                $('#area_' + foundNum).slideUp(1000, function () {
                    $('#area_' + foundNum).remove();
                });
            }
        });

        if (sectionsWereRemoved == true) {
            var msg = "Empty sections were removed.  This may have changed the allocation total.";
            var title = "Empty sections removed.";
            dialogOKOnly(false, title, msg);
        }

        return true;
    }

    $('#saveButton').click(function () {
        UpdateTotal();
        RemoveEmptySections();

        var totalString = $('#AllocationTotal').val();
        totalString = totalString.replace("%", "");
        var totalVal = parseFloat(totalString);

        if (totalVal == 100 || totalVal == 0) {
            $(".field-area").each(function (index) {
                tempStringArray = new Array();

                //Get id of the current field area
                var foundID = ($(this).attr('id'));
                //remove text from ID and just leave the number
                var foundNum = foundID.replace("area_", "");

                if ($("[id=Allocation" + foundNum + "]").val() != 0) {

                    tempStringArray.push(
                            "{ECAID:'" + $("[id=ECAName" + foundNum + "]").val() + "'",
                            "Allocation:'" + $("[id=Allocation" + foundNum + "]").val() / 100 + "'",
                            "Note:'" + $("[id=Note" + foundNum + "]").val() + "'}"
                        );
                    if (builtJSON == "") {
                        builtJSON = "[";
                    }

                    if (builtJSON != "[") {
                        builtJSON = builtJSON + ",";
                    }
                    builtJSON = builtJSON + (tempStringArray);
                }
            });

            if (builtJSON != "") {
                builtJSON = builtJSON + "]";
            }
                //No associations
            else {
                builtJSON = builtJSON + "[{ECAID:'0',Allocation:'0',Note:''}]";
            }

            $.ajax({
                type: "POST",
                contentType: 'application/json;',
                url: RootURL + "Accounts/UpdateECALinks/" + $('#AccountID').val(),
                data: builtJSON,
                success: function (data) {
                    var msg = "The ECA Associations were successfully updated.";
                    document.location.href = RootURL + 'Accounts/Edit/' + $('#AccountID').val() + "?viewbagResult=" + msg;
                }
            });
        }
        else {
            var msg = "The Allocation Total is " + totalVal + "%. It must to be 100% before you can save.";
            var title = "Allocation Must Equal 100%";
            dialogOKOnly(false, title, msg);
        }
    });

    //-------------------------
    // Custom Functions
    //-------------------------
    function UpdateTotal() {
        var totalVal = 0;
        var tempString = "";

        $('.allocation-field').each(function (index) {
            //Filter out non-numeric
            tempString = $(this).val();
            tempString = tempString.replace(/[A-Za-z$-]/g, "");
            $(this).val(tempString);

            //If number is found
            if ($(this).val() != "") {
                //Add to running total and remove leading zeros
                totalVal = totalVal + parseFloat($(this).val());
                $(this).val(parseFloat($(this).val()));
            }
                //Populate 0 if no number found
            else {
                $(this).val(0);
            }
        });

        $('#AllocationTotal').val(totalVal.toFixed(2) + '%');
    }

    function CheckUniqueECAs(ECAName, controlID) {
        var tempString = "";
        var numFound = 0;

        $('.ECAName-field').each(function (index) {

            tempString = $(this).val();

            //If match is found, add one to count.  
            if ($(this).val() == ECAName) {
                numFound = numFound + 1;
            }

            //If more then one match was found
            if (numFound > 1) {
                $('#' + controlID).val("");
                var msg = "The selected ECA already has an allocation amount.  An ECA can only have one allocation per account.";
                var title = "ECA Used More Than Once";
                dialogOKOnly(false, title, msg);
            }
        });
    }
});

