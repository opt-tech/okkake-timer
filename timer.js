'use strict';

class Indicator {
  constructor(parent) {
    this.parent = parent;
    this.size = 50;
    this.element = this.createElement();
    this.move(10);
    setInterval(this.timerHandler.bind(this), 100);
    parent.appendChild(this.element);
  }
  createElement() {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.bottom = "0";
    div.style.width = this.size + "px";
    div.style.height = this.size + "px";
    div.style.transform = "translateX(-100%)";
    return div;
  }
  move(percentile) {
    if (percentile < 0) percentile = 0;
    if (100 < percentile) percentile = 100;
    this.element.style.left = percentile + "%";
  }
  timerHandler() {
    // abstract
  }
  removeElement() {//fixme: There must be more appropriate name.
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
  stop() {
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
  constructor(slide) {
    super(slide.children[0]);
    this.slide = slide;
  }
  createElement() {
    var div = super.createElement();
    div.style.backgroundImage = "url(" + chrome.extension.getURL("images/cat.png") + ")";
    div.style.opacity = "0.5";
    return div;
  }
  timerHandler() {
    var pageCount = this.slide.querySelector(".slide_controller_pageCount");
    var [current, total] = pageCount.textContent.split('/');
    this.move(current * 100.0 / total);
  }
}

var timeIndicator;
var progressIndicator;

function setupIndicators(allottedSecond) {
  if(timeIndicator) {
    timeIndicator.removeElement();
  }
  if(progressIndicator) {
    progressIndicator.removeElement();
  }

  var slides = document.querySelectorAll(".slide");
  slides.forEach(function(slide) {
    timeIndicator = new TimeIndicator(slide.children[0], 0, allottedSecond);
    progressIndicator = new QiitaProgressIndicator(slide);
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.allottedSecond) {
      setupIndicators(request.allottedSecond)
    }
    if (request.command) {
      switch(request.command) {
        case "stop":
          timeIndicator.stop();
          break;
        case "resume":
          timeIndicator.resume();
          break;
        default:
          break;
      }
    }
  });
