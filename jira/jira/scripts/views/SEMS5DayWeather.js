;
(function ($, window, document, undefined) {
    $.namespace('SEMS');

    window.SEMS.WeatherForecast = function (settings) {
        // this class will try and get weather data up to 5 times before it attempts to use cached data
        // the current weather provider is yahoo and from time to time they will not return results, I belive this is due to frequent calls but i don't know for sure.
        var url = settings.url;
        var retries = 0;
        var maxRetries = 5;
        var maxCacheAge = 4;
        var trace = new window.SEMS.Trace(false);
        
        var isValidData = function (data) {
            if (data == null)
                return false;

            if (data.query == null)
                return false;

            if (data.query.results == null)
                return false;

            return true;
        };

        var showMessage = function (text, addErrorClass) {
            var $weatherMessage = $("#weatherMessage");
            var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
            console.log(text);

            $weatherMessage.empty();
            $weatherMessage.text(errorMessage);

            if (addErrorClass != undefined && addErrorClass)
                $weatherMessage.addClass("error");

            trace.info(text);
        };

        var appendMessage = function(text) {
            var $weatherMessage = $("#weatherMessage");
            var oldText = $weatherMessage.text();

            $weatherMessage.empty();
            $weatherMessage.html(oldText + '<br/>' + text);
            
            trace.logHtml(oldText + '<br/>' + text);
        };
        
        var daysBetween = function (first, second) {
            var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
            var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
            var millisecondsPerDay = 1000 * 60 * 60 * 24;
            var millisBetween = two.getTime() - one.getTime();
            var days = Math.floor(millisBetween / millisecondsPerDay);
            
            return days;
        };

        var init = function () {
            trace.info("init called");
            
            $('.weatherData').hide();

            trace.info("performing ajax call");
            
            $.ajax({
                url: url,
                dataType: 'json'
            }).done(function (data) {
                trace.info("ajax done called");

                retries += 1;
                
                showMessage("Data recieved");

                var cookieData;
                var dataLoadedFromCache = false;
                
                if (isValidData(data)) {
                    cookieData = JSON.stringify({
                        time: new Date(),
                        data: data
                    });

                    $.cookie("weatherData", cookieData);
                } else {
                    showMessage("Invalid weather data, attempt " + retries + " of " + maxRetries);

                    if (retries < maxRetries) {
                        window.setTimeout(init, 1000);

                        return;
                    } else {
                        try {
                            cookieData = JSON.parse($.cookie("weatherData"));

                            var cookieDate = cookieData != null ? new Date(cookieData.time) : new Date(2000, 1, 1);
                            var daysOld = daysBetween(cookieDate, new Date());
                            
                            if (daysOld < maxCacheAge) {
                                data = cookieData != null ? cookieData.data : null;
                                
                                if (data == null) {
                                    showMessage("Unable to load weather data", true);
                                } else {
                                    showMessage("Data loaded from cache, it's " + daysOld + " days old", true);
                                    dataLoadedFromCache = true;
                                }
                            } else {
                                showMessage(""); // we don't need to show this and the message isn't always relevant for all users
                            }
                        } catch (e) {
                            showMessage(e.message);
                        }
                    }
                }

                if (processData(data)) {
                    if (!dataLoadedFromCache)
                        $("#weatherMessage").hide();
                    
                    $('.weatherData').show();
                }
            }).fail(function (xhr, textStatus, errorThrown) {
                trace.info("ajax fail called");
                retries += 1;
                
                if (retries < maxRetries) {
                    showMessage("Invalid weather data, attempt " + retries + " of " + maxRetries);
                    window.setTimeout(init, 1000);

                    return;
                }
                
                try {
                    var cookieData = JSON.parse($.cookie("weatherData"));
                    var data = null;
                    var cookieDate = cookieData != null ? new Date(cookieData.time) : new Date(2000, 1, 1);
                    var daysOld = daysBetween(cookieDate, new Date());

                    if (daysOld < maxCacheAge) {
                        data = cookieData != null ? cookieData.data : null;

                        if (data == null) {
                            showMessage("Unable to load weather data", true);
                        } else {
                            showMessage("Data loaded from cache, it's " + daysOld + " days old", true);
                        }
                    } else {
                        showMessage("Cached data is too old to show, it's " + daysOld + " days old");
                    }

                    appendMessage("Unexpected error: " + errorThrown);

                    if (processData(data)) {
                        $('.weatherData').show();
                    }
                } catch (e) {
                    showMessage(e.message);
                }
            });
        };

        var processData = function (data) {
            if (!isValidData(data))
                return false;

            var weatherForecasts = data.query.results.item.forecast;
            var title = data.query.results.item.title;
            var weatherData = $('.weatherData');

            weatherData.append('<div>' + title + '</div><br/>');

            for (var i = 0; i < weatherForecasts.length; i++) {
                var code = weatherForecasts[i].code;
                var dayContainer = $(document.createElement('div'));

                dayContainer.addClass('dayContainer');
                weatherData.append(dayContainer);

                dayContainer.append('<div>' + weatherForecasts[i].day + ' ' + weatherForecasts[i].date + '</div>');

                var icon = $('<div class="weather-icon" title="' + weatherForecasts[i].text + '" />').css('background-position', '-' + (61 * code) + 'px 0px');

                dayContainer.append(icon);
                dayContainer.append('<div class="hight">' + weatherForecasts[i].high + ' °F</div>');
                dayContainer.append('<div class="low">' + weatherForecasts[i].low + ' °F</div>');
            }

            return true;
        };

        showMessage("Loading weather...");

        return {
            init: init,
            processData: processData
        };
    };
})(jQuery, window, document);