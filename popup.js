document.addEventListener("DOMContentLoaded", function () {
  let startButton = document.getElementById("startButton");
  let stopButton = document.getElementById("stopButton");
  let colorInput = document.getElementById("colorInput");
  let clearButton = document.getElementById("clearButton");

  // Function to send a message to start the measurement
  startButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "startMeasuring" });
    });
  });

  // Function to send a message to stop the measurement
  stopButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "stopMeasuring" });
    });
  });

  // Function to send a message to clear all outlines
  clearButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "clearOutlines" });
    });
  });

  chrome.storage.sync.get("selectedColor", function (data) {
    let storedColor = data.selectedColor || "#101010";
    colorInput.value = storedColor;
  });

  // Listen for changes in the color picker and send a message to content script
  colorInput.addEventListener("input", function () {
    let selectedColor = colorInput.value;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        action: "updateOutlineColor",
        color: selectedColor,
      });
      chrome.storage.sync.set({ selectedColor: selectedColor });
    });
  });
});
