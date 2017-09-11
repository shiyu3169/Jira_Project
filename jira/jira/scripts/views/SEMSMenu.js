;
//todo: edit SideMenuLink to exclude spa



$(document).ready(function () {
    //if (typeof String.prototype.startsWith != 'function') {
    //    String.prototype.startsWith = function (it) {
    //        return this.indexOf(it) != -1;
    //    };
    //}

    var currentGroup = null;
    var clearGroup = null;
    var highlightMenu = function (url) {
        // get the url
        // if the url contains spa we need to expand the container group and high light the link
        // note: durandal is case sensitive
        var urlDictionary = [
            { urlPart: 'spa#accountGroups', regex: new RegExp('#accountGroups', 'i'), group: 'UtilitySetup', controller: 'UtilitySetup' },
            { urlPart: 'spa#workOrder', regex: new RegExp('#workOrder', 'i'), group: 'WorkOrders', controller: 'WorkOrders' },
            { urlPart: 'spa#meters', regex: new RegExp('#meters', "i"), group: 'Metering', controller: 'Metering' },
            { urlPart: 'spa#paworkOrdersform', regex: new RegExp('#paworkOrdersform', 'i'), group: 'PAWorkOrders', controller: 'PAWorkOrders' },
            { urlPart: 'spa#cabinets', regex: new RegExp('#cabinets', 'i'), group: 'Admin', controller: 'Admin' }
        ];

        var currentUrl = url.toString().toLowerCase();

        clearGroup = currentGroup;

        for (var i = 0; i < urlDictionary.length; i++) {
            var entry = urlDictionary[i];

            if (!entry.regex.test(currentUrl)) {
                continue;
            }

            // we have a match, highlight the link and parent group and end
            var group = $("[data-controller='" + entry.controller + "']");
            //nav dropdown active opened
            currentGroup = {
                group: group,
                entry: entry,
                index: i
            };
            var subLinks = group.find(".subNav");
            //when in durandal we need to unselect the previous link
            var currentLink = subLinks.find("li > a").filter(function (index) {
                var href = $(this).attr('href').toLowerCase().replace('/', '');
                return entry.regex.test(href);
            });
            if (clearGroup && clearGroup.index != i) {
                clearGroup.group.removeClass("active opened").find(".subNav").find("li.selected").removeClass("selected");
                clearGroup.group.find('.subNav').slideUp();
            }
            
            currentLink.parent().addClass('selected');
            //currentLink.child().controller("WorkOrders2");

                //group.find("") addClass("nav dropdown active opened");
                //entry.controller("WorkOrders2").addClass('selected');

            group.addClass("nav dropdown active opened");
            subLinks.slideDown();
           

            return;


        }
    };

    if ("onhashchange" in window) {
        window.onhashchange = function () {
            highlightMenu(window.location);
        };
    } else {
        var location = window.location;
        window.setInterval(function () {
            if (window.location != location) {
                location = window.location;
                highlightMenu(location);
            }
        }, 100);
    }
    highlightMenu(window.location);
});