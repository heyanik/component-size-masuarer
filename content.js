let isMeasuring = false;
let selectedColor = "#f91432"; // Default color
let outlineWidth = 2; // Default outline width
let outlineElement = null;
let sizeLabel = null;

function createOutline(startX, startY, width, height) {
  if (outlineElement) {
    outlineElement.remove(); // Remove the previous outline element
    if (sizeLabel) sizeLabel.remove(); // Remove the size label if exists
  }

  outlineElement = document.createElement("div");
  outlineElement.id = "extensionOutline"; // Set a unique ID for the outline
  outlineElement.style.position = "absolute";
  outlineElement.style.border = `${outlineWidth}px dashed ${selectedColor}`;
  outlineElement.style.pointerEvents = "none";
  outlineElement.style.zIndex = "9999"; // Set a high z-index to ensure it appears above other elements
  outlineElement.style.left = startX + "px";
  outlineElement.style.top = startY + "px";
  outlineElement.style.width = width + "px";
  outlineElement.style.height = height + "px";

  document.body.appendChild(outlineElement);

  if (sizeLabel) {
    createSizeLabel(outlineElement.offsetWidth, outlineElement.offsetHeight);
  }
}

// Function to prevent text selection during measurement
function preventTextSelection(event) {
  event.preventDefault();
}

function createSizeLabel(width, height) {
  sizeLabel = document.createElement("div");
  sizeLabel.style.position = "absolute";
  sizeLabel.style.color = selectedColor;
  sizeLabel.style.zIndex = "9999"; // Set a high z-index to ensure it appears above other elements
  sizeLabel.style.top = outlineElement.offsetTop - 20 + "px";
  sizeLabel.style.left =
    outlineElement.offsetLeft + outlineElement.offsetWidth + 5 + "px";
  sizeLabel.textContent = `${width}px X ${height}px`;

  document.body.appendChild(sizeLabel);
}

function stopMeasuring() {
  isMeasuring = false;
  if (outlineElement) {
    outlineElement.remove();
    outlineElement = null;
  }
  if (sizeLabel) {
    sizeLabel.remove();
    sizeLabel = null;
  }
}

document.addEventListener("mousedown", function (event) {
  if (event.button !== 0 || !isMeasuring) return;

  let startX = event.pageX;
  let startY = event.pageY;

  // Prevent text selection during the measurement
  document.addEventListener("selectstart", preventTextSelection);
  document.addEventListener("mousemove", drag);

  function drag(event) {
    if (!isMeasuring) return;

    let width = event.pageX - startX;
    let height = event.pageY - startY;

    createOutline(startX, startY, width, height);
  }

  document.addEventListener(
    "mouseup",
    function () {
      isMeasuring = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("selectstart", preventTextSelection);
      if (outlineElement) {
        createSizeLabel(
          outlineElement.offsetWidth,
          outlineElement.offsetHeight
        );
      }
    },
    { once: true }
  );
});

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
    if (outlineElement) {
      outlineElement.style.border = `${outlineWidth}px dashed ${selectedColor}`;
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let colorPicker = document.getElementById("colorInput");

  colorPicker.addEventListener("input", function () {
    selectedColor = colorPicker.value;
    if (outlineElement) {
      outlineElement.style.border = `${outlineWidth}px dashed ${selectedColor}`;
    }
  });
});
