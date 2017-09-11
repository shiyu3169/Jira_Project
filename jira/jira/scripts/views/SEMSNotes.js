;

$('document').ready(function ()
{
    (function ($, window, document, undefined) {
        var custId = $('#CustId').val();

        var dataSource = (function () {
            return new kendo.data.DataSource({
                transport: {
                    prefix: "",
                    read: {
                        url: "/api/Notes/" + custId,
                        type: "GET"
                    },
                    create: {
                        url: "/api/Notes",
                        type: "POST",
                        complete: function(e) {
                            dataSource.read();
                        }

                    },
                    parameterMap: function (data, type) {
                        if (type == "create") {
                            data.CustId = custId;                           
                        }
                        return data;
                    }
                },
                total: 0,
                pageSize: 10,
                serverPaging: false,
                serverSorting: false,
                serverFiltering: false,
                serverGrouping: false,
                serverAggregates: false,
                type: "aspnetmvc-ajax",
                filter: [],
                sort: { field: "CreateDate", dir: "asc", unsortable: true },
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
                            Text: {
                                type: "string"
                            },
                            FirstName: {
                                type: "string"
                            },
                            LastName: {
                                type: "string"
                            },
                            UserName: {
                                type: "string"
                            },
                            CreateDate: {
                                type: "date",
                            }
                        }
                    }
                },
                error: function (e) {
                    var responseText = $.parseJSON(e.xhr.responseText);
                    var error = responseText.Message;
                    //Cheap way to handle the different message formats
                    if (responseText.ExceptionMessage) {
                        error = responseText.ExceptionMessage;
                    }
                    toastr.error("Error: " + error);
                }
            });
        })(custId);

        var gridOptions = {
            dataSource: dataSource,
            scrollable: false,
            pageable: true,
            pageSize: 10,
            sortable: true,
            editable: {
                mode: 'popup',
                template: kendo.template($('#addNewNote').html()),
                create: true,
                destroy: false,
                update: false
            },
            width: 750,
            toolbar: ["create"],
            columns: [
                { field: "UserName", title: "User Name", width: '10%' },
                { field: "FirstName", title: "First Name", width: '10%' },
                { field: "LastName", title: "Last Name", width: '10%'},
                { field: "Text", title: "Note", width: '60%' },
                { field: "CreateDate", title: "Create Date", template: '#= kendo.toString(kendo.parseDate(CreateDate), "M/d/yyyy h:mm:ss tt")#', sortable: true }
            ]
        };

        $("#noteGrid").kendoGrid(gridOptions);
    })(jQuery, window, document);

});
