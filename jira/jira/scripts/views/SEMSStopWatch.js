jQuery.namespace('SEMS');

; (function ($, window, document, undefined) {
    window.SEMS.StopWatch = function (options) {
        var settings = $.extend({}, window.SEMS.StopWatch.defaults, options);
        var startTime = null;
        var stopTime = null;
        var isRunning = false;
        var elapsed = null;

        function getTime() {
            var day = new Date();

            return day.getTime();
        }

        function start () {
            if (isRunning)
                throw "StopWatch already started, please call stop before calling start";

            isRunning = true;
            startTime = getTime();
            stopTime = null;
        }

        function stop () {
            if (!isRunning)
                throw "StopWatch hasn't been started, please call start before calling stop";

            stopTime = getTime();
            elapsed = (stopTime - startTime) / 1000;
            isRunning = false;
        }

        if (settings.autoStart)
            start();
        
        return {
            start: start,
            stop: stop,
            elapsed: function() {
                return elapsed;
            },
            isRunning: function() {
                return isRunning;
            }
        };
    };

    window.SEMS.StopWatch.defaults = {
        autoStart: false
    };
})(jQuery, window, document);