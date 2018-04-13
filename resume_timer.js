'use strict';

function onResumeButtonClick(e) {
  sendResumeToContent();
}

function sendResumeToContent() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"command": "resume"});
  });
}
  
document.addEventListener('DOMContentLoaded', function () {
  var startButton = document.getElementById('resume-presentation');
  startButton.addEventListener('click', onResumeButtonClick);
});
