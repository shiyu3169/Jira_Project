;

(function ($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.UsageProfileChart = new function () {
        var weatherDataStripped;
        var series = [];
        var title;
        var settings = {};

        var Aggregates = {
            COMBINE: "Combine",
            SEPARATE: "Separate"
        };

        var ChartTypes = {
            INDIVIDUAL: "Individual",
            STACKED: "Stacked"
        };

        var getMaxDataPoint = function (points, seriesName) {
            var maxPoint = {
                name: 'MaxUsage',
                color: '#dc143c'
            };

            var max;

            if (!points.length) {
                return points;
            }

            max = 0;
            for (var i = 1; i < points.length; i++) {
                if (points[max] < points[i]) {
                    max = i;
                }
            }

            maxPoint.y = points[max];
            if (seriesName) {
                maxPoint.seriesName = seriesName;
            }
            points[max] = maxPoint;

            return points;
        };

        var maxStackedSeries = function (allSeries) {

            var maxIndex = 0;
            var maxPoint = {
                name: 'MaxUsage',
                color: '#dc143c'
            };

            if (!allSeries.length) {
                return;
            }

            var maxLength = allSeries[0].data.length;

            for (var i = 1; i < allSeries.length; i++) {
                if (allSeries[i].data.length > maxLength) {
                    maxLength = allSeries[i].data.length;
                }
            }

            var numberOfSeries = allSeries.length;

            var total = getTotal(maxIndex, numberOfSeries, allSeries);

            for (i = 1; i < maxLength; i++) {
                var testTotal = getTotal(i, numberOfSeries, allSeries);
                if (total < testTotal) {
                    total = testTotal;
                    maxIndex = i;
                }
            }

            allSeries.forEach(function (value, index, it) {
                var max = $.extend({}, maxPoint);
                if (value.data[maxIndex]) {
                    max.y = value.data[maxIndex];
                    value.data[maxIndex] = max;
                }
            });

        };

        var getTotal = function (index, numOfSeries, theSeries) {

            var total = 0;

            for (var i = 0; i < numOfSeries; i++) {
                total += theSeries[i].data[index] ? theSeries[i].data[index] : 0;
            }

            return total;
        };

        var createUsageSeries = function () {
            if (settings.aggregate == Aggregates.COMBINE) {
                var dataPoints = $.Enumerable.From(settings.meterReads).Select(function (x) {
                    return x.kwh;
                }).ToArray();
                dataPoints = getMaxDataPoint(dataPoints);
                series.push({
                    name: 'Usage',
                    type: 'column',
                    yAxis: 1,
                    data: dataPoints
                });
            } else {
                for (var i = 0; i < settings.selectedMeters.length; i++) {
                    dataPoints = $.Enumerable.From(settings.meterReads).Where(function (x) {
                        if (settings.usingGroups) {
                            return x.MeterGroupId == settings.selectedMeters[i].ID;
                        }

                        return x.MeterID == settings.selectedMeters[i].ID;
                    }).Select(function (x) {
                        return x.kwh;
                    }).ToArray();
                    dataPoints = settings.chartType == ChartTypes.STACKED ? dataPoints : getMaxDataPoint(dataPoints, settings.selectedMeters[i].Name);

                    series.push({
                        name: settings.selectedMeters[i].Name,
                        type: 'column',
                        yAxis: 1,
                        data: dataPoints,
                        dataLabels: {
                            enabled: true,
                            rotation: 0,
                            color: '#000',
                            align: 'center',
                            format: '{point.seriesName}',
                            y: 0, 
                            style: {
                                fontSize: '15px'
                            }
                        }
                    });
                }
            }
        };

        var createWeatherSeries = function () {

            weatherDataStripped = $.Enumerable.From(settings.weatherData).Select(function (x) {
                return x.TempF;
            }).ToArray();

            series.push({
                name: 'OutsideTemperature',
                type: 'spline',
                yAxis: 0,
                data: weatherDataStripped,
                marker: {
                    enabled: weatherDataStripped.length < 2
                }
            });
        };

        var createChart = function () {
            
            var uom = $("#Uomformeter").text();
            if (uom == "Total :") {
                uom = uom.replace("Total :", "Usage");
            } else {
                uom = uom.replace("Total", "Usage (");
                uom = uom.replace(":", " )");
            }

            $('#' + settings.divId).highcharts({
                global: {
                    useUTC: false
                },
                chart: {
                    type: 'column',
                    alignTicks: false

                },
                title: {
                    text: settings.usageTile
                },
                xAxis: [{
                    categories: settings.meterReadCategories,
                    labels: {
                        rotation: -35,
                        align: 'right'
                    },

                    tickInterval: parseFloat(settings.tickInterval),

                }],
                yAxis: [{
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    },
                    title: {
                        text: 'Outside Temperature(°F)'
                    },
                    opposite: true,
                    min: 0,
                    tickInterval: parseFloat(10),
                    gridLineWidth: 0
                },
                {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    },
                    title: {
                        //text: 'Usage(kWh)'
                        text: uom
                    },
                    gridLineWidth: 1,
                    gridLineColor: '#C6C6C6',
                }],
                tooltip: {
                    formatter: formatTooltip
                },
                series: series,
                plotOptions: getPlotOptions()
            });
        };

        var getPlotOptions = function () {

            var spline = {
                connectNulls: true
            };

            var column = {
                stacking: 'normal'
            };

            var options = {};

            options.spline = spline;

            if (settings.chartType == ChartTypes.STACKED) {
                options.column = column;
            }

            return options;
        };



        var init = function (options) {
            settings.meterReadCategories = $.parseJSON(options.meterReadCategories);
            settings.usingGroups = options.usingGroups == "True";
            settings.aggregate = options.aggregate;
            settings.divId = options.divId;
            settings.usageTile = options.usageTitle;
            settings.tickInterval = options.tickInterval;
            settings.chartType = options.chartType;
            settings.weatherData = $.parseJSON(options.weatherData);
            settings.selectedMeters = $.parseJSON(options.selectedMeters);
            settings.meterReads = $.parseJSON(options.meterReads);
            settings.showEnergyTypeInHover = options.showEnergyTypeInHover == "True";
            settings.metersForTooltips = $.parseJSON(options.metersForTooltips);
            createUsageSeries();
            createWeatherSeries();
            createChart();
        };

        var formatTooltip = function () {

            var name = String(this.series.name); // series.name may be a number, string will cast it properly for our needs
            var value = Highcharts.numberFormat(this.y, 2);
            var xIndex = this.series.data.indexOf(this.point);
            var meters;
            if (name.indexOf('Temp') > -1) {
                return this.x + '<br/>' + name + ': ' + value + '°F';
            }

            if (settings.showEnergyTypeInHover && settings.chartType != ChartTypes.STACKED) {
                meters = settings.metersForTooltips;
                var meter = $.Enumerable.From(meters).Where(function (x) { return x.Name == name; }).FirstOrDefault();

                if (meter) {
                    if (meter.MeterUoM != null)
                        return name + ':<br/>' + this.x + '<br/>Unit of measure: ' + meter.MeterUoM + '<br/>Usage: ' + value;
                    else
                        return name + ': ' + value + '<br/>' + this.x;
                }
            } else if (settings.showEnergyTypeInHover && settings.chartType == ChartTypes.STACKED && settings.aggregate != Aggregates.COMBINE) {
                meters = settings.metersForTooltips;
                var pointsWithMeters = $.Enumerable.From(series).Select(function (x) {
                    return {
                        name: x.name,
                        value: x.data[xIndex]
                    };
                }).ToArray();

                var tooltipString = this.x + '<br/>';

                pointsWithMeters.forEach(function (item) {
                    if (item.name == "OutsideTemperature")
                        return;

                    meter = $.Enumerable.From(meters).Where(function (x) {
                        return x.Name == item.name;
                    }).FirstOrDefault();

                    if (meter && meter.MeterUoM) {
                        tooltipString += item.name + ':<br/>Unit of measure: ' + meter.MeterUoM + '<br/>Usage: ' + item.value + '<br/>';
                    } else {
                        tooltipString += item.name + '<br/>Usage: ' + item.value + '<br/>';
                    }
                });

                return tooltipString;

            }

            return name + ': ' + value + '<br/>' + this.x;


        };



        return {
            formatTooltip: formatTooltip,
            init: init
        };
    };

})(jQuery, window, document);