;

(function ($, window, document, undefined) {
    $.namespace('SEMS');

    window.SEMS.MeterComboBox = new function () {

        return {
            Synchronize: function (sender, e) {
                sender.SetText("Custom meter selection");
            }
        };
    };
    
    $(document).ready(function () {
        $("#selectAllMeters").click(function () {
            var isChecked = $(this).is(':checked');

            $("INPUT[name*='Meters'][type='checkbox']").prop('checked', isChecked); // toggle checkboxes based on header checkbox
        });

        $("INPUT[name*='Meters'][type='checkbox']").change(function () {
            $("#selectAllMeterGroups").prop('checked', false);
            $("INPUT[name*='MeterGroups'][type='checkbox']").prop('checked', false);
        });

        $("#selectAllMeterGroups").click(function () {
            var isChecked = $(this).is(':checked');

            $("INPUT[name*='MeterGroups'][type='checkbox']").prop('checked', isChecked); // toggle checkboxes based on header checkbox
        });

        $("INPUT[name*='MeterGroups'][type='checkbox']").change(function () {
            $("#selectAllMeters").prop('checked', false);
            $("INPUT[name*='Meters'][type='checkbox']").prop('checked', false);
        });
    });
})(jQuery, window, document, undefined);