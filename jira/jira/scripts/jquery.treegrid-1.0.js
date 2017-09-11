/*
 *  Project: EmSys
 *  Description: Client side component for creating a table with a tree column
 *  Author: Jeff Circeo
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
; (function ($, window, document, undefined) {
    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    var publicMethods = {
        init: init
    };

    var column = function () {
        var applyHeaderCellCss = function ($cell) {
            $cell.width(this.width);
        };
        
        var renderHeader = function (params) {
            var $row = params.$row;

            $row.append("<th>" + this.displayName + "</th>");

            var $cell = $row.find('th:last');

            this.applyHeaderCellCss($cell);
        };

        var renderValue = function (params) {
            var $row = params.$row;
            var data = params.data;

            if (!_.isString(this.dataBinding)) {
                $row.append("<td>Unsupported binding</td>");

                return;
            }

            var propertyName = this.dataBinding;

            $row.append("<td>" + data[propertyName] + "</td>");
        };

        return {
            renderHeader: renderHeader,
            renderValue: renderValue,
            applyHeaderCellCss: applyHeaderCellCss
        };
    };

    var treeColumn = function () {
        column.call(this); // base constructor
    };

    treeColumn.prototype = new column;
    
    treeColumn.prototype.renderHeader = function (params) {
        var $row = params.$row;

        if (this.showCheckbox) {
            if (this.showHeaderCheckbox) {
                $row.append("<th><input type='checkbox' /></th>");

                var $checkbox = $row.find("th:last input[type='checkbox']");

                $checkbox.change(function () {
                    
                });
            } else {
                $row.append("<th></th>");
            }
        }

        $row.append("<th>" + this.displayName + "</th>");

        var $cell = $row.find('th:last');

        this.applyHeaderCellCss($cell);
    };

    $.fn.treeGrid = function (method) {
        // Method calling logic
        if (publicMethods[method]) {
            return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return publicMethods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };

    $.fn.treeGrid.defaults = {
        onCheckChanged: function (args) { },
        onRootNodeCreated: function (args) { },
        onDataLoaded: function (args) { }
    };

    $.fn.treeGrid.columnDefaults = {
        displayName: '',
        width: '',
        showCheckbox: true,
        showHeaderCheckbox: true
    };

    function init(options) {
        var settings = $.extend({}, $.fn.treeGrid.defaults, options);

        initColumns(settings);

        return this.each(function () {
            var $this = $(this); // div
            var $table = initElement($this, settings);

            updateTable({
                $div: $this,
                $table: $table,
                settings: settings
            });
        });
    }

    function initColumns(settings) {
        var newColumns = [];
        var hasTreeColumn = false;
        
        for (var columnIndex = 0; columnIndex < settings.columns.length; columnIndex++) {
            var columnOptions = settings.columns[columnIndex];
            var newColumn;

            switch (columnOptions.type) {
                case 'tree':
                    newColumn = new treeColumn();
                    hasTreeColumn = true;
                    break;
                default:
                    newColumn = new column();
            }

            newColumn = $.extend(newColumn, $.fn.treeGrid.columnDefaults, columnOptions);
            newColumns.push(newColumn);
        }

        if (!hasTreeColumn)
            throw "No tree column found, at least on tree column is required";
        
        settings.columns = newColumns;
    }

    function treeNode() {
        var settings = arguments[0];
        var data = arguments[1];
        var nodeValue = arguments[2];
        var children = new Array();

        this.isExpanded = false;
        
        return {
            isExpanded: this.isExpanded,
            value: nodeValue,
            settings: settings,
            data: data,
            children: children,
            add: function (item) {
                item.parent = this;

                item.isExpanded = item.getDepth() < 2;
                
                return children.push(item);
            },
            findByValue: function (value) {
                if (this.value == value)
                    return this;

                for (var index = 0; index < children.length; index++) {
                    var childNode = children[index];

                    if (childNode.value == value)
                        return childNode;

                    childNode = childNode.findByValue(value);

                    if (childNode != null)
                        return childNode;
                }

                return null;
            },
            renderChildren: function (params) {
                var $tbody = params.$tbody;
                
                for (var nodeIndex = 0; nodeIndex < children.length; nodeIndex++) {
                    var node = children[nodeIndex];

                    node.render({
                        $tbody: $tbody,
                        nodeIndex: nodeIndex + (params.nodeIndex || 0)
                    });
                }
            },
            hasChildNodes: function() {
                return children.length > 0;
            },
            renderNode: function (params) {
                var $row = params.$row;
                var myColumn = params.column;
                var propertyName = myColumn.dataBinding.textField;
                var depth = this.getDepth();
                var html = '';

                for (var i = 1; i < depth; i++) {
                    html += '<td class="indent"></td>';
                }

                var cssClass = this.getTreeIconClass();
                
                html += '<td class="' + cssClass + '"></td>';
                $row.append(html);
                
                if (myColumn.showCheckbox) {
                    var checkPropertyName = myColumn.dataBinding.checkField;
                    this.isChecked = data[checkPropertyName];
                    var checked = this.isChecked ? "checked='checked'" : "";

                    $row.append("<td class='checkbox'><input type='checkbox' " + checked + "/></td>");

                    var $checkbox = $row.find("td:last input[type='checkbox']:first");

                    this.$checkbox = $checkbox;

                    $checkbox.change($.proxy(function () {
                        this.isChecked = $checkbox.is(':checked');
                        this.checkChildren(this.isChecked);
                        settings.onCheckChanged({
                            node: this,
                            settings: settings,
                            data: data,
                            value: nodeValue,
                            isChecked: this.isChecked
                        });
                    }, this));
                }

                $row.append("<td class='nodeText'>" + data[propertyName] + "</td>");
                
                this.$td = $row.find("td:last");
                this.$row = $row;
                this.updateColspan(params);
                
                $row.find('td.icon').click($.proxy(this.toggleExpanded, this));
            },
            checkChildren: function(isChecked) {
                for (var childNodeIndex = 0; childNodeIndex < children.length; childNodeIndex++) {
                    var child = children[childNodeIndex];

                    child.setCheck(isChecked);
                    child.checkChildren(isChecked);
                }
            },
            setCheck: function(isChecked) {
                this.isChecked = isChecked;
                this.$checkbox.attr("checked", isChecked);
            },
            toggleExpanded: function () {
                this.isExpanded = !this.isExpanded;
                this.toggleChildIsExpanded(this.isExpanded);
                
                var $iconCell = this.$row.find('td.icon');
                
                if (this.isExpanded) {
                    $iconCell.addClass("expandedParent");
                    $iconCell.removeClass("collapsedParent");
                } else {
                    $iconCell.addClass("collapsedParent");
                    $iconCell.removeClass("expandedParent");
                }
            },
            toggleChildIsExpanded: function (isExpanded) {
                for (var childNodeIndex = 0; childNodeIndex < children.length; childNodeIndex++) {
                    var child = children[childNodeIndex];
                    
                    if (isExpanded) {
                        child.$row.show();
                    } else {
                        child.$row.hide();
                    }

                    if (child.isExpanded)
                        child.toggleChildIsExpanded(isExpanded);
                }
            },
            getTreeIconClass: function() {
                if (this.hasChildNodes()) {
                    if (this.isExpanded)
                        return "icon expandedParent";
                    else
                        return "icon collapsedParent";
                }

                return "indent";
            },
            updateColspan: function (params) {
                // get the max depth
                // get my depth
                // colspan = max depth - my depth

                var root = this.getRoot();
                var checkedCells = column.showCheckbox ? 1 : 0;
                var iconCells = 1;
                var maxDepth = root.getMaxDepth() + checkedCells + iconCells;

                this.updateChildColspan(root, maxDepth);
                this.updateHeaderColspan(root, maxDepth, params);
            },
            updateHeaderColspan: function (node, maxDepth, params) {
                var $table = node.$table;
                var myColumn = params.column;
                var columnIndex = params.columnIndex;
                var checkedCells = myColumn.showCheckbox ? 1 : 0;
                var iconCells = 1;
                var cells = iconCells + checkedCells;
                var $th = myColumn.showCheckbox ? $table.find("thead tr th").eq(columnIndex + cells - 1) : $table.find("thead tr th").eq(columnIndex);
                
                $th.attr("colspan", maxDepth);
            },
            updateChildColspan: function (node, maxDepth) {
                for (var nodeIndex = 0; nodeIndex < node.children.length; nodeIndex++) {
                    var childNode = node.children[nodeIndex];
                    var colspan = maxDepth - 1;

                    childNode.setColspan(colspan);
                    childNode.updateChildColspan(childNode, colspan);
                }
            },
            setColspan: function (value) {
                var $td = this.$td;

                if ($td == undefined)
                    return; //throw "td not found on node";

                $td.attr("colspan", value);
            },
            getDepth: function () {
                var depth = 0;
                var parent = this.parent;

                while (parent != null) {
                    depth += 1;
                    parent = parent.parent;
                }

                return depth;
            },
            getMaxDepth: function () {
                // here we need to find the depest expanded child node and return the depth
                var depth = this.getDepth();

                if (!this.isExpanded)
                    return depth;
                
                for (var i = 0; i < children.length; i++) {
                    var childNode = children[i];
                    var childDepth = childNode.getMaxDepth();

                    if (childDepth > depth)
                        depth = childDepth;
                }

                return depth;
            },
            getRoot: function () {
                var currentNode = this;

                while (true) {
                    if (currentNode.parent == undefined)
                        return currentNode;

                    currentNode = currentNode.parent;
                }
            },
            getSelectedNodes: function () {
                var selectedNodes = [];
                
                for (var childNodeIndex = 0; childNodeIndex < children.length; childNodeIndex++) {
                    var child = children[childNodeIndex];

                    if (child.isChecked)
                        selectedNodes.push(child);
                    
                    var childSelectedNodes = child.getSelectedNodes();

                    if (childSelectedNodes.length > 0) {
                        for (var i = 0; i < childSelectedNodes.length; i++) {
                            selectedNodes.push(childSelectedNodes[i]);
                        }
                    }
                }

                return selectedNodes;
            },
            getAllNodes: function () {
                var allNodes = [];

                for (var childNodeIndex = 0; childNodeIndex < children.length; childNodeIndex++) {
                    var child = children[childNodeIndex];

                    allNodes.push(child);

                    var nodes = child.getAllNodes();

                    if (nodes.length > 0) {
                        for (var i = 0; i < nodes.length; i++) {
                            allNodes.push(nodes[i]);
                        }
                    }
                }

                return allNodes;
            },
            render: function (params) {
                var $tbody = params.$tbody;
                var nodeIndex = params.nodeIndex;
                var className = nodeIndex % 2 == 0 ? "alt" : "even";

                $tbody.append('<tr class="' + className + '"></tr>');

                var $row = $tbody.find('tr:last');

                for (var columnIndex = 0; columnIndex < settings.columns.length; columnIndex++) {
                    var myColumn = settings.columns[columnIndex];
                    var args = {
                        $row: $row,
                        $tbody: $tbody,
                        data: data,
                        node: this,
                        column: myColumn,
                        columnIndex: columnIndex
                    };

                    if (myColumn.type == 'tree') {
                        this.renderNode(args);

                        continue;
                    }

                    myColumn.renderValue(args);
                }
            }
        };
    }

    function updateTable(params) {
        var $table = params.$table;
        var settings = params.settings;
        
        settings.dataSource.getData(function (results) {
            var stopWatch = new window.SEMS.StopWatch({ autoStart: true });
            var $tbody = $table.find('tbody:first');
            var rootNode = getRootNode(params);

            populateNode(rootNode, settings, results);

            stopWatch.stop();

            settings.onDataLoaded({ elapsed: stopWatch.elapsed() });

            var nodes = rootNode.getAllNodes();

            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];

                //if (node.isExpanded)
                    node.render({
                        $tbody: $tbody,
                        nodeIndex: i
                    });
            }
        });
    }

    function getRootNode(params) {
        var $div = params.$div;
        var $table = params.$table;
        var settings = params.settings;
        var element = $div[0];
        var rootNode = jQuery.data(element, "rootNode");

        if (rootNode == null) {
            rootNode = new treeNode();
            rootNode.$table = $table;
            
            jQuery.data(element, "rootNode", rootNode);

            settings.onRootNodeCreated({
                node: rootNode
            });
        }

        return rootNode;
    }

    function populateNode(node, settings, results) {
        var myColumn = getTreeColumn(settings.columns);
        var parentFieldName = myColumn.dataBinding.parentField;
        var valueFieldName = myColumn.dataBinding.valueField;
        
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var parentValue = result[parentFieldName];
            var value = result[valueFieldName];
            var childNode = new treeNode(settings, result, value);

            if (parentValue == null) {
                node.add(childNode);

                continue;
            }

            var parentNode = node.findByValue(parentValue);

            parentNode.add(childNode);
        }
    }
    
    function getTreeColumn(columns) {
        for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            var myColumn = columns[columnIndex];

            if (myColumn.type != 'tree')
                continue;

            return myColumn;
        }

        throw "TreeColumn not found";
    }

    function initElement($div, settings) {
        var $table = $div.append('<table><thead><tr></tr></thead><tbody></tbody></table>');
        var $thead = $div.find('thead:first');
        var $row = $thead.find('tr:first');

        for (var columnIndex = 0; columnIndex < settings.columns.length; columnIndex++) {
            var myColumn = settings.columns[columnIndex];

            myColumn.renderHeader({
                $row: $row,
                columnIndex: columnIndex
            });
        }

        return $table;
    }
})(jQuery, window, document);