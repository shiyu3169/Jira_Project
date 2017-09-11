// Global Variables
var rules = [0, 5, 35, 60, 3600];
var requests = [];
var loader; //For ajax loading overlay

// Global Functions For Highchart
function showLoading(showAlso) {
    $('#loading').show();
    if (showAlso != '' || show != undefined) {
        $(showAlso).empty();
        $(showAlso).html('<div id="overlay"><img src="' + RootURL + 'Content/images/loading.gif" class="loading_circle" alt="loading" /></div>');
        $('#overlay').height($(showAlso).parent().height());
    }
}
function hideLoading() {
    $('#loading').hide();
}

function ajaxOverlay() {
    $('#loading').hide();
}


function cleanUpJsonString(s) {

    s = s.replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
    // remove non-printable and other non-valid JSON chars
    s = s.replace(/[\u0000-\u0019]+/g, "");
    return s;
}


//Get lists for Invoice Data, Interval Data & Account Budget reporting pages
function getValueList(id, type, value, callback) {
    //Create "Loading" overlay
    var loader = new ajaxLoader($('#loadingArea'));
    var url = '';

    //Default value
    value = typeof value !== 'undefined' ? value : 'N/A';

    if (value == 'N/A') {
        url = RootURL + 'InvoiceReporting/Get' + type + 'List/' + id;
    }
    else {
        url = RootURL + 'InvoiceReporting/Get' + type + 'List/?id=' + id + '&value=' + value;
    }

    requests.push(
    $.ajax({
        url: url, //RootURL + 'InvoiceReporting/Get' + type + 'List/' + id,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var options = [];

            $.each(data, function (i, item) {
                options.push('<option value="' + item.ID + '">' + item.Show + '</option>');
            });

            if (type == 'Period') {
                $('#From' + type).html(options.join(''));
                $('#To' + type).html(options.join(''));
            } else {
                $('#' + type + 's').html(options.join(''));
            }

        },
        complete: function () {
            //Generate chart if the year has already been selected and passed to the view model
            if (type == 'BudgetYear') {
                if (!stringIsNullOrEmpty($('#BudgetYear').val())) {

                    $('#BudgetYears').val($('#BudgetYear').val());
                    callGenerateChart();
                    $('#BudgetYear').val(0);
                }
            }

            //A callback function was provided
            if (callback != null) {
                callback();
            }
            //Remove "Loading" overlay
            loader.remove();
        }
    }));
}

