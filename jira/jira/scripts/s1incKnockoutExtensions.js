;
(function ($, window, document, undefined) {

    define(['kendo', 'knockout'], function (kendo, ko) {
        
        ko.bindingHandlers.s1Upload = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                var fileElement = $(element);
                var value = valueAccessor();
                var onUpload = function(args) {
                    var json = value.toJS();

                    args.data = json;
                };

                var uploadComponent = fileElement.kendoUpload({
                    async: {
                        saveUrl: "/Api/PAWorkOrders",
                        removeUrl: "Not Implemented",
                        autoUpload: false
                    },
                    upload: onUpload
                }).data("kendoUpload");
                uploadComponent._showUploadButton = function () {
                    // we don't want to show the upload button
                };
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    uploadComponent.unbind("upload", onUpload);
                });
            }
        };

        ko.bindingHandlers.dateString = {
            init: function (element, valueAccessor) {
            },
            update: function (element, valueAccessor) {
                var value = valueAccessor();
                var valueUnwrapped = ko.utils.unwrapObservable(value.date);
                var isDate = Object.prototype.toString.call(valueUnwrapped) === "[object Date]";
                var valueAsDate = isDate ? valueUnwrapped : new Date(valueUnwrapped);
                var pattern = value.datePattern || 'MM/dd/yyyy';
                var text = kendo.toString(valueAsDate, pattern);
                $(element).text(text);
            }
        };
        
        ko.extenders.numeric = function (target, precision) {
            //create a writeable computed observable to intercept writes to our observable
            var result = ko.computed({
                read: target,  //always return the original observables value
                write: function (newValue) {
                    var current = target(),
                        roundingMultiplier = Math.pow(10, precision),
                        newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                        valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

                    //only write if it changed
                    if (valueToWrite !== current) {
                        target(valueToWrite);
                    } else {
                        //if the rounded value is the same, but a different value was written, force a notification for the current field
                        if (newValue !== current) {
                            target.notifySubscribers(valueToWrite);
                        }
                    }
                }
            }).extend({ notify: 'always' });

            //initialize with current value to make sure it is rounded appropriately
            result(target());

            //return the new computed observable
            return result;
        };

        var formatNumber = function (element, valueAccessor, allBindingsAccessor, format) {
            // Provide a custom text value
            var value = valueAccessor(), allBindings = allBindingsAccessor();
            var numeralFormat = allBindingsAccessor.numeralFormat || format;
            var strNumber = ko.utils.unwrapObservable(value);

            if (strNumber)
                return numeral(strNumber).format(numeralFormat);

            return '';
        };

        ko.bindingHandlers.numeralText = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                $(element).text(formatNumber(element, valueAccessor, allBindingsAccessor, "(0,0.00)"));
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                $(element).text(formatNumber(element, valueAccessor, allBindingsAccessor, "(0,0.00)"));
            }
        };

        ko.bindingHandlers.numeralValue = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                $(element).val(formatNumber(element, valueAccessor, allBindingsAccessor, "(0,0.00)"));

                //handle the field changing
                ko.utils.registerEventHandler(element, "change", function () {
                    var observable = valueAccessor();
                    observable($(element).val());
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                $(element).val(formatNumber(element, valueAccessor, allBindingsAccessor, "(0,0.00)"));
            }
        };

        ko.bindingHandlers.percentText = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                $(element).text(formatNumber(element, valueAccessor, allBindingsAccessor, "(0.000 %)"));
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                $(element).text(formatNumber(element, valueAccessor, allBindingsAccessor, "(0.000 %)"));
            }
        };

        ko.bindingHandlers.percentvalue = {
            init: function (element, valueAccessor, allBindingsAccessor) {
                $(element).val(formatNumber(element, valueAccessor, allBindingsAccessor, "(0.000 %)"));

                //handle the field changing
                ko.utils.registerEventHandler(element, "change", function () {
                    var observable = valueAccessor();
                    observable($(element).val());
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor) {
                $(element).val(formatNumber(element, valueAccessor, allBindingsAccessor, "(0.000 %)"));
            }
        };

        ko.bindingHandlers.kendoComboBoxWidth = {
            update: function (element, valueAccessor) {
                var dropdownlist = $(element).data("kendoComboBox");
                dropdownlist.list.width(valueAccessor());
            }
        };

        ko.bindingHandlers.kendoChartResize = {
            //This binding is purely to handle resizing so there will be no update, and no valueAccessor 
            init: function(element) {
                var resize = function() {
                    $(element).data('kendoChart').resize(true);
                };
                $(window).on('resize', resize);
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $(window).off('resize', resize);
                });
            }
        };

        ko.bindingHandlers.kendoShowLoadmask = {
          update: function(element, valueAccessor, allBindingsAccessor) {
              var show = valueAccessor();
              kendo.ui.progress($(element), show());
          }
        };


    });

})(jQuery, window, document);