;
(function($, window, document, undefined) {
    
    jQuery.namespace('SEMS');

    window.SEMS.Export = new function () {
        function redirect(values) {
            $.redirect(window.location.toString(), values);
        }

        return {
            exportType_onChanged: function (sender, e) {
                window.SEMS.Overlay.show();
                redirect({ ExportOptionId: this.value()});
            }
           
        };



    };

})(jQuery, window, document)