//-----------------
// Chart Functions
//-----------------
//Used for Interval Data reporting page
function getIntervalData(valueType, group, eca, meter, startdate, enddate, index) {
    var url = RootURL + 'InvoiceReporting/GetIntervalData?valuetype=' + valueType + '&startdate=' + startdate + '&enddate=' + enddate + '&group=' + group + '&eca=' + eca + '&meter=' + meter;

    ////Create "Loading" overlay
    //var loader = new ajaxLoader($('#loadingArea'));

    requests.push(
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        beforeSend: function () {
            chart.showLoading();
        },
        success: function (data) {
            if (data != null && data != "") {
                var s = [];
                $.each(data.Town, function (i, data) {
                    s.push([
                                data.Key,
                                data.Value
                    ]);
                });

                s = highlightHighestPoint(s);

                chart.series[index].setData(s);
                chart.redraw(true);
                $.each(data.Summary, function (key, value) {
                    var fields = ['townAvg', 'townTotal'];
                    if (value != null) {
                        if ($.inArray(key, fields) >= 0) {
                            var periodText = getXAxixTitle(diffDays);

                            //Show 2 decimal places
                            if (periodText == 'Hourly') {
                                if (selectedValueType == 'mmbtu') {
                                    //3 decimal places for MMBTU
                                    $('#' + key).html(addCommas(Math.round(value * 1000) / 1000) + " " + selectedValueTypeText);
                                } else {
                                    //2 decimal places for everything else
                                    $('#' + key).html(addCommas(Math.round(value * 100) / 100) + " " + selectedValueTypeText);
                                }
                            }
                                //Show 1 decimal places
                            else if (periodText == 'Daily') {
                                if (selectedValueType == 'mmbtu') {
                                    //2 decimal places for MMBTU
                                    $('#' + key).html(addCommas(Math.round(value * 100) / 100) + " " + selectedValueTypeText);
                                } else {
                                    //1 decimal places for everything else
                                    $('#' + key).html(addCommas(Math.round(value * 10) / 10) + " " + selectedValueTypeText);
                                }
                            }
                                //Show 0 decimal places
                            else if (periodText == 'Monthly') {
                                if (selectedValueType == 'mmbtu') {
                                    //1 decimal places for MMBTU
                                    $('#' + key).html(addCommas(Math.round(value * 10) / 10) + " " + selectedValueTypeText);
                                } else {
                                    //0 decimal places for everything else
                                    $('#' + key).html(addCommas(Math.round(value * 1) / 1) + " " + selectedValueTypeText);
                                }
                            }

                        } else {
                            $('#' + key).html(Math.round(value * 1) / 1);
                        }
                    }
                });
            } else {
                alert('No data to display');
            }
        },
        complete: function () {
            var diffDays = getDifferenceInDays(startdate, enddate);
            // Set Range Element text
            $('#Average').html(getXAxixTitle(diffDays) + ' Average');
            // $('#Total').html(getXAxixTitle(diffDays) + ' Total');
            // Set xAxis Title based on Range
            /*
            chart.xAxis[0].axisTitle.attr({
                text: '(Click to Toggle Series)'
            });
            */
            // Set xAxis Interval based on Range
            chart.xAxis[0].options.tickInterval = getTickInterval(diffDays);
            chart.xAxis[0].isDirty = true;
            chart.redraw();
            chart.hideLoading();

            ////Remove "Loading" overlay
            //loader.remove();
        }
    }));
}

function highlightHighestPoint(points) {
    // note that this function was written only for array data
    if (points.length <= 0) {
        return points;
    }

    var isArray = points[0] instanceof Array;
    var highestReadIndex = -1;
    var highestRead = 0;

    $.each(points, function (i, data) {
        //Get highest read so we can highligh it
        if (isArray) {
            if (data[1] > highestRead) {
                highestRead = data[1];
                highestReadIndex = i;
            }
        } else {
            if (data > highestRead) {
                highestRead = data;
                highestReadIndex = i;
            }
        }
    });

    if (highestReadIndex < 0) {
        return points;
    }

    var highestReadData = points[highestReadIndex];

    // create a new point and set the color using the old data so it's highlighted
    if (isArray) {
        points[highestReadIndex] = {
            x: highestReadData[0],
            y: highestReadData[1],
            color: 'crimson'
        };
    } else {
        points[highestReadIndex] = {
            y: highestReadData,
            color: 'crimson'
        };
    }

    return points;
}

