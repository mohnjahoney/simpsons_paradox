const svgSize = 620;
const plot = { left: 72, right: 560, top: 42, bottom: 520 };
const axisMax = 6;
const correctFeature = "fill";

const features = [
  { key: "color", label: "color" },
  { key: "shape", label: "shape" },
  { key: "size", label: "size" },
  { key: "border", label: "border" },
  { key: "fill", label: "fill style" }
];

const colors = [
  { value: "coral", label: "coral", color: "#d7656a" },
  { value: "blue", label: "blue", color: "#4388c9" },
  { value: "gold", label: "gold", color: "#c89728" }
];
const shapes = ["circle", "square", "diamond"];
const sizes = ["small", "medium", "large"];
const borders = [
  { value: "dark", label: "dark border", color: "#2f3a31" },
  { value: "green", label: "green border", color: "#4e8b65" },
  { value: "purple", label: "purple border", color: "#7d5aa6" }
];
const fills = [
  { value: "color", label: "color fill" },
  { value: "white", label: "white fill" }
];

const linePalette = ["#2e8462", "#b98012", "#7d5aa6", "#4388c9"];
const points = createPoints();
const maxNoise = 0.55;

export function createFeatureGroupingChallenge({ onComplete, mode = "challenge" } = {}) {
  const tool = document.createElement("div");
  tool.className = `feature-grouping-tool feature-grouping-mode-${mode}`;

  const graph = svgElement("svg", {
    class: "feature-grouping-graph",
    viewBox: `0 0 ${svgSize} ${svgSize}`,
    role: "img",
    "aria-label": "Scatterplot of objects with color, shape, size, border, and fill style"
  });

  const controls = document.createElement("div");
  controls.className = "feature-grouping-controls";

  const feedback = document.createElement("p");
  feedback.className = "feature-grouping-feedback";
  feedback.setAttribute("aria-live", "polite");

  const noiseControl = document.createElement("label");
  noiseControl.className = "feature-grouping-noise-control";
  noiseControl.innerHTML = "<span>Data noise</span> <output>0%</output>";
  const noiseSlider = document.createElement("input");
  noiseSlider.type = "range";
  noiseSlider.min = "0";
  noiseSlider.max = "100";
  noiseSlider.value = "0";
  noiseSlider.step = "1";
  noiseSlider.setAttribute("aria-label", "Add deterministic noise to the data");
  noiseControl.append(noiseSlider);

  let selectedFeature = mode === "solved" ? correctFeature : null;
  let completed = false;
  let noiseLevel = 0;

  noiseSlider.addEventListener("input", () => {
    noiseLevel = Number(noiseSlider.value);
    noiseControl.querySelector("output").textContent = `${noiseLevel}%`;
    render();
  });

  if (mode === "challenge") {
    features.forEach((feature) => {
      const button = document.createElement("button");
      button.className = "secondary compact-tool-button feature-grouping-button";
      button.type = "button";
      button.textContent = feature.label;
      button.addEventListener("click", () => {
        selectedFeature = feature.key;
        render();
        if (feature.key === correctFeature && !completed) {
          completed = true;
          onComplete?.();
        }
      });
      controls.append(button);
    });
  }

  tool.append(graph);
  tool.append(noiseControl);
  if (mode === "challenge") tool.append(controls);
  tool.append(feedback);
  render();
  return tool;

  function render() {
    drawGraph(graph, selectedFeature, mode, getNoisyPoints(noiseLevel));
    updateButtons(controls, selectedFeature);
    updateFeedback(feedback, selectedFeature, mode, noiseLevel);
    tool.classList.toggle("feature-grouping-success", selectedFeature === correctFeature);
  }
}

function createPoints() {
  const fillGroups = [
    { fill: "color", centerX: 1.65, centerY: 4.65 },
    { fill: "white", centerX: 4.35, centerY: 1.95 }
  ];
  const xOffsets = [-0.66, -0.32, 0, 0.32, 0.66];
  const yOffsets = [-0.18, 0.04, 0.18];

  return fillGroups.flatMap((group, groupIndex) => {
    let index = 0;
    return xOffsets.flatMap((xOffset, xIndex) => yOffsets.map((yOffset, yIndex) => {
      const point = {
        id: `${group.fill}-${xIndex}-${yIndex}`,
        x: group.centerX + xOffset + (yIndex - 1) * 0.045,
        y: group.centerY + xOffset * 0.58 + yOffset,
        fill: group.fill,
        color: colors[(index + groupIndex) % colors.length].value,
        shape: shapes[(index + groupIndex * 2) % shapes.length],
        size: sizes[(index + groupIndex) % sizes.length],
        border: borders[(index * 2 + groupIndex) % borders.length].value
      };
      index += 1;
      return point;
    }));
  });
}

