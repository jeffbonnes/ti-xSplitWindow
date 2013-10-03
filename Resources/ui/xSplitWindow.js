var tracer = require('/lib/tracer');
var log = tracer.createTracer('xsplitwin');
log.setLevel(tracer.levels.NONE);

var orientations = {};
orientations.LANDSCAPE = 'land';
orientations.PORTRAIT = 'port';

var MASTER_WINDOW_WIDTH = '320dp';
var ANIMATION_DURATION = 150;
var REDRAWING = false;
var ANIMATING = false;

exports.createSplitWindow = function(params) {

    log.debug('creating SplitWindow');

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
        if (REDRAWING) {
            log.warn('trying to slideIn when already redrawing, exiting');
            return;
        }
        if (ANIMATING) {
            log.warn('trying to slideIn when already animating, exiting');
            return;
        }
        masterWindow.left = '-' + MASTER_WINDOW_WIDTH;
        masterWindow.visible = true;
        if (me.myOrientation === orientations.LANDSCAPE) {
            detailWindow.animate({
                left : MASTER_WINDOW_WIDTH,
                duration : ANIMATION_DURATION
            });
        } else {
            clickCatcher.visible = true;
        }
        masterWindow.animate({
            left : 0,
            duration : ANIMATION_DURATION
        });
        setTimeout(function() {
            masterWindow.left = 0;
            if (me.myOrientation === orientations.LANDSCAPE) {
                me.masterShowingLandscape = true;
            } else {
                me.masterShowingPortrait = true;
                me.masterShowingLandscape = true;
            }
            navButton.showCorrectImage();
            ANIMATING = false;
        }, ANIMATION_DURATION);
    };

    masterWindow.slideOut = function() {
        if (REDRAWING) {
            log.warn('trying to slideOut when already redrawing, exiting');
            return;
        }
        if (ANIMATING) {
            log.warn('trying to slideOut when already animating, exiting');
            return;
        }
        if (me.myOrientation === orientations.LANDSCAPE) {
            detailWindow.animate({
                left : 0,
                duration : ANIMATION_DURATION
            });
        }
        masterWindow.animate({
            left : '-' + MASTER_WINDOW_WIDTH,
            duration : ANIMATION_DURATION
        });
        setTimeout(function() {
            masterWindow.left = '-' + MASTER_WINDOW_WIDTH;
            clickCatcher.visible = false;
            masterWindow.visible = false;
            if (me.myOrientation === orientations.LANDSCAPE) {
                me.masterShowingLandscape = false;
            }
            me.masterShowingPortrait = false;
            navButton.showCorrectImage();
            ANIMATING = false;
        }, ANIMATION_DURATION)
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
        if (REDRAWING) {
            log.warn('doRedraw is already redrawing, exiting');
            return;
        }
        REDRAWING = true;
        log.debug('redrawing');
        if (me.myOrientation === orientations.LANDSCAPE) {
            log.debug('landscape');
            if (me.masterShowingLandscape) {
                log.debug('showing master');
                masterWindow.left = 0;
                masterWindow.visible = true;
                detailWindow.left = MASTER_WINDOW_WIDTH;
            } else {
                log.debug('not showing master');
                masterWindow.visible = false;
                detailWindow.left = 0;
            }
            clickCatcher.visible = false;
        } else if (me.myOrientation === orientations.PORTRAIT) {
            log.debug('portrait');
            log.debug('me.masterShowingPortrait=' + me.masterShowingPortrait ? 'true' : 'false');
            masterWindow.visible = me.masterShowingPortrait;
            log.debug('masterWindow.visible=' + masterWindow.visible);
            masterWindow.left = 0;
            log.debug('masterWindow.left=' + masterWindow.left);
            clickCatcher.visible = me.masterShowingPortrait;
            detailWindow.left = 0;
        }
        log.debug('setting navButton');
        navButton.showCorrectImage();
        setTimeout(function() {
            REDRAWING = false
        }, 500);
    };

    function reDrawWithTimeout() {
        setTimeout(me.doRedraw, 100);
    }

    function checkForOrientationChange() {

        if (Ti.Gesture.isLandscape() && me.myOrientation != orientations.LANDSCAPE) {
            me.myOrientation = orientations.LANDSCAPE;
            reDrawWithTimeout();
        } else if (Ti.Gesture.isPortrait() && me.myOrientation != orientations.PORTRAIT) {
            me.myOrientation = orientations.PORTRAIT;
            reDrawWithTimeout();
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
        }
    };

    var navButton = Ti.UI.createImageView({
        height : 40,
        width : 40
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
                right : 0,
                width : 1
            });
            if (masterWindow.addFullScreen) {
                // shim for XUI
                masterWindow.addFullScreen(border)
            } else {
                masterWindow.add(border);
            }
            masterWindow.width = MASTER_WINDOW_WIDTH;
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