//Used for Calendarized Usage Data reporting page
function GetUsageData(valueType, energyType, energyUoM, group, account, fromPeriod, toPeriod, index) {
    var url = RootURL + 'InvoiceReporting/GetUsageData?valuetype=' + valueType + '&fromPeriod=' + fromPeriod + '&toPeriod=' + toPeriod +
            '&energyType=' + energyType + '&energyUoM=' + energyUoM + '&group=' + group + '&account=' + account;

    ////Create "Loading" overlay
    //var loader = new ajaxLoader($('#loadingArea'));

    requests.push(
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        beforeSend: function () {
            chart.showLoading();
        },
        success: function (data) {
            if (data != null && data != "") {
                var s = [];
                $.each(data.Town, function (i, data) {
                    s.push([
                                data.Key,
                                data.Value
                    ]);
                });

                s = highlightHighestPoint(s);

                chart.series[index].setData(s);
                chart.redraw(true);
                $.each(data.Summary, function (key, value) {
                    var fields = ['townAvg', 'townTotal'];
                    if (value != null) {
                        if ($.inArray(key, fields) >= 0) {
                            var periodText = getXAxixTitle(diffDays);

                            //Show 2 decimal places
                            if (periodText == 'Hourly') {
                                if (selectedValueType == 'mmbtu') {
                                    //3 decimal places for MMBTU
                                    $('#' + key).html(addCommas(Math.round(value * 1000) / 1000) + " " + selectedValueTypeText);
                                } else {
                                    //2 decimal places for everything else
                                    $('#' + key).html(addCommas(Math.round(value * 100) / 100) + " " + selectedValueTypeText);
                                }
                            }
                                //Show 1 decimal places
                            else if (periodText == 'Daily') {
                                if (selectedValueType == 'mmbtu') {
                                    //2 decimal places for MMBTU
                                    $('#' + key).html(addCommas(Math.round(value * 100) / 100) + " " + selectedValueTypeText);
                                } else {
                                    //1 decimal places for everything else
                                    $('#' + key).html(addCommas(Math.round(value * 10) / 10) + " " + selectedValueTypeText);
                                }
                            }
                                //Show 0 decimal places
                            else if (periodText == 'Monthly') {
                                if (selectedValueType == 'mmbtu') {
                                    //1 decimal places for MMBTU
                                    $('#' + key).html(addCommas(Math.round(value * 10) / 10) + " " + selectedValueTypeText);
                                } else {
                                    //0 decimal places for everything else
                                    $('#' + key).html(addCommas(Math.round(value * 1) / 1) + " " + selectedValueTypeText);
                                }
                            }

                        } else {
                            $('#' + key).html(Math.round(value * 1) / 1);
                        }
                    }
                });
            } else {
                alert('No data to display');
            }
        },
        complete: function () {
            var diffDays = 365//getDifferenceInDays(startdate, enddate);
            // Set Range Element text
            $('#Average').html(getXAxixTitle(diffDays) + ' Average');
            // $('#Total').html(getXAxixTitle(diffDays) + ' Total');
            // Set xAxis Title based on Range
            /*
            chart.xAxis[0].axisTitle.attr({
                text: '(Click to Toggle Series)'
            });
            */
            // Set xAxis Interval based on Range
            chart.xAxis[0].options.tickInterval = getTickInterval(diffDays);
            chart.xAxis[0].isDirty = true;
            chart.redraw();
            chart.hideLoading();

            ////Remove "Loading" overlay
            //loader.remove();
        }
    }));
}

//Used for Account Budget reporting page
function getBudgetData(account, year) {
    if (account != 0 && year != 0) {
        var url = RootURL + 'InvoiceReporting/GetBudgetData?accountParm=' + account + '&yearParm=' + year;

        $('.report-summary-box').removeAttr('hidden');
        $('#EditBudget').removeAttr('hidden');

        ////Create "Loading" overlay
        //var loader = new ajaxLoader($('#loadingArea'));

        requests.push(
            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                beforeSend: function () {
                    chart.showLoading();
                },
                success: function (data) {
                    if (data != null && data != "") {
                        //Get EstimateCost
                        var s1 = [];
                        $.each(data.EstimateCost, function (i, group) {
                            s1.push([
                                group.Key,
                                group.Value
                            ]);
                        });
                        chart.series[0].setData(s1);

                        //Get ActualCost
                        var s2 = [];
                        $.each(data.ActualCost, function (i, group) {
                            s2.push([
                                group.Key,
                                group.Value
                            ]);
                        });
                        chart.series[1].setData(s2);

                        //Get EstimateUsage
                        var s3 = [];
                        $.each(data.EstimateUsage, function (i, group) {
                            s3.push([
                                group.Key,
                                group.Value
                            ]);
                        });
                        chart.series[2].setData(s3);

                        //Get ActualeUsage
                        var s4 = [];
                        $.each(data.ActualUsage, function (i, group) {
                            s4.push([
                                group.Key,
                                group.Value
                            ]);
                        });
                        chart.series[3].setData(s4);

                        chart.redraw(true);

                        $.each(data.BudgetSummary, function (key, value) {
                            //0 decimal places
                            if (value != null) {
                                $('#' + key).html(addCommas(Math.round(value * 1) / 1));
                            } else {
                                $('#' + key).html('0');
                            }
                        });
                    } else {
                        // alert('No data to display');
                    }
                },
                complete: function () {

                    // Set Range Element text
                    //$('#Average').html(getXAxixTitle(diffDays) + ' Average');
                    // $('#Total').html(getXAxixTitle(diffDays) + ' Total');
                    // Set xAxis Title based on Range
                    /*
                chart.xAxis[0].axisTitle.attr({
                    text: '(Click to Toggle Series)'
                });
                */
                    // Set xAxis Interval based on Range
                    //chart.xAxis[0].options.tickInterval = getTickInterval(diffDays);
                    //chart.xAxis[0].isDirty = true;
                    //chart.redraw();
                    chart.hideLoading();
                    //chart.redraw();

                    ////Remove "Loading" overlay
                    //loader.remove();
                }
            }));
    }
}

