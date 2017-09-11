define(['durandal/system', 'plugins/router', 'services/logger'],
    function (system, router) {
        var shell = {
            activate: activate,
            router: router
        };

        function activate() {
            return boot();
        }

        function boot() {

            var routes = [
                { route: '', moduleId: 'activity', title: 'Activity', nav: 1},
                { route: 'about', moduleId: 'about', title: 'About', nav: 2 }];

            return router.makeRelative({ moduleId: 'viewmodels' }) // router will look here for viewmodels by convention
                .map(routes)            // Map the routes
                .buildNavigationModel() // Finds all nav routes and readies them
                .activate();            // Activate the router
        }
        
        return shell;
    });