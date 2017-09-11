function openDialog(options) {
    var kWindow = $("#window:first").kendoWindow({
        iframe: true,
        modal: true,
        width: "1000px",
        height: "500px",
        title: options.title,
        content: options.url,
        type: "GET",
        visible: false //don't show it yet, we're going to center it
    });
    
    kWindow.data("kendoWindow").center().open();
}

function closeDialog() {
    var kWindow = $("#window:first").data("kendoWindow");
    
    kWindow.close();
}