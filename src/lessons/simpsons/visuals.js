export const visualRenderers = {
  trendReversal: createTrendReversal
};

function createTrendReversal() {
  const equation = document.createElement("div");
  equation.className = "trend-reversal-equation";
  equation.setAttribute("role", "img");
  equation.setAttribute("aria-label", "The red-fish trend rises and the blue-fish trend rises, but the combined trend falls.");

  equation.append(
    createTrendIcon("Red fish", "rise", "red"),
    createEquationSymbol("+"),
    createTrendIcon("Blue fish", "rise", "blue"),
    createEquationSymbol("="),
    createTrendIcon("All fish", "fall", "combined")
  );

  return equation;
}

function createTrendIcon(label, direction, color) {
  const icon = document.createElement("div");
  icon.className = `trend-icon trend-icon-${color}`;

  const labelElement = document.createElement("span");
  labelElement.className = "trend-icon-label";
  labelElement.textContent = label;

  const graph = svgElement("svg", { viewBox: "0 0 120 82", "aria-hidden": "true" });
  graph.classList.add("trend-icon-graph");
  graph.append(
    svgElement("path", { d: "M 18 12 V 67 H 108", class: "trend-icon-axis" }),
    svgElement("path", {
      d: direction === "rise" ? "M 30 56 L 94 22" : "M 30 24 L 94 57",
      class: "trend-icon-line"
    }),
    svgElement("circle", { cx: 30, cy: direction === "rise" ? 56 : 24, r: 4, class: "trend-icon-dot" }),
    svgElement("circle", { cx: 94, cy: direction === "rise" ? 22 : 57, r: 4, class: "trend-icon-dot" })
  );

  icon.append(labelElement, graph);
  return icon;
}

function createEquationSymbol(value) {
  const symbol = document.createElement("span");
  symbol.className = "trend-equation-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = value;
  return symbol;
}

function svgElement(tagName, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}
