jQuery.namespace('SEMS');

window.SEMS.Overlay = new function () {
    return {
        show: function () {
            $("body").mask("Please wait...");
        },
        hide: function () {
            $("body").unmask();
        }
    };
};