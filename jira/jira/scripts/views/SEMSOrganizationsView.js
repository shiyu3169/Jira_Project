; (function ($, window, document, undefined) {
    $(function () {
        window.onerror = function (msg, url, line) {
            try {
                if (dataSource.hasChanges()) {
                    dataSource.sync();
                } else {
                    toastr.error("Error: " + msg + "\nurl: " + url + "\nline #: " + line);
                }
            } catch (e) {
                console.log(e);
                toastr.error("Sorry we encountered an error while processing your request. Please contact the Support team.");
            }

            var suppressErrorAlert = true;

            return suppressErrorAlert;
        };

        var dataSource = (function () {
            return new kendo.data.DataSource({
                transport: {
                    prefix: "",
                    read: {
                        url: "api/Organizations",
                        type: "GET"
                    },
                    update: {
                        url: function (data) {
                            return "api/Organizations/" + data.Id;
                        },
                        type: "PUT",
                        complete: function (e) {
                            dataSource.read();
                        }
                    },
                    create: {
                        url: "api/Organizations",
                        type: "POST",
                        complete: function (e) {
                            dataSource.read();
                        }
                    },
                    destroy: {
                        url: function (data) {
                            return "api/Organizations/" + data.Id;
                        },
                        type: "DELETE",
                        complete: function (e) {
                            dataSource.read();
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
                        id: "Id",
                        fields: {
                            Id: {
                                type: "number"
                            },
                            Name: {
                                type: "string"
                            },
                            DefaultPassword: {
                                type: "string"
                            },
                            AllowPdfNotificationAttachments: {
                                type: "boolean"
                            }
                        }
                    }
                },
                error: function (e) {
                    toastr.error("Error: " + e.errorThrown);
                }
            });
        })();

        var gridOptions = (function () {
            return {
                columns: [
                    { command: ["edit"], title: "&nbsp;", width: "90px" },
                    { title: "Name", field: "Name", filterable: {}, encoded: true },
                    {
                        title: "Default Password", field: "DefaultPassword", filterable: {}, encoded: true,
                        template: function (parameters) {
                            return "";
                        }
                    },
                    { title: "Allow Pdf Notification Attachments", field: "AllowPdfNotificationAttachments", width: 110 },
                    { command: ["destroy"], title: "&nbsp;", width: "90px" }
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
                dataSource: dataSource
            };
        })();

        $("#organizationsGridView").kendoGrid(gridOptions);

        $(window).bind('beforeunload', function () {
            var isDirty = dataSource.hasChanges();

            if (isDirty) {
                return "You have unsaved data, are you sure to leave?";
            }
        });
    });
})(jQuery, window, document);