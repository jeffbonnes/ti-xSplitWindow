Ti.UI.setBackgroundColor('#000');

var masterWindow = require('/ui/xui').createWindow({
    title : 'master example',
    backgroundColor : '#AAA'
});

var detailWindow = require('/ui/xui').createWindow({
    title : 'detail window',
    backgroundColor : 'white'
});

var webView = Ti.UI.createWebView({
    url : 'sample.html'
});

detailWindow.add(webView);

var splitView = require('/ui/xSplitWindow').createWrappedSplitWindow({
    masterView : masterWindow,
    detailView : detailWindow
});

splitView.open();
