'use strict';

function onStopButtonClick(e) {
  sendStopToContent();
}

function sendStopToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"command": "stop"});
  });
}
  
document.addEventListener('DOMContentLoaded', function () {
  var startButton = document.getElementById('stop-presentation');
  startButton.addEventListener('click', onStopButtonClick);
});
