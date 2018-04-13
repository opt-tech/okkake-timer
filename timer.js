var slides = document.querySelectorAll(".slide");
slides.forEach(function(slide) {
  var div = document.createElement("div");
  div.style.width = "50px";
  div.style.height = "50px";
  div.style.backgroundColor = "black";
  slide.children[0].appendChild(div);
});
