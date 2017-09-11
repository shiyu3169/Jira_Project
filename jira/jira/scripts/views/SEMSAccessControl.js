;
$(document).ready(function () {
    var usertoadd = null;
    var usertodelete = null;
    var building = null;
    var customer = null;
    var portfolio = null;
    var serviceRoot = "/AccessControl/";
    var filter = true;
    


    $(window).resize(function () {
 
        if ($('.global-warning').length) {
            $("#main").height($(window).height() - ($("#footer").height() + $("#header").height() + $('.global-warning').first().outerHeight()) + +$('#filterActivebox').height());
            return;
        }
        $("#main").height($(window).height() - ($("#footer").height() + $("#header").height()) + $('#filterActivebox').height());

    });


    var filterEvents = function(e) {

        var $this = e.currentTarget;
        
        if ($this.id == "allradio") {
            filter = false;
            var x = $('#activeradio');
            $('#activeradio').attr('checked', false);
        } else {
            filter = true;
            $('#allradio').attr('checked', false);
            
        }

        var tree = $('#treeview').data("kendoTreeView");
        tree.dataSource.read();

        $this.checked = true;

    };

    $('#activeradio').attr('checked', true);


    $('#filterActivebox :input').on('click', filterEvents);

    function addOnClick() {
        var jsonSerialized;

        if (building != null && usertoadd != null) {

            jsonSerialized = JSON.stringify({ user: usertoadd, buildingID: building });

            $.ajax({
                type: "POST",
                url: serviceRoot + "AssociateUserWithBuidling",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: jsonSerialized
            }).done(function() {
                var currentgrid = $("#currentusergrid").data("kendoGrid");
                var availablegrid = $("#availableusergrid").data("kendoGrid");
                availablegrid.dataSource.read();
                availablegrid.refresh();
                currentgrid.dataSource.read();
                currentgrid.refresh();
            });

            usertoadd = null;
        } else if (customer != null && usertoadd != null) {

            jsonSerialized = JSON.stringify({ user: usertoadd, customerID: customer });

            $.ajax({
                type: "POST",
                url: serviceRoot + "AssociateUserWithCustomer",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: jsonSerialized
            }).done(function() {
                var currentgrid = $("#currentusergrid").data("kendoGrid");
                var availablegrid = $("#availableusergrid").data("kendoGrid");
                availablegrid.dataSource.read();
                availablegrid.refresh();
                currentgrid.dataSource.read();
                currentgrid.refresh();
            });
            usertoadd = null;

        } else if (portfolio != null && usertoadd != null) {

            jsonSerialized = JSON.stringify({ user: usertoadd, portfolioID: portfolio });

            $.ajax({
                type: "POST",
                url: serviceRoot + "AssociateUserWithPortfolio",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: jsonSerialized
            }).done(function() {
                var currentgrid = $("#currentusergrid").data("kendoGrid");
                var availablegrid = $("#availableusergrid").data("kendoGrid");
                availablegrid.dataSource.read();
                availablegrid.refresh();
                currentgrid.dataSource.read();
                currentgrid.refresh();

            });
            usertoadd = null;


        }


    };
    function removeOnClick() {

        var jsonSerialized;

        if (building != null && usertodelete != null) {

            jsonSerialized = JSON.stringify({ user: usertodelete, buildingID: building });

            $.ajax({
                type: "POST",
                url: serviceRoot + "RemoveUserFromBuilding",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: jsonSerialized
            }).done(function () {
                var currentgrid = $("#currentusergrid").data("kendoGrid");
                var availablegrid = $("#availableusergrid").data("kendoGrid");
                availablegrid.dataSource.read();
                availablegrid.refresh();
                currentgrid.dataSource.read();
                currentgrid.refresh();
            });

            usertodelete = null;
        } else if (customer != null && usertodelete != null) {

            jsonSerialized = JSON.stringify({ user: usertodelete, customerID: customer });

            $.ajax({
                type: "POST",
                url: serviceRoot + "RemoveUserFromCustomer",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: jsonSerialized
            }).done(function () {
                var currentgrid = $("#currentusergrid").data("kendoGrid");
                var availablegrid = $("#availableusergrid").data("kendoGrid");
                availablegrid.dataSource.read();
                availablegrid.refresh();
                currentgrid.dataSource.read();
                currentgrid.refresh();
            });

 
            usertodelete = null;

        } else if (portfolio != null && usertodelete != null) {

            jsonSerialized = JSON.stringify({ user: usertodelete, portfolioID: portfolio });

            $.ajax({
                type: "POST",
                url: serviceRoot + "RemoveUserFromPortfolio",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: jsonSerialized
            }).done(function () {
                var currentgrid = $("#currentusergrid").data("kendoGrid");
                var availablegrid = $("#availableusergrid").data("kendoGrid");
                availablegrid.dataSource.read();
                availablegrid.refresh();
                currentgrid.dataSource.read();
                currentgrid.refresh();


            });

            usertodelete = null;

        }



    };

    //#region Grids

        $("#availableusergrid").kendoGrid({
            height: "100%",
            autoBind: false,
            dataSource: [],
            scrollable: false,
            selectable: true,
            change: function () {
                var selected = this.select();
                var dataItem = this.dataItem(selected);
                usertodelete = null;
                usertoadd = dataItem;
            },

            sortable: true,
            columns: [{
                    field: "",
                    width: "30px",
                    template: '<img src="/Content/images/Add-icon.png" alt="Add User" class="add" />'
            
                }, 
                {
                    field: "UserName",
                    title: "User Name",
                    width: "10%"
                }, {
                    field: "Email",
                    title: "Email Address",
                    width: "20%"
                },
                {
                    field: "FirstName",
                    title: "First Name",
                    width: "10%"
                },
                {
                    field: "LastName",
                    title: "Last Name"
                }]
        
        });
    

        $("#currentusergrid").kendoGrid({
            height: "100%",
            autoBind: false,
            dataSource: [],
            selectable: true,
            scrollable: false,
            sortable: true,
            change: function () {
                var selected = this.select();
                var dataItem = this.dataItem(selected);
                usertoadd = null;

                usertodelete = dataItem;
            },
            columns: [{
                    field: "",
                    width: "30px",
                    template: '<img src="/Content/images/Minus.png" alt="Remove User" class="remove" />'
            
                },
                {
                    field: "UserName",
                    title: "User Name",
                    width: "10%"
                }, {
                    field: "Email",
                    title: "Email Address",
                    width: "20%"
                },
                {
                    field: "FirstName",
                    title: "First Name",
                    width: "10%"
                }, {
                    field: "LastName",
                    title: "Last Name"
                }]
        });

        function onSelect(e) {
            switch (this.dataItem(e.node).type) {
            case "portfolio":
                {
                    building = null;
                    customer = null;
                    portfolio = this.dataItem(e.node).id;
                    var currentdatasource = new kendo.data.DataSource({
                        type: "json",
                        // pageSize: 20,
                        schema: {
                            data: "data",
                            total: "total"
                        },
                        transport: {
                            read: serviceRoot + "GetUsersForPortfolioID/" + this.dataItem(e.node).id,
                            cache: false
                        }

                    });
                    var currentgrid = $("#currentusergrid").data("kendoGrid");
                    var availabledatasource = new kendo.data.DataSource({
                        type: "json",
                        //pageSize: 20,
                        schema: {
                            data: "data",
                            total: "total"
                        },
                        transport: {
                            read: serviceRoot + "GetUsersNotForPortfolioID/" + this.dataItem(e.node).id,
                            cache: false
                        }

                    });
                    var availablegrid = $("#availableusergrid").data("kendoGrid");
                    availablegrid.setDataSource(availabledatasource);
                    availablegrid.dataSource.read();
                    availablegrid.refresh();
                    currentgrid.setDataSource(currentdatasource);
                    currentgrid.dataSource.read();
                    currentgrid.refresh();
                    $("#availableusergrid").on('click', '.add', addOnClick);
                    $("#currentusergrid").on('click', '.remove', removeOnClick);


                }
                break;
            case "building":
                {
                    building = this.dataItem(e.node).id;
                    customer = null;
                    portfolio = null;
                    var currentdatasource = new kendo.data.DataSource({
                        type: "json",
                        // pageSize: 20,
                        schema: {
                            data: "data",
                            total: "total"
                        },
                        transport: {
                            read: serviceRoot + "GetUsersForBuildingID/" + this.dataItem(e.node).id,
                            cache: false
                        }

                    });
                    var currentgrid = $("#currentusergrid").data("kendoGrid");
                    var availabledatasource = new kendo.data.DataSource({
                        type: "json",
                        //pageSize: 20,
                        schema: {
                            data: "data",
                            total: "total"
                        },
                        transport: {
                            read: serviceRoot + "GetUsersNotForBuildingID/" + this.dataItem(e.node).id,
                            cache: false
                        }

                    });
                    var availablegrid = $("#availableusergrid").data("kendoGrid");
                    availablegrid.setDataSource(availabledatasource);
                    availablegrid.dataSource.read();
                    availablegrid.refresh();
                    currentgrid.setDataSource(currentdatasource);
                    currentgrid.dataSource.read();
                    currentgrid.refresh();
                    $("#availableusergrid").on('click', '.add', addOnClick);
                    $("#currentusergrid").on('click', '.remove', removeOnClick);


                }
                break;
            case "customer":
                {
                    building = null;
                    customer = this.dataItem(e.node).id;
                    portfolio = null;

                    var currentdatasource = new kendo.data.DataSource({
                        type: "json",
                        //pageSize: 20,
                        schema: {
                            data: "data",
                            total: "total"
                        },
                        transport: {
                            read: serviceRoot + "GetUsersForCustomerID/" + this.dataItem(e.node).id,
                            cache: false
                        }

                    });
                    var currentgrid = $("#currentusergrid").data("kendoGrid");
                    var availabledatasource = new kendo.data.DataSource({
                        type: "json",
                        //pageSize: 20,
                        schema: {
                            data: "data",
                            total: "total"
                        },
                        transport: {
                            read: serviceRoot + "GetUsersNotForCustomerID/" + this.dataItem(e.node).id,
                            cache: false
                        }

                    });
                    var availablegrid = $("#availableusergrid").data("kendoGrid");
                    availablegrid.setDataSource(availabledatasource);
                    availablegrid.dataSource.read();
                    availablegrid.refresh();
                    currentgrid.setDataSource(currentdatasource);
                    currentgrid.dataSource.read();
                    currentgrid.refresh();
                    $("#availableusergrid").on('click', '.add', addOnClick);
                    $("#currentusergrid").on('click', '.remove', removeOnClick);


                }
                break;

            }
            if (building == null) {
                $('#batchbutton').prop("disabled", true);
                $('#batchbutton').css('visibility', 'hidden');
                $('#exportbutton').prop("disabled", true);
                $('#exportbutton').css('visibility', 'hidden');
            } else {
                $('#batchbutton').removeProp("disabled");
                $('#batchbutton').css('visibility', 'visible');
                $('#exportbutton').removeProp("disabled");
                $('#exportbutton').css('visibility', 'visible');
            }

        }

    //#endregion
    
    //#region BatchCreate

    function batchCreate() {
        $.ajax({
            type: "POST",
            url: serviceRoot + 'GetBatchCreateUsers',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({buildingId: building, filterActive: filter})
        }).done(function (result) {

            var viewModel = {
                close: function() {
                    $('#batchWindowDiv').data('kendoWindow').destroy();
                },
                create: function() {
                    if (this.Organization == -1) {
                        window.toastr.error("You Must Select An Organization In Order To Batch Create");
                        return;
                    }
                    var data = this.toJSON();
                    data.Organizations = null;
                    $.ajax({
                        type: "POST",
                        url: serviceRoot + "Create",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({ batch: data, createAll: false })
                    }).done(function(data) {
                        if (data.Success) {
                            rebind(data, viewModel);
                        } else {
                            viewModel.close();
                            createErrorDisplay(data, viewModel);
                        }
                    }).fail(function(result) {
                        
                    });
                },
                createAll: function() {
                    if (this.Organization == -1) {
                        window.toastr.error("You Must Select An Organization In Order To Batch Create");
                        return;
                    }
                    var data = this.toJSON();
                    data.Organizations = null;
                    $.ajax({
                        type: "POST",
                        url: serviceRoot + "Create",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify({ batch: data, createAll: true })
                    }).done(function(data) {
                        if (data.Success) {
                            rebind(data, viewModel);
                        } else {
                            viewModel.close();
                            createErrorDisplay(data, viewModel);
                        }
                    });
                },
                dropDownChange: function(e) {
                    var org = null;
                    for (var i = 0; i < this.Organizations.length; i++) {
                        if (this.Organizations[i].Id == this.Organization) {
                            org = this.Organizations[i];
                        }
                    }
                    for (var i = 0; i < this.Users.length; i++) {
                        this.Users[i].Password = org.DefaultPassword == null ? this.Users[i].UserName + "1" : org.DefaultPassword;
                    }
                    rebind(this.toJSON(), viewModel);
                },
                gridExport: function() {
                    var formTemplate = "<form id='exportForm' action='" + serviceRoot + "ExportToCsv' method='POST'></form>";
                    var inputTemplateBegin = "<input type='hidden' name='Users[";
                    var inputTemplateUserNameEnd = "].UserName' value='";
                    var inputTemplateCustomerNameEnd = "].CustomerName' value='";
                    var inputTemplatePasswordEnd = "].Password' value='";
                    var inputTemplateEmailEnd = "].Email' value='";
                    var inputTemplateCustIdEnd = "].CustID' value='";
                    var valueEndTag = "'";
                    var inputEndTag = "'/>";
                    var html = '';
                    $('#content').append($.parseHTML(formTemplate));
                    var users = this.toJSON().Users;                    
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].Created) {
                            html += inputTemplateBegin + i + inputTemplateUserNameEnd + users[i].UserName + valueEndTag + inputEndTag;
                            html += inputTemplateBegin + i + inputTemplateCustomerNameEnd + users[i].CustomerName + valueEndTag + inputEndTag;
                            html += inputTemplateBegin + i + inputTemplatePasswordEnd + users[i].Password + valueEndTag + inputEndTag;
                            html += inputTemplateBegin + i + inputTemplateEmailEnd + users[i].Email + valueEndTag + inputEndTag;
                            html += inputTemplateBegin + i + inputTemplateCustIdEnd + users[i].CustID + valueEndTag + inputEndTag;

                        }
                    }
                    $('#exportForm').append($.parseHTML(html));
                    var x = $('#exportForm');
                    $('#exportForm').submit();
                    $('#exportForm').remove();
                }
            };
            if (result.Success) {
                createGrid(result, viewModel);
            } else {
                createErrorDisplay(result, viewModel);
            }


        }).fail(function (r) {
            var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
            console.log(r.responseText);

            window.alert(errorMessage);
        });
    }

    var rebind = function(data, viewModel) {
        var observableData = kendo.observable($.extend({}, data, viewModel));
        kendo.bind($('#batchWindowDiv'), observableData);
        var logWindow = $('#batchWindowDiv').data('kendoWindow');
        logWindow.content($('#Popup').html());
        kendo.bind($('#PopWindow'), observableData);
        initToolbar('#PopWindow', observableData);
    };

    var createErrorDisplay = function(data, viewModel) {
        var windowTemplate = $('#batchWindow');
        var observableData = kendo.observable($.extend({}, data, viewModel));
        $('#main').append(windowTemplate.html());
        kendo.bind($('#batchWindowDiv'), observableData);
        var logWindow = $('#batchWindowDiv').data('kendoWindow');
        logWindow.content($('#errorGrid').html());
        kendo.bind($('#PopWindow'), observableData);
        initToolbar('#PopWindow', observableData);
        logWindow.center();
    };

    var createGrid = function(data, viewModel) {
        var windowTemplate = $('#batchWindow');
        var observableData = kendo.observable($.extend({}, data, viewModel));
        $('#main').append(windowTemplate.html());
        kendo.bind($('#batchWindowDiv'), observableData);
        var logWindow = $('#batchWindowDiv').data('kendoWindow');
        logWindow.content($('#Popup').html());
        kendo.bind($('#PopWindow'), observableData);
        initToolbar('#PopWindow', observableData);
        logWindow.center();
    };

    var initToolbar = function(id, data) {

        $(id).find(".k-grid-toolbar").insertAfter($(id + " .k-grid-content"));
        kendo.bind($(id).find(".k-grid-toolbar"), data);
    };
    //#endregion
    
    //#region TreeView

    var Customers = {
        transport: {
            read: {
                url: function(options) {
                    return serviceRoot + "GetCustomersByBuildingID/" + options.BuildingID + "?filter=" + filter;

                },
                dataType: "json"
            }
        },
        schema: {
            model: {
                type: "customer",
                id: "CustomerID",
            }
        }
    };

    var Buildings = {
        transport: {
            read: {
                url: function (options) {
                    return serviceRoot + "GetBuildingsByPortfolioID/" + options.PortfolioID;

                },
                dataType: "json"
            }
        },
        schema: {
            model: {
                type: "building",
                id: "BuildingID",
                hasChildren: "hasCustomers",
                children: Customers
            }
        }
    };

    var formattree = new kendo.data.HierarchicalDataSource({

        transport: {
            read: {
                url: serviceRoot + "GetPortfolios",
                dataType: "json"
            }
        },
        schema: {
            model: {
                type: "portfolio",
                id: "PortfolioID",
                hasChildren: "hasBuildings",
                children: Buildings
            }
        }
    });

    $('#treeview').kendoTreeView({
        dataSource: formattree,
        dataTextField: ['PortfolioName', 'BuildingName', 'CustomerName', 'LeaseID'],
        select: onSelect
    });
    
    //#endregion
    
    //#region Splitter

    $("#vertical").kendoSplitter({

        //layoutChange: onResize,
        orientation: "vertical",
        panes: [
            { size: "50%", scrollable: true},
            { size: "50%", scrollable: true}

        ]
    });

    $("#horizontal").kendoSplitter({
        panes: [
            { size: "30%" },
            { size: "70%" }

        ]
    });

    //#endregion


    //#region Export

    var exportTenantUsers = function() {
        var form = '<form id="exportForm" action="' + serviceRoot + 'ExportTenantUsers" method="post">';
        var endForm = '</form>';
        var html = form + '<input name="buildingId" type="text" value="' + building + '">' + endForm;

        $('#content').append($.parseHTML(html));
        $('#exportForm').submit();
        $('#exportForm').remove();

    };

    //#endregion

    $('#vertical').data("kendoSplitter").size("#availableusers", "50%");
    $('#batchbutton').prop("disabled", true);
    $('#batchbutton').css('visibility', 'hidden');
    $('#batchbutton').click(batchCreate);
    $('#exportbutton').prop("disabled", true);
    $('#exportbutton').css('visibility', 'hidden');
    $('#exportbutton').click(exportTenantUsers);
    
    $(window).resize();

});
