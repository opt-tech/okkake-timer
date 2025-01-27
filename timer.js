"use strict";

class Indicator {
  constructor(slide) {
    this.slide = slide;
    this.wsize = 50;
    this.hsize = 80;
    this.element = this.createElement();
    this.move(0);
    setInterval(this.timerHandler.bind(this), 100);
  }
  createElement() {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.width = this.wsize + "px";
    div.style.height = this.hsize + "px";
    return div;
  }
  appendedTo(element) {
    return this.element.parentElement === element;
  }
  move(percentile) {
    if (percentile < 0) percentile = 0;
    if (100 < percentile) percentile = 100;
    this.element.style.left = percentile + "%";
    this.element.style.transform = "translateX(-" + percentile + "%)";
  }
  timerHandler() {
    // abstract
  }
}

class TimeIndicator extends Indicator {
  constructor(slide, current, duration) {
    super(slide);
    this.working = true; //fixme: dirty design
    this.accumulation = 0; //fixme: dirty design
    this.start = new Date().getTime() / 1000;
    this.current = current;
    this.duration = duration;
  }
  createElement() {
    var div = super.createElement();
    div.style.backgroundImage =
      "url(" + chrome.runtime.getURL("images/buri50x80.png") + ")";
    div.style.opacity = "0.6";
    return div;
  }
  timerHandler() {
    var now = new Date().getTime() / 1000;
    if (this.working) {
      this.current = this.accumulation + now - this.start;
      this.move((this.current * 100.0) / this.duration);
    }
  }
  pause() {
    var now = new Date().getTime() / 1000;
    if (this.working) {
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

class ProgressIndicator extends Indicator {
  createElement() {
    var div = super.createElement();
    div.style.backgroundImage =
      "url(" + chrome.runtime.getURL("images/mure50x80.png") + ")";
    div.style.opacity = "0.6";
    return div;
  }
  timerHandler() {
    var [current, total] = this.slide.currentProgress();
    this.move(((current - 1) * 100.0) / (total - 1));
  }
}

class Slide {
  constructor() {}
  start(allottedTime) {
    this.reset();
    this.allottedSecond = allottedTime * 60;
    this.timeIndicator = new TimeIndicator(this, 0, this.allottedSecond);
    this.progressIndicator = new ProgressIndicator(this);
    this.show();
  }
  show() {
    if (!this.slideElement) return;
    this.slideElement.style.position = "relative";
    if (this.timeIndicator && !this.timeIndicator.appendedTo(this.slideElement))
      this.append(this.timeIndicator);
    if (
      this.progressIndicator &&
      !this.progressIndicator.appendedTo(this.slideElement)
    )
      this.append(this.progressIndicator);
  }
  pause() {
    if (this.timeIndicator) this.timeIndicator.pause();
  }
  resume() {
    if (this.timeIndicator) this.timeIndicator.resume();
  }
  reset() {
    this.paused = false;
    this.allottedSecond = null;
    if (this.timeIndicator) {
      this.slideElement.removeChild(this.timeIndicator.element);
      this.timeIndicator = null;
    }
    if (this.progressIndicator) {
      this.slideElement.removeChild(this.progressIndicator.element);
      this.progressIndicator = null;
    }
  }
  status() {
    return { allottedTime: this.allottedSecond / 60, paused: this.paused };
  }
  currentProgress() {
    // abstract
  }
  append(indicator) {
    this.placeIndicator(indicator.element);
    this.slideElement.appendChild(indicator.element);
  }
  placeIndicator(element) {
    // abstract
  }
}

class QiitaSlide extends Slide {
  constructor() {
    super();
    const root = document.querySelector(".slideMode");
    if (!root) return;
    this.slideElement = root.querySelector(".slideMode-Dashboard");
    this.controlElement = root.querySelector(".slideMode-Dashboard_pageCount");
  }
  currentProgress() {
    var [current, total] = this.controlElement.textContent.split("/");
    return [current, total];
  }
  placeIndicator(element) {
    element.style.bottom = "100%";
  }
}

class GoogleSlide extends Slide {
  constructor() {
    super();
    setInterval(
      function () {
        var iframe = document.querySelector("iframe.punch-present-iframe");
        if (!iframe) return;
        this.slideElement = iframe.contentDocument.querySelector(
          ".punch-viewer-content"
        );
        this.controlElement = iframe.contentDocument.querySelector(
          ".punch-viewer-loadstatus ~ div [aria-posinset]"
        );
        this.show();
      }.bind(this),
      500
    );
    this.lastCurrent = 1;
    this.lastTotal = 1;
  }
  currentProgress() {
    if (this.controlElement) {
      var current = this.controlElement.getAttribute("aria-posinset");
      var total = this.controlElement.getAttribute("aria-setsize");
      this.lastCurrent = current;
      this.lastTotal = total;
      return [current, total];
    } else {
      return [this.lastCurrent, this.lastTotal];
    }
  }
  placeIndicator(element) {
    element.style.bottom = "0px";
  }
}

class IndicationController {
  constructor() {
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
    switch (window.location.hostname) {
      case "qiita.com":
        this.slide = new QiitaSlide();
        break;
      case "docs.google.com":
        this.slide = new GoogleSlide();
        break;
    }
  }

  onMessage(request, sender, sendResponse) {
    switch (request.command) {
      case "start":
        this.slide.start(request.allottedTime);
        break;
      case "pause":
        this.slide.pause();
        break;
      case "resume":
        this.slide.resume();
        break;
      case "reset":
        this.slide.reset();
        break;
      case "status":
        sendResponse(this.slide.status());
        break;
      default:
        break;
    }
    return true;
  }
}

new IndicationController();
