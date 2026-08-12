import { clamp } from "../lib/math.js";

const targetSnapRadius = 40;
const iconScaleFactor = 0.3;
const graphAxisStartPercent = 10;
const graphAxisEndPercent = 90;

const fishToPlace = [
  { length: 1.2, height: 3.3 },
  { length: 2.0, height: 4.5 },
  { length: 2.8, height: 5.4 },
  { length: 3.7, height: 1.3 },
  { length: 4.6, height: 2.1 },
  { length: 5.2, height: 2.8 }
];

export function createFishMeasureGraph({ onComplete } = {}) {
  const panel = document.createElement("div");
  panel.className = "measure-panel";
  panel.setAttribute("aria-label", "Measure and place six fish on a graph by length and height");

  const graph = document.createElement("div");
  graph.className = "fish-graph";
  graph.setAttribute("aria-label", "Fish organized on a graph by length and height");

  const lengthRuler = createRuler("fish-ruler length-ruler", "Length ruler 100 pixels above the graph");
  const heightRuler = createRuler("fish-ruler height-ruler", "Height ruler to the right of the graph");

  const xAxis = document.createElement("div");
  xAxis.className = "graph-axis x-axis";
  xAxis.textContent = "length";

  const yAxis = document.createElement("div");
  yAxis.className = "graph-axis y-axis";
  yAxis.textContent = "height";

  const axisTicks = createAxisTicks();

  const dotsLayer = document.createElement("div");
  dotsLayer.className = "fish-dot-layer";
  dotsLayer.setAttribute("aria-hidden", "true");
  dotsLayer.append(...createTargetDots());

  const instruction = document.createElement("div");
  instruction.className = "measure-instruction";
  instruction.setAttribute("aria-live", "polite");

  graph.append(dotsLayer, axisTicks, xAxis, yAxis);
  panel.append(lengthRuler, graph, heightRuler, instruction);

  makeFishPlacementTool(panel, graph, lengthRuler, heightRuler, instruction, onComplete);
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

function createTargetDots() {
  return fishToPlace.map((fish, index) => {
    const dot = document.createElement("div");
    dot.className = "fish-target-dot";
    dot.style.left = `${getGraphXPercent(fish.length)}%`;
    dot.style.top = `${getGraphYPercent(fish.height)}%`;
    dot.title = `Fish ${index + 1}: ${fish.length} long, ${fish.height} tall`;
    return dot;
  });
}

function createAxisTicks() {
  const ticks = document.createElement("div");
  ticks.className = "graph-ticks";
  ticks.setAttribute("aria-hidden", "true");

  for (let value = 0; value <= 6; value += 1) {
    const verticalLine = document.createElement("span");
    verticalLine.className = "graph-grid-line vertical-grid-line";
    verticalLine.style.left = `${getGraphXPercent(value)}%`;

    const horizontalLine = document.createElement("span");
    horizontalLine.className = "graph-grid-line horizontal-grid-line";
    horizontalLine.style.top = `${getGraphYPercent(value)}%`;

    const xTick = document.createElement("span");
    xTick.className = "graph-tick x-tick";
    xTick.textContent = value;
    xTick.style.left = `${getGraphXPercent(value)}%`;

    const yTick = document.createElement("span");
    yTick.className = "graph-tick y-tick";
    yTick.textContent = value;
    yTick.style.top = `${getGraphYPercent(value)}%`;

    ticks.append(verticalLine, horizontalLine, xTick, yTick);
  }

  return ticks;
}

function makeFishPlacementTool(panel, graph, lengthRuler, heightRuler, instruction, onComplete) {
  const fishItems = fishToPlace.map((data, index) => createFishItem(data, index));
  const guidelines = createMeasurementGuidelines();
  const activeDot = document.createElement("div");
  activeDot.className = "fish-center-dot active-center-dot";
  activeDot.hidden = true;
  panel.append(guidelines.layer, activeDot);

  let nextFishIndex = 0;
  let placedCount = 0;
  let activeFish = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let completed = false;

  function createMeasurementGuidelines() {
    const layer = document.createElement("div");
    layer.className = "fish-guidelines";
    layer.hidden = true;

    const front = document.createElement("div");
    front.className = "fish-guideline vertical-fish-guideline front-guideline";
    const rear = document.createElement("div");
    rear.className = "fish-guideline vertical-fish-guideline rear-guideline";
    const top = document.createElement("div");
    top.className = "fish-guideline horizontal-fish-guideline top-guideline";
    const bottom = document.createElement("div");
    bottom.className = "fish-guideline horizontal-fish-guideline bottom-guideline";

    layer.append(front, rear, top, bottom);
    return { layer, front, rear, top, bottom };
  }

  fishItems.forEach((item) => {
    panel.append(item.image);
    panel.append(item.measurement);
    panel.append(item.dot);
    attachDragHandlers(item);
  });

  function createFishItem(data, index) {
    const color = getFishColor(index);
    const image = document.createElement("img");
    image.className = "measured-fish draggable-measure-fish";
    image.src = `img/fish_${color}.png`;
    image.alt = `${color} fish ${index + 1} of ${fishToPlace.length}, ${data.length} feet long and ${data.height} feet tall`;
    image.draggable = false;
    image.style.setProperty("--icon-scale-factor", iconScaleFactor);
    if (shouldReverseFish(index)) image.classList.add("reverse");
    image.hidden = true;

    const measurement = document.createElement("div");
    measurement.className = "fish-measurement";
    measurement.textContent = `(${data.length}, ${data.height})`;
    measurement.setAttribute("aria-hidden", "true");
    measurement.hidden = true;

    const dot = document.createElement("div");
    dot.className = "fish-center-dot placed-center-dot";
    dot.hidden = true;

    return {
      ...data,
      index,
      image,
      measurement,
      dot,
      imageWidth: 0,
      imageHeight: 0,
      x: 0,
      y: 0,
      placed: false,
      visible: false
    };
  }

  function showNextFish() {
    if (nextFishIndex >= fishItems.length) return;

    const item = fishItems[nextFishIndex];
    item.visible = true;
    item.image.hidden = false;
    item.measurement.hidden = false;
    moveFishTo(item, getDockPosition());
    updateDot(item);
    nextFishIndex += 1;
  }

  function getDockPosition() {
    const graphRect = graph.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const graphLeft = graphRect.left - panelRect.left;
    const graphTop = graphRect.top - panelRect.top;
    const dockOffset = Number.parseFloat(getComputedStyle(panel).getPropertyValue("--fish-dock-space"));
    return {
      x: graphLeft - dockOffset / 2,
      y: graphTop + graphRect.height * 0.52
    };
  }

  function attachDragHandlers(item) {
    item.image.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      startDrag(item, event.clientX, event.clientY);
      item.image.setPointerCapture(event.pointerId);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", releaseFish);
      window.addEventListener("pointercancel", releaseFish);
    });

    item.image.addEventListener("pointermove", (event) => {
      moveDrag(event.clientX, event.clientY);
    });

    item.image.addEventListener("mousedown", (event) => {
      if (activeFish) return;
      event.preventDefault();
      startDrag(item, event.clientX, event.clientY);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", releaseFish);
    });

    item.image.addEventListener("pointerup", releaseFish);
    item.image.addEventListener("pointercancel", releaseFish);
    item.image.addEventListener("dragstart", (event) => event.preventDefault());
  }

  function startDrag(item, clientX, clientY) {
    const fishRect = item.image.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    activeFish = item;
    dragOffsetX = clientX - fishRect.left - fishRect.width / 2;
    dragOffsetY = clientY - fishRect.top - fishRect.height / 2;
    item.image.classList.add("is-dragging");
    updateMeasurementPosition(item, 1);
    item.dot.hidden = true;
    activeDot.hidden = false;
    item.x = fishRect.left - panelRect.left + fishRect.width / 2;
    item.y = fishRect.top - panelRect.top + fishRect.height / 2;
    updateActiveDot();
    guidelines.layer.hidden = false;
    updateGuidelines();
  }

  function moveDrag(clientX, clientY) {
    if (!activeFish) return;

    const panelRect = panel.getBoundingClientRect();
    const graphRect = graph.getBoundingClientRect();
    const graphLeft = graphRect.left - panelRect.left;
    const graphTop = graphRect.top - panelRect.top;
    const nextX = clientX - panelRect.left - dragOffsetX;
    const nextY = clientY - panelRect.top - dragOffsetY;
    moveFishTo(activeFish, {
      x: clamp(nextX, graphLeft, graphLeft + graphRect.width),
      y: clamp(nextY, graphTop, graphTop + graphRect.height)
    });
    updateActiveDot();
    updateGuidelines();
  }

  function onMouseMove(event) {
    moveDrag(event.clientX, event.clientY);
  }

  function onPointerMove(event) {
    moveDrag(event.clientX, event.clientY);
  }

  function releaseFish(event) {
    if (!activeFish) return;

    if (event.pointerId !== undefined && activeFish.image.hasPointerCapture(event.pointerId)) {
      activeFish.image.releasePointerCapture(event.pointerId);
    }

    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", releaseFish);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", releaseFish);
    window.removeEventListener("pointercancel", releaseFish);
    activeFish.image.classList.remove("is-dragging");
    updateMeasurementPosition(activeFish, iconScaleFactor);
    activeDot.hidden = true;
    guidelines.layer.hidden = true;

    const snapTarget = getNearestTargetPosition(activeFish);
    if (snapTarget) moveFishTo(activeFish, snapTarget);

    if (isFishCenterInGraph(activeFish)) {
      if (!activeFish.placed) {
        activeFish.placed = true;
        placedCount += 1;
        showNextFish();
      }
      updateDot(activeFish);
      activeFish.dot.hidden = false;
    } else if (!activeFish.placed) {
      moveFishTo(activeFish, getDockPosition());
      activeFish.dot.hidden = true;
    } else {
      updateDot(activeFish);
      activeFish.dot.hidden = false;
    }

    activeFish = null;
    updateInstruction();

    if (!completed && placedCount === fishItems.length) {
      completed = true;
      onComplete?.();
    }
  }

  function moveFishTo(item, position) {
    item.x = position.x;
    item.y = position.y;
    item.image.style.left = `${item.x}px`;
    item.image.style.top = `${item.y}px`;
    updateMeasurementPosition(item, item.image.classList.contains("is-dragging") ? 1 : iconScaleFactor);
  }

  function updateMeasurementPosition(item, scale) {
    item.measurement.style.left = `${item.x}px`;
    item.measurement.style.top = `${item.y + (item.imageHeight * scale) / 2 + 7}px`;
  }

  function updateActiveDot() {
    if (!activeFish) return;
    activeDot.style.left = `${activeFish.x}px`;
    activeDot.style.top = `${activeFish.y}px`;
  }

  function updateGuidelines() {
    if (!activeFish) return;

    const panelRect = panel.getBoundingClientRect();
    const graphRect = graph.getBoundingClientRect();
    const lengthRulerRect = lengthRuler.getBoundingClientRect();
    const heightRulerRect = heightRuler.getBoundingClientRect();
    const graphTop = graphRect.top - panelRect.top;
    const axisLeft = graphRect.left - panelRect.left + graphRect.width * (getGraphXPercent(0) / 100);
    const axisBottom = graphTop + graphRect.height * (getGraphYPercent(0) / 100);
    const verticalTop = lengthRulerRect.bottom - panelRect.top;
    const horizontalRight = heightRulerRect.left - panelRect.left;
    const fishLeft = activeFish.x - activeFish.imageWidth / 2;
    const fishRight = activeFish.x + activeFish.imageWidth / 2;
    const fishTop = activeFish.y - activeFish.imageHeight / 2;
    const fishBottom = activeFish.y + activeFish.imageHeight / 2;

    setVerticalGuideline(guidelines.front, fishRight, verticalTop, axisBottom);
    setVerticalGuideline(guidelines.rear, fishLeft, verticalTop, axisBottom);
    setHorizontalGuideline(guidelines.top, fishTop, axisLeft, horizontalRight);
    setHorizontalGuideline(guidelines.bottom, fishBottom, axisLeft, horizontalRight);
  }

  function setVerticalGuideline(line, x, top, bottom) {
    line.style.left = `${x}px`;
    line.style.top = `${top}px`;
    line.style.height = `${Math.max(0, bottom - top)}px`;
  }

  function setHorizontalGuideline(line, y, left, right) {
    line.style.left = `${left}px`;
    line.style.top = `${y}px`;
    line.style.width = `${Math.max(0, right - left)}px`;
  }

  function updateDot(item) {
    item.dot.style.left = `${item.x}px`;
    item.dot.style.top = `${item.y}px`;
  }

  function isFishCenterInGraph(item) {
    const graphRect = graph.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const graphLeft = graphRect.left - panelRect.left;
    const graphTop = graphRect.top - panelRect.top;
    return item.x >= graphLeft &&
      item.x <= graphLeft + graphRect.width &&
      item.y >= graphTop &&
      item.y <= graphTop + graphRect.height;
  }

  function getNearestTargetPosition(item) {
    const graphRect = graph.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const graphLeft = graphRect.left - panelRect.left;
    const graphTop = graphRect.top - panelRect.top;
    let nearestTarget = null;
    let nearestDistance = targetSnapRadius;

    fishToPlace.forEach((fish) => {
      const target = {
        x: graphLeft + graphRect.width * (getGraphXPercent(fish.length) / 100),
        y: graphTop + graphRect.height * (getGraphYPercent(fish.height) / 100)
      };
      const distance = Math.hypot(item.x - target.x, item.y - target.y);

      if (distance <= nearestDistance) {
        nearestTarget = target;
        nearestDistance = distance;
      }
    });

    return nearestTarget;
  }

  function updateInstruction() {
    if (placedCount === fishItems.length) {
      instruction.textContent = "All 6 fish are on the graph. You can still adjust them, or continue.";
      return;
    }

    instruction.textContent = `Place fish ${placedCount + 1} of ${fishItems.length}. Drag it from the left, using the center dot as its graph point.`;
  }

  const observer = new ResizeObserver(() => {
    alignRulersToGraph();
    sizeFishToRuler();
    fishItems.forEach((item) => {
      if (item.visible && !item.placed && item !== activeFish) {
        moveFishTo(item, getDockPosition());
      } else if (item.visible) {
        moveFishTo(item, item);
      }
      updateDot(item);
    });
    updateActiveDot();
    updateGuidelines();
  });

  observer.observe(panel);
  observer.observe(graph);

  alignRulersToGraph();
  sizeFishToRuler();
  showNextFish();
  updateInstruction();

  function alignRulersToGraph() {
    const graphRect = graph.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const graphLeft = graphRect.left - panelRect.left;
    const graphTop = graphRect.top - panelRect.top;
    const axisLeft = graphLeft + graphRect.width * (getGraphXPercent(0) / 100);
    const axisRight = graphLeft + graphRect.width * (getGraphXPercent(6) / 100);
    const axisTop = graphTop + graphRect.height * (getGraphYPercent(6) / 100);
    const axisBottom = graphTop + graphRect.height * (getGraphYPercent(0) / 100);

    lengthRuler.style.left = `${axisLeft}px`;
    lengthRuler.style.width = `${axisRight - axisLeft}px`;
    heightRuler.style.top = `${axisTop}px`;
    heightRuler.style.height = `${axisBottom - axisTop}px`;
  }

  function sizeFishToRuler() {
    const feetToPixels = lengthRuler.getBoundingClientRect().width / 6;

    fishItems.forEach((item) => {
      item.imageWidth = item.length * feetToPixels;
      item.imageHeight = item.height * feetToPixels;
      item.image.style.width = `${item.imageWidth}px`;
      item.image.style.height = `${item.imageHeight}px`;
    });
  }
}

function getFishColor(index) {
  return index < 3 ? "red" : "blue";
}

function shouldReverseFish(index) {
  return index % 2 === 1;
}

function getGraphXPercent(length) {
  return graphAxisStartPercent + (length / 6) * (graphAxisEndPercent - graphAxisStartPercent);
}

function getGraphYPercent(height) {
  return graphAxisEndPercent - (height / 6) * (graphAxisEndPercent - graphAxisStartPercent);
}
