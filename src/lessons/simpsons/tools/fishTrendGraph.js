const fish = [
  { color: "red", length: 1.2, height: 3.3 },
  { color: "red", length: 2.0, height: 4.5 },
  { color: "red", length: 2.8, height: 5.4 },
  { color: "blue", length: 3.7, height: 1.3 },
  { color: "blue", length: 4.6, height: 2.1 },
  { color: "blue", length: 5.2, height: 2.8 }
];

const plotStart = 72;
const plotEnd = 552;
const plotSpan = plotEnd - plotStart;

const challengeSettings = {
  red: {
    items: fish.filter((item) => item.color === "red"),
    anchor: "axes",
    lineClass: "red-trend-line",
    mutedColor: "blue",
    initialAnchor: { x: 0, y: 0 },
    initialFree: { x: 5, y: 5 },
    tolerance: 0.8,
    slopeDirection: 1,
    success: "Nice fit. The red trend is positive: longer red fish tend to be taller."
  },
  blue: {
    items: fish.filter((item) => item.color === "blue"),
    anchor: "axes",
    lineClass: "blue-trend-line",
    mutedColor: "red",
    initialAnchor: { x: 0, y: 0 },
    initialFree: { x: 5, y: 5 },
    tolerance: 0.7,
    slopeDirection: 1,
    success: "Nice fit. The blue trend is positive too: longer blue fish tend to be taller."
  },
  combined: {
    items: fish,
    anchor: "axes",
    lineClass: "combined-trend-line",
    mutedColor: null,
    initialAnchor: { x: 0, y: 0 },
    initialFree: { x: 5, y: 5 },
    tolerance: 1.45,
    slopeDirection: -1,
    success: "The gray line falls. Red fish occupy the shorter, taller region, while blue fish occupy the longer, shorter region. That between-group arrangement overwhelms the rise within each color."
  }
};

