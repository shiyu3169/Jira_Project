;

(function($, window, document, undefined) {
    
    $.namespace('SEMS');

    window.SEMS.BuildingRecovery = new function () {
        var buildingkWh;
        var submeterkWh;
        var utilityCost;
        var tenantPaid;
        var lastSelected = "";
        var costPrefix = "";

        function updateRecoveryChart(selected) {
            var chart = window.recoveryChart;
            lastSelected = selected;
				
            // remove all series before we add new ones
            while (chart.series.length > 0)
                chart.series[0].remove(true);

            var firstSeries = { data: [], name: '' };
            var secondSeries = { data: [], name: '' };

            if (selected == 'utilityTenantBilledChart') {
                costPrefix = "";
                buildingkWh = $.parseJSON($('#BuildingKWH').val());
                submeterkWh = $.parseJSON($('#SubMeterKWH').val());
                firstSeries.data = buildingkWh;
                firstSeries.name = 'CAM';
                secondSeries.data = submeterkWh;
                secondSeries.name = 'Submeter';
            } else {
                costPrefix = "$";
                utilityCost = $.parseJSON($('#UtilityCost').val());
                firstSeries.data = utilityCost;
                firstSeries.name = 'CAM';
                tenantPaid = $.parseJSON($('#TenantPaid').val());
                secondSeries.data = tenantPaid;
                secondSeries.name = 'Tenant';
            }
				
            chart.addSeries({
                data: firstSeries.data,
                name: firstSeries.name,
                color: Highcharts.theme.colors[1]
            }, false);
						
            chart.addSeries({
                data: secondSeries.data,
                name: secondSeries.name,
                color: Highcharts.theme.colors[0]
            }, false);
				
            chart.redraw();
        }

        $(document).ready(function() {
            window.setTimeout(function() {
                updateRecoveryChart('utilityTenantBilledChart');

                $('input:radio[name=recoveryToggle]').click(function() {
                    var selected = $('input[name=recoveryToggle]:checked').val();

                    updateRecoveryChart(selected);
                });

                var showNoLoadingMessage = $('#HasData').val() == 'True';

                if (showNoLoadingMessage) {
                    window.recoveryChart.showLoading('No data to display');
                }
            }, 1000);
        });

        return {
            formatTooltip: function () {
                var name = this.series.name;
                var value = "";
                var total = "";
					
                if (lastSelected == 'costRecoveryChart') {
                    value = "$" + Highcharts.numberFormat(this.y, 0);
                    total = "$" + Highcharts.numberFormat(this.total, 0);
                } 
                else {
                    value = Highcharts.numberFormat(this.y, 0);
                    total = Highcharts.numberFormat(this.total, 0);
                }
					
                var percentage = Highcharts.numberFormat(this.percentage, 1) + '%';    
					
                var label = "Recovery";

                if (name.indexOf('Building') > -1 || name.indexOf('Utility') > -1) {
                    label = "CAM";
                }

                return name + '<br/>Total: ' + total + '<br/>' + label + ': ' + value + '<br/>Percentage: ' + percentage;
            },
            formatLabel: function() {
                return costPrefix + Highcharts.numberFormat(this.value / 1000, 0) + 'k';
            }
        };
    };
})(jQuery, window, document);