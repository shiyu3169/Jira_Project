;

(function($, window, document, undefined) {
    
    $(document).ready(function () {

        var disableCheckbox = function (box) {
            box.prop("disabled", true);
        };

        var enableCheckbox = function (box) {
            box.removeAttr("disabled");
        };

        var subscribeClick = function (e) {
            var pdfBox = null;
            if (!$(this).is(":checked")) {
                pdfBox = $(this).closest("tr").find("> td:nth-child(3) > input:checkbox");
                pdfBox.prop("checked", false);
                disableCheckbox(pdfBox);
            } else {
                pdfBox = $(this).closest("tr").find("> td:nth-child(3) > input:checkbox");
                enableCheckbox(pdfBox);
            }

        };

        var notificationBoxes = $('tr > td:nth-child(2) > input:checkbox');
        var pdfBoxes = $('tr > td:nth-child(3) > input:checkbox');
        notificationBoxes.each(function (index) {
            var isChecked = $(this).is(':checked');
            if (!isChecked && pdfBoxes.length > 0) {
                disableCheckbox(pdfBoxes.eq(index));
            }

        });

        notificationBoxes.on("click", subscribeClick);

    });

})(jQuery, window, document);