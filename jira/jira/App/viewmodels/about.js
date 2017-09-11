define(['durandal/system'], function (system) {
    var title = 'About';
    
    //#region Internal Methods
    function activate() {
        return true;
    }
    
    var vm = {
        activate: activate,
        title: title
    };
    
    return vm;
});