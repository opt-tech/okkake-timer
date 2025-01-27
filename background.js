chrome.runtime.onInstalled.addListener(function() {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, async function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: 'qiita.com' },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: 'docs.google.com', pathPrefix: '/presentation/' },
        })
      ],
      actions: [
        new chrome.declarativeContent.SetIcon({
          imageData: {
            16: await loadImageData('images/cat.png'),
          },
        }),
        new chrome.declarativeContent.ShowAction()
      ]
    }]);
  });
});

// Snnipet from: https://stackoverflow.com/questions/64473519/how-to-disable-gray-out-page-action-for-chrome-extension/64475504
async function loadImageData(url) {
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const {width: w, height: h} = img;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}