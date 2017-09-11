;

(function ($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.RealTimeChart = new function () {
        var updateInterval = 1000;
        var stop = false;
        var urls = null;
        /// <summary>
        ///     Requests data from the server in one seconds intervals
        /// </summary>

        function requestData() {
            $.ajax({
                url: urls.realTimeData,
                success: function (points) {
                    try {
                        updateChart(points);

                        if (stop)
                            return;

                        setTimeout(requestData, updateInterval);
                    } catch (e) {
                        console.log(e);
                        alert("Sorry we encountered an error while processing your request. Please contact the Support team.");
                    }
                },
                cache: false
            });
        }

        /// <summary>
        ///     Updates the real time chart
        /// </summary>

        function updateChart(points) {
            var firstSeriesIndex = 0;
            var firstSeries = window.realTimeHighChart.series[firstSeriesIndex];
            var shiftSeries = firstSeries.data.length > 20; // shift if the series is longer than 20

            for (var index = 0; index < points.length; index++) {
                var point = points[index];

                // add the point
                window.realTimeHighChart.series[index].addPoint(point, true, shiftSeries);
            }
        }

        var init = function (settings) {
            urls = settings;
        };

        return {
            /// <summary>
            /// Starts a timer to retrieve server data
            /// </summary>
            Start: function () {
                stop = false;
                requestData();
            },
            /// <summary>
            /// Stop will disabled the timer that downloads data
            /// </summary>
            Stop: function () {
                stop = true;
            },

            init: init
        };
    };

})(jQuery, widnow, document);