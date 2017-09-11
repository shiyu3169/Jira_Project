window.onerror = function (msg, url, line) {
    try {
        window.toastr.error("Error: " + msg + "\nurl: " + url + "\nline #: " + line);
    } catch (e) {
        // most likely the dom or toastr wasn't loaded yet, this script loads before all others
        console.log("Error: " + msg + "\nurl: " + url + "\nline #: " + line);
        alert("Sorry we encountered an error while processing your request. Please contact the Support team.");

    }

    var suppressErrorAlert = true;

    return suppressErrorAlert;
};