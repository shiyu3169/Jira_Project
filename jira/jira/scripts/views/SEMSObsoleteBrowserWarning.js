;

(function ($, window, document, undefined) {

    $.namespace('SEMS');

    window.SEMS.ObsoleteBrowserWarning = function() {

        var browserVersion = { msie: 9.0, chrome: 29.0, safari: 5.0, opera: 16.0, firefox: 23.0 };
        
        var browser = $.browser;

        var cookie = new window.SEMS.Cookie();
        

        //Mucho uggo
        var showPopup = function () {
            var body = '<p>You are currently using an outdated browser.<br/>This may have an adverse effect on your user experience. </p>';
            var checkbox = '<br/><span class="popupCheckbox"><input id="NoShow" type="checkbox"></input><label for="NoShow" >Do not show this message again.</label></span>';
            var buttons = '<div id="buttons" class="popupButtons"><span class="k-button center">Close</span></div>';
            var options = {
                modal: true,
                resizable: false,
                width: "auto",
                minHeight: "75px",
                minWidth: "300px",
                title: "Warning!",
                close: function(e) {
                    var checked = $(' #windowContainer  input:checked');
                    if (checked.length) {

                        cookie.obsoleteBrowserCookie(true).create();
                        return;

                    }
                    cookie.obsoleteBrowserCookie(false).create();

                }
            };
            

            var bindPopupEventHandlers = function() {
                var x = $('#buttons > .k-button:first');
                $('#buttons > .k-button:first').on('click', function() {

                    $('#windowContainer').data('kendoWindow').close();

                });
            };
            
            var $body = $('#windowContainer');
            $body.empty();
            $body.kendoWindow(options);
            var $data = $body.data('kendoWindow');



            $data.content(body + checkbox + buttons);
            bindPopupEventHandlers();
            $data.open();
            $data.center();


        };
        if (cookie.getCookie('SEMSObsoleteBrowserCookie') == null) {

            browser.version = parseFloat(browser.version);

            if (browser.opr && browser.version < browserVersion['opera']) {
                showPopup();
                return;
            }
            if (browser.safari && browser.version < browserVersion['safari']) {
                showPopup();
                return;
            }
            if (browser.msie && browser.version < browserVersion['msie']) {
                showPopup();
                return;
            }
            if (browser.firefox && browser.version < browserVersion['firefox']) {
                showPopup();
                return;
            }
            if (browser.chrome && browser.version < browserVersion['chrome']) {
                showPopup();
                return;
            }

            
        }
    };    


}(jQuery, window, document))