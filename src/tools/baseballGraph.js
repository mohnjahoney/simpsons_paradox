import { battingAverage, battingPlayers, formatAverage, playerTotal } from "./baseballData.js";

const svgSize = 620;
const plot = { left: 72, right: 560, top: 42, bottom: 520 };
const maxAtBats = 100;
const maxHits = 30;

export function createBaseballGraph({ onComplete, mode = "season" } = {}) {
  const tool = document.createElement("div");
  tool.className = "baseball-tool baseball-graph-tool";

  const graph = svgElement("svg", {
    class: "baseball-graph",
    viewBox: `0 0 ${svgSize} ${svgSize}`,
    role: "img",
    "aria-label": "Hits versus at-bats graph"
  });

  const feedback = document.createElement("p");
  feedback.className = "baseball-feedback";
  feedback.setAttribute("aria-live", "polite");

  const button = document.createElement("button");
  button.className = "primary compact-tool-button";
  button.type = "button";

  let showOverall = false;
  let sortedByAtBats = false;

  if (mode === "overall") {
    button.textContent = "Show overall lines";
    feedback.textContent = "Each season segment has a slope. Overall uses the line from the origin to the player's total.";
  } else if (mode === "atBats") {
    button.textContent = "Sort by at-bats";
    feedback.textContent = "The same segments can be reorganized by comparable denominator size.";
  } else {
    button.hidden = true;
    feedback.textContent = "Slope means hits divided by at-bats, which is batting average.";
  }

  button.addEventListener("click", () => {
    if (mode === "overall") {
      showOverall = true;
      button.disabled = true;
      feedback.textContent = "The pale total lines reveal the reversal: Jackie's overall slope is steeper.";
    } else if (mode === "atBats") {
      sortedByAtBats = true;
      button.disabled = true;
      feedback.textContent = "Now the leaders are mixed: Arlo wins the 20 at-bat comparison, Jackie wins the 80 at-bat comparison.";
    }
    render();
    onComplete?.();
  });

  tool.append(graph, button, feedback);
  render();
  return tool;

  function render() {
    graph.replaceChildren();
    drawGrid(graph);
    battingPlayers.forEach((player) => drawPlayer(graph, player, { showOverall, sortedByAtBats }));
    drawLegend(graph, sortedByAtBats);
  }
}

function drawGrid(graph) {
  for (let value = 0; value <= maxAtBats; value += 20) {
    const x = graphX(value);
    graph.append(svgElement("line", { class: "baseball-grid-line", x1: x, y1: plot.top, x2: x, y2: plot.bottom }));
    graph.append(svgElement("text", { class: "baseball-x-tick", x, y: plot.bottom + 30 }, value));
  }

  for (let value = 0; value <= maxHits; value += 5) {
    const y = graphY(value);
    graph.append(svgElement("line", { class: "baseball-grid-line", x1: plot.left, y1: y, x2: plot.right, y2: y }));
    graph.append(svgElement("text", { class: "baseball-y-tick", x: plot.left - 12, y: y + 5 }, value));
  }

  graph.append(svgElement("line", { class: "baseball-axis-line", x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom }));
  graph.append(svgElement("line", { class: "baseball-axis-line", x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.bottom }));
  graph.append(svgElement("text", { class: "baseball-axis-label", x: plot.right - 12, y: plot.bottom + 64 }, "at-bats"));
  graph.append(svgElement("text", { class: "baseball-axis-label baseball-y-label", x: 16, y: plot.top + 12 }, "hits"));
}

function drawPlayer(graph, player, { showOverall, sortedByAtBats }) {
  const segments = sortedByAtBats
    ? [...player.seasons].sort((a, b) => a.atBats - b.atBats)
    : player.seasons;

  let start = { atBats: 0, hits: 0 };
  segments.forEach((season, index) => {
    const end = { atBats: start.atBats + season.atBats, hits: start.hits + season.hits };
    graph.append(svgElement("line", {
      class: `baseball-season-line ${player.className}-line season-${index + 1}`,
      x1: graphX(start.atBats),
      y1: graphY(start.hits),
      x2: graphX(end.atBats),
      y2: graphY(end.hits)
    }));
    graph.append(svgElement("circle", {
      class: `baseball-point ${player.className}-point`,
      cx: graphX(end.atBats),
      cy: graphY(end.hits),
      r: 7
    }));
    start = end;
  });

  const total = playerTotal(player);
  if (showOverall) {
    graph.append(svgElement("line", {
      class: `baseball-overall-line ${player.className}-overall`,
      x1: graphX(0),
      y1: graphY(0),
      x2: graphX(total.atBats),
      y2: graphY(total.hits)
    }));
  }

  graph.append(svgElement("text", {
    class: `baseball-player-label ${player.className}-label`,
    x: graphX(total.atBats) - 6,
    y: graphY(total.hits) - (player.name === "Jackie" ? 16 : -24)
  }, `${player.name} ${formatAverage(battingAverage(total))}`));
}

function drawLegend(graph, sortedByAtBats) {
  const labels = sortedByAtBats
    ? ["first segment: 20 at-bats", "second segment: 80 at-bats"]
    : ["solid: 2018", "dashed: 2019"];

  labels.forEach((label, index) => {
    graph.append(svgElement("text", {
      class: "baseball-legend-label",
      x: plot.left + index * 170,
      y: 590
    }, label));
  });
}

function graphX(atBats) {
  return plot.left + (atBats / maxAtBats) * (plot.right - plot.left);
}

function graphY(hits) {
  return plot.bottom - (hits / maxHits) * (plot.bottom - plot.top);
}

function svgElement(tag, attributes, text = "") {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}