function drawGraph(graph, selectedFeature, mode, data) {
  graph.replaceChildren();
  drawGrid(graph);
  drawOverallTrend(graph, data);

  if (selectedFeature) {
    drawGroupTrends(graph, selectedFeature, data);
  }

  data.forEach((point) => drawPoint(graph, point, selectedFeature));
  drawLegend(graph, selectedFeature, mode);
}

function drawGrid(graph) {
  for (let value = 0; value <= axisMax; value += 1) {
    const x = graphX(value);
    const y = graphY(value);
    graph.append(
      svgElement("line", { class: "feature-grid-line", x1: x, y1: plot.top, x2: x, y2: plot.bottom }),
      svgElement("line", { class: "feature-grid-line", x1: plot.left, y1: y, x2: plot.right, y2: y }),
      svgElement("text", { class: "feature-x-tick", x, y: plot.bottom + 30 }, value),
      svgElement("text", { class: "feature-y-tick", x: plot.left - 12, y: y + 5 }, value)
    );
  }

  graph.append(
    svgElement("line", { class: "feature-axis-line", x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom }),
    svgElement("line", { class: "feature-axis-line", x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.bottom }),
    svgElement("text", { class: "feature-axis-label", x: plot.right - 10, y: plot.bottom + 64 }, "x"),
    svgElement("text", { class: "feature-axis-label feature-y-label", x: 20, y: plot.top + 12 }, "y")
  );
}

function drawOverallTrend(graph, data) {
  const fit = linearFit(data);
  drawFitLine(graph, fit, points, "feature-overall-line");
  graph.append(svgElement("text", {
    class: "feature-overall-label",
    x: graphX(3.9),
    y: graphY(fit.slope * 3.9 + fit.intercept) - 16
  }, "overall trend"));
}

function drawGroupTrends(graph, featureKey, data) {
  const groups = groupBy(data, featureKey);
  Array.from(groups.entries()).forEach(([value, groupPoints], index) => {
    const fit = linearFit(groupPoints);
    drawFitLine(graph, fit, groupPoints, "feature-group-line", linePalette[index % linePalette.length]);
    const labelPoint = groupPoints.reduce((rightmost, point) => point.x > rightmost.x ? point : rightmost, groupPoints[0]);
    graph.append(svgElement("text", {
      class: "feature-group-label",
      x: graphX(labelPoint.x) + 10,
      y: graphY(fit.slope * labelPoint.x + fit.intercept) + (index % 2 === 0 ? -8 : 18),
      fill: linePalette[index % linePalette.length]
    }, getFeatureValueLabel(featureKey, value)));
  });
}

function drawFitLine(graph, fit, linePoints, className, stroke = null) {
  const minX = Math.min(...linePoints.map((point) => point.x));
  const maxX = Math.max(...linePoints.map((point) => point.x));
  const attributes = {
    class: className,
    x1: graphX(minX),
    y1: graphY(fit.slope * minX + fit.intercept),
    x2: graphX(maxX),
    y2: graphY(fit.slope * maxX + fit.intercept)
  };
  if (stroke) attributes.stroke = stroke;
  graph.append(svgElement("line", attributes));
}

function drawPoint(graph, point, selectedFeature) {
  const group = svgElement("g", {
    class: `feature-point feature-point-${point.shape} feature-fill-${point.fill}${selectedFeature ? " has-grouping" : ""}`,
    transform: `translate(${graphX(point.x)} ${graphY(point.y)})`
  });

  const radius = point.size === "small" ? 7 : point.size === "medium" ? 9 : 11;
  const color = getColor(point.color).color;
  const isColorFill = point.fill === "color";
  const borderColor = isColorFill ? "none" : getBorder(point.border).color;
  const fillColor = isColorFill ? color : "#fffdf7";

  const attributes = {
    class: "feature-point-mark",
    fill: fillColor,
    "fill-opacity": 1,
    stroke: borderColor,
    "stroke-width": isColorFill ? 0 : 5
  };

  if (point.shape === "circle") {
    group.append(svgElement("circle", { ...attributes, r: radius }));
  } else if (point.shape === "square") {
    group.append(svgElement("rect", { ...attributes, x: -radius, y: -radius, width: radius * 2, height: radius * 2, rx: 2 }));
  } else {
    group.append(svgElement("path", { ...attributes, d: `M 0 ${-radius * 1.25} L ${radius * 1.25} 0 L 0 ${radius * 1.25} L ${-radius * 1.25} 0 Z` }));
  }

  graph.append(group);
}

