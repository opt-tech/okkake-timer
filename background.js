chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostContains: 'qiita.com' },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: '//docs.google.com/presentation/' },
        })
      ],
      actions: [ new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
});
