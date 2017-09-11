// Maps the files so Durandal knows where to find these.
require.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'services': 'services',
        'viewmodels': 'viewmodels',
        'knockout': '../Scripts/knockout-3.1.0',
        'bootstrap': '../Content/bootstrap',
        'jquery': '../Scripts/jquery-1.9.1',
        'scripts': '../Scripts'
    }
});

// Durandal 2.x assumes no global libraries. It will ship expecting 
// Knockout and jQuery to be defined with requirejs. .NET 
// templates by default will set them up as standard script
// libs and then register them with require as follows: 
define('jquery', function () { return jQuery; });
define('knockout', ko);


define(['durandal/app', 'durandal/viewLocator', 'durandal/system'], boot);

function boot (app, viewLocator, system) {

    // Enable debug message to show in the console 
    system.debug(true);

    app.title = 'Jira App';

    app.configurePlugins({
        router: true
    });
    
    app.start().then(function () {
        toastr.options.positionClass = 'toast-bottom-right';
        toastr.options.backgroundpositionClass = 'toast-bottom-right';

        // When finding a viewmodel module, replace the viewmodel string 
        // with view to find it partner view.
        // [viewmodel]s/sessions --> [view]s/sessions.html
        // Defaults to viewmodels/views/views. 
        // Otherwise you can pass paths for modules, views, partials
        viewLocator.useConvention();
        
        //Show the app by setting the root view model for our application.
        app.setRoot('viewmodels/shell', 'entrance');
    });
};