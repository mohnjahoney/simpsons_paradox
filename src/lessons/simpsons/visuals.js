import { battingAverage, battingPlayers, formatAverage } from "./tools/baseballData.js";

export const visualRenderers = {
  battingWeights: createBattingWeights,
  trendReversal: createTrendReversal
};

function createBattingWeights() {
  const visual = document.createElement("figure");
  visual.className = "batting-weight-visual";
  visual.setAttribute("aria-label", "Season blocks sized by at-bats. Jackie has 20 at-bats at .050 and 80 at-bats at .300. Arlo has 80 at-bats at .150 and 20 at-bats at .500.");

  const heading = document.createElement("figcaption");
  heading.className = "batting-weight-heading";
  heading.textContent = "How much each season counts";

  const key = document.createElement("p");
  key.className = "batting-weight-key";
  key.textContent = "Block width = how much the season counts";

  const rows = document.createElement("div");
  rows.className = "batting-weight-rows";
  battingPlayers.forEach((player) => rows.append(createBattingWeightRow(player)));

  visual.append(heading, key, rows);
  return visual;
}

function createBattingWeightRow(player) {
  const row = document.createElement("section");
  row.className = `batting-weight-row ${player.className}-weight-row`;

  const name = document.createElement("h4");
  name.textContent = player.name;

  const bar = document.createElement("div");
  bar.className = "batting-weight-bar";
  bar.style.gridTemplateColumns = player.seasons.map((season) => `${season.atBats}fr`).join(" ");

  const strongestRate = Math.max(...player.seasons.map(battingAverage));
  player.seasons.forEach((season) => {
    const rate = battingAverage(season);
    const block = document.createElement("div");
    block.className = `batting-season-block ${player.className}-season-block`;
    if (rate === strongestRate) block.classList.add("is-stronger-season");
    block.setAttribute("aria-label", `${player.name}, ${season.year}: ${formatWeightRate(rate)} over ${season.atBats} at-bats`);

    const year = document.createElement("span");
    year.className = "batting-season-year";
    year.textContent = season.year;

    const average = document.createElement("strong");
    average.className = "batting-season-rate";
    average.textContent = formatWeightRate(rate);

    const count = document.createElement("span");
    count.className = "batting-season-count";
    count.textContent = `${season.atBats} at-bats`;

    block.append(year, average, count);
    bar.append(block);
  });

  const strongestSeason = player.seasons.find((season) => battingAverage(season) === strongestRate);
  const note = document.createElement("p");
  note.className = "batting-weight-note";
  note.textContent = `Stronger season: ${formatWeightRate(strongestRate)} across ${strongestSeason.atBats} at-bats.`;

  row.append(name, bar, note);
  return row;
}

function formatWeightRate(value) {
  return formatAverage(value).replace(/^0/, "");
}

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
