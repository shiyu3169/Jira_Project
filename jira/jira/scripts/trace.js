; (function ($, window, document, undefined) {
    jQuery.namespace('SEMS');
    
    window.SEMS.Trace = function (enabled) {
        if (!enabled) {
            return {
                info: function () {
                },
                error: function() {
                    
                },
                init: function () {

                },
                logHtml: function() {
                    
                }
            };
        }

        var $dom = {
            body: null,
            debugContentWindow: null
        };

        var addCommand = function (text, handler) {
            var html = "<a href='#'>" + text + "</a>";

            $dom.debugWindowComands.append($(html));

            var link = $dom.debugWindowComands.find('a:last');

            link.click(handler);

            return link;
        };

        var scrollToBottom = function () {
            var scrollHeight = $dom.debugContentWindow[0].scrollHeight;

            $dom.debugContentWindow.scrollTop(scrollHeight);
        };

        var init = function () {
            var html = "<div id='debugWindow' class='debugWindow'><div id='debugWindowComands'></div><div id='debugContentWindow'></div></div>";

            $dom.body = $("body:first");
            $dom.body.append($(html));
            $dom.debugWindow = $("#debugWindow");
            $dom.debugContentWindow = $dom.debugWindow.find("#debugContentWindow:first");
            $dom.debugWindowComands = $dom.debugWindow.find("#debugWindowComands:first");
            $dom.clearLink = addCommand("Clear", function () {
                $dom.debugContentWindow.empty();
                
                return false;
            });
            $dom.closeLink = addCommand("Close", function () {
                $dom.debugWindow.remove();
                
                return false;
            });
            $dom.debugWindow.draggable();
        };
        
        function htmlEncode(value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        }

        var info = function(message, highlight) {
            var style = highlight ? ' style="color:yellow; background-color:#000;"' : "";
            var html = "<div" + style + ">" + message + "</div>";

            $dom.debugContentWindow.append($(html));
            scrollToBottom();
        };

        var error = function (message) {
            var html = '<div style="color:red; background-color:#000;">' + message + '</div>';

            $dom.debugContentWindow.append($(html));
            scrollToBottom();
        };

        init();

        return {
            info: info,
            error: error,
            logHtml: function(html) {
                var text = htmlEncode(html);

                info(text);
            }
        };
    };
})(jQuery, window, document);