function getDateFormat(diffDays) {
    var format;
    if (diffDays >= rules[0] && diffDays <= rules[1]) {
        //Hour
        format = '%A, %b %e, %Y %l %p';
    } else if (diffDays > rules[1] && diffDays <= rules[3]) {
        // Day
        format = '%A, %b %e, %Y';
    } else if (diffDays > rules[3] && diffDays <= rules[4]) {
        // Month                        
        format = '%B %Y';
    }
    return format;
}
function getTickInterval(diffDays) {
    var interval;
    if (diffDays >= rules[0] && diffDays <= rules[1]) {
        //Hour
        interval = 4 * 3600 * 1000;
    } else if (diffDays > rules[1] && diffDays <= rules[3]) {
        // Day
        interval = 24 * 3600 * 1000;
    } else if (diffDays > rules[3] && diffDays <= rules[4]) {
        // Month                        
        interval = 31 * 24 * 3600 * 1000;
    }
    return interval;
}
function getXAxixTitle(diffDays) {
    var text;
    if (diffDays >= rules[0] && diffDays <= rules[1]) {
        //Hour
        text = 'Hourly';
    } else if (diffDays > rules[1] && diffDays <= rules[3]) {
        // Day
        text = 'Daily';
    } else if (diffDays > rules[3] && diffDays <= rules[4]) {
        // Month                        
        text = 'Monthly';
    }
    return text;
}

//--------------------------
// Reusable Functions
//--------------------------
function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
function getDifferenceInDays(startDate, endDate) {
    var diff = Math.abs(new Date(endDate) - new Date(startDate));
    var day = 1000 * 60 * 60 * 24;
    return Math.round(diff / day);
}
function getDaysInMonth(Month, Year) {
    return 32 - new Date(Year, Month, 32).getDate();
}
function htmlspecialchars(string, quote_style, charset, double_encode) {
    // http://kevin.vanzonneveld.net
    // +   original by: Mirek Slugen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Nathan
    // +   bugfixed by: Arno
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Ratheous
    // +      input by: Mailfaker (http://www.weedem.fr/)
    // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +      input by: felix
    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: charset argument not supported
    // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
    // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
    // *     example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
    // *     returns 2: 'ab"c&#039;d'
    // *     example 3: htmlspecialchars("my "&entity;" is still here", null, null, false);
    // *     returns 3: 'my &quot;&entity;&quot; is still here'
    var optTemp = 0,
        i = 0,
        noquotes = false;
    if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
    }
    string = string.toString();
    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            }
            else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
    }
    return string;
}
// This function removes non-numeric characters
function stripNonNumeric(str) {
    str += '';
    var rgx = /^\d|\.|-$/;
    var out = '';
    for (var i = 0; i < str.length; i++) {
        if (rgx.test(str.charAt(i))) {
            if (!((str.charAt(i) == '.' && out.indexOf('.') != -1) ||
             (str.charAt(i) == '-' && out.length != 0))) {
                out += str.charAt(i);
            }
        }
    }
    return out;
}

function numberPrecision(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function stringIsNullOrEmpty(value) {
    return (!value || !value.length);
}