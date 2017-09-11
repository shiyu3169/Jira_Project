(function ($, undefined) {
    $.namespace('SEMS.Views.Documents');

    var ns = window.SEMS.Views.Documents;
    var trace = new window.SEMS.Trace(false);

    ns.DataSource = function (settings) {
        var cachedResults = null;
        var request = null;

        var abortRequest = function () {
            if (request && request.abort != undefined) {
                request.abort();
            }
        };

        var handleServiceFailure = function (response) {
            var errorMessage = 'Sorry we encountered an error while processing your request. Please contact the Support team.';
            console.log(response);

            var message = errorMessage + '<br/>';

            window.toastr.error(message);
        };

        var getData = function (path) {
            trace.info("dataSource.getdata called");

            if (cachedResults != null) {
                var deferred = $.Deferred();

                window.setTimeout(function () {
                    deferred.resolve(cachedResults);
                }, 0); // async

                return deferred.promise();
            }

            abortRequest();

            return $.Deferred(function (deferred) {
                request = $.ajax({
                    url: settings.serviceBaseUrl + path
                }).done(function (xhr, textStatus, errorThrown) {
                    cachedResults = xhr;
                    deferred.resolve(xhr, textStatus, errorThrown);
                }).fail(function (xhr, textStatus, errorThrown) {
                    handleServiceFailure({ Message: xhr.responseText });
                    deferred.reject(xhr, textStatus, errorThrown);
                }).always(function () {
                    request = null;
                });
            }).promise();
        };

        return {
            getCabinets: function (callback) {
                return getData("GetCabinets").done(function (response, textStatus, jqXHR) {
                    trace.info("dataSource.getCabinets done called");

                    callback(response);
                });
            },
            getCabinetById: function (cabinetId, callback) {
                this.getCabinets(function (results) {
                    var cabinet = $.Enumerable.From(results).Where(function (x) {
                        return x.Id == cabinetId;
                    }).FirstOrDefault();

                    callback(cabinet);
                });
            }
        };
    };

    ns.Index = function (settings) {
        var dataSource = new ns.DataSource(settings);
        var currentCabinet = {};
        var $dom = {
            userDefinedFieldsContainer: $("#userDefinedFieldsContainer")
        };

        var getCabinetId = function () {
            var cabinetsCombo = $("#cabinets").data("kendoComboBox");

            if (cabinetsCombo == null)
                return null;

            var value = cabinetsCombo.value();

            return value;
        };
        var getSearchBytext = function () {
            var searcybytext = $("#searchBytext");
            var radioselect = $("#FileSearch");
            var value = searcybytext.val();

            return value;
        };
        var getSearchRadio = function () {
            var value = "null";
            var radioselect = $("#FileSearchRadio input[name='SearchOption']:checked");
            if (radioselect.val() == "true") {
                 value = "searchbycontent";
            }
            else if (radioselect.val() == "false") {
                value = "searchbytext";
            }
            else {
                value = "nothing";
            }

            return value;
        };

        var comboOnChange = function () {
            try {
                var cabinetId = getCabinetId();
                var SearchbyTextValue = getSearchBytext();

                dataSource.getCabinetById(cabinetId, function (cabinet) {
                    if (cabinet == null)
                        return;

                    currentCabinet = cabinet;

                    $dom.userDefinedFieldsContainer = $("#userDefinedFieldsContainer"); // refresh cache
                    $dom.userDefinedFieldsContainer.empty();

                    var folders = cabinet.Folders;

                    if (folders != null && folders.length > 0) {
                        createFoldersDropdown(folders);
                    }

                    var userDefinedFields = cabinet.UserDefinedFields;

                    if (userDefinedFields == null) {
                        reloadDocumentsGrid();

                        return;
                    }

                    for (var index = 0; index < userDefinedFields.length; index++) {
                        var userDefinedField = userDefinedFields[index];

                        createUserDefinedFieldFilter(userDefinedField);
                    }

                    reloadDocumentsGrid();
                });
            } catch (e) {
                console.log(e);
                window.toastr.error("Sorry we encountered an error while processing your request. Please contact the Support team.");
            }
        };

        var reloadDocumentsGrid = function () {
            var documentsGrid = $("#documentsGrid").data("kendoGrid");
            var ds = documentsGrid.dataSource;

            ds.read();
        };
        var adjustComboBox = function (comboBox) {
            comboBox.list.width(250);
        };
        var folderChanged = function () {
            reloadDocumentsGrid();
        };
        var userDefinedFieldOnChange = function () {
            reloadDocumentsGrid();
        };

        var createFoldersDropdown = function (folders) {
            var html = "<div class='box2'><label for='folders'>Folder</label><input id='folders' type='text' style='width: 200px' /></div>";

            $dom.userDefinedFieldsContainer.append($(html));

            $("#folders").kendoComboBox({
                change: folderChanged,
                dataSource: folders,
                dataTextField: "Name",
                dataValueField: "Name",
                filter: "contains",
                index: 0,
                suggest: true
            });

            adjustComboBox($("#folders").data("kendoComboBox"));
        };

        var createUserDefinedFieldFilter = function (userDefinedField) {
            var template = "<div class='box2'><label for='@model.Id'>@model.Name</label><input id='@model.Id' type='text' style='width: 200px' /></div>";
            var html = jazor.parse(template, userDefinedField);

            trace.info(userDefinedField.Name);

            $dom.userDefinedFieldsContainer.append($(html));

            var data = new Array();

            for (var i = 0; i < userDefinedField.Values.length; i++) {
                data[i] = {
                    Text: userDefinedField.DisplayValues[i],
                    Value: userDefinedField.Values[i]
                };
            }

            $("#" + userDefinedField.Id).kendoComboBox({
                change: userDefinedFieldOnChange,
                dataSource: data,
                dataTextField: "Text",
                dataValueField: "Value",
                filter: "contains",
                index: 0,
                suggest: true
            });
        };

        var showWindow = function (url, title, useModal) {
            if (useModal == undefined) {
                window.open(url);

                return;
            }

            var wdiv = $("#windowContainer").kendoWindow({
                actions: ["Maximize", "Close"],
                resizable: true,
                iframe: true,
                modal: true,
                animation: false,
                type: "GET",
                width: "777px",
                height: "666px",
                title: title,
                content: url
            });

            wdiv.data("kendoWindow").center().open();
        };




        var dataBound = function (e) {
            //this.expandRow(this.tbody.find("tr.k-master-row").first()); // auto expand first row when is data loaded
            this.tbody.find("a.documentLink").on("click", function () {
                var $this = $(this);

                showWindow($this.attr("href"), $this.text());

                return false;
            });

            var grid = e.sender;
            var gridHasData = grid.dataSource.data().length > 0;

            if (gridHasData)
                return;

            $(grid.tbody.get(0)).append("<tr class='custom-no-data-row'><td></td><td span='100'>No data to display.</td></tr>");
        };


        var customEncode = function (url) {
            return encodeURIComponent(url).replace(/'/g, "%27");
        };

        window.closeKendoWindow = function () {
            $("#windowContainer").data("kendoWindow").close();
            reloadDocumentsGrid();
        };


        var createCabinetComboBox = function (cabinets) {
            $("#cabinets").kendoComboBox({
                change: comboOnChange,
                dataBound: comboOnChange,
                dataSource: cabinets,
                dataTextField: "Name",
                dataValueField: "Id",
                filter: "contains",
                index: 0,
                placeholder: "Select cabinet...",
                suggest: true
            });

            adjustComboBox($("#cabinets").data("kendoComboBox"));
        };

        var getFolder = function () {
            var $element = $("#folders");

            if ($element.length < 1)
                return null;

            var comboBox = $element.data("kendoComboBox");
            var value = comboBox.value();

            return value;
        };
        var getDocumentFilters = function () {
            var cabinetId = getCabinetId();
            var folder = getFolder();
            var searchByText = getSearchBytext();
            var radioSearch = getSearchRadio();

            var filter = {
                cabinetId: cabinetId,
                folder: folder,
                searchByText: searchByText,
                radioSearch: radioSearch
            };

            if (currentCabinet.UserDefinedFields == null)
                return filter;

            var userDefinedFields = currentCabinet.UserDefinedFields;
            var ids = new Array();
            var values = new Array();
            var types = new Array();

            for (var index = 0; index < userDefinedFields.length; index++) {
                var userDefinedField = userDefinedFields[index];
                var id = userDefinedField.Id;
                var comboBox = $("#" + id).data("kendoComboBox");
                var value = comboBox.value();
                var type = userDefinedField.Type;

                ids[index] = id;
                values[index] = value;
                types[index] = type;
            }

            filter.ids = ids; // JSON.stringify(values); didn't work
            filter.values = values; // JSON.stringify(values); didn't work
            filter.types = types; // JSON.stringify(values); didn't work

            return filter;
        };

        var createDocumentsGrid = function () {
            var transport = {
                prefix: "",
                read: {
                    url: "/Documents/GetDocuments",
                    data: getDocumentFilters
                }
            };
            var schema = {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    fields: {
                        Id: { type: "number" },
                        Name: { type: "string" },
                        Created: { type: "date" }
                    }
                }
            };
            var ds = new kendo.data.DataSource({
                transport: transport,
                pageSize: 20,
                page: 1,
                total: 0,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                serverGrouping: true,
                serverAggregates: true,
                type: "aspnetmvc-ajax",
                filter: [],
                schema: schema
            });
            var templateHtml = $('#template').html();
            var detailTemplate = kendo.template(templateHtml);
            var columns = [
                { title: "Name", template: "<a class='documentLink' href='/Documents/Download/#= Id #'>#= Name #</a>", field: "Name", filterable: {}, encoded: true },
                { title: "Created", field: "Created", format: "{0:d}", filterable: {}, encoded: true }
            ];
            var pageable = {
                autoBind: false,
                buttonCount: 100
            };

            $("#documentsGrid").kendoGrid({
                dataBound: dataBound,
                columns: columns,
                pageable: pageable,
                sortable: true,
                scrollable: false,
                autoBind: false,
                dataSource: ds,
                detailTemplate: detailTemplate
            });
        };

        var updateLargeFileUploadLink = function () {
            var link = $("#largeFileUploadLink");

            link.on("click", function () {
                var $this = $(this);
                var cabId = getCabinetId();
                var folder = getFolder();
                var url = $this.attr("href") + "?CabId=" + cabId + "&Folder=" + customEncode(folder);

                showWindow(url, $this.text(), true);

                return false;
            });
        };
        var setupSearch = function() {
            $("#searchButton20").click(function() {
                reloadDocumentsGrid();
                return false;
            });

            $("#searchBytext").off('keydown');
            $("#searchBytext").on('keydown', function (event) {
                if (event.which == 13) {
                    $("#searchButton20").trigger('click');
                }
            });

            $("#refreshButton").off('click');
            $("#refreshButton").on('click', function () {
                location.reload();
            });
        };
        var setupExport = function () {
            $("#exportButton").click(function () {
                window.location = "/Documents/Export";
            });
        };
        return {
            init: function () {
                setupSearch();
                setupExport();
                updateLargeFileUploadLink();
                createDocumentsGrid(); // created before the cabinets combo so it may be updated once the combo is loaded
                
                dataSource.getCabinets(function (results) {
                    createCabinetComboBox(results);
                });
            }
        };
    };
})(jQuery);