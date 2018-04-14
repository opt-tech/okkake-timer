'use strict';

class Indicator {
  constructor(parent) {
    this.parent = parent;
    this.size = 50;
    this.element = this.createElement();
    this.move(0);
    setInterval(this.timerHandler.bind(this), 100);
    parent.style.position = "relative";
    parent.appendChild(this.element);
  }
  createElement() {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = "0px";
    div.style.width = this.size + "px";
    div.style.height = this.size + "px";
    div.style.transform = "translateY(-100%)";
    return div;
  }
  move(percentile) {
    if (percentile < 0) percentile = 0;
    if (100 < percentile) percentile = 100;
    this.element.style.left = percentile + "%";
    this.element.style.transform = "translateX(-" + percentile + "%) translateY(-100%)";
  }
  timerHandler() {
    // abstract
  }
  removeElement() {
    this.parent.removeChild(this.element);
  }
}

class TimeIndicator extends Indicator {
  constructor(parent, current, duration) {
    super(parent);
    this.working = true;//fixme: dirty design
    this.accumulation = 0;//fixme: dirty design
    this.start = new Date().getTime() / 1000;
    this.current = current;
    this.duration = duration;
  }
  createElement() {
    var div = super.createElement();
    div.style.backgroundImage = "url(" + chrome.extension.getURL("images/mouse.png") + ")";
    div.style.opacity = "0.5";
    return div;
  }
  timerHandler() {
    var now = new Date().getTime() / 1000;
    if(this.working){
      this.current = this.accumulation + now - this.start;
      this.move(this.current * 100.0 / this.duration);
    }
  }
  pause() {
    var now = new Date().getTime() / 1000;
    if(this.working) {
      this.accumulation = this.accumulation + now - this.start;
    }
    this.working = false;
  }

  resume() {
    var now = new Date().getTime() / 1000;
    this.start = now;
    this.working = true;
  }
}

class QiitaProgressIndicator extends Indicator {
  createElement() {
    var div = super.createElement();
    div.style.backgroundImage = "url(" + chrome.extension.getURL("images/cat.png") + ")";
    div.style.opacity = "0.5";
    return div;
  }
  timerHandler() {
    var pageCount = this.parent.querySelector(".slide_controller_pageCount");
    var [current, total] = pageCount.textContent.split('/');
    this.move((current - 1) * 100.0 / (total - 1));
  }
}

class IndicationController {
  constructor () {
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
  }

  setupIndicators(allottedSecond) {
    var slides = document.querySelectorAll(".slide .slide_controller");
    this.resetIndicators();
    slides.forEach(function(slide) {
      this.timeIndicator = new TimeIndicator(slide, 0, allottedSecond);
      this.progressIndicator = new QiitaProgressIndicator(slide);
    }.bind(this));
  }

  resetIndicators() {
    if(this.timeIndicator) {
      this.timeIndicator.removeElement();
      this.timeIndicator = null;
    }
    if(this.progressIndicator) {
      this.progressIndicator.removeElement();
      this.progressIndicator = null;
    }
  }

  onMessage(request, sender, sendResponse) {
    switch(request.command) {
      case "start":
        this.allottedTime = request.allottedTime;
        this.setupIndicators(this.toSecond(request.allottedTime))
        break;
      case "pause":
        this.paused = true;
        this.timeIndicator.pause();
        break;
      case "resume":
        this.paused = false;
        this.timeIndicator.resume();
        break;
      case "reset":
        this.allottedTime = null;
        this.paused = false;
        this.resetIndicators();
        break;
      case "status":
        sendResponse({"allottedTime": this.allottedTime, "paused": this.paused});
        break;
      default:
        break;
    }
  }

  toSecond(allottedTime) {
    return allottedTime * 60;
  }
}

new IndicationController();
