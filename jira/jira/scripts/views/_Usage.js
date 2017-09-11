var selectedValueType = "";
var selectedValueTypeText = "";
var selectedGroup = "";
var selectedAccount = "";
var selectedEnergyType = "--All--";
var selectedEnergyUoM = "--All--";
var fromPeriod = "";
var toPeriod = "";
var diffDays = "";
var chart;
var options = "";

$(document).ready(function () {
    
    SetValueTypeVariables();
    
    selectedGroup = $('#AccountGroups').val();
    selectedAccount = 0;
    
    selectedGroup = $('#AccountGroups').val();
    diffDays = 365;//getDifferenceInDays(startDate, endDate);       

    //Fill Accounts
    getValueList(selectedGroup, 'Account');
    
    //Fill Periods and generate the chart after periods are pulled.
    getValueList(0, 'Period','N/A',
       function () {
           var sDate = Date.today().addMonths(-15);
           var eDate = Date.today().addMonths(-4);
           var sYear = sDate.getFullYear();
           var sMonth = sDate.getMonth() + 1;
           var eYear = eDate.getFullYear();
           var eMonth = eDate.getMonth() + 1;
           var earliestPeriod = $('#FromPeriod option:last').val() || "";
           var earliestYear = parseFloat(earliestPeriod.substring(0, 4));
           var earliestMonth = parseFloat(earliestPeriod.substring(4));
           
           //----------
           //Build periods for earliest comparison
           //----------
           var sPeriod = sYear.toString();
           if (sMonth < 10) {
               sPeriod = sPeriod + '0' + sMonth.toString();
           } else {
               sPeriod = sPeriod + sMonth.toString();
           }
           var earliestPeriodCompare = earliestYear.toString();
           if (earliestMonth < 10) {
               earliestPeriodCompare = earliestPeriodCompare + '0' + earliestMonth.toString();
           } else {
               sPeriod = sPeriod + earliestMonth.toString();
           }
           
           //If the earliest found period is greater than the target From period, use the earliest period found.
           if (parseFloat(earliestPeriodCompare) > parseFloat(sPeriod)) {
               sYear = parseFloat(earliestYear);
               sMonth = parseFloat(earliestMonth);
           }
            //Set default periods as the last full years from the current date minus two months
           $('#FromPeriod').val(sYear.toString() + sMonth.toString());
           $('#ToPeriod').val(eYear.toString() + eMonth.toString());
           
           callGenerateChart();
       }
    );
    
    //---------------------
    // Change event handlers
    //---------------------
    //Energy Type
    $('#EnergyTypes').change(function () {
        //Fill Energy UoM
        getValueList(0, 'EnergyUoM', $('#EnergyTypes').val());

        selectedEnergyUoM = "";
        $('#EnergyUoMs').val("--All--");
        selectedEnergyType = $('#EnergyTypes').val();
        
        //If a Group is selected
        if (selectedGroup != '') {
            //Reset Account
            selectedAccount = 0;
            getValueList(selectedGroup, 'Account', selectedEnergyType);
        }
        
        callGenerateChart();
    });
    
    //Energy UoM
    $('#EnergyUoMs').change(function () {
        selectedEnergyUoM = $('#EnergyUoMs').val();
        
        callGenerateChart();
    });
    
    //Value Field
    $('#UsageValueTypes').change(function () {
        SetValueTypeVariables();
        
        //Fill Accounts
        getValueList(selectedGroup, 'Account', selectedEnergyType);
        
        callGenerateChart();
    });
    
    //Groups
    $('#AccountGroups').change(function () {
        selectedGroup = $('#AccountGroups').val();
        
        //Reset Account
        selectedAccount = 0;
        getValueList(selectedGroup, 'Account', selectedEnergyType);
        
        callGenerateChart();
    });
    
    //Accounts
    $('#Accounts').change(function () {
        selectedAccount = $('#Accounts').val();
        callGenerateChart();
    });
    
    $('#SubmitUsageDate').click(function () {
        callGenerateChart();
    });
    
    options = {
        chart: {
            renderTo: 'chart',
            spacingTop: 30,
            spacingBottom: 25
        },
        title: {
            text: null
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: '(Click to Toggle Series)',
                margin: 40
            },
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                hour: '%l %p',
                day: '%b %e',
                week: '%b %Y',
                month: '%b %Y',
                year: '%Y'
            },
            labels: {
                rotation: -35,
                y: 30,
                x: -10
            },
            startOnTick: true,
            tickInterval: 31 * 24 * 3600 * 1000,
            showFirstLabel: true
        },
        yAxis: [{
            title: {
                enabled: true,
                text: 'Usage (' + selectedValueTypeText + ')',
                margin: 20
            },
            labels: {
                align: 'left',
                x: -10,
                y: 16
            },
            showFirstLabel: false
        }//,
//            { // Secondary yAxis
//                title: {
//                    text: 'Average Temperature (°F)',
//                    style: {
//                        color: '#71C05F'
//                    }
//                },
//                labels: {
//                    formatter: function () {
//                        return this.value + ' °F';
//                    }
//                },
//                opposite: true
//}
],

        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            y: -30,
            floating: true,
            borderWidth: 0
        },

        tooltip: {
            shared: true,
            crosshairs: true,
            formatter: function () {
                var html;
                html = Highcharts.dateFormat(getDateFormat(diffDays), this.x) + '<br />';
                $.each(this.points, function (i, point) {
                    if (point.series.name == 'Average Temperature (°F)') {
                        html += '<b>' + point.series.name + '</b>: ' + Math.round(point.y * 10) / 10 + ' °F<br />';
                    } else {
                        var periodText = getXAxixTitle(diffDays);
                            
                        //Show 2 decimal places
                        if (periodText == 'Hourly') {
                            if (selectedValueType == 'mmbtu') {
                                //3 decimal places for MMBTU
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 1000) / 1000) + ' ' + selectedValueTypeText + '<br />';
                                
                            } else {
                                //2 decimal places for everything else
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 100) / 100) + ' ' + selectedValueTypeText + '<br />';
                            }
                        }
                        //Show 1 decimal places
                        else if (periodText == 'Daily') {
                            if (selectedValueType == 'mmbtu') {
                                //2 decimal places for MMBTU
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 100) / 100) + ' ' + selectedValueTypeText + '<br />';
                            } else {
                                //1 decimal places for everything else
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 10) / 10) + ' ' + selectedValueTypeText + '<br />';
                            }
                        }
                        //Show 0 decimal places
                        else if (periodText == 'Monthly') {
                            if (selectedValueType == 'mmbtu') {
                                //1 decimal places for MMBTU
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 10) / 10) + ' ' + selectedValueTypeText + '<br />';
                            } else {
                                //0 decimal places for everything else
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 1) / 1) + ' ' + selectedValueTypeText + '<br />';
                            }
                        } else {
                        //0 decimal places for everything else
                                html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 1) / 1) + ' ' + selectedValueTypeText + '<br />';
                        }
                    }
                });
                return html;
            }
        },

        plotOptions: {
            series: {
                cursor: 'default',
                marker: {
                    lineWidth: 1
                }
            }
        },

        series: [{
            name: 'Usage',
            lineWidth: 4,
            type: 'column',
            marker: {
                radius: 4
            }
        }
            //, {
            //name: 'Average Temperature (°F)',
            //color: '#71C05F',
            //type: 'spline',
            //yAxis: 1
            //}
        ],
        //exporting: { enabled: false },
        exporting: {
            buttons: {
                //exportButton: {enabled: false},
                exportButton:{
                    menuItems: [
                        {
                            text: 'Export Chart Data to CSV',
                            onclick: function () {
                                downloadData("summary");
                            }
                        },
                        null,
                    null,
                    null
                    ],
                    y: 5
                },
                printButton: {enabled: false}
            },
            enabled: true
        },
        credits: { enabled: false }
    }; // End Options
});

