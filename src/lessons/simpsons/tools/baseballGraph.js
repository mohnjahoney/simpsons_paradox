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

  if (mode === "overall") {
    const question = document.createElement("h3");
    question.className = "baseball-slope-question";
    tool.append(question, graph, feedback);
    createSlopeComparisonLesson({ graph, question, feedback, onComplete });
    return tool;
  }

  const button = document.createElement("button");
  button.className = "primary compact-tool-button";
  button.type = "button";

  let showOverall = false;
  let sortedByAtBats = false;
  if (mode === "atBats") {
    button.textContent = "Sort by at-bats";
    feedback.textContent = "The same segments can be reorganized by comparable denominator size.";
  } else {
    button.textContent = "Show overall lines";
    button.disabled = true;
    button.setAttribute("aria-hidden", "true");
    button.classList.add("tool-button-placeholder");
    feedback.textContent = "Slope means hits divided by at-bats, which is batting average.";
  }

  button.addEventListener("click", () => {
    if (mode === "atBats") {
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
    if (mode === "season") drawSeasonConstruction(graph, feedback);
    else battingPlayers.forEach((player) => drawPlayer(graph, player, { showOverall, sortedByAtBats }));
    drawLegend(graph, sortedByAtBats);
  }
}

function createSlopeComparisonLesson({ graph, question, feedback, onComplete }) {
  const normalizedRun = 30;
  const [jackie, arlo] = battingPlayers;
  const jackiePoints = cumulativePoints(jackie.seasons);
  const arloPoints = cumulativePoints(arlo.seasons);
  const stages = [
    {
      label: "2018",
      contestants: [
        { player: jackie, start: jackiePoints[0], end: jackiePoints[1] },
        { player: arlo, start: arloPoints[0], end: arloPoints[1] }
      ]
    },
    {
      label: "2019",
      contestants: [
        { player: jackie, start: jackiePoints[1], end: jackiePoints[2] },
        { player: arlo, start: arloPoints[1], end: arloPoints[2] }
      ]
    },
    {
      label: "overall",
      contestants: [
        { player: jackie, start: jackiePoints[0], end: jackiePoints[2] },
        { player: arlo, start: arloPoints[0], end: arloPoints[2] }
      ]
    }
  ];
  const comparisonOrigin = { x: 205, y: 340 };
  let stageIndex = 0;
  let completed = false;

  graph.classList.add("baseball-overall-lesson");
  graph.setAttribute("role", "group");
  graph.setAttribute("aria-label", "Interactive batting-average slope comparison");
  drawGrid(graph, "baseball-main-structure");
  graph.querySelectorAll(".baseball-main-structure").forEach((element) => element.setAttribute("aria-hidden", "true"));
  presentStage();

  function presentStage() {
    const stage = stages[stageIndex];

    question.textContent = `Which ${stage.label} segment has the greater slope?`;
    feedback.textContent = "Select a gray segment. Both lines use the same horizontal run, so compare only how much they rise.";

    const stageGroup = svgElement("g", { class: `baseball-slope-stage baseball-slope-stage-${stage.label}` });
    stageGroup.append(svgElement("text", {
      class: "baseball-slope-stage-label",
      x: comparisonOrigin.x,
      y: comparisonOrigin.y - 276
    }, stage.label === "overall" ? "Combined totals" : stage.label));

    const choices = stage.contestants.map((contestant) => createSlopeChoice(contestant, stageGroup));
    graph.append(stageGroup);

    function createSlopeChoice(contestant, parent) {
      const { player, start, end } = contestant;
      const slope = battingAverage({ hits: end.hits - start.hits, atBats: end.atBats - start.atBats });
      const runPixels = graphX(normalizedRun) - graphX(0);
      const risePixels = graphY(0) - graphY(slope * normalizedRun);
      const choice = svgElement("g", {
        class: `baseball-slope-choice ${player.className}-slope-choice`,
        transform: `translate(${comparisonOrigin.x} ${comparisonOrigin.y})`,
        role: "button",
        tabindex: 0,
        "aria-label": `Select ${player.name}'s ${stage.label} segment`
      });
      const line = svgElement("line", {
        class: "baseball-slope-choice-line",
        x1: 0,
        y1: 0,
        x2: runPixels,
        y2: -risePixels,
        "vector-effect": "non-scaling-stroke"
      });
      const hitArea = svgElement("line", {
        class: "baseball-slope-hit-area",
        x1: 0,
        y1: 0,
        x2: runPixels,
        y2: -risePixels
      });
      const label = svgElement("text", {
        class: "baseball-slope-choice-label",
        x: runPixels + 12,
        y: -risePixels + (player === jackie ? -7 : 16)
      }, player.name);
      choice.append(line, hitArea, label);
      parent.append(choice);

      const select = () => {
        if (stageGroup.classList.contains("is-resolving")) return;
        const winner = stage.contestants.reduce((best, current) => {
          const bestSlope = battingAverage({ hits: best.end.hits - best.start.hits, atBats: best.end.atBats - best.start.atBats });
          const currentSlope = battingAverage({ hits: current.end.hits - current.start.hits, atBats: current.end.atBats - current.start.atBats });
          return currentSlope > bestSlope ? current : best;
        });

        if (winner.player !== player) {
          choice.classList.add("is-incorrect");
          feedback.textContent = `${player.name}'s segment rises less over the same run. Try the other line.`;
          return;
        }

        stageGroup.classList.add("is-resolving");
        choice.classList.add("is-winner");
        feedback.textContent = `Yes. ${player.name}'s ${stage.label} segment has the greater slope.`;
        moveChoicesToGraph(choices, stage);
      };

      choice.addEventListener("click", select);
      choice.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
      return choice;
    }
  }

  function moveChoicesToGraph(choices, stage) {
    graph.classList.add("has-main-graph");
    graph.querySelectorAll(".baseball-main-structure").forEach((element) => element.removeAttribute("aria-hidden"));
    choices.forEach((choice, index) => {
      const { start, end } = stage.contestants[index];
      const scale = (end.atBats - start.atBats) / normalizedRun;
      const targetTransform = `translate(${graphX(start.atBats)}px, ${graphY(start.hits)}px) scale(${scale})`;
      choice.classList.add("is-placed");
      choice.removeAttribute("role");
      choice.removeAttribute("tabindex");
      choice.setAttribute("aria-hidden", "true");
      choice.animate(
        [
          { transform: `translate(${comparisonOrigin.x}px, ${comparisonOrigin.y}px) scale(1)` },
          { transform: targetTransform }
        ],
        { duration: 720, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "forwards" }
      );
    });

    window.setTimeout(() => {
      stageIndex += 1;
      if (stageIndex < stages.length) {
        presentStage();
        return;
      }

      question.hidden = true;
      feedback.textContent = "The comparison reverses: Arlo's segments are steeper in both seasons, but Jackie's overall line is steeper.";
      if (!completed) {
        completed = true;
        onComplete?.();
      }
    }, 820);
  }
}

function drawSeasonConstruction(graph, feedback) {
  const [jackie, arlo] = battingPlayers;
  const jackiePoints = cumulativePoints(jackie.seasons);
  const arloPoints = cumulativePoints(arlo.seasons);
  const legFadeDelay = 12.8;
  const jackieLineDuration = 2;
  const arloLineDuration = 1;

  drawSlopeTriangle(graph, jackiePoints[0], jackiePoints[1], jackie, 0, legFadeDelay, 1, jackieLineDuration);
  drawSlopeTriangle(graph, jackiePoints[1], jackiePoints[2], jackie, 6, legFadeDelay, 2, jackieLineDuration);

  drawAnimatedSegment(graph, arloPoints[0], arloPoints[1], arlo, 13.8, 1, arloLineDuration);
  drawAnimatedSegment(graph, arloPoints[1], arloPoints[2], arlo, 14.8, 2, arloLineDuration);

  drawAnimatedLabel(graph, jackie, jackiePoints[2], 12.3);
  drawAnimatedLabel(graph, arlo, arloPoints[2], 16.1);

  scheduleComment(feedback, "20 at-bats in 2018", 2);
  scheduleComment(feedback, "1 hit in 2018", 4);
  scheduleComment(feedback, "1 hit in 2018", 6);
  scheduleComment(feedback, "out of 20 at-bats in 2018", 7.1);
  scheduleComment(feedback, "80 at-bats in 2019", 8);
  scheduleComment(feedback, "24 hits in 2019", 10);
  scheduleComment(feedback, "24 hits in 2019", 12);
  scheduleComment(feedback, "out of 80 at-bats in 2019", 13.1);
  scheduleComment(feedback, "12 hits in 2018", 14.8);
  scheduleComment(feedback, "out of 80 at-bats in 2018", 15.1);
  scheduleComment(feedback, "10 hits in 2019", 15.8);
  scheduleComment(feedback, "out of 20 at-bats in 2019", 16.1);
  scheduleComment(feedback, "Slope means hits divided by at-bats, which is batting average.", 17.3);
}

function scheduleComment(feedback, text, delay) {
  window.setTimeout(() => { feedback.textContent = text; }, delay * 1000);
}

function cumulativePoints(seasons) {
  const points = [{ atBats: 0, hits: 0 }];
  seasons.forEach((season) => {
    const previous = points.at(-1);
    points.push({
      atBats: previous.atBats + season.atBats,
      hits: previous.hits + season.hits
    });
  });
  return points;
}

function drawSlopeTriangle(graph, start, end, player, delay, fadeDelay, seasonIndex, lineDuration) {
  const corner = { atBats: end.atBats, hits: start.hits };
  graph.append(
    createConstructionLeg(start, corner, player, delay, fadeDelay, lineDuration),
    createConstructionLeg(corner, end, player, delay + lineDuration, fadeDelay, lineDuration),
    createSeasonSegment(start, end, player, delay + lineDuration * 2, seasonIndex, lineDuration),
    createAnimatedPoint(end, player, delay + lineDuration * 3)
  );
}

function drawAnimatedSegment(graph, start, end, player, delay, seasonIndex, lineDuration) {
  graph.append(
    createSeasonSegment(start, end, player, delay, seasonIndex, lineDuration),
    createAnimatedPoint(end, player, delay + lineDuration)
  );
}

function createConstructionLeg(start, end, player, delay, fadeDelay, lineDuration) {
  const leg = svgElement("line", {
    class: `baseball-construction-leg ${player.className}-construction-leg`,
    x1: graphX(start.atBats),
    y1: graphY(start.hits),
    x2: graphX(end.atBats),
    y2: graphY(end.hits),
    pathLength: 1
  });
  setAnimationTiming(leg, delay, fadeDelay, lineDuration);
  return leg;
}

function createSeasonSegment(start, end, player, delay, seasonIndex, lineDuration) {
  const segment = svgElement("line", {
    class: `baseball-season-line baseball-animated-line ${player.className}-line season-${seasonIndex}`,
    x1: graphX(start.atBats),
    y1: graphY(start.hits),
    x2: graphX(end.atBats),
    y2: graphY(end.hits),
    pathLength: 1
  });
  setAnimationTiming(segment, delay, undefined, lineDuration);
  return segment;
}

function createAnimatedPoint(point, player, delay) {
  const marker = svgElement("circle", {
    class: `baseball-point baseball-animated-point ${player.className}-point`,
    cx: graphX(point.atBats),
    cy: graphY(point.hits),
    r: 7
  });
  setAnimationTiming(marker, delay);
  return marker;
}

function drawAnimatedLabel(graph, player, point, delay) {
  const label = svgElement("text", {
    class: `baseball-player-label baseball-animated-label ${player.className}-label`,
    x: graphX(point.atBats) - 6,
    y: graphY(point.hits) - (player.name === "Jackie" ? 16 : -24)
  }, `${player.name} ${formatAverage(battingAverage(playerTotal(player)))}`);
  setAnimationTiming(label, delay);
  graph.append(label);
}

function setAnimationTiming(element, delay, fadeDelay, duration) {
  element.style.setProperty("--draw-delay", `${delay}s`);
  if (fadeDelay !== undefined) element.style.setProperty("--fade-delay", `${fadeDelay}s`);
  if (duration !== undefined) element.style.setProperty("--draw-duration", `${duration}s`);
}

function drawGrid(graph, additionalClass = "") {
  const className = (name) => `${name} ${additionalClass}`.trim();
  for (let value = 0; value <= maxAtBats; value += 20) {
    const x = graphX(value);
    graph.append(svgElement("line", { class: className("baseball-grid-line"), x1: x, y1: plot.top, x2: x, y2: plot.bottom }));
    graph.append(svgElement("text", { class: className("baseball-x-tick"), x, y: plot.bottom + 30 }, value));
  }

  for (let value = 0; value <= maxHits; value += 5) {
    const y = graphY(value);
    graph.append(svgElement("line", { class: className("baseball-grid-line"), x1: plot.left, y1: y, x2: plot.right, y2: y }));
    graph.append(svgElement("text", { class: className("baseball-y-tick"), x: plot.left - 12, y: y + 5 }, value));
  }

  graph.append(svgElement("line", { class: className("baseball-axis-line"), x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom }));
  graph.append(svgElement("line", { class: className("baseball-axis-line"), x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.bottom }));
  graph.append(svgElement("text", { class: className("baseball-axis-label"), x: plot.right - 12, y: plot.bottom + 64 }, "at-bats"));
  graph.append(svgElement("text", { class: className("baseball-axis-label baseball-y-label"), x: 16, y: plot.top + 12 }, "hits"));
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
      class: `baseball-point season-point season-${index + 1} ${player.className}-point`,
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
