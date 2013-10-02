exports.createNavigationWindow = function(params) {

    if (Ti.Platform.osname == "android") {
        return params.window;
    } else {
        return Ti.UI.iOS.createNavigationWindow(params);
    }
}
