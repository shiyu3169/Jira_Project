; (function ($, window, document, undefined) {
    $.namespace('SEMS');

    window.SEMS.Notifications = function (settings) {
        var currentBuildingId = null;
        var currentMonth = null;
        var currentYear = null;
        var ds = null;

        var notesReceived = false;
        var dataReceived = true;

        var dataSource = function (handleServiceFailure) {
            var abortRequest = function () {
                if (request && request.abort != undefined) {
                    request.abort();
                }
            };

            var getNotifications = function (url, id, month, year) {
                abortRequest();

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: url,
                        data: JSON.stringify({ buildingID: id, month: month, year: year }),
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (response, textStatus, errorThrown) {
                        if (response.Success) {
                            deferred.resolve(response.data);
                            return;
                        }

                        handleServiceFailure({ Message: response.Message });
                        deferred.reject(response, textStatus, errorThrown);
                    }).fail(function (xhr) {
                        var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
                        console.log(xhr.responseText);

                        window.toastr.error(errorMessage);
                    }).complete(function () {
                        notesReceived = true;
                    }).always(function () {
                        request = null;
                    });
                }).promise();
            };

            var request;
            
            var getLookups = function (url) {
                abortRequest();

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        dataType: "json",
                        url: url
                    }).done(function (response, textStatus, errorThrown) {
                        if (response.Success) {
                            deferred.resolve(response.data);

                            return;
                        }

                        handleServiceFailure({ Message: response.Message });
                        deferred.reject(response, textStatus, errorThrown);
                    }).always(function () {
                        request = null;
                    });
                }).promise();
            };

            var getBuildings = function (url) {
                abortRequest();

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        dataType: "json",
                        url: url
                    }).done(function (response, textStatus, errorThrown) {
                        if (response.Success) {
                            deferred.resolve(response.data);
                            
                            return;
                        }
                        
                        handleServiceFailure({ Message: response.Message });
                        deferred.reject(response, textStatus, errorThrown);
                    }).always(function () {
                        request = null;
                    });
                }).promise();
            };
            
            var sendData = function (url, id) {
                abortRequest();

                return $.Deferred(function (deferred) {
                    request = $.ajax({
                        type: "post",
                        dataType: "json",
                        url: url,
                        data: JSON.stringify({ buildingID: id }),
                        contentType: 'application/json; charset=utf-8'
                    }).done(function (response, textStatus, errorThrown) {
                        if (response.Success) {
                            deferred.resolve(response.data);
                            
                            return;
                        }
                        
                        handleServiceFailure({ Message: response.Message });
                        deferred.reject(response, textStatus, errorThrown);
                    }).complete(function () {
                        dataReceived = true;
                    }).always(function () {
                        request = null;
                    });
                }).promise();
            };

            return {
                getLookups: function (url, callback) {
                    getLookups(url).done(function (response) {
                        callback(response);
                    });
                },
                getBuildings: function (url, callback) {
                    getBuildings(url).done(function (response) {
                        callback(response);
                    });
                },
                getNotifications: function (url, id, month, year, callback) {
                    getNotifications(url, id, month, year).done(function (response) {
                        callback(response);
                    });
                },
                sendData: function (url, id, callback) {
                    sendData(url, id).done(function (response) {
                        callback(response);
                    });
                }
            };
        };

        var createDataSource = function(data) {
            return new kendo.data.DataSource({
                data: data,
                change: function () {
                    var grid = $('#notificationgrid');

                    grid.find('.empty-grid').remove();
                    
                    if (this.total() > 0)
                        return; // continue only for empty grid

                    var msg = 'No notifications to approve'; // Default message
                    
                    grid.append($('<div class="empty-grid">' + msg + '</div>'));
                }
            });
        };
        
        var initilizeGrid = function () {
            $('#notificationgrid').kendoGrid({
                dataSource: createDataSource([]),
                sortable: true,
                resizable: true,
                columns: [
                    {
                        field: "UserName",
                        title: "User Name"
                    }, {
                        field: "FirstName",
                        title: "First Name"
                    }, {
                        field: "LastName",
                        title: "Last Name"
                    }, {
                        field: "BillYear",
                        title: "Bill Year"
                    }, {
                        field: "BillPeriod",
                        title: "Bill Period"
                    }, {
                        field: "ToAddress",
                        title: "ToAddress"
                    }, {
                        field: "CCAddresses",
                        title: "CCAddresses"
                    }, {
                        field: "Approved",
                        title: "Approved"
                    }, {
                        field: "Sent",
                        title: "Sent"
                    }, {
                        field: "Error",
                        title: "Error"
                    }
                ]
            });

            loadNotifications();
        };

        var loadNotifications = function () {
            ds.getNotifications(settings.getNotifications, currentBuildingId, currentMonth, currentYear, function (data) {
                $('#notificationgrid').data("kendoGrid").setDataSource(createDataSource(data));
            });
        };

        var serviceFailureHandler = function (exception) {
            var message = exception.Message;

            toastr.error(message);
        };

        var init = function () {
            ds = new dataSource(serviceFailureHandler);

            $('#refreshNotifications').on('click', function () {
                if (notesReceived) {
                    notesReceived = false;
                    loadNotifications(true);
                }
            });

            $('#cancelApproval').on('click', function () {
                if (currentBuildingId == null)
                    return;
                if (dataReceived) {
                    dataReceived = false;
                    ds.sendData(settings.cancelApproval, currentBuildingId, function (data) {
                        $('#notificationgrid').data('kendoGrid').setDataSource(createDataSource(data));
                    });
                }
            });
            
            $('#approveNotifications').on('click', function () {
                if (currentBuildingId == null)
                    return;
                if (dataReceived) {
                    dataReceived = false;
                    ds.sendData(settings.approveNotifications, currentBuildingId, function (data) {
                        $('#notificationgrid').data('kendoGrid').setDataSource(createDataSource(data));
                    });
                }
            });
            
            $('#yeardropdown').kendoComboBox({
                dataTextField: "YearName",
                dataValueField: "YearValue",
                dataBound: function (e) {
                    this.select(this.ul.children().eq(0));

                    if (this.dataItem(0)) {
                        currentYear = this.dataItem(0).YearValue;
                    }
                },
                select: function (e) {
                    currentYear = this.dataItem(e.item.index()).YearValue;

                    if (currentYear == null)
                        return;

                    if (notesReceived) {
                        notesReceived = false;
                        loadNotifications();
                    }
                },
                text: "Choose a Year..."
            });


            $('#monthdropdown').kendoComboBox({
                dataTextField: "MonthName",
                dataValueField: "MonthValue",
                dataBound: function (e) {
                    this.select(this.ul.children().eq(0));

                    if (this.dataItem(0)) {
                        currentMonth = this.dataItem(0).MonthValue;
                    }
                },
                select: function (e) {
                    currentMonth = this.dataItem(e.item.index()).MonthValue;

                    if (currentMonth == null)
                        return;

                    if (notesReceived) {
                        notesReceived = false;
                        loadNotifications();
                    }
                },
                text: "Choose a Month..."
            });

            $('#buildingdropdown').kendoComboBox({
                dataTextField: "BuildingName",
                dataValueField: "BuildingID",
                dataBound: function (e) {
                    this.select(this.ul.children().eq(0));

                    if (this.dataItem(0)) {
                        currentBuildingId = this.dataItem(0).BuildingID;
                        initilizeGrid();
                    }
                },
                select: function(e) {
                    currentBuildingId = this.dataItem(e.item.index()).BuildingID;

                    if (currentBuildingId == null)
                        return;

                    if (notesReceived) {
                        notesReceived = false;
                        loadNotifications();
                    }
                },
                text: "Choose a Building..."
            });

            //ds.getBuildings(settings.getBuildings, function (data) {
            //    $('#buildingdropdown').data('kendoComboBox').setDataSource(data);
            //});

            ds.getLookups(settings.getLookups, function (data) {
                $('#yeardropdown').data('kendoComboBox').setDataSource(data.jsonyears);
                $('#monthdropdown').data('kendoComboBox').setDataSource(data.jsonmonths);
                $('#buildingdropdown').data('kendoComboBox').setDataSource(data.jsonbuildings);
            });
        };

        return {
            init: init
        };
    };
})(jQuery, window, document);
