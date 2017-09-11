var selectedAccount = "";
var selectedYear = "";
var chart;
var options = "";

$(document).ready(function () {
    
    $("#loading").ajaxStart(function () {
        $(this).show();
    });
    $("#loading").ajaxStop(function () {
        $(this).hide();
    });
    
    if (!stringIsNullOrEmpty($('#BudgetAccountID').val())) {
        selectedAccount = $('#BudgetAccountID').val();
        $('#AccountBudgets').val($('#BudgetAccountID').val());
        getValueList(selectedAccount, "BudgetYear");
        $('#BudgetAccountID').val(0);

    } else {
        selectedAccount = 0;
    }
    
    if (!stringIsNullOrEmpty($('#BudgetYear').val())) {
        selectedYear = $('#BudgetYear').val();
        $('#BudgetYears').val($('#BudgetYear').val());
        
    } else {
        selectedYear = 0;
    }
    
    //---------------------
    // Click event handlers
    //---------------------
    $('#EditBudget').click(function () {
        if (selectedAccount != 0 && selectedYear != 0) {
            window.location.href = RootURL + 'Accounts/CallEditBudgetFromReporting?accountId=' + selectedAccount + '&year=' + selectedYear;
        }
    });

    //---------------------
    // Change event handlers
    //---------------------
    //Accounts
    $('#AccountBudgets').change(function () {
        selectedAccount = $('#AccountBudgets').val();
        
        selectedYear = 0;
        getValueList(selectedAccount, "BudgetYear");
        
        callGenerateChart();
        
        if (!stringIsNullOrEmpty($('#BudgetYear').val())) {
            selectedYear = $('#BudgetYear').val();
            $('#BudgetYears').val($('#BudgetYear').val());
            callGenerateChart();
        }
    });
    
    //Years
    $('#BudgetYears').change(function () {
        selectedYear = $('#BudgetYears').val();
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
                text: 'Cost',
                margin: 20
            },
            labels: {
                align: 'left',
                x: -10,
                y: 16
            },
            showFirstLabel: false
        },
            { // Secondary yAxis
                title: {
                    text: 'Usage',
                    enabled: true,
                    margin: 20,
                    style: {
                        color: '#71C05F'
                    }
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                },
                opposite: true
}
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
                html = Highcharts.dateFormat('%B', this.x) + '<br />';
                $.each(this.points, function (i, point) {
                    if (point.series.name == 'Average Temperature (°F)') {
                        html += '<b>' + point.series.name + '</b>: ' + Math.round(point.y * 10) / 10 + ' °F<br />';
                    } else {
                        html += '<b>' + point.series.name + '</b>: ' + addCommas(Math.round(point.y * 1) / 1) +  ' <br />';
                        
                    }
                });
                return html;
            }
        },

        plotOptions: {
            series: {
                cursor: 'pointer',
                marker: {
                    lineWidth: 1
                }
            }
        },

        series: [{
            name: 'Estimated Cost',
            lineWidth: 4,
            type: 'column',
            marker: {
                radius: 4
            },
        },
        {
            name: 'Actual Cost',
            lineWidth: 4,
            type: 'column',
            marker: {
                radius: 4
            },
        }
        ,
        {
            name: 'Estimated Usage',
            lineWidth: 4,
            type: 'column',
            yAxis: 1,
            marker: {
                radius: 4
            }
        }
        ,
        {
            name: 'Actual Usage',
            lineWidth: 4,
            type: 'column',
            yAxis: 1,
            marker: {
                radius: 4
            }
        }
        ],
        //exporting: { enabled: false },
        exporting: {
            buttons: {
                exportButton: {
                    menuItems: [
                        {
                            text: 'Export Chart Data to CSV',
                            onclick: function () {
                                downloadData("summary");
                            }
                        },
                        {
                            text: 'Export Detailed Data to CSV',
                            onclick: function () {
                                downloadData("detail");
                            }
                        },
                    null,
                    null
                    ],
                    y: 5
                },
                printButton: {enabled: false}
            },
            enabled: false
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
    generateChart(selectedAccount, selectedYear);
};

function generateChart(account, year) {
    if (account != 0 && year != 0) {
        window.chart = new Highcharts.Chart(options);
        getBudgetData(account, year);
    } else {
        //Remove Chart if it was already generated and now the variables have changed. Also clear the totals fields.
        if ($('#EstimatedCostTotal').text() != 0 && $('#EstimatedCostTotal').text() != '' && $('#EstimatedCostTotal').text() != null) {
            $('#chart').empty();
            $('.report-summary-box').attr({ 'hidden': true });
            $('#EditBudget').attr({ 'hidden': true });
            $('#EstimatedCostTotal').empty();
            $('#EstimatedUsageTotal').empty();
            $('#ActualCostTotal').empty();
            $('#ActualUsageTotal').empty();
            $('#ActualCostProjectedTotal').empty();
            $('#ActualUsageProjectedTotal').empty();
        }
    }
    //$('#hiddenStartDate').val(startdate);
    //$('#hiddenEndDate').val(enddate);
    //$('#hiddenValueType').val(valueType);
    //$('#hiddenValueTypeText').val(valueTypeText);
    //$('#hiddenGroup').val(group);
    //$('#hiddenECA').val(eca);
    //$('#hiddenMeter').val(meter);
}
