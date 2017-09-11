; (function ($, window, document, undefined) {
    $.namespace('SEMS');
    
    window.SEMS.GlobalView = function (options) {
        $(document).ready(function() {
            window.SEMS.ObsoleteBrowserWarning();

            var editProfileUrl = '/account';
            var currentLocation = window.location.href.toLowerCase();
            
            if (currentLocation.indexOf(editProfileUrl) > -1) {
                return;
            }

            if (!$.cookie('showOnlyOneDoesUserProfileExist')) {
                //either cookie already expired, or user never visit the site
                $.ajax({
                    dataType: "json",
                    url: options.doesUserProfileExistUrl,
                    contentType: "application/json; charset=utf-8"
                }).done(function(result) {
                    if (!result.profile) {
                        $('#popupbox').kendoWindow({
                            title: "User Profile",
                            width: "auto",
                            visible: false
                        });

                        var html = '<div id="popupmessage" style="text-align: center">' +
                            '<p>There is currently no user profile associated with this account.<br/> Would you like to create one?</p></div>' +
                            '<div id="popupbuttons" style="text-align: center"><span id="yesbutton" class="k-button">Create Now</span><span id="nobutton" class="k-button">No, Thanks</span></div>';
                        $('#popupbox').data('kendoWindow').content(html);
                        $('#popupbox').data('kendoWindow').center().open();

                        $('#yesbutton').click(function() {
                            window.location = options.editUserProfileUrl;
                        });

                        $('#nobutton').click(function() {
                            $('#popupbox').data('kendoWindow').close();
                        });
                    } else {
                        //create the cookie
                        $.cookie('showOnlyOneDoesUserProfileExist', 'showOnlyOneDoesUserProfileExist', { expires: 1 });
                    }
                });
            }
        });
    };
})(jQuery, window, document);