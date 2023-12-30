let isMeasuring = false;
let selectedColor = "#f91432"; // Default color
let outlineWidth = 2; // Default outline width
let outlineElements = [];
let sizeLabels = [];

function createOutline(startX, startY, width, height) {
  let outlineElement = document.createElement("div");
  outlineElement.style.position = "absolute";
  outlineElement.style.border = `${outlineWidth}px dashed ${selectedColor}`;
  outlineElement.style.pointerEvents = "none";
  outlineElement.style.zIndex = "9999"; // Set a high z-index to ensure it appears above other elements
  outlineElement.style.left = startX + "px";
  outlineElement.style.top = startY + "px";
  outlineElement.style.width = width + "px";
  outlineElement.style.height = height + "px";

  document.body.appendChild(outlineElement);
  outlineElements.push(outlineElement);

  let sizeLabel = createSizeLabel(outlineElement, width, height);
  sizeLabels.push(sizeLabel);
}

function createSizeLabel(outlineElement, width, height) {
  let sizeLabel = document.createElement("div");
  sizeLabel.style.position = "absolute";
  sizeLabel.style.color = selectedColor;
  sizeLabel.style.zIndex = "9999"; // Set a high z-index to ensure it appears above other elements
  sizeLabel.style.top = outlineElement.offsetTop - 20 + "px";
  sizeLabel.style.left =
    outlineElement.offsetLeft + outlineElement.offsetWidth + 5 + "px";
  sizeLabel.textContent = `${width}px X ${height}px`;

  document.body.appendChild(sizeLabel);

  return sizeLabel;
}

function stopMeasuring() {
  isMeasuring = false;
}

document.addEventListener("mousedown", function (event) {
  if (event.button !== 0 || !isMeasuring) return;

  let startX = event.pageX;
  let startY = event.pageY;

  let width = 0;
  let height = 0;

  createOutline(startX, startY, width, height);

  // Prevent text selection during the measurement
  document.addEventListener("selectstart", preventTextSelection);
  document.addEventListener("mousemove", drag);

  function drag(event) {
    width = event.pageX - startX;
    height = event.pageY - startY;

    outlineElements[outlineElements.length - 1].style.width = width + "px";
    outlineElements[outlineElements.length - 1].style.height = height + "px";

    sizeLabels[
      outlineElements.length - 1
    ].textContent = `${width}px X ${height}px`;
  }

  document.addEventListener(
    "mouseup",
    function () {
      isMeasuring = true; // Allow creating another outline
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("selectstart", preventTextSelection);
    },
    { once: true }
  );
});

// Function to prevent text selection during measurement
function preventTextSelection(event) {
  event.preventDefault();
}

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startMeasuring" && !isMeasuring) {
    isMeasuring = true;
    // Start measuring logic here, for example, attaching event listeners
    document.addEventListener("mousedown", startMeasurement);
  } else if (request.action === "stopMeasuring") {
    stopMeasuring();
  } else if (request.action === "updateOutlineSettings") {
    selectedColor = request.color || selectedColor;
    outlineWidth = request.size || outlineWidth;
    outlineElements.forEach((outline) => {
      outline.style.border = `${outlineWidth}px dashed ${selectedColor}`;
    });
  } else if (request.action === "clearOutlines") {
    clearAllOutlines();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let colorPicker = document.getElementById("colorInput");

  colorPicker.addEventListener("input", function () {
    selectedColor = colorPicker.value;
    outlineElements.forEach((outline) => {
      outline.style.border = `${outlineWidth}px dashed ${selectedColor}`;
    });
  });
});

function clearAllOutlines() {
  outlineElements.forEach((outline) => {
    outline.remove();
  });
  sizeLabels.forEach((label) => {
    label.remove();
  });
  outlineElements = [];
  sizeLabels = [];
}
