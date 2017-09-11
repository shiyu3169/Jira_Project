jQuery.namespace('SEMS');

window.SEMS.DrillThroughChart = function (settings) {
    var invoiceUrl = settings.invoiceUrl;
    var drillThroughTotalsUrl = settings.drillThroughTotalsUrl;
    var canShowConsumptionInDrillDownUrl = settings.canShowConsumptionInDrillDownUrl;
    var chartViews = { portfolios: 100, building: 75, customers: 50, periods: 25, invoices: 10 };
    var chartTypes = { pie: 'pie', column: 'column' };
    var valueDataSources = { dollars: "Dollars", consumption: "Consumption" };
    var valueDataSource = valueDataSources.dollars;
    var currentChartView = chartViews.portfolios;
    var element = null;
    var chart;
    var portfolios;
    var selectedPortfolio;
    var selectedBuilding;
    var selectedCustomer;
    var selectedPeriod;
    var enableOtherData = true;

    var doServiceCall = function (jsonUrl, callBack) {
        $.getJSON(
            jsonUrl,
            null,
            function (response, textStatus, jqXHR) {
                if (!response.Success) {
                    handleServiceFailure(response);

                    return;
                }

                callBack(response);
            }
        );
    };

    var handleServiceFailure = function (response) {
        alert('Service call failed: ' + response.Message);
    };

    var showOverlay = function (message) {
        if (message == null)
            message = "Loading...";

        element.parent().mask(message);
    };

    var parseDate = function (input) {
        var parts = input.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2].split("T")[0]); // months are 0-based
    };

    var hideOverlay = function () {
        element.parent().unmask();
    };

    var createChart = function (data, chartType) {
        if (data.length < 1) {
            showNoDataWarning(element.parent());

            return;
        }

        if (chartType == null)
            chartType = chartTypes.pie;

        var catagories = chartType == chartTypes.pie ? null : $.Enumerable.From(data).Select(function (x) {
            var y = parseDate(x.Date);
            return y;
        }).ToArray();

        if (chart != null) {
            chart.destroy();
        }

        chart = new Highcharts.Chart({
            chart: {
                renderTo: element.get(0),
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: catagories,
                labels: {
                    align: 'right',
                    rotation: -35,
                    formatter: function () {
                        return Highcharts.dateFormat('%b %Y', this.value);
                    }
                },
                showFirstLabel: true,
                startOnTick: true,
                tickInterval: 1,
                type: 'datetime'
            },
            tooltip: {
                formatter: function () {
                    var html = '';

                    if (selectedPortfolio != null)
                        html += '<b>Portfolio: </b>' + selectedPortfolio.Name + '<br />';

                    if (selectedBuilding != null)
                        html += '<b>Building: </b>' + selectedBuilding.Name + '<br />';

                    if (selectedCustomer != null)
                        html += '<b>Customer: </b>' + selectedCustomer.Name + '<br />';

                    if (selectedPeriod != null)
                        html += '<b>Period: </b>' + selectedPeriod.Name + '<br />';

                    html += getHtmlForCurrentChartView(this.point, catagories);

                    if (chartType == chartTypes.pie)
                        html += '<b>Percentage: </b>' + Highcharts.numberFormat(this.percentage, 0) + '%<br/>';

                    return html + getValueText(this.y);
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    events: {
                        click: chartClick
                    },
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function () {
                            return '<b>' + this.point.name + '</b>: ' + Highcharts.numberFormat(this.percentage, 0) + '%';
                        }
                    }
                },
                column: {
                    events: {
                        click: chartClick
                    },
                    cursor: 'pointer'
                }
            },
            series: [{
                type: chartType,
                name: 'Dollars',
                showInLegend: false,
                data: getData(data, chartType)
            }]
        });
    };

    var getHtmlForCurrentChartView = function (point, catagories) {
        if (currentChartView == chartViews.portfolios)
            return '<b>Portfolio: </b>' + point.name + '<br />';

        if (currentChartView == chartViews.building)
            return '<b>Building: </b>' + point.name + '<br />';

        if (currentChartView == chartViews.customers)
            return '<b>Customer: </b>' + point.name + '<br />';

        if (currentChartView == chartViews.periods) {
            var value = catagories[point.x];
            var formatted = Highcharts.dateFormat('%b %Y', value);

            return '<b>Period: </b>' + formatted + '<br />';
        }

        return '';
    };

    var chartClick = function (e) {
        try {
            selectPoint(e.point);
        } catch (error) {
            console.log(error);
        }
    };

    var getValueText = function (value) {
        if (valueDataSource == valueDataSources.consumption)
            return '<b>Consumption: </b>' + Highcharts.numberFormat(value, 2);

        return '<b>Amount: </b> $' + Highcharts.numberFormat(value, 2);
    };

    var selectPoint = function (point) {
        var name = point.name;
        
        if (currentChartView == chartViews.portfolios) {
            if (name == 'Other') {
                createTable(portfolios);

                return;
            }

            selectedPortfolio = $.Enumerable.From(portfolios).Where(function (x) { return x.Name == name; }).First();

            loadBuildings();
        } else if (currentChartView == chartViews.building) {
            if (name == 'Other') {
                createTable(selectedPortfolio.buildings);

                return;
            }

            selectedBuilding = $.Enumerable.From(selectedPortfolio.buildings).Where(function (x) { return x.Name == name; }).First();

            loadCustomers();
        } else if (currentChartView == chartViews.customers) {
            if (name == 'Other') {
                createTable(selectedBuilding.customers);

                return;
            }

            selectedCustomer = $.Enumerable.From(selectedBuilding.customers).Where(function (x) { return x.Name == name; }).First();

            loadPeriods();
        } else if (currentChartView == chartViews.periods) {
            selectedPeriod = selectedCustomer.periods[point.x];

            loadinvoices();
        } else if (currentChartView == chartViews.invoices) {
            window.location.href = invoiceUrl + point.entityID;
        }
    };

    var createTable = function (entities, startPos, useLinks) {
        if (startPos == null)
            startPos = 10;

        if (useLinks == null)
            useLinks = false;

        element.empty();

        try {
            if (entities.length == 0) {
                element.append($('<span>No records found</span>'));

                return;
            }

            var table = $('<table></table>');

            element.append(table);

            for (var i = startPos; i < entities.length; i++) {
                var entity = entities[i];
                var value = getValue(entity);
                var valuePrefix = valueDataSource == valueDataSources.dollars ? "$" : "";
                var url = invoiceUrl + entity.ID;

                table.append($('<tr><td><a href="' + url + '" entityID="' + entity.ID + '">' + entity.Name + '</a></td><td class="value">' + valuePrefix + value + '</td></tr>'));
            }

            table.find(".value").formatCurrency();

            if (useLinks == false) {
                table.find('a').click(function () {
                    var el = $(this);
                    var name = el.text();
                    var id = el.attr("entityID");

                    selectPoint({ entityID: id, name: name });

                    return false;
                });
            }
        } catch (e) {
            console.log(e);
            alert("Sorry we encountered an error while processing your request. Please contact the Support team.");
        }
    };

    var getValue = function (entity) {
        var value = 0;

        try {
            if (valueDataSource == valueDataSources.consumption)
                value = entity.TotConsump;
            else
                value = entity.TotalAmt;

            // NOT WORKING return Highcharts.numberFormat(value, 2);
            return value;
        } catch (e) {
            console.log(e);

            return value;
        }
    };

    var getData = function (entities, chartType) {
        var newData = [];
        var enableOther = chartType == chartTypes.pie ? enableOtherData : false;
        var length = entities.length < 9
            ? entities.length
            : enableOther ? 9 : entities.length;

        for (var i = 0; i < length; i++) {
            var entity = entities[i];

            newData.push([entity.Name, getValue(entity)]);
        }

        if (entities.length > 8 && enableOther) {
            var totalAmt = $.Enumerable.From(entities).Select(function (x) { return getValue(x); }).Sum();

            newData.push(['Other', totalAmt]);
        }

        return newData;
    };

    var parseJson = function (results) {
        // not working - not sure why, creating a work around
        //                try {
        //                    return $.parseJSON(results);
        //                } catch (e) {
        //                    console.log(e.message);
        //                }

        return results; // we tried... this means dates won't work
    };

    var loadPortfolios = function () {
        clearSelected(chartViews.portfolios);

        if (portfolios != null) {
            currentChartView = chartViews.portfolios;
            createChart(portfolios);
            $("#portfoliosLink").show();

            return;
        }

        showOverlay("Loading portfolios");

        var url = drillThroughTotalsUrl + '?DataSource=Portfolios';

        doServiceCall(url, function (response) {
            hideOverlay();
            portfolios = parseJson(response.Results);

            if (portfolios.length == 0) {
                // skip portfolios and go to buildings
                selectedPortfolio = { ID: 0, Name: 'Default' };
                loadBuildings();

                return;
            } else if (portfolios.length == 1) {
                // skip portfolios and go to buildings
                selectedPortfolio = portfolios[0];
                loadBuildings();

                return;
            }

            currentChartView = chartViews.portfolios;
            createChart(portfolios);
            $("#portfoliosLink").show();
        });
    };

    var loadBuildings = function () {
        clearSelected(chartViews.building);

        if (selectedPortfolio.buildings != null) {
            currentChartView = chartViews.building;
            createChart(selectedPortfolio.buildings);
            $("#buildingsLink").show();

            return;
        }

        showOverlay("Loading buildings");

        var url = drillThroughTotalsUrl + '?DataSource=Buildings&ID=' + selectedPortfolio.ID;

        doServiceCall(url, function (response) {
            hideOverlay();
            selectedPortfolio.buildings = parseJson(response.Results);

            if (selectedPortfolio.buildings.length == 1) {
                selectedBuilding = selectedPortfolio.buildings[0];
                loadCustomers();

                return;
            }

            currentChartView = chartViews.building;
            createChart(selectedPortfolio.buildings);
            $("#buildingsLink").show();
        });
    };

    var loadCustomers = function () {
        clearSelected(chartViews.customers);

        if (selectedBuilding.customers != null) {
            currentChartView = chartViews.customers;
            createChart(selectedBuilding.customers);
            $("#customersLink").show();

            return;
        }

        showOverlay("Loading customers");

        var url = drillThroughTotalsUrl + '?DataSource=Customers&ID=' + selectedBuilding.ID;

        doServiceCall(url, function (response) {
            hideOverlay();
            selectedBuilding.customers = parseJson(response.Results);

            if (selectedBuilding.customers.length == 1) {
                // skip portfolios and go to buildings
                selectedCustomer = selectedBuilding.customers[0];
                loadPeriods();

                return;
            }

            currentChartView = chartViews.customers;
            createChart(selectedBuilding.customers);
            $("#customersLink").show();
        });
    };

    var loadPeriods = function () {
        clearSelected(chartViews.periods);

        if (selectedCustomer.periods != null) {
            currentChartView = chartViews.periods;
            createChart(selectedCustomer.periods, chartTypes.column);
            $("#periodsLink").show();

            return;
        }

        showOverlay("Loading periods");

        var url = drillThroughTotalsUrl + '?DataSource=Periods&ID=' + selectedCustomer.ID;

        doServiceCall(url, function (response) {
            hideOverlay();
            selectedCustomer.periods = parseJson(response.Results);

            if (selectedCustomer.periods.length == 1) {
                // skip portfolios and go to buildings
                selectedPeriod = selectedCustomer.periods[0];
                loadinvoices();

                return;
            }

            currentChartView = chartViews.periods;
            createChart(selectedCustomer.periods, chartTypes.column);
            $("#periodsLink").show();
        });
    };

    var loadinvoices = function () {
        clearSelected(chartViews.invoices);

        if (selectedPeriod.invoices != null) {
            currentChartView = chartViews.invoices;
            createTable(selectedPeriod.invoices, 0);
            $("#invoicesLink").show();

            return;
        }

        showOverlay("Loading invoices");

        var url = drillThroughTotalsUrl + '?DataSource=Invoices&ID=' + selectedPeriod.ID;

        doServiceCall(url, function (response) {
            hideOverlay();
            selectedPeriod.invoices = parseJson(response.Results);

            //if (selectedPeriod.invoices.length == 1) {
            //    showOverlay("Redirecting to invoice");
            //    window.location.href = invoiceUrl + selectedPeriod.invoices[0].ID;

            //    return;
            //}

            currentChartView = chartViews.invoices;
            createTable(selectedPeriod.invoices, 0, true);
            $("#invoicesLink").show();
        });
    };

    var clearSelected = function (view) {
        if (view >= chartViews.portfolios) {
            selectedPortfolio = null;
            $("#portfoliosLink").hide();
        }

        if (view >= chartViews.building) {
            selectedBuilding = null;
            $("#buildingsLink").hide();
        }

        if (view >= chartViews.customers) {
            selectedCustomer = null;
            $("#customersLink").hide();
        }

        if (view >= chartViews.periods) {
            selectedPeriod = null;
            $("#periodsLink").hide();
        }

        if (view >= chartViews.invoices) {
            $("#invoicesLink").hide();
        }
    };

    var reloadChart = function () {
        if (currentChartView == chartViews.portfolios) {
            loadPortfolios();
        } else if (currentChartView == chartViews.building) {
            loadBuildings();
        } else if (currentChartView == chartViews.customers) {
            loadCustomers();
        } else if (currentChartView == chartViews.periods) {
            loadPeriods();
        } else if (currentChartView == chartViews.invoices) {
            loadinvoices();
        }
    };

    var showNoDataWarning = function (container) {
        container.empty();

        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var now = new Date();

        container.html("<div>The drill through chart shows year to date data and there is no data to display for <b>" + monthNames[now.getMonth()] + "</b></div>");
    };

    var init = function () {
        element = $(settings.id);

        loadPortfolios();

        $("#portfoliosLink").click(function () {
            loadPortfolios();
        });

        $("#buildingsLink").click(function () {
            loadBuildings();
        });

        $("#customersLink").click(function () {
            loadCustomers();
        });

        $("#periodsLink").click(function () {
            loadPeriods();
        });

        $("#invoicesLink").click(function () {
            loadinvoices();
        });

        $("#showOtherCheckbox").change(function () {
            enableOtherData = this.checked;
            reloadChart();
        });


        var widget = element.closest(".widget");
        var content = widget.find(".widget-content");

        content.get(0).id = 'drillThroughWidgetContent';
        $("#ConsumptionButton").change(function () {
            if (this.checked == true) {
                valueDataSource = "Consumption";
                reloadChart();
            }

        });
        $("#DollarButton").change(function () {
            if (this.checked == true) {
                valueDataSource = "Dollars";
                reloadChart();
            }

        });

        var url = canShowConsumptionInDrillDownUrl;

        doServiceCall(url, function (canShowConsumptionInDrillDown) {
            var tabs = widget.find(".test");

            //if (canShowConsumptionInDrillDown.Result) {
            //    tabs.prepend('<span>TESTING THIS CODE</span>');
            //}

            //tabs.find('input').click(function (e) {
            //    var text = $(this).text();

            //    valueDataSource = text;
            //    reloadChart();

            //    e.preventDefault();
            //});
        });
    };

    return {
        init: init
    };
};