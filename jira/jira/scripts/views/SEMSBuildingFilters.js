;

(function ($, window, document, undefined) {

    $.namespace('SEMS.Utils.BuildingFilters');
    var trace = new window.SEMS.Trace(false);
    window.SEMS.Utils.BuildingFilters.createDeferred = function (df, message) {
        trace.info(message + " called", true);

        return $.Deferred(function (deferred) {
            df.done(function (xhr, textStatus, errorThrown) {
                trace.info(message + " completed", true);
                deferred.resolve(xhr, textStatus, errorThrown);
            }).fail(function (xhr, textStatus, errorThrown) {
                trace.info(message + " failed", true);
                deferred.reject(xhr, textStatus, errorThrown);
            });
        }).promise();
    };


    window.SEMS.Utils.BuildingFilters.DataSource = function (settings) {
        trace.info("dataSource created", true);

        var currentSettings = {};

        var defaults = {
            getPathIdregex: /{[iI]d}/

        };

        currentSettings = $.extend(currentSettings, defaults, settings);
        var cachedResults = {};
        var currentRequests = {};

        var abortRequest = function (path) {
            if (currentRequests[path] && currentRequests[path].abort != undefined) {
                trace.error("dataSource.abortRequest: aborting request in progress for path: " + path);

                currentRequests[path].abort();
            }
        };

        var handleServiceFailure = function (response) {
            var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
            console.log(response);
            var message = errorMessage + '<br/>';


            trace.error("dataSource.handleServiceFailure: " + message);

            window.toastr.error(message);
        };

        var get = function (path, data) {

            path = path.replace(currentSettings.getPathIdregex, data ? data.Id : '');

            trace.info("dataSource.get called: " + path);

            if (cachedResults[path] != null) {
                var df = $.Deferred();

                window.setTimeout(function () {
                    df.resolve(cachedResults[path]);
                }, 0); // async

                return df.promise();
            }

            abortRequest(path);

            return $.Deferred(function (deferred) {
                currentRequests[path] = $.ajax({
                    type: 'GET',
                    url: path
                }).done(function (xhr, textStatus, errorThrown) {
                    trace.info("dataSource.get completed: " + path);
                    cachedResults[path] = xhr;
                    deferred.resolve(xhr, textStatus, errorThrown);
                }).fail(function (xhr, textStatus, errorThrown) {
                    handleServiceFailure({ Message: xhr.responseText });
                    deferred.reject(xhr, textStatus, errorThrown);
                }).always(function () {
                    delete currentRequests[path];
                });
            }).promise();

        };

        return {
            get: function (path, data) {
                return get(path, data);
            },
            clearCache: function () {
                trace.info("dataSource.clearCache");

                cachedResults = {};
            }
        };
    };


    window.SEMS.BuildingFilters = new function () {
        var defaults = {
            serviceBaseUrl: '/Api/',
            buildingsUrl: 'Building/{Id}',
            leaseUrl: 'Leases/GetByCustomer/{customerId}',
            leaseBuildingUrl: 'Leases/GetByBuilding/{buildingId}',
            customerUrl: 'Customer/{Id}?requireCustomer={requireCustomer}'
        };

        var $dom = {
            hiddenBuildingId: null,
            hiddenCustomerId: null,
            buildingComboBox: null,
            customerComboBox: null,
            oldCustomerId: null,
            oldBuildingId: null,
            leasesComboBox: null,
            oldLeaseId: null,
            hiddenLeaseId: null
        };

        var settings = {};

        var observers = [];

        var dataSource = (function () {
            var ds = new window.SEMS.Utils.BuildingFilters.DataSource();
            var createDeferred = window.SEMS.Utils.BuildingFilters.createDeferred;

            return {
                getBuildings: function (data) {
                    return createDeferred(ds.get(settings.serviceBaseUrl + settings.buildingsUrl, data), 'Trying to get buildings');
                },
                getCustomers: function (data) {
                    return createDeferred(ds.get(settings.serviceBaseUrl + settings.customerUrl.replace(/{requireCustomer}/, data.requireCustomer), data), 'Trying to get customer data');
                },
                getLeases: function (data) {
                    var url;

                    if (settings.showCustomers) {
                        url = settings.serviceBaseUrl + settings.leaseUrl.replace(/{customerId}/, data.customerId);
                    } else {
                        url = settings.serviceBaseUrl + settings.leaseBuildingUrl.replace(/{buildingId}/, data.buildingId);
                    }

                    return createDeferred(ds.get(url, data), 'Trying to get lease data');
                }
            };
        })();

        var buildingSummaryComboBoxOnChanged = function (e) {
            submitForm(true, true);
        };

        var customerComboBoxComboBoxOnChanged = function (e) {
            submitForm(false, true);
        };

        var leaseComboBoxComboBoxOnChanged = function (e) {
            submitForm(false, false);
        };

        var createBuildingDropDown = function (data, dfd) {

            $dom.buildingComboBox.kendoComboBox({
                dataValueField: 'BuildingID',
                dataTextField: 'BuildingName',
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,
                suggest: true,

                headerTemplate: '<table style="margin-bottom: 2px;"><tr style="height: 15px; border-bottom: 1px solid black;"><td style="width: 200px; padding-left: 5px;">Building</td><td style="width: 100px; text-align: center;">SqFt</td>' +
                    '<td style="width: 100px; text-align: center;">City</td><td style="width: 50px; text-align: center;">State</td><td style="width: 100px; text-align: center;">Zip</td></tr></table>',
                template: '<table><tr><td style="width: 200px;">#: data.BuildingName #</td><td style="width: 100px; padding-left: 5px; text-align: center;">#: kendo.format("{0:n0}",data.BldgSqFt) #</td>' +
                    '<td style="width: 100px; padding-left: 5px; text-align: center;">#: data.City #</td>' +
                    '<td style="width: 50px; padding-left: 5px; text-align: center;">#: data.State #</td>' +
                    '<td style="width: 100px; padding-left: 5px; text-align: center;">#: data.Zip #</td></tr></table>',

                dataSource: { data: data },

                change: buildingSummaryComboBoxOnChanged
            }).data('kendoComboBox').select(function (dataItem) {
                if (settings.buildingId == 0) {
                    $dom.hiddenBuildingId.val(dataItem.BuildingID);
                    return true;
                }
                return dataItem.BuildingID == settings.buildingId;
            });

        };

        var createCustomerDropDown = function (data) {
            $dom.customerComboBox.kendoComboBox({
                dataValueField: 'CustomerID',
                dataTextField: 'CustName',
                suggest: true,
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,
                headerTemplate: '<table style="margin-bottom: 2px;"><tr style="height: 15px; border-bottom: 1px solid black;"><td style="width: 240px; padding-left: 5px;">Customer</td>' +
                    '<td style="width: 100px; text-align: center;">Tenant #</td></tr></table>',
                template: '<table><tr><td style="width: 250px;">#: data.CustName #</td><td style="width: 100px; text-align: center; margin-left: 5px;">#: data.CustID #</td></tr></table>',

                dataSource: { data: data },

                change: customerComboBoxComboBoxOnChanged
            }).data('kendoComboBox').select(function (dataItem) {
                if (settings.customerId == 0) {
                    $dom.hiddenCustomerId.val(dataItem.CustomerID);
                    return true;
                }
                return dataItem.CustomerID == settings.customerId;
            });
        };

        var hideLeasees = function () {
            if ($dom.leasesComboBox) {
                $dom.leasesComboBox.parents('.box2').hide();
            }
        }

        var showLeases = function () {
            if ($dom.leasesComboBox) {
                $dom.leasesComboBox.parents('.box2').show();
            }
        }

        var createLeaseDropDown = function (data) {
            $dom.leasesComboBox.width(200).kendoComboBox({
                dataValueField: 'LeaseId',
                dataTextField: 'LeaseName',
                suggest: true,
                delay: 100,
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                autoBind: true,
                headerTemplate: '<table style="margin-bottom: 2px;"><tr style="height: 15px; border-bottom: 1px solid black;"><td style="width: 300px; padding-left: 5px;">Name</td></tr></table>',
                template: '<table><tr><td style="width: 300px;">#: data.LeaseName #</td></tr></table>',

                dataSource: { data: data },

                change: leaseComboBoxComboBoxOnChanged
            }).data('kendoComboBox').select(function (dataItem) {
                if (settings.leaseId == 0) {
                    $dom.hiddenLeaseId.val(dataItem.LeaseId);
                    return true;
                }
                return dataItem.LeaseId == settings.leaseId;
            });

            if (data.length > 1) {
                showLeases();
            } else {
                hideLeasees();
            }

        };

        var loadBuildings = function (dfd) {
            return dataSource.getBuildings().done(function (xhr, textStatus, errorThrown) {
                createBuildingDropDown(xhr, dfd);
            });
        };

        var loadCustomers = function (buildingId) {
            return dataSource.getCustomers({ Id: buildingId, requireCustomer: settings.requireCustomer }).done(function (xhr, textStatus, errorThrown) {
                createCustomerDropDown(xhr);
            });
        };

        var loadLeases = function (leaseId) {
            return dataSource.getLeases({ Id: leaseId, customerId: settings.customerId, buildingId: settings.buildingId }).done(function (xhr) {
                createLeaseDropDown(xhr);
            });
        };


        var createDropDowns = function () {
            loadBuildings();
            if (settings.showCustomers) {
                loadCustomers(settings.buildingId);
            }

            if (settings.showLeases) {
                loadLeases(settings.leaseId);
            }
            else {
                hideLeasees();
            }
        };

        var init = function (settingsObj) {
            $.extend(settings, defaults, settingsObj || {});
            settings.enableAutoPost = /^True/.test(settings.enableAutoPost);
            settings.showCustomers = /^True/.test(settings.showCustomers);
            settings.showLeases = /^True/.test(settings.showLeases);
            settings.requireCustomer = /^True/.test(settings.requireCustomer);
            $dom.hiddenBuildingId = $('#BuildingFilters_BuildingID');
            $dom.hiddenCustomerId = $('#BuildingFilters_CustomerID');
            $dom.buildingComboBox = $('#BuildingFilterBuildingComboBox');
            $dom.customerComboBox = $('#BuildingFilterCustomerComboBox');
            $dom.leasesComboBox = $('#BuildingFilterLeaseComboBox');
            $dom.oldBuildingId = $('#BuildingFilters.OldBuildingID');
            $dom.oldCustomerId = $('#BuildingFilters.OldCustomerId');
            $dom.oldLeaseId = $('#BuildingFilters.OldLeaseId');
            $dom.hiddenLeaseId = $('#BuildingFilters_LeaseId');
            createDropDowns();
        };

        var getComboBoxDataItem = function (box) {
            var comboBox = box.data('kendoComboBox');
            return comboBox.dataItem(comboBox.select());
        };

        function submitForm(clearCustomer, clearLease) {

            if (!settings.enableAutoPost)
                return;

            window.SEMS.Overlay.show();

            var form = $($dom.buildingComboBox).closest("form");
            var building = getComboBoxDataItem($dom.buildingComboBox);
            if (!building) {
                window.SEMS.Overlay.hide();
                window.toastr.error("Please select a building");
                return;
            }

            $dom.hiddenBuildingId.val(building.BuildingID);
            if (settings.showCustomers) {
                var customer = getComboBoxDataItem($dom.customerComboBox);
                if (!customer) {
                    window.SEMS.Overlay.hide();
                    window.toastr.error("Please select a customer");
                    return;
                }
                var customerId = clearCustomer ? 0 : customer.CustomerID;

                $dom.hiddenCustomerId.val(customerId);
            }

            if (settings.showLeases) {
                var lease = getComboBoxDataItem($dom.leasesComboBox);
                if (!lease) {
                    lease = {};
                    lease.LeaseId = 0;
                    //    window.SEMS.Overlay.hide();
                    //    window.toastr.error("Please select a lease");
                    //    return;
                }

                var leaseId = clearLease ? 0 : lease.LeaseId;

                $dom.hiddenLeaseId.val(leaseId);
            }

            if (form.length <= 0) {
                alert('No form found to submit, please contact support and let them know');

                return;
            }

            form.submit();
        };

        function updateArguments(arguments) {
            observers.forEach(
                function (el) {
                    el.call(window, arguments);
                }
            );
        };



        return {
            subscribeOnBeginCallback: function (func) {
                observers.push(func);
            },
            gridView_OnBeginCallback: function (sender, e) {
                var buildingId = $dom.buildingComboBox.data('kendoComboBox').value();

                e.customArgs["BuildingFilters.buildingID"] = buildingId;

                if ($dom.customerComboBox.data('kendoComboBox') == null)
                    return;

                var customerId = $dom.customerComboBox.data('kendoComboBox').value();

                e.customArgs["BuildingFilters.customerID"] = customerId;

                updateArguments(e.customArgs);
            },
            init: init
        };
    };


})(jQuery, window, document);