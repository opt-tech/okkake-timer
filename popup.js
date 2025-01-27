'use strict';

class PopupController {
  constructor() {
    this.idleArea = document.getElementById("idle-area");
    this.allottedTimeInput = document.getElementById("allotted-time-input");
    this.startButton = document.getElementById("start-presentation");
    this.startButton.addEventListener("click", this.start.bind(this));
    this.runningArea = document.getElementById("running-area");
    this.allottedTimeText = document.getElementById("allotted-time-text");
    this.pauseResumeButton = document.getElementById("pause-resume-presentation");
    this.pauseResumeButton.addEventListener("click", this.pauseResume.bind(this));
    this.resetButton = document.getElementById("reset-presentation");
    this.resetButton.addEventListener("click", this.reset.bind(this));
    this.getStatus();
  }

  start() {
    this.allottedTime = this.allottedTimeInput.value;
    if(this.allottedTime) {
      this.sendMessage({"command": "start", "allottedTime": this.allottedTime});
      window.close();
    }
  }

  pauseResume() {
    this.sendMessage({"command": this.paused ? "resume" : "pause"});
    this.paused = !this.paused;
    this.refresh();
  }

  reset() {
    this.sendMessage({"command": "reset"});
    window.close();
  }

  refresh() {
    this.idleArea.style.display = this.allottedTime ? "none" : "";
    this.runningArea.style.display = this.allottedTime ? "" : "none";
    this.allottedTimeText.textContent = this.allottedTime;
    this.pauseResumeButton.value = this.paused ? "resume" : "pause";
  }

  getStatus() {
    this.sendMessage({"command": "status"}, function(response) {
      if (!response || !response.allottedTime)
        return;
      this.allottedTime = response.allottedTime;
      this.paused = response.paused;
      this.refresh();
    }.bind(this));
  }

  sendMessage(message, responseHandler) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, responseHandler);
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  new PopupController();
});
