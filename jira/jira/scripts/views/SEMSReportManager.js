; (function ($, window, document, undefined) {
    var model = null;
    var defaultCategoryId = 0;
    var defaultConnectionStringId = 0;
    var windowTemplate;
    var deleteWindow;
    var userReportsDataSource = function (reportId) {
        var thisDs = new kendo.data.DataSource({
            transport: {
                prefix: "",
                read: {
                    url: "api/Reports/" + reportId + "/Users",
                    type: "GET" // works
                },
                update: {
                    url: function (data) {
                        return "api/Reports/" + reportId + "/Users";
                    },
                    type: "PUT",
                    complete: function (e) {
                        thisDs.read();
                    }
                },
                create: {
                    url: "api/Reports/" + reportId + "/Users",
                    type: "POST", // works
                    complete: function (e) {
                        thisDs.read();
                    }
                },
                destroy: {
                    url: function (data) {
                        return "api/Reports/" + reportId + "/Users/" + data.UserId;
                    },
                    type: "DELETE",
                    complete: function (e) {
                        thisDs.read();
                    }
                }
            },
            pageSize: 10,
            page: 1,
            total: 0,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            serverGrouping: true,
            serverAggregates: true,
            type: "aspnetmvc-ajax",
            filter: [],
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    id: "UserId",
                    fields: {
                        ReportId: {
                            type: "number"
                        },
                        UserId: {
                            type: "string"
                        },
                        UserName: {
                            type: "string"
                        },
                        FirstName: {
                            type: "string"
                        },
                        LastName: {
                            type: "string"
                        }
                    }
                }
            },
            error: function (e) {
                toastr.error("Error: " + e.errorThrown);
            }
        });

        return thisDs;
    };

    var usersDataSource = (function () {
        return new kendo.data.DataSource({
            transport: {
                prefix: "",
                read: {
                    url: "api/Users",
                    type: "GET"
                },
                update: {
                    url: function (data) {
                        return "api/Users/" + data.UserID;
                    },
                    type: "PUT",
                    complete: function (e) {
                        reportsDataSource.read();
                    }
                },
                create: {
                    url: "api/Users",
                    type: "POST",
                    complete: function (e) {
                        reportsDataSource.read();
                    }
                },
                destroy: {
                    url: function (data) {
                        return "api/Users/" + data.UserID;
                    },
                    type: "DELETE",
                    complete: function (e) {
                        reportsDataSource.read();
                    }
                }
            },
            page: 1,
            total: 0,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            serverGrouping: true,
            serverAggregates: true,
            type: "aspnetmvc-ajax",
            filter: [],
            sort: { field: "UserName", dir: "asc" },
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    id: "UserID",
                    fields: {
                        UserID: {
                            type: "string"
                        },
                        UserName: {
                            type: "string"
                        },
                        FirstName: {
                            type: "string",
                            editable: false
                        },
                        LastName: {
                            type: "string",
                            editable: false
                        }
                    }
                }
            },
            error: function (e) {
                toastr.error("Error: " + e.errorThrown);
            }
        });
    })();

    var userGridOptions = function (reportId) {
        return {
            columns: [
                {
                    command: ["edit"], title: "&nbsp;", width: "90px"
                }, {
                    field: "UserName", title: "User", width: "225px", editor: function (container, options) {
                        $('<input required data-text-field="UserName" data-value-field="UserName" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoAutoComplete({
                                filter: "contains",
                                placeholder: "Enter a user name...",
                                autoBind: true,
                                dataSource: usersDataSource
                            });
                    },
                    template: "#=UserName#"
                }, {
                    field: "FirstName", title: "First Name", editor: function (container, options) {
                        var td = $("<td role ='gridcell'>" + options.model["FirstName"] + "</td>");
                        td.appendTo(container);
                    }
                }, {
                    field: "LastName", title: "Last Name", width: "190px", editor: function (container, options) {
                        var td = $("<td role ='gridcell'>" + options.model["LastName"] + "</td>");
                        td.appendTo(container);
                    }
                }, {
                    command: ["destroy"], title: "&nbsp;", width: "90px"
                }
            ],
            pageable: {
                buttonCount: 10
            },
            sortable: true,
            filterable: true,
            scrollable: false,
            editable: {
                confirmation: "Are you sure you want to delete this record?",
                mode: "inline",
                create: true,
                update: true,
                destroy: true
            },
            toolbar: ["create"],
            dataSource: userReportsDataSource(reportId)
        };
    };

    var detailInit = function (e) {
        var detailRow = e.detailRow;
        var data = e.data;
        var reportId = data.Id;
        var tabstrip = detailRow.find(".tabstrip");

        tabstrip.kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });

        var $reportXmlEditor = detailRow.find(".reportXmlEditor:first");
        var $textEditor = $reportXmlEditor.find("textarea:first");
        var $saveButton = $reportXmlEditor.find("button:first");
        var $browseButton = $reportXmlEditor.find("input[type=file]:first");

        $textEditor.val(data.Xml);

        $browseButton.on("change", function (event) {
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser, please use chrome');

                return;
            }

            var input = $browseButton[0];

            if (!input) {
                alert("Um, couldn't find the fileinput element.");
            } else if (!input.files) {
                alert("This browser doesn't seem to support the `files` property of file inputs.");
            } else if (!input.files[0]) {
                //alert("Please select a file before clicking 'Load'");
            } else {
                var file = input.files[0];
                var fileReader = new FileReader();

                fileReader.onload = function (e) {
                    var contents = e.target.result;

                    $textEditor.val(contents);
                };

                fileReader.readAsText(file);
            }
        });

        $saveButton.on("click", function () {
            data.set("Xml", $textEditor.val());

            reportsDataSource.sync();
        });

        var $reportUsers = detailRow.find(".reportUsers");

        if (!data.EnabledForAllUsers) {
            $reportUsers.kendoGrid(userGridOptions(reportId));
        } else {
            var template = $("#enableSpecificUsersTemplate").html();

            $reportUsers.empty();
            $reportUsers.append(template);
            $reportUsers.find("a").on("click", function () {
                data.EnabledForAllUsers = true;
                $reportUsers
                    .hide()
                    .empty()
                    .fadeIn()
                    .kendoGrid(userGridOptions(reportId));
            });
        }
    };

    var reportsDataSource = null;

    var createReportsDataSource = function () {
        model = {
            id: "Id",
            fields: {
                Id: {
                    type: "number"
                },
                Name: {
                    type: "string",
                    validation: { required: true }
                },
                DisplayName: {
                    type: "string",
                    validation: { required: true }
                },
                Type: {
                    type: "string"
                },
                ReportCategoryId: {
                    type: "number",
                    defaultValue: defaultCategoryId,
                    validation: { required: true }
                },
                ConnectionStringId: {
                    type: "number",
                    defaultValue: defaultConnectionStringId,
                    validation: { required: true }
                },
                EnabledForAllUsers: {
                    type: "boolean"
                },
                Xml: {
                    type: "string"
                },
                Order: {
                    type: "number"
                },
            }
        };

        return new kendo.data.DataSource({
            transport: {
                prefix: "",
                read: {
                    url: "api/Reports",
                    type: "GET"
                },
                update: {
                    url: function (data) {
                        return "api/Reports/" + data.Id;
                    },
                    type: "PUT",
                    complete: function (e) {
                        reportsDataSource.read();
                    }
                },
                create: {
                    url: "api/Reports",
                    type: "POST",
                    complete: function (e) {
                        reportsDataSource.read();
                    }
                },
                destroy: {
                    url: function (data) {
                        return "api/Reports/" + data.Id;
                    },
                    type: "DELETE",
                    complete: function (e) {
                        reportsDataSource.read();
                    }
                }
            },
            pageSize: 1000000,
            page: 1,
            total: 0,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            serverGrouping: true,
            serverAggregates: true,
            type: "aspnetmvc-ajax",
            filter: [],
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: model
            },
            group: [
                { field: "ConnectionStringId", dir: "asc" },
                { field: "ReportCategoryId", dir: "asc" }
            ],
            error: function (e) {
                toastr.error("Error: " + e.errorThrown);
            }
        });
    };

    var reportCategoriesDataSource = (function () {
        return new kendo.data.DataSource({
            transport: {
                prefix: "",
                read: {
                    url: "api/ReportCategories",
                    type: "GET"
                },
            },
            page: 1,
            total: 0,
            serverPaging: false,
            serverSorting: true,
            serverFiltering: true,
            serverGrouping: false,
            serverAggregates: true,
            type: "aspnetmvc-ajax",
            filter: [],
            sort: { field: "Name", dir: "asc" },
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    id: "Id",
                    fields: {
                        Id: {
                            type: "number"
                        },
                        Name: {
                            type: "string"
                        }
                    }
                }
            },
            error: function (e) {
                toastr.error("Error: " + e.errorThrown);
            }
        });
    })();

    var getCategoriesAsync = function () {
        var deferred = $.Deferred(),

            translate = function (data) {
                var categories = data;

                defaultCategoryId = categories[0].Id;

                categories.findById = function (id) {
                    for (var i = 0; i < categories.length; i++) {
                        if (categories[i].Id == id)
                            return categories[i];
                    }

                    return null;
                };

                deferred.resolve(categories);
            },

            load = function () {
                reportCategoriesDataSource.fetch(function () {
                    var data = this.data();
                    translate(data);
                });
            };

        window.setTimeout(load, 1);
        return deferred.promise();
    };

    var createCategoryEditor = function (categories) {
        return function (container, options) {
            $('<input data-text-field="Name" data-value-field="Id" data-bind="value:' + options.field + '" />')
                .appendTo(container)
                .kendoComboBox({
                    autoBind: false,
                    dataSource: categories,
                    optionLabel: "Select a category..."
                });
        };
    };

    var connectionStringDataSource = (function () {
        return new kendo.data.DataSource({
            transport: {
                prefix: "",
                read: {
                    url: "api/ConnectionStrings",
                    type: "GET"
                },
            },
            page: 1,
            total: 0,
            serverPaging: false,
            serverSorting: true,
            serverFiltering: true,
            serverGrouping: false,
            serverAggregates: true,
            type: "aspnetmvc-ajax",
            filter: [],
            sort: { field: "Name", dir: "asc" },
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    id: "Id",
                    fields: {
                        Id: {
                            type: "number"
                        },
                        Name: {
                            type: "string"
                        }
                    }
                }
            },
            error: function (e) {
                toastr.error("Error: " + e.errorThrown);
            }
        });
    })();

    var getConnectionStringAsync = function () {
        var deferred = $.Deferred(),

            translate = function (data) {
                var items = data;

                defaultConnectionStringId = items[0].Id;

                items.findById = function (id) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].Id == id)
                            return items[i];
                    }

                    return null;
                };

                deferred.resolve(items);
            },

            load = function () {
                connectionStringDataSource.fetch(function () {
                    var data = this.data();
                    translate(data);
                });
            };

        window.setTimeout(load, 1);
        return deferred.promise();
    };

    var createConnectionStringEditor = function (connectionStrings) {
        return function (container, options) {
            $('<input data-text-field="Name" data-value-field="Id" data-bind="value:' + options.field + '" />')
                .appendTo(container)
                .kendoComboBox({
                    autoBind: false,
                    dataSource: connectionStrings,
                    optionLabel: "Select a category..."
                });
        };
    };

    var addCopyButtonHandlers = function () {
        var copyButtons = $("#reportsGridView .copyButton");

        copyButtons.on("click", function (event) {
            event.preventDefault();
            var report = $("#reportsGridView").data("kendoGrid").dataItem($(this).closest("tr"));
            var newReport = {};
            var fields = model.fields;

            for (var field in fields) {
                if (report.hasOwnProperty(field))
                    newReport[field] = report[field];
            }

            newReport.Id = 0;
            newReport.Name = report.Name + "Copy";
            newReport.DisplayName = report.DisplayName + " Copy";

            reportsDataSource.add(newReport);
            reportsDataSource.sync();
        });
    };

    //var toggleColumns = function() {
    //    var g = $("#reportsGridView").data("kendoGrid");

    //    for (var i = 0; i < g.columns.length; i++) {
    //        g.showColumn(i);
    //    }

    //    $("#reportsGridView div.k-group-indicator").each(function(i, v) {
    //        g.hideColumn($(v).data("field"));
    //    });
    //};

    var saveGridState = function(grid) {
        var dataSource = grid.dataSource;

        var state = kendo.stringify({
            page: dataSource.page(),
            pageSize: dataSource.pageSize(),
            sort: dataSource.sort(),
            group: dataSource.group(),
            filter: dataSource.filter()
        });

        $.cookie("s1inc_ReportManagerState", state);
    };

    var reportDeleteButtonHandler = function (e) {
        var tr = $(e.target).closest("tr");
        var reportGrid = this;
        var data = reportGrid.dataItem(tr); //get the row data so it can be referred later

        deleteWindow.content(windowTemplate(data)); //send the row data object to the template and render it
        deleteWindow.open().center();

        $("#yesButton").click(function() {
            reportGrid.dataSource.remove(data); //prepare a "destroy" request 
            reportGrid.dataSource.sync(); //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
            deleteWindow.close();
        });

        $("#noButton").click(function() {
            deleteWindow.close();
        });
    };

    var getGridOptions = function (categories, connectionStrings) {
        var categoryEditor = createCategoryEditor(categories);
        var connectionStringEditor = createConnectionStringEditor(connectionStrings);
        var getCategoryNameForGroupBy = function (report) {
            return categories.findById(report.value).Name;
        };
        var getConnectionStringNameForGroupBy = function (report) {
            return connectionStrings.findById(report.value).Name;
        };
        var getCategoryName = function (report) {
            if (report && report.ReportCategoryId)
                return categories.findById(report.ReportCategoryId).Name;

            return "Not found";
        };
        var getConnectionStringName = function (report) {
            if (report && report.ConnectionStringId)
                return connectionStrings.findById(report.ConnectionStringId).Name;

            return "";
        };

        return {
            columns: [
                { command: ["edit"], title: "&nbsp;", width: "90px" },
                { title: "&nbsp;", filterable: false, encoded: true, template: '<a class="k-button k-button-icontext" href="/ReportManager/Download/#=Id#">Download</a>' },
                { title: "&nbsp;", filterable: false, encoded: true, template: '<a class="k-button k-button-icontext copyButton" href="/">Copy</a>' },
                { title: "Name", field: "Name", filterable: {}, encoded: true, template: '<a href="/DynamicReporting/#=Name#">#=Name#</a>' },
                { title: "Display Name", field: "DisplayName", filterable: {}, encoded: true, template: '<a href="/DynamicReporting/#=Name#">#=DisplayName#</a>' },
                { title: "Type", field: "Type", filterable: {}, encoded: true },
                { title: "Category", field: "ReportCategoryId", values: categories, editor: categoryEditor, template: getCategoryName, groupHeaderTemplate: getCategoryNameForGroupBy, width: "225px" },
                { title: "Connection", field: "ConnectionStringId", values: connectionStrings, editor: connectionStringEditor, template: getConnectionStringName, groupHeaderTemplate: getConnectionStringNameForGroupBy, width: "225px" },
                { title: "EnabledForAllUsers", field: "EnabledForAllUsers", filterable: {}, encoded: true },
                { command: [{ name: "Delete", click: reportDeleteButtonHandler }], title: "&nbsp;", width: "90px" }
            ],
            pageable: {
                buttonCount: 10
            },
            //pageable:false,
            sortable: true,
            filterable: true,
            scrollable: false,
            groupable: true,
            detailTemplate: kendo.template($("#reportDetailsTemplate").html()),
            detailInit: detailInit,
            dataBound: function () {
                addCopyButtonHandlers();
                //this.expandRow(this.tbody.find("tr.k-master-row").first());
                //toggleColumns();
                //saveGridState(this);
                //$("a").removeClass("k-link k-pager-nav k-pager-first k-state-disabled");
                $("a").remove(":contains('Go to the first page')");
                $("a").remove(":contains('Go to the previous page')");
                $("a").remove(":contains('Go to the next page')");
                $("a").remove(":contains('Go to the last page')");
                $("span").remove(":contains('1')");
                $("span").removeClass("k-icon k-i-seek-w");
                $("span").removeClass("k-icon k-i-arrow-w");
                $("span").removeClass("k-icon k-i-arrow-e");
                $("span").removeClass("k-icon k-i-seek-e");
                $("ul").remove(".k-pager-numbers, .k-reset");
            },
            editable: {
                confirmation: "Are you sure you want to delete this record?",
                create: true,
                update: true,
                destroy: true,
                mode: "inline"
            },
            toolbar: ["create"],
            dataSource: reportsDataSource
        };
    };
    
    //var parseFilterDates = function(filter, fields) {
    //    if (filter.filters) {
    //        for (var i = 0; i < filter.filters.length; i++) {
    //            parseFilterDates(filter.filters[i], fields);
    //        }
    //    } else {
    //        if (fields[filter.field].type == "date") {
    //            filter.value = kendo.parseDate(filter.value);
    //        }
    //    }
    //};
    //var inboxGrid = $('#inboxItems').data("kendoGrid");
    //inboxGrid.dataSource.pageSize(inboxGrid.dataSource.total());
    //inboxGrid.refresh();
    //$('[class*="k-pager-nav"]').hide();
    $(function () {
        $.when(getCategoriesAsync(), getConnectionStringAsync()).then(function(categories, connectionStrings) {
            reportsDataSource = createReportsDataSource();

            windowTemplate = kendo.template($("#windowTemplate").html());
            deleteWindow = $("#window").kendoWindow({
                title: "Are you sure you want to delete this report?",
                visible: false, //the window will not appear before its .open method is called
                width: "400px",
                height: "400px",
            }).data("kendoWindow");

            var options = getGridOptions(categories, connectionStrings);
            var grid = $("#reportsGridView").kendoGrid(options).data("kendoGrid");
            //var state = JSON.parse($.cookie("s1inc_ReportManagerState"));

            //if (state) {
            //    if (state.filter) {
            //        parseFilterDates(state.filter, grid.dataSource.options.schema.model.fields);
            //    }
            //    grid.dataSource.query(state);
            //}
            //else {
            //    grid.dataSource.read();
            //}

            //toggleColumns();
            //$("#reportsGridView tr").hover(function () {
            //    $(this).toggleClass("k-state-hover");
            //});

            //$("#reportsGridView .k-grid-edit").on("click", function (e) {
            //    alert("edit pressed!");
            //    var item = $("#reportsGridView").data("kendoGrid").dataItem($(this).closest("tr"));
            //    this.expandRow(item); //this.tbody.find("tr.k-master-row").first());
            //});
        }).fail(function(a, b, c) {
            //debugger;
        });
    });
})(jQuery, window, document);