export function createFishTrendGraph({ onComplete, mode = "red" } = {}) {
  const settings = challengeSettings[mode] ?? challengeSettings.red;
  const isCombined = mode === "combined";
  const tool = document.createElement("div");
  tool.className = `fish-trend-tool trend-mode-${mode}`;

  const graph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  graph.classList.add("fish-trend-graph");
  graph.setAttribute("viewBox", "0 0 620 620");
  graph.setAttribute("role", "img");
  graph.setAttribute("aria-label", `${mode} fish trend-line challenge`);

  drawGrid(graph);
  fish.forEach((item, index) => drawFish(graph, item, index, mode, settings));

  const line = svgElement("line", { class: `fish-trend-line user-trend-line ${settings.lineClass}` });
  const anchorHandle = svgElement("circle", { class: "trend-handle constrained-trend-handle", r: 13, tabindex: 0 });
  const freeHandle = svgElement("circle", { class: "trend-handle free-trend-handle", r: 13, tabindex: 0 });
  graph.append(line, anchorHandle, freeHandle);

  const feedback = document.createElement("p");
  feedback.className = "fish-trend-explanation";
  feedback.setAttribute("aria-live", "polite");
  feedback.textContent = "Place the line, then release a handle to check the fit.";

  let prediction = null;
  let predictionSummary = null;
  let predictionButtons = [];

  if (isCombined) {
    tool.classList.add("awaiting-prediction");
    graph.setAttribute("hidden", "");
    feedback.hidden = true;
    anchorHandle.setAttribute("tabindex", "-1");
    anchorHandle.setAttribute("aria-disabled", "true");
    freeHandle.setAttribute("tabindex", "-1");
    freeHandle.setAttribute("aria-disabled", "true");

    const predictionPanel = document.createElement("section");
    predictionPanel.className = "fish-trend-prediction";

    const predictionQuestion = document.createElement("h3");
    predictionQuestion.textContent = "Both color-specific lines rose. When color is hidden, what will the one line do?";

    const choices = document.createElement("div");
    choices.className = "choices fish-prediction-choices";
    predictionButtons = [
      { value: "rise", label: "Rise" },
      { value: "fall", label: "Fall" },
      { value: "flat", label: "Stay roughly flat" }
    ].map(({ value, label }) => {
      const button = document.createElement("button");
      button.className = "choice fish-prediction-choice";
      button.type = "button";
      button.dataset.prediction = value;
      button.textContent = label;
      button.addEventListener("click", () => lockPrediction(value, label));
      return button;
    });
    choices.append(...predictionButtons);

    predictionSummary = document.createElement("p");
    predictionSummary.className = "fish-prediction-summary";
    predictionSummary.setAttribute("aria-live", "polite");
    predictionSummary.textContent = "Choose one answer before the combined graph is revealed.";

    predictionPanel.append(predictionQuestion, choices, predictionSummary);
    tool.append(predictionPanel, graph, feedback);
  } else {
    tool.append(graph, feedback);
  }

  let anchor = { ...settings.initialAnchor };
  let free = { ...settings.initialFree };
  let activeHandle = null;
  let activeHandleElement = null;
  let completed = false;
  updateLine();

  attachHandle(anchorHandle, "anchor");
  attachHandle(freeHandle, "free");

  function attachHandle(handle, kind) {
    handle.addEventListener("pointerdown", (event) => {
      if (isCombined && !prediction) return;
      event.preventDefault();
      activeHandle = kind;
      activeHandleElement = handle;
      handle.classList.add("is-dragging");
      tool.classList.add("is-fitting-line");
      handle.setPointerCapture(event.pointerId);
      window.addEventListener("pointermove", moveActiveHandle);
      window.addEventListener("pointerup", releaseHandle);
      window.addEventListener("pointercancel", releaseHandle);
    });
  }

  function moveActiveHandle(event) {
    if (!activeHandle) return;
    const point = eventToGraphPoint(event);
    if (activeHandle === "free") free = point;
    else anchor = constrainToAxis(point, settings.anchor, anchor);
    updateLine();
  }

  function releaseHandle(event) {
    if (!activeHandle) return;
    if (activeHandleElement.hasPointerCapture(event.pointerId)) activeHandleElement.releasePointerCapture(event.pointerId);
    activeHandleElement.classList.remove("is-dragging");
    tool.classList.remove("is-fitting-line");
    window.removeEventListener("pointermove", moveActiveHandle);
    window.removeEventListener("pointerup", releaseHandle);
    window.removeEventListener("pointercancel", releaseHandle);
    activeHandle = null;
    activeHandleElement = null;
    checkFit();
  }

  function eventToGraphPoint(event) {
    const rect = graph.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * 620;
    const svgY = ((event.clientY - rect.top) / rect.height) * 620;
    return {
      x: clamp(((svgX - plotStart) / plotSpan) * 6, 0, 6),
      y: clamp(((plotEnd - svgY) / plotSpan) * 6, 0, 6)
    };
  }

  function updateLine() {
    line.setAttribute("x1", graphX(anchor.x));
    line.setAttribute("y1", graphY(anchor.y));
    line.setAttribute("x2", graphX(free.x));
    line.setAttribute("y2", graphY(free.y));
    anchorHandle.setAttribute("cx", graphX(anchor.x));
    anchorHandle.setAttribute("cy", graphY(anchor.y));
    freeHandle.setAttribute("cx", graphX(free.x));
    freeHandle.setAttribute("cy", graphY(free.y));
  }

  function checkFit() {
    const dx = free.x - anchor.x;
    if (Math.abs(dx) < 0.2) {
      feedback.textContent = "Make the line less vertical so it can describe how height changes with length.";
      return;
    }

    const slope = (free.y - anchor.y) / dx;
    const intercept = anchor.y - slope * anchor.x;
    const directionIsCorrect = settings.slopeDirection > 0 ? slope > 0.2 : slope < -0.15;
    const error = Math.sqrt(settings.items.reduce((sum, item) => {
      const difference = item.height - (slope * item.length + intercept);
      return sum + difference ** 2;
    }, 0) / settings.items.length);

    if (!directionIsCorrect) {
      feedback.textContent = settings.slopeDirection > 0
        ? "The line needs to rise from left to right. Try a positive slope."
        : "The line needs to fall from left to right. Try a negative slope.";
      return;
    }

    if (error > settings.tolerance) {
      feedback.textContent = "The direction is right. Move the line closer to the middle of the fish.";
      return;
    }

    feedback.textContent = settings.success;
    feedback.classList.add("good");
    tool.classList.add("fit-accepted");
    if (isCombined) resolvePrediction();
    anchorHandle.setAttribute("r", 10);
    freeHandle.setAttribute("r", 10);
    if (!completed) {
      completed = true;
      onComplete?.();
    }
  }

  function lockPrediction(value, label) {
    if (prediction) return;
    prediction = value;
    predictionButtons.forEach((button) => {
      button.disabled = true;
      button.classList.toggle("selected", button.dataset.prediction === value);
    });
    predictionSummary.textContent = `Your prediction: ${label}. Fit one line through all six fish to test it.`;
    tool.classList.remove("awaiting-prediction");
    tool.classList.add("prediction-locked");
    graph.removeAttribute("hidden");
    feedback.hidden = false;
    anchorHandle.setAttribute("tabindex", "0");
    anchorHandle.removeAttribute("aria-disabled");
    freeHandle.setAttribute("tabindex", "0");
    freeHandle.removeAttribute("aria-disabled");
  }

  function resolvePrediction() {
    const selectedButton = predictionButtons.find((button) => button.dataset.prediction === prediction);
    const predictionLabel = selectedButton?.textContent ?? prediction;
    predictionSummary.textContent = `Your prediction: ${predictionLabel}. Result: the combined line falls.`;
    predictionButtons.forEach((button) => {
      const isResult = button.dataset.prediction === "fall";
      button.classList.toggle("correct", isResult);
      button.classList.toggle("incorrect", button === selectedButton && !isResult);
    });
  }

  return tool;
}