function downloadData(downloadType) {
    if (diffDays <= 765) {
        $('#hiddenDownloadType').val(downloadType);
        
        $('#Download').submit();
    } else {
        alert('Sorry, you can only export a maximum 2 years of data at a time. Please adjust dates and retry.');
    }
}

function callGenerateChart() {
    SetValueTypeVariables();
    
    fromPeriod = $('#FromPeriod').val();
    toPeriod = $('#ToPeriod').val();

   generateChart(selectedValueType, selectedValueTypeText, selectedEnergyType, selectedEnergyUoM, selectedGroup , selectedAccount, fromPeriod, toPeriod);
};

function generateChart(valueType, valueTypeText, energyType, energyUoM, group, account, from, to) {
    window.chart = new Highcharts.Chart(options);
    
    //Set yAxis title based on the value field that is selected
    chart.yAxis[0].axisTitle.attr({
        text: 'Usage (' + selectedValueTypeText + ')',
    });
    
    GetUsageData(valueType, energyType, energyUoM, group, account, from, to, 0);
    //getWeatherData(startdate, enddate, 1);
    diffDays = 365;//getDifferenceInDays(startdate, enddate);
    
    $('#hiddenFromPeriod').val(from);
    $('#hiddenToPeriod').val(to);
    $('#hiddenValueType').val(valueType);
    $('#hiddenValueTypeText').val(valueTypeText);
    $('#hiddenEnergyType').val(energyType);
    $('#hiddenEnergyUoM').val(energyUoM);
    $('#hiddenGroup').val(group);
    $('#hiddenAccount').val(account);
}

function SetValueTypeVariables() {
    selectedValueType = $('#UsageValueTypes').val();
    
    //Usage Value Type
    if (selectedValueType == "usage") {
        //No EnergyUoM selected
        if ($('#EnergyUoMs').val() == "--All--") {
            selectedValueTypeText = $('#EnergyTypes').val();
        }
        //EnergyType & EnergyUoM are selected
        else {
            selectedValueTypeText = $('#EnergyTypes').val() + "/" + $('#EnergyUoMs').val();
        }
    }
    //All other Value types
    else {
        selectedValueTypeText = $('#UsageValueTypes option:selected').text();
    }

//If Value Field is an Energy Type, only save the UoM for display
    if (selectedValueTypeText.indexOf("(") > 0) {
        selectedValueTypeText = selectedValueTypeText.substring(0, selectedValueTypeText.indexOf("(")-1);
    }
}