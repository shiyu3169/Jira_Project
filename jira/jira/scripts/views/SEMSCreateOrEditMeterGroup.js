/// <reference path="SEMSCreateOrEditMeterGroup.js" />
; (function ($, window, document, undefined) {
    $.namespace('SEMS');

    window.SEMS.CreateOrEditMeterGroup = function (settings) {
        var properties = ["MeterNum", "Location", "Riser", "MeterUoM"];
        var selectedProperties = $.merge(["BuildingName"], properties);
        var essentialProperties = ["MeterNum"];
        var ds = null;
        var trace = new window.SEMS.Trace(false);
        var $dom = {
            id: null,
            nameTextbox: null,
            buildingDropDown: null,
            customersDropDown: null,
            metersTableTBody: null,
            selectedMetersTableTBody: null
        };

        var dataSource = function(settings) {
            var cachedResults = null;
            var request = null;
            var abortRequest = function() {
                if (request && request.abort != undefined) {
                    request.abort();
                }
            };

            var getData = function() {
                trace.info("dataSource.getdata called");

                if (cachedResults != null) {
                    var deferred = $.Deferred();

                    window.setTimeout(function() {
                        deferred.resolve(cachedResults);
                    }, 0); // async

                    return deferred.promise();
                }

                abortRequest();

                return $.Deferred(function(deferred) {
                    request = $.ajax({
                        url: settings.getDataUrl
                    }).done(function(xhr, textStatus, errorThrown) {
                        cachedResults = xhr;
                        trace.info("dataSource.getdata.result.Success = " + xhr.Success);

                        if (xhr.Success) {
                            deferred.resolve(xhr, textStatus, errorThrown);

                            return;
                        }

                        handleServiceFailure({ Message: xhr.Message });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).fail(function(xhr, textStatus, errorThrown) {
                        handleServiceFailure({ Message: xhr.responseText });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).always(function() {
                        request = null;
                    });
                }).promise();
            };

            var sendData = function(postData) {
                abortRequest();

                var jsonData = JSON.stringify(postData);

                return $.Deferred(function(deferred) {
                    request = $.ajax({
                        type: "post",
                        url: settings.saveDataUrl,
                        dataType: 'json',
                        data: jsonData,
                        contentType: 'application/json; charset=utf-8'
                    }).done(function(xhr, textStatus, errorThrown) {
                        cachedResults = xhr;

                        if (xhr.Success) {
                            deferred.resolve(xhr, textStatus, errorThrown);

                            return;
                        }

                        handleServiceFailure({ Message: xhr.Message });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).fail(function(xhr, textStatus, errorThrown) {
                        handleServiceFailure({ Message: xhr.responseText });
                        deferred.reject(xhr, textStatus, errorThrown);
                    }).always(function() {
                        request = null;
                    });
                }).promise();
            };

            return {
                getBuildings: function(callback) {
                    return getData().done(function(response, textStatus, jqXHR) {
                        trace.info("dataSource.getBuildings done called");

                        var results = distinct(response.Results, "BuildingID", function(obj) {
                            return {
                                value: obj.BuildingID,
                                text: obj.BuildingName
                            };
                        });

                        callback(results);
                    });
                },
                getCustomersForBuildingId: function(buildingId, callback) {
                    return getData().done(function(response) {
                        var results = $.Enumerable.From(response.Results)
                            .Where(function(x) {
                                return x.BuildingID == buildingId;
                            })
                            .Select(function(x) {
                                return {
                                    CustomerID: x.CustomerID,
                                    CustName: x.CustName
                                };
                            })
                            .ToArray();

                        results = distinct(results, "CustomerID", function(obj) {
                            return {
                                value: obj.CustomerID,
                                text: obj.CustName
                            };
                        });
                        results.sort(function(a, b) {
                            var aText = a.text.toLowerCase();
                            var bText = b.text.toLowerCase();
                            return ((aText < bText) ? -1 : ((aText > bText) ? 1 : 0));
                        });
                        callback(results);
                    });
                },
                getMetersForCustomerId: function(customerId, callback) {
                    return getData().done(function(response) {
                        var results = $.Enumerable.From(response.Results)
                            .Where(function(x) {
                                return x.CustomerID == customerId;
                            })
                            .ToArray();

                        results.sort(function (a, b) {
                            var aText = a.MeterNum;
                            var bText = b.MeterNum;
                            return ((aText < bText) ? -1 : ((aText > bText) ? 1 : 0));
                        });
                        callback(results);
                    });
                },
                getSelectedMetersForId: function(id, callback) {
                    return getData().done(function(response) {
                        if (id == '') {
                            callback([]);

                            return;
                        }

                        var results = $.Enumerable.From(response.Results)
                            .Where(function(x) {
                                return x.MeterGroupId == id;
                            })
                            .ToArray();

                        callback(results);
                    });
                },
                saveMeterGroup: function(data) {
                    return sendData(data);
                }
            };
        };

        var distinct = function(results, propertySelector, objectSelector) {
            var newResults = new Array();

            if (results == null || results == undefined)
                return newResults;

            var usePropertySelectorNewResults = false;

            if (!_.isFunction(objectSelector)) {
                usePropertySelectorNewResults = true;

                objectSelector = function(obj) {
                    return obj;
                };
            }

            if (!_.isFunction(propertySelector)) {
                var property = propertySelector;

                propertySelector = function(obj) {
                    return obj[property];
                };
            }

            for (var i = 0; i < results.length; i++) {
                var id = propertySelector(results[i]);
                var add = true;

                for (var j = 0; j < newResults.length; j++) {
                    var myId = usePropertySelectorNewResults ? propertySelector(newResults[j]) : newResults[j].value;

                    if (id == myId) {
                        add = false;
                        break;
                    }
                }

                if (add) {
                    newResults.push(objectSelector(results[i]));
                }
            }

            return newResults;
        };

        var handleServiceFailure = function (response) {
            var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
            console.log(response);
            var message = errorMessage + '<br/>';

            window.toastr.error(message);
        };

        var updateDropDown = function($dropDown, items) {
            var selectedValue = $dropDown.val();

            $dropDown.empty();

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var selected = selectedValue == item.value ? " selected='selected'" : "";
                var html = '<option' + selected + ' value="' + item.value + '">' + item.text + '</option>';

                $dropDown.append($(html));
            }

            $dropDown.trigger('change');
        };

        var appendToTableBody = function($tableBody, items, properties, checked, isSelected) {
            $tableBody.empty();

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var html = getTableRowHtml(item, properties, essentialProperties, checked, isSelected);

                $tableBody.append($(html));

                var $lastRow = $tableBody.find("tr:last");

                $lastRow.data("data", item);
            }

            window.setTimeout(function () {
                // this runs on separate thread so header checkbox gets checked if all are selected when edit page loads
                var $table = $tableBody.closest("table");
                var $headerCheckbox = $table.find("thead input:first");

                if ($table.length > 0)
                    $headerCheckbox.checkAll('#' + $table[0].id + ':first > tbody:first input:checkbox');
            }, 0);
        };

        var getTableRowHtml = function(item, properties, essentialProperties, checked, selectedMeter) {
            var html = checked ? '<td class="essential"><input type="checkbox" checked="checked" /></td>' : '<td class="essential"><input type="checkbox" /></td>';

            if (selectedMeter) {
                properties.push("Multiplier");
            }

            _.forEach(properties, function(property) {
                var value = item[property];

                if (value == null || value == undefined)
                    value = '';

                if (property == "Multiplier") {

                    if (_.contains(essentialProperties, property)) {
                        html += "<td class='essential'><input type='text' value='" + value + "'</input></td>";
                    } else {
                        html += "<td class='optional'><input type='text' value='" + value + "'</input>";
                    }
                    properties.pop();
                } else {
                    
                    if (_.contains(essentialProperties, property)) {
                        html += "<td class='essential'>" + value + "</td>";
                    } else {
                        html += "<td class='optional'>" + value + "</td>";
                    }
                }
            });

            return "<tr>" + html + "</tr>";
        };

        var addCheckBoxHandlers = function($tableBody, disableAdd) {
            trace.info('addCheckBoxHandlers called table.id = ' + $tableBody.closest("table")[0].id);

            var $checkboxes = $tableBody.find(':checkbox');

            $checkboxes.unbind('change');
            $checkboxes.change(function() {
                trace.info('checked changed table.id = ' + $tableBody.closest("table")[0].id);

                var $element = $(this);
                var $row = $element.parents("tr:first");
                var data = $row.data("data");
                var isChecked = $element.is(":checked");

                if (isChecked) {
                    if (!disableAdd)
                        addMeterToSelectedList(data);
                } else {
                    var $rows = $dom.selectedMetersTableTBody.find("tr");

                    $rows.each(function(index) {
                        var selectedRow = $(this);
                        var selectedRowData = selectedRow.data("data");

                        if (selectedRowData.Id != data.Id)
                            return true;

                        selectedRow.remove();

                        return false;
                    });
                }
                
                window.setTimeout(function() {
                    // if this happens on same thread, only the first meter gets selected or selected meters doesn't clear properly
                    // this is due to the checkbox change handlers updating both tables
                    checkMeters();
                }, 100);
            });
        };

        var addMeterToSelectedList = function(data) {
            trace.info('addMeterToSelectedList called');

            var $selectedRows = $dom.selectedMetersTableTBody.find("tr");
            var selectedMeters = getDataFromRows($selectedRows);

            //check if meter is already selected
            for (var i = 0; i < selectedMeters.length; i++) {
                var selectedMeter = selectedMeters[i];

                if (selectedMeter.Id == data.Id) {
                    trace.info('addMeterToSelectedList: meter is selected');

                    return; // it's already selected
                }
            }
            data["Multiplier"] = 1;
            var html = getTableRowHtml(data, selectedProperties, essentialProperties, true, true);

            $dom.selectedMetersTableTBody.append(html);

            var $lastRow = $dom.selectedMetersTableTBody.find("tr:last");

            $lastRow.data("data", data);

            //hack: work around needed because header checkbox is getting unselected
            $dom.selectedMetersHeaderCheckBox.prop('checked', true);
            addCheckBoxHandlers($dom.selectedMetersTableTBody, true);
            addInputChangeTracking($dom.selectedMetersTableTBody);
        };

        var getDataFromRows = function($rows) {
            var allData = new Array();

            $rows.each(function(index) {
                var $row = $(this);
                var data = $row.data("data");
                
                allData.push({
                    buildingId: data.BuildingID,
                    customerId: data.CustomerID,
                    meterId: data.MeterId,
                    Id: data.Id,
                    Multiplier: data.Multiplier
                });
            });

            return allData;
        };

        var checkMeters = function() {
            var $meterRows = $dom.metersTableTBody.find("tr");
            var $selectedRows = $dom.selectedMetersTableTBody.find("tr");
            var selectedMeters = $.Enumerable.From(getDataFromRows($selectedRows));

            $meterRows.each(function(index) {
                var $row = $(this);
                var meter = $row.data("data");
                var result = selectedMeters.FirstOrDefault(null, function(x) {
                    return x.Id == meter.Id;
                });

                if (result != null)
                    checkMeter($meterRows, result, true);
                else
                    checkMeter($meterRows, meter, false);
            });
        };

        var checkMeter = function($rowsToSearch, meter, checked) {
            trace.info('checkMeter: checked = ' + checked, true);

            $rowsToSearch.each(function(index) {
                var $row = $(this);
                var data = $row.data("data");

                if (meter.Id != data.Id)
                    return true;

                var checkBox = $row.find(':checkbox');

                checkBox.prop('checked', checked);

                return false;
            });
        };

        var addEventHandlers = function() {
            $dom.metersHeaderCheckBox.change(function() {
                var checkBoxes = $("#metersTable > tbody input:checkbox");

                checkBoxes.prop('checked', $(this).prop('checked'));
                checkBoxes.trigger('change');
            });

            $dom.selectedMetersHeaderCheckBox.change(function() {
                var checkBoxes = $dom.selectedMetersTableTBody.find(":checkbox");
                var $this = $(this);
                var isChecked = $this.prop('checked');

                checkBoxes.prop('checked', isChecked);
                checkBoxes.trigger('change');

                if (isChecked)
                    return;

                // we are clearing the list so we need to sync the meterTable
                checkBoxes = $dom.metersTableTBody.find(":checkbox");
                checkBoxes.prop('checked', false);
                checkBoxes.trigger('change');
                $dom.metersHeaderCheckBox.prop('checked', false);
                $this.prop('checked', true); // this checkbox should always be checked so the user can clear the list again
            });

            $dom.buildingDropDown.change(function() {
                var id = $(this).val();

                ds.getCustomersForBuildingId(id, function(results) {
                    updateDropDown($dom.customersDropDown, results);
                });
            });

            $dom.customersDropDown.change(function() {
                var id = $(this).val();

                ds.getMetersForCustomerId(id, function(results) {
                    appendToTableBody($dom.metersTableTBody, results, properties);
                    addCheckBoxHandlers($dom.metersTableTBody, false);
                    checkMeters();
                });
            });

            $dom.$saveButton.click(function() {
                var id = $dom.id.val();
                var name = $dom.nameTextbox.val();
                var $selectedRows = $dom.selectedMetersTableTBody.find("tr");
                var meters = getDataFromRows($selectedRows);
                var $form = $(this).closest("form");
                var $inputs = $form.find("input, select, button, textarea");

                $inputs.prop("disabled", true);

                ds.saveMeterGroup({
                    id: id,
                    name: name,
                    meters: meters
                }).done(function(results) {
                    toastr.success('Saved');
                    $dom.id.val(results.Id);
                    loadData();
                }).always(function() {
                    $inputs.prop("disabled", false);
                });

                return false;
            });
        };

        var addInputChangeTracking = function($selectedMetersTableTBody) {
            var inputs = $selectedMetersTableTBody.find("tr > td:last-child  :input");

            inputs.on("blur", function () {
                var $this = $(this);
                var $row = $this.parents("tr:first");
                var value = $this.val();
                var data = $row.data();

                data.data.Multiplier = value;

                $row.data(data);
            });
        };

        var loadData = function() {
            ds.getBuildings(function(results) {
                $dom.buildingDropDown.empty();

                updateDropDown($dom.buildingDropDown, results);

                var id = $dom.id.val();

                ds.getSelectedMetersForId(id, function(results) {
                    appendToTableBody($dom.selectedMetersTableTBody, results, selectedProperties, true, true);
                    addCheckBoxHandlers($dom.selectedMetersTableTBody, true);
                    addInputChangeTracking($dom.selectedMetersTableTBody);
                });
            });
        };

        var init = function () {
            ds = new dataSource(settings);
            trace.info("Init called");
            $dom.id = $("#Id");
            $dom.nameTextbox = $("#Name");
            $dom.buildingDropDown = $("#buildingsDropDown:first");
            $dom.customersDropDown = $("#customersDropDown:first");
            $dom.metersHeaderCheckBox = $("#metersTable > thead input:checkbox");
            $dom.selectedMetersHeaderCheckBox = $("#selectedMetersTable:first > thead input:checkbox");
            $dom.metersTableTBody = $("#metersTable:first > tbody:first");
            $dom.selectedMetersTableTBody = $("#selectedMetersTable:first > tbody:first");
            $dom.$saveButton = $("#saveButton:first");
            loadData();
            addEventHandlers();
            trace.info("Init completed");
        };

        init();
    };
})(jQuery, window, document);