function constrainToAxis(point, axis, current) {
  if (axis === "y") return { x: 0, y: point.y };
  if (axis === "x") return { x: point.x, y: 0 };

  // Keep the handle on its current axis until it reaches the origin. Once it
  // is there, a drag along the perpendicular axis carries it through (0, 0)
  // instead of trapping it on its original axis.
  if (current.x === 0) {
    return current.y <= 0.35 && point.y <= 0.35 ? { x: point.x, y: 0 } : { x: 0, y: point.y };
  }
  return current.x <= 0.35 && point.x <= 0.35 ? { x: 0, y: point.y } : { x: point.x, y: 0 };
}

function drawGrid(graph) {
  for (let value = 0; value <= 6; value += 1) {
    const x = graphX(value);
    const y = graphY(value);
    graph.append(
      svgElement("line", { x1: x, y1: plotStart, x2: x, y2: plotEnd, class: "trend-grid-line" }),
      svgElement("line", { x1: plotStart, y1: y, x2: plotEnd, y2: y, class: "trend-grid-line" }),
      svgText(value, x, 574, "trend-x-tick"),
      svgText(value, 52, y + 4, "trend-y-tick")
    );
  }

  graph.append(
    svgElement("line", { x1: plotStart, y1: plotEnd, x2: plotEnd, y2: plotEnd, class: "trend-axis-line" }),
    svgElement("line", { x1: plotStart, y1: plotStart, x2: plotStart, y2: plotEnd, class: "trend-axis-line" }),
    svgText("length", 510, 604, "trend-axis-label"),
    svgText("height", 18, 98, "trend-axis-label trend-y-label")
  );
}

function drawFish(graph, item, index, mode, settings) {
  const width = 54;
  const height = 34;
  const isGray = mode === "combined";
  const isMuted = settings.mutedColor === item.color;
  const image = svgElement("image", {
    href: `img/fish_${item.color}${isGray ? "_gray" : ""}.png`,
    x: graphX(item.length) - width / 2,
    y: graphY(item.height) - height / 2,
    width,
    height,
    class: `trend-fish${isGray ? " gray-fish" : ""}${isMuted ? " muted-fish" : ""}`
  });
  image.setAttribute("aria-label", `Fish ${index + 1}: length ${item.length}, height ${item.height}`);
  graph.append(image);
}

function graphX(value) {
  return plotStart + (value / 6) * plotSpan;
}

function graphY(value) {
  return plotEnd - (value / 6) * plotSpan;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function svgElement(tagName, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function svgText(value, x, y, className) {
  const text = svgElement("text", { x, y, class: className });
  text.textContent = value;
  return text;
}
