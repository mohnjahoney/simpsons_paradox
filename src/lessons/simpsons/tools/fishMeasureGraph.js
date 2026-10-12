import { clamp } from "../math.js";

const fishToPlace = [
  { length: 1.2, height: 3.3 },
  { length: 2.0, height: 4.5 },
  { length: 2.8, height: 5.4 },
  { length: 3.7, height: 1.3 },
  { length: 4.6, height: 2.1 },
  { length: 5.2, height: 2.8 }
];
const measurementScale = 62;

export function createFishMeasureGraph({ onComplete } = {}) {
  const panel = document.createElement("div");
  panel.className = "measure-panel staged-measure-panel";
  panel.setAttribute("aria-label", "Measure fish, then organize them on a graph by length and height");

  const measureView = document.createElement("div");
  measureView.className = "fish-measure-view";
  const measureTitle = document.createElement("p");
  measureTitle.className = "fish-step-label";
  const measureScene = document.createElement("div");
  measureScene.className = "fish-measure-scene";
  const fish = document.createElement("img");
  fish.className = "measured-fish staged-fish";
  fish.draggable = false;
  const measurementGuides = document.createElement("div");
  measurementGuides.className = "staged-measurement-guides";
  measurementGuides.innerHTML = `
    <span class="staged-guide staged-guide-left"></span>
    <span class="staged-guide staged-guide-right"></span>
    <span class="staged-guide staged-guide-top"></span>
    <span class="staged-guide staged-guide-bottom"></span>
  `;
  const lengthRuler = createRuler("fish-ruler length-ruler", "Length ruler");
  const heightRuler = createRuler("fish-ruler height-ruler", "Height ruler");
  lengthRuler.style.width = `${measurementScale * 6}px`;
  heightRuler.style.height = `${measurementScale * 6}px`;
  measureScene.append(lengthRuler, heightRuler, measurementGuides, fish);

  const form = document.createElement("form");
  form.className = "fish-coordinate-form";
  form.innerHTML = `
    <label>Length <input name="length" inputmode="decimal" autocomplete="off" placeholder="e.g. 1.2" required></label>
    <label>Height <input name="height" inputmode="decimal" autocomplete="off" placeholder="e.g. 3.3" required></label>
    <button type="submit">Add measurement</button>
  `;
  const formNote = document.createElement("p");
  formNote.className = "fish-form-note";
  formNote.setAttribute("aria-live", "polite");
  measureView.append(measureTitle, measureScene, form, formNote);

  const graphView = document.createElement("div");
  graphView.className = "fish-graph-view";
  graphView.hidden = true;
  const graphTitle = document.createElement("p");
  graphTitle.className = "fish-step-label";
  const graph = createGraph();
  const placementDot = document.createElement("div");
  placementDot.className = "fish-center-dot active-center-dot staged-placement-dot";
  placementDot.hidden = true;
  graph.append(placementDot);
  const graphNote = document.createElement("p");
  graphNote.className = "measure-instruction";
  graphNote.setAttribute("aria-live", "polite");
  graphView.append(graphTitle, graph, graphNote);

  const dotBank = document.createElement("div");
  dotBank.className = "fish-dot-bank";
  dotBank.setAttribute("aria-label", "Measured fish data points");
  panel.append(measureView, graphView, dotBank);

  let index = 0;
  let current = fishToPlace[0];
  let firstPlaced = false;
  let completed = false;
  let drag = false;
  let dragOffset = { x: 0, y: 0 };
  let automaticPhase = false;
  let fishPosition = { x: 0, y: 0 };
  const measuredDots = [];
  const lengthInput = form.querySelector("[name=length]");
  const heightInput = form.querySelector("[name=height]");

  function setGuideFocus(kind) {
    measurementGuides.classList.toggle("focus-length", kind === "length");
    measurementGuides.classList.toggle("focus-height", kind === "height");
    measurementGuides.classList.remove("pulse-length", "pulse-height");
    void measurementGuides.offsetWidth;
    measurementGuides.classList.add(kind === "length" ? "pulse-length" : "pulse-height");
  }

  function showFish() {
    current = fishToPlace[index];
    const color = getFishColor(index);
    fish.src = `img/fish_${color}.png`;
    fish.alt = `${color} fish ${index + 1}, measure its length and height`;
    fish.classList.toggle("reverse", index % 2 === 1);
    fish.classList.remove("fish-collapsing");
    fish.style.width = `${current.length * measurementScale}px`;
    fish.style.height = `${current.height * measurementScale}px`;
    requestAnimationFrame(() => {
      setFishPosition(measureScene.clientWidth / 2, measureScene.clientHeight * 0.52);
    });
    measureTitle.textContent = index === 0 ? "1. Measure this fish" : `Measure fish ${index + 1} of ${fishToPlace.length}`;
    formNote.textContent = index === 0 ? "Use the rulers, then enter the length and height." : "The next measurement will be added automatically.";
    lengthInput.value = "";
    heightInput.value = "";
    measureView.hidden = false;
    requestAnimationFrame(() => measureView.classList.add("is-visible"));
  }

  function createDataDot(data, i) {
    const dot = document.createElement("div");
    dot.className = `fish-data-dot ${getFishColor(i)}-data-dot`;
    dot.textContent = `(${data.length}, ${data.height})`;
    dot.setAttribute("aria-label", `${getFishColor(i)} fish, length ${data.length}, height ${data.height}`);
    return dot;
  }

  function recordMeasurement() {
    if (automaticPhase && index > 0) {
      if (!lengthInput.value) lengthInput.value = current.length;
      if (!heightInput.value) heightInput.value = current.height;
    }
    const length = Number(form.querySelector("[name=length]").value);
    const height = Number(form.querySelector("[name=height]").value);
    if (!Number.isFinite(length) || !Number.isFinite(height) || length <= 0 || height <= 0) {
      formNote.textContent = "Enter both measurements before adding the fish.";
      return false;
    }
    if (index === 0 && (Math.abs(length - current.length) > 0.15 || Math.abs(height - current.height) > 0.15)) {
      formNote.textContent = "Check the rulers and try those measurements again.";
      return false;
    }
    const data = { length: index === 0 ? length : current.length, height: index === 0 ? height : current.height };
    const dot = createDataDot(data, index);
    dotBank.append(dot);
    measuredDots.push({ dot, data });
    fish.classList.add("fish-collapsing");
    form.classList.add("is-complete");
    lengthRuler.classList.add("is-hidden-ruler");
    heightRuler.classList.add("is-hidden-ruler");
    window.setTimeout(() => {
      if (!firstPlaced) {
        showPlacement();
      } else if (index < fishToPlace.length - 1) {
        index += 1;
        form.classList.remove("is-complete");
        lengthRuler.classList.remove("is-hidden-ruler");
        heightRuler.classList.remove("is-hidden-ruler");
        showFish();
        window.setTimeout(runAutomaticMeasurement, 520);
      } else {
        revealAllDots();
      }
    }, 560);
    return true;
  }

  function runAutomaticMeasurement() {
    automaticPhase = true;
    lengthInput.value = current.length;
    heightInput.value = current.height;
    lengthInput.focus();
    setGuideFocus("length");
    window.setTimeout(() => {
      heightInput.focus();
      setGuideFocus("height");
      window.setTimeout(recordMeasurement, 560);
    }, 720);
  }

  function showPlacement() {
    measureView.classList.remove("is-visible");
    graphView.hidden = false;
    graphView.classList.add("is-visible");
    graphTitle.textContent = "2. Place the data point";
    graphNote.textContent = "Drag the waiting dot to the matching spot on the graph.";
    placementDot.hidden = false;
    positionPlacementDot({ x: graph.clientWidth * 0.2, y: graph.clientHeight * 0.5 });
    window.setTimeout(() => { measureView.hidden = true; }, 260);
  }

  function positionPlacementDot(point) {
    placementDot.style.left = `${point.x}px`;
    placementDot.style.top = `${point.y}px`;
  }

  function startDrag(event) {
    if (placementDot.hidden) return;
    event.preventDefault();
    drag = true;
    const rect = placementDot.getBoundingClientRect();
    dragOffset = { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
    placementDot.classList.add("is-dragging");
    placementDot.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  }

  function moveDrag(event) {
    if (!drag) return;
    event.preventDefault();
    const rect = graph.getBoundingClientRect();
    positionPlacementDot({
      x: clamp(event.clientX - rect.left - dragOffset.x, 10, rect.width - 10),
      y: clamp(event.clientY - rect.top - dragOffset.y, 10, rect.height - 10)
    });
  }

  function endDrag() {
    if (!drag) return;
    drag = false;
    window.removeEventListener("pointermove", moveDrag);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    placementDot.classList.remove("is-dragging");
    const target = graphPoint(current);
    const x = Number.parseFloat(placementDot.style.left);
    const y = Number.parseFloat(placementDot.style.top);
    if (Math.hypot(x - target.x, y - target.y) < 48) {
      positionPlacementDot(target);
      placementDot.classList.add("is-settled");
      graphNote.textContent = "Nice. That fish is in the right place.";
      firstPlaced = true;
      index = 1;
      window.setTimeout(startCollection, 700);
    } else {
      graphNote.textContent = "Almost — use the length and height axes to guide the dot.";
    }
  }

  function startCollection() {
    graphView.classList.remove("is-visible");
    window.setTimeout(() => {
      graphView.hidden = true;
      graphNote.textContent = "";
      form.classList.remove("is-complete");
      lengthRuler.classList.remove("is-hidden-ruler");
      heightRuler.classList.remove("is-hidden-ruler");
      measureView.hidden = false;
      showFish();
      window.setTimeout(runAutomaticMeasurement, 520);
    }, 360);
  }

  function revealAllDots() {
    measureView.classList.remove("is-visible");
    window.setTimeout(() => {
      measureView.hidden = true;
      graphView.hidden = false;
      graphTitle.textContent = "3. Organize the fish";
      graphNote.textContent = "The dots settle into the graph by length and height.";
      graphView.classList.add("is-visible");
      placementDot.hidden = true;
      measuredDots.forEach(({ dot, data }, i) => {
        dot.classList.add("in-graph");
        dot.style.left = `${graphPoint(data).x}px`;
        dot.style.top = `${graphPoint(data).y}px`;
        dot.style.setProperty("--dot-delay", `${i * 120}ms`);
        graph.append(dot);
      });
      window.setTimeout(() => {
        graphNote.textContent = "Now look at the overall pattern: red fish tend to be shorter and taller, while blue fish tend to be longer and narrower.";
        if (!completed) { completed = true; onComplete?.(); }
      }, 1100);
    }, 360);
  }

  function graphPoint(data) {
    return { x: graph.clientWidth * (0.1 + (data.length / 6) * 0.8), y: graph.clientHeight * (0.9 - (data.height / 6) * 0.8) };
  }

  function setFishPosition(x, y) {
    const halfWidth = fish.offsetWidth / 2;
    const halfHeight = fish.offsetHeight / 2;
    fishPosition = {
      x: clamp(x, halfWidth + 18, measureScene.clientWidth - halfWidth - 18),
      y: clamp(y, halfHeight + 18, measureScene.clientHeight - halfHeight - 18)
    };
    fish.style.left = `${fishPosition.x}px`;
    fish.style.top = `${fishPosition.y}px`;
    measurementGuides.querySelector(".staged-guide-left").style.left = `${fishPosition.x - halfWidth}px`;
    measurementGuides.querySelector(".staged-guide-right").style.left = `${fishPosition.x + halfWidth}px`;
    measurementGuides.querySelector(".staged-guide-top").style.top = `${fishPosition.y - halfHeight}px`;
    measurementGuides.querySelector(".staged-guide-bottom").style.top = `${fishPosition.y + halfHeight}px`;
  }

  function startFishDrag(event) {
    if (fish.classList.contains("fish-collapsing")) return;
    event.preventDefault();
    const rect = fish.getBoundingClientRect();
    drag = true;
    dragOffset = { x: event.clientX - (rect.left + rect.width / 2), y: event.clientY - (rect.top + rect.height / 2) };
    fish.classList.add("is-dragging");
    fish.setPointerCapture?.(event.pointerId);
  }

  function moveFishDrag(event) {
    if (!drag) return;
    const rect = measureScene.getBoundingClientRect();
    setFishPosition(event.clientX - rect.left - dragOffset.x, event.clientY - rect.top - dragOffset.y);
  }

  function endFishDrag() {
    if (!drag) return;
    drag = false;
    fish.classList.remove("is-dragging");
  }

  lengthInput.addEventListener("focus", () => setGuideFocus("length"));
  heightInput.addEventListener("focus", () => setGuideFocus("height"));
  form.addEventListener("submit", (event) => { event.preventDefault(); recordMeasurement(); });
  fish.addEventListener("pointerdown", startFishDrag);
  fish.addEventListener("pointermove", moveFishDrag);
  fish.addEventListener("pointerup", endFishDrag);
  fish.addEventListener("pointercancel", endFishDrag);
  placementDot.addEventListener("pointerdown", startDrag);
  placementDot.addEventListener("pointermove", moveDrag);
  placementDot.addEventListener("pointerup", endDrag);
  placementDot.addEventListener("pointercancel", endDrag);
  showFish();
  requestAnimationFrame(() => measureView.classList.add("is-visible"));
  return panel;
}

function createRuler(className, label) {
  const ruler = document.createElement("div");
  ruler.className = className;
  ruler.setAttribute("role", "img");
  ruler.setAttribute("aria-label", label);
  for (let value = 0; value <= 6; value += 1) {
    const tick = document.createElement("span");
    tick.textContent = value === 6 ? "6 ft" : value;
    tick.style.setProperty("--ruler-position", `${(value / 6) * 100}%`);
    ruler.append(tick);
  }
  return ruler;
}

function createGraph() {
  const graph = document.createElement("div");
  graph.className = "fish-graph staged-graph";
  const ticks = document.createElement("div");
  ticks.className = "graph-ticks";
  for (let value = 0; value <= 6; value += 1) {
    const vertical = document.createElement("span");
    vertical.className = "graph-grid-line vertical-grid-line";
    vertical.style.left = `${10 + (value / 6) * 80}%`;
    const horizontal = document.createElement("span");
    horizontal.className = "graph-grid-line horizontal-grid-line";
    horizontal.style.top = `${90 - (value / 6) * 80}%`;
    const xTick = document.createElement("span");
    xTick.className = "graph-tick x-tick";
    xTick.textContent = value;
    xTick.style.left = `${10 + (value / 6) * 80}%`;
    const yTick = document.createElement("span");
    yTick.className = "graph-tick y-tick";
    yTick.textContent = value;
    yTick.style.top = `${90 - (value / 6) * 80}%`;
    ticks.append(vertical, horizontal, xTick, yTick);
  }
  const xAxis = document.createElement("div");
  xAxis.className = "graph-axis x-axis";
  xAxis.textContent = "length";
  const yAxis = document.createElement("div");
  yAxis.className = "graph-axis y-axis";
  yAxis.textContent = "height";
  graph.append(ticks, xAxis, yAxis);
  return graph;
}

function getFishColor(index) { return index < 3 ? "red" : "blue"; }