function drawLegend(graph, selectedFeature, mode) {
  const legendY = 586;
  graph.append(svgElement("text", { class: "feature-legend-label", x: plot.left, y: legendY }, "overall line: all objects together"));

  if (!selectedFeature) {
    graph.append(svgElement("text", { class: "feature-legend-label", x: plot.left + 250, y: legendY }, mode === "overview" ? "all features are visible" : "choose a grouping feature"));
    return;
  }

  graph.append(svgElement("text", {
    class: "feature-legend-label",
    x: plot.left + 250,
    y: legendY
  }, `group lines: ${getFeatureLabel(selectedFeature)}`));
}

function updateButtons(controls, selectedFeature) {
  if (!controls) return;
  Array.from(controls.querySelectorAll(".feature-grouping-button")).forEach((button, index) => {
    const feature = features[index];
    button.classList.toggle("selected", feature.key === selectedFeature);
    button.classList.toggle("correct-feature", feature.key === selectedFeature && feature.key === correctFeature);
    button.classList.toggle("incorrect-feature", feature.key === selectedFeature && feature.key !== correctFeature);
  });
}

function updateFeedback(feedback, selectedFeature, mode, noiseLevel) {
  feedback.classList.toggle("good", selectedFeature === correctFeature);

  if (mode === "overview") {
    feedback.textContent = "The whole cloud slopes downward. But every object also has color, shape, size, border, and fill style.";
    return;
  }

  if (mode === "solved") {
    feedback.textContent = "Grouping by fill style reveals the reversal: each fill group slopes upward, while the whole cloud slopes downward.";
    return;
  }

  if (!selectedFeature) {
    feedback.textContent = "Choose a feature. The graph will draw one trend line for each group made by that feature.";
    return;
  }

  if (selectedFeature === correctFeature) {
    feedback.textContent = "Yes. Grouping by fill style creates the paradox: each group trends upward, but the combined trend is downward.";
    return;
  }

  const slopes = Array.from(groupBy(getNoisyPoints(noiseLevel), selectedFeature).values()).map((groupPoints) => linearFit(groupPoints).slope);
  const direction = slopes.every((slope) => slope > 0.12) ? "positive" : slopes.every((slope) => slope < -0.12) ? "negative" : "mixed";
  feedback.textContent = `Grouping by ${getFeatureLabel(selectedFeature)} gives ${direction} subgroup trends. It does not reverse the overall story.`;
}

function getNoisyPoints(level) {
  const amount = (level / 100) * maxNoise;
  return points.map((point) => {
    const noise = deterministicNoise(point.id);
    return {
      ...point,
      x: clamp(point.x + noise.x * amount),
      y: clamp(point.y + noise.y * amount)
    };
  });
}

function deterministicNoise(id) {
  let seed = 2166136261;
  for (const character of id) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  const next = () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  return { x: next() * 2 - 1, y: next() * 2 - 1 };
}

function clamp(value) {
  return Math.max(0.05, Math.min(axisMax - 0.05, value));
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    if (!groups.has(item[key])) groups.set(item[key], []);
    groups.get(item[key]).push(item);
    return groups;
  }, new Map());
}

function linearFit(items) {
  const meanX = items.reduce((sum, point) => sum + point.x, 0) / items.length;
  const meanY = items.reduce((sum, point) => sum + point.y, 0) / items.length;
  const numerator = items.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
  const denominator = items.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

function graphX(value) {
  return plot.left + (value / axisMax) * (plot.right - plot.left);
}

function graphY(value) {
  return plot.bottom - (value / axisMax) * (plot.bottom - plot.top);
}

function getColor(value) {
  return colors.find((color) => color.value === value);
}

function getBorder(value) {
  return borders.find((border) => border.value === value);
}

function getFeatureLabel(key) {
  return features.find((feature) => feature.key === key)?.label ?? key;
}

function getFeatureValueLabel(key, value) {
  if (key === "color") return getColor(value).label;
  if (key === "border") return getBorder(value).label;
  if (key === "fill") return fills.find((fill) => fill.value === value)?.label ?? value;
  return value;
}

function svgElement(tag, attributes, text = "") {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}
