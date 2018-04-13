class Indicator {
  constructor(parent) {
    this.size = 30;
    this.element = this.createElement();
    this.move(0);
    parent.appendChild(this.element);
  }
  createElement() {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.bottom = "0";
    div.style.width = this.size + "px";
    div.style.height = this.size + "px";
    div.style.backgroundColor = "black";
    div.style.transform = "translateX(-50%)";
    return div;
  }
  move(percentile) {
    if (percentile < 0) percentile = 0;
    if (100 < percentile) percentile = 100;
    this.element.style.left = percentile + "%";
  }
}

class TimeIndicator extends Indicator {
  constructor(parent, current, duration) {
    super(parent);
    this.start = new Date().getTime() / 1000;
    this.current = current;
    this.duration = duration;
    setInterval(this.timerHandler.bind(this), 100);
  }
  timerHandler() {
    var now = new Date().getTime() / 1000;
    this.current = now - this.start;
    this.move(this.current * 100.0 / this.duration);
  }
}

var plannedSeconds = 30;
var slides = document.querySelectorAll(".slide");
slides.forEach(function(slide) {
  new TimeIndicator(slide.children[0], 0, plannedSeconds);
});

