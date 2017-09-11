/**
 * Emsys theme for Highcharts JS
 */

Highcharts.theme = {
    colors: ['#00acf1', '#f36916', '#b4cc24', '#299b62', '#ffc600', '#f79578', '#e83c79', '#9868c6', '#7fd6f7', '#326593', '#86a0c8', '#BF3E39', '#2D588B', '#002a5c', '#e52217'],
    chart: {
        /*backgroundColor: {
			linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
			stops: [
				[0, 'rgb(252, 252, 252)'],
				[1, 'rgb(240, 240, 240)']
			]
		},
		borderWidth: 1,*/
        backgroundColor: '#FFF',
        borderColor: '#EFEFEF',
        borderRadius: 0,
        plotBackgroundColor: null,
        plotShadow: false,
        plotBorderWidth: 0,
        style: {
            fontFamily: '"RobotoRegular", Helvetica, Arial, sans-serif', // default font
            fontSize: '12px'
        }
    },

    title: {
        style: {
            color: '#5295b3',
            fontSize: '20px',
            fontFamily: '"RobotoLight", Helvetica, Arial, sans-serif',
            fontWeight: 'normal'
        },
        align: 'center',
        margin: 30
    },

    xAxis: {
        labels: {
            style: {
                fontWeight: 'normal'
            }
        },
        title: {
            style: {
                color: '#666',
                fontSize: '14px',
                fontWeight: 'bold'
            }
        },
        lineColor: '#CCC',
        tickColor: '#CCC',
        gridLineColor: '#DDD'
    },

    yAxis: {
        labels: {
            style: {
                color: '#86a1c7',
                fontSize: '15px',
                fontWeight: 'bold'
            }
        },
        title: {
            style: {
                color: '#666',
                fontSize: '14px',
                fontWeight: 'bold'
            }
        },
        lineColor: '#CCC',
        tickColor: '#CCC',
        gridLineColor: '#DDD'
    },

    plotOptions: {
        column: {
            borderWidth: 0,
            shadow: false,
            borderRadius: 2
        },
        line: {
            shadow: false
        },
        spline: {
            shadow: false
        },
        pie: {
            borderWidth: 0,
            shadow: false
        }
    },

    legend: {
        itemStyle: {
            color: '#747474',
            fontSize: '14px',
            fontWeight: 'normal'
        },
        itemHoverStyle: {
            color: '#333',
            fontSize: '14px',
            fontWeight: 'normal'
        },
        margin: 35,
        borderWidth: 0,
        borderRadius: 0,
        itemMarginTop: 7,
        itemMarginBottom: 7
        /*padding: 10*/
    },

    tooltip: {
        borderWidth: 1
    }

};

// Apply the theme
var highchartsOptions = Highcharts.setOptions(Highcharts.theme);