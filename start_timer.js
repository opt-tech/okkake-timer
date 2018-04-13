// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

function toSecond(allottedTime) {
  return allottedTime;//todo
}

function onStartButtonClick(e) {
  var allottedTime = document.getElementById('allotted-time').value;

  var allottedSecond = toSecond(allottedTime);
  if(allottedSecond) {
    sendAllotedTimeToContent(allottedSecond)
    window.close();
  }
}

function sendAllotedTimeToContent(allottedSecond) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"allottedSecond": allottedSecond});
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var startButton = document.getElementById('start-presentation');
  startButton.addEventListener('click', onStartButtonClick);
});

//todo: make connection and keep sending current time