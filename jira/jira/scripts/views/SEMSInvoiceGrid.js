(function ($, window, document, undefined) {

    var ns = $.namespace('SEMS');

    ns.InvoiceGrid = (function () {
        var defaults = {
            url: '',
            gridElement: '',
            proxyURL: '',
            showYear: '',
            showMonth: '',
            excelFileName: 'default.xlsx',
            pdfFileName: 'default.pdf',
            csvInputName: '',
            invoiceUrl: '',
            buildingId: 0,
            customerId: 0,
            year: 0,
            month: 0,
            utility: 0
        };
        var settings,
            grid;

        var exportCsvOnClick = function () {
            var form = $('#filtersForm');
            var input = $('<input>').attr({
                type: 'hidden',
                name: settings.csvInputName,
                value: true
            });

            form.append(input).submit();
            input.remove();

            return false;
        };
        
        var createGrid = function () {
            var ds = (function () {
                return new kendo.data.DataSource({
                    pageSize: 20,
                    transport: {
                        read: {
                            type: 'GET',
                            url: settings.invoiceUrl,
                            data: function () {
                                return {
                                    param: {
                                        BuildingId: settings.buildingId,
                                        CustomerId: settings.customerId,
                                        Utility: settings.utility,
                                        Year: settings.year,
                                        Month: settings.month
                                    }
                                };
                            }
                        }
                    },
                    schema: {
                        data: "Data",
                        total: "Total",
                        errors: "Errors",
                        model: {
                            fields: {
                                BillYear: { type: 'number' },
                                BillPeriod: { type: 'number' },
                                custName: { type: 'string' },
                                totConsump: { type: 'number' },
                                totDemand: { type: 'number' },
                                energyType: { type: 'string' },
                                Subtotal: { type: 'number' },
                                tax: { type: 'number' },
                                TotalAmt: { type: 'number' }
                            }
                        }
                    },

                    type: "aspnetmvc-ajax",
          
                    error: function (e) {
                        toastr.error("Error: " + e.errorThrown);
                    }
                });
            })();

            grid = $('#' + settings.gridElement).kendoGrid({
                toolbar: [
                    'excel',
                    //'pdf',
                    {
                        name: "Csv",
                        text: "Export To CSV",
                        template: '<a class="k-button k-button-icontext" onclick="return window.SEMS.InvoiceGrid.exportCsvOnClick()"><span class="k-icon"></span>Export To CSV</a>'
                    }
                ],
                pdf: {
                    author: 'EMSys',
                    creator: 'EMSys',
                    fileName: settings.pdfFileName,
                    proxyURL: settings.proxyURL
                },
                excel: {
                    fileName: settings.excelFileName,
                    proxyURL: settings.proxyURL,
                    filterable: true,
                    allPages: true
                },
                dataSource: ds,
                columns: [
                    {
                        title: '',
                        template: function (dataItem) {
                            var format = '<a href="' + kendo.htmlEncode(settings.url) + '/' + kendo.htmlEncode(dataItem.BillByPeriodID) + '">' + kendo.htmlEncode(dataItem.TenantNum) + '</a>';

                            return format;
                        }, sortable: false,
                    },
                    { field: 'BillYear', title: 'Bill Year' },
                    { field: 'BillPeriod', title: 'Bill Period' },
                    { field: 'custName', title: 'Customer'},
                    { field: 'totConsump', title: 'Usage', format: '{0:n0}' },
                    { field: 'totDemand', title: 'Demand', format: '{0:n1}' },
                    { field: 'energyType', title: 'Energy Type' },
                    { field: 'Subtotal', format: '{0:c2}' },
                    { field: 'tax', title: 'Sales Tax', format: '{0:c2}' },
                    { field: 'TotalAmt', title: 'Total Amount', format: '{0:c2}'}
                ],
                resizable: true,
                height: 543,
                scrollable: {
                    virtual: true
                },
                pageable: true, // 1/29/2015
            }).data('kendoGrid');
        };

        function expandFirstGroup() {
            grid.tbody.find('>tr.k-grouping-row:first').each(function (e) {
                grid.expandRow(this);
            });

            var expandIcon = grid.tbody.find('.k-i-expand:first');

            expandIcon.trigger('click');
        }

        function collapseRows() {
            grid.tbody.find('>tr.k-grouping-row').each(function (e) {
                grid.collapseRow(this);
            });
        }

        var init = function (inputs) {
            settings = $.extend({}, defaults, inputs);
            createGrid();
        };
        
        return {
            init: init,
            exportCsvOnClick: exportCsvOnClick
        };
    })();

})(jQuery, window, document);