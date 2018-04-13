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
    div.style.backgroundColor = "black";
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
}

class TimeIndicator extends Indicator {
  constructor(parent, current, duration) {
    super(parent);
    this.start = new Date().getTime() / 1000;
    this.current = current;
    this.duration = duration;
  }
  createElement() {
    var div = super.createElement();
    div.style.backgroundColor = "blue";
    div.style.opacity = "0.5";
    return div;
  }
  timerHandler() {
    var now = new Date().getTime() / 1000;
    this.current = now - this.start;
    this.move(this.current * 100.0 / this.duration);
  }
}

class QiitaProgressIndicator extends Indicator {
  constructor(slide) {
    super(slide.children[0]);
    this.slide = slide;
  }
  createElement() {
    var div = super.createElement();
    div.style.backgroundColor = "red";
    div.style.opacity = "0.5";
    return div;
  }
  timerHandler() {
    var pageCount = this.slide.querySelector(".slide_controller_pageCount");
    var [current, total] = pageCount.textContent.split('/');
    this.move(current * 100.0 / total);
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.allottedSecond) {
      var slides = document.querySelectorAll(".slide");
      slides.forEach(function(slide) {
        new TimeIndicator(slide.children[0], 0, request.allottedSecond);
        new QiitaProgressIndicator(slide);
      });
    }
  });
