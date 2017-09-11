jQuery.namespace('SEMS');

window.SEMS.PredictiveAnalysis = function() {
    var predictiveAnalysisTypes = { longTerm: 0, shortTerm: 1 };
    var startDate;
    var endDate;

    return {
        type_onChanged: function(sender, e) {
            var typeValue = sender.GetValue();
            var date = new Date();
            var days = typeValue == predictiveAnalysisTypes.shortTerm ? 3 : 365;
            
            startDate.value(date.addDays(-days));
            endDate.value(date.addDays(days));
        },
        init: function (userSettings) {
            startDate = $("#" + userSettings.startDate).data("kendoDatePicker");
            endDate = $("#" + userSettings.endDate).data("kendoDatePicker");
        }
    };
};