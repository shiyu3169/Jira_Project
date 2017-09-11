;

(function($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.Cookie = function() {

        var obsoleteBrowserCookie = function(dontShow) {
            var dontShowOptions = {
                path: '/',
                expires: 365
            };
            var showOptions = {
                path: '/'
            };
            var name = 'SEMSObsoleteBrowserCookie';
            var value = 'Aknowledged';

            var create = function () {
                if ($.cookie(name) == null)
                    $.cookie(name, value, dontShow ? dontShowOptions : showOptions);
            };

            var remove = function() {
                return $.removeCookie(name, options);
            };

            var read = function() {
                return $.cookie(name);
            };

            return {
                create: create,
                remove: remove,
                read: read
            };

        };

        var getCookie = function(cookie) {

            return $.cookie(cookie);
        };

        return {
            obsoleteBrowserCookie: obsoleteBrowserCookie,
            getCookie: getCookie
        };
    };

}(jQuery, window, document))