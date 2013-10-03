var orientations = {};
orientations.LANDSCAPE = 'land';
orientations.PORTRAIT = 'port';

var MASTER_WINDOW_WIDTH = '320dp';
var MASTER_NAVWINDOW_WIDTH = '321dp';
var ANIMATION_DURATION = 250;

exports.createSplitWindow = function(params) {

    var me = Ti.UI.createWindow({
        navBarHidden : true,
        backgroundColor : params.backgroundColor || 'black',
        fullScreen : false,
        exitOnClose : true
    });

    me.masterShowingPortrait = false;
    me.masterShowingLandscape = true;

    var masterWindow = params.masterView;

    masterWindow.slideIn = function() {
        masterWindow.left = '-' + MASTER_WINDOW_WIDTH;
        masterWindow.visible = true;
        masterWindow.animate({
            left : 0,
            duration : ANIMATION_DURATION
        }, function() {
            if (me.myOrientation === orientations.LANDSCAPE) {
                me.masterShowingLandscape = true;
            } else {
                me.masterShowingPortrait = true;
                me.masterShowingLandscape = true;
                clickCatcher.visible = true;
            }
            navButton.showCorrectImage();
        });
        if (me.myOrientation === orientations.LANDSCAPE) {
            detailWindow.animate({
                left : MASTER_WINDOW_WIDTH
            });
        }
    };

    masterWindow.slideOut = function() {
        masterWindow.animate({
            left : '-' + MASTER_WINDOW_WIDTH,
            duration : ANIMATION_DURATION
        }, function() {

            if (me.myOrientation === orientations.LANDSCAPE) {
                me.masterShowingLandscape = false;
            } else {
                me.masterShowingPortrait = false;
                clickCatcher.visible = false;
            }
            masterWindow.visible = false;
            navButton.showCorrectImage();
        });
        if (me.myOrientation === orientations.LANDSCAPE) {
            detailWindow.animate({
                left : 0
            });
        }
    };

    masterWindow.addEventListener('swipe', function(e) {
        if (e.direction == 'left') {
            masterWindow.slideOut();
        }
    });

    var detailWindow = params.detailView;

    var clickCatcher = Ti.UI.createView({
        visible : false
    });

    clickCatcher.addEventListener('click', function() {
        // hide the masterWindow
        masterWindow.slideOut();
        clickCatcher.visible = false;
    });

    me.myOrientation = "";

    me.doRedraw = function() {
        if (me.myOrientation === orientations.LANDSCAPE) {
            if (me.masterShowingLandscape) {
                masterWindow.left = 0;
                masterWindow.visible = true;
                detailWindow.left = MASTER_WINDOW_WIDTH;
            } else {
                masterWindow.visible = false;
                detailWindow.left = 0;
            }
            clickCatcher.visible = false;
        } else if (me.myOrientation === orientations.PORTRAIT) { Array
            masterWindow.visible = me.masterShowingPortrait;
            clickCatcher.visible = me.masterShowingPortrait;
            detailWindow.left = 0;
        }
        navButton.showCorrectImage();
    };

    function checkForOrientationChange() {
        if (Ti.Gesture.isLandscape() && me.myOrientation != orientations.LANDSCAPE) {
            me.myOrientation = orientations.LANDSCAPE;
            me.doRedraw();
        } else if (Ti.Gesture.isPortrait() && me.myOrientation != orientations.PORTRAIT) {
            me.myOrientation = orientations.PORTRAIT;
            me.doRedraw();
        }
    }

    function navButtonClick() {
        if (me.myOrientation === orientations.LANDSCAPE) {
            if (me.masterShowingLandscape) {
                masterWindow.slideOut();
            } else {
                masterWindow.slideIn();
            }
        } else if (me.myOrientation === orientations.PORTRAIT) {
            masterWindow.slideIn();
            // TODO Show the ClickCatcher on the detailWindow
        }
    };

    var navButton = Ti.UI.createButton({
        title : " "
    });

    navButton.addEventListener('click', navButtonClick);

    navButton.showCorrectImage = function() {
        if (me.myOrientation === orientations.LANDSCAPE) {
            if (me.masterShowingLandscape) {
                navButton.image = '/images/leftarrow.png'
            } else {
                navButton.image = '/images/rightarrow.png'
            }
        } else if (me.myOrientation === orientations.PORTRAIT) {
            navButton.image = '/images/nav.png'
        }
    };

    if (detailWindow.window) {
        detailWindow.window.leftNavButton = navButton;
    } else {
        detailWindow.leftNavButton = navButton;
    }

    me.addEventListener('open', function() {
        masterWindow.left = 0;
        masterWindow.width = 0;
        detailWindow.add(clickCatcher);
        navButton.showCorrectImage();
        masterWindow.addEventListener('open', function() {
            checkForOrientationChange();
            var border = Ti.UI.createView({
                backgroundColor : 'black',
                right : 1,
                width : 1
            });
            if (masterWindow.addFullScreen) {
                // shim for XUI
                masterWindow.addFullScreen(border);
            } else {
                masterWindow.add(border);
            }
            if (masterWindow.window) {
                masterWindow.width = MASTER_NAVWINDOW_WIDTH;
                masterWindow.window.width = MASTER_WINDOW_WIDTH;
                masterWindow.window.left = 0;
            } else {
                masterWindow.width = MASTER_WINDOW_WIDTH;
            }
        });
        detailWindow.open();
        masterWindow.open();
        Ti.App.addEventListener('xsplitview:orientationchange', checkForOrientationChange);
    });

    me.addEventListener('close', function() {
        Ti.App.removeEventListener('xsplitview:orientationchange', checkForOrientationChange);
    });

    return me;
};

exports.createWrappedSplitWindow = function(params) {

    // This automatically adds the NavigationWindow

    var masterNavWindow = require('/ui/xNavigationWindow').createNavigationWindow({
        window : params.masterView
    });

    params.masterView = masterNavWindow;

    var detailNavWindow = require('/ui/xNavigationWindow').createNavigationWindow({
        window : params.detailView
    });

    params.detailView = detailNavWindow;

    return exports.createSplitWindow(params);

}

Ti.Gesture.addEventListener('orientationchange', function(e) {
    Ti.App.fireEvent('xsplitview:orientationchange', {
        eventObject : e
    });
});

