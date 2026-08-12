const initialCounts = {
  A: {
    males: { effective: 2, notEffective: 3 },
    females: { effective: 2, notEffective: 0 }
  },
  B: {
    males: { effective: 0, notEffective: 2 },
    females: { effective: 3, notEffective: 2 }
  }
};

const groups = ["males", "females"];
const vaccines = ["A", "B"];
const outcomes = ["effective", "notEffective"];
const vaccineColors = {
  A: "#d7656a",
  B: "#4388c9"
};
const vaccineSoftColors = {
  A: "#efb7ba",
  B: "#a9c9e8"
};

const svgSize = 620;
const plot = { left: 76, right: 560, top: 42, bottom: 520 };

export function createVaccineChallenge({ onComplete, mode = "challenge" } = {}) {
  const state = cloneCounts(initialCounts);
  const readOnly = mode === "readOnly";
  const completed = { value: false };
  const tool = document.createElement("div");
  tool.className = `vaccine-tool vaccine-mode-${mode}`;

  const table = createVaccineTable(state);
  const graph = createGraph();
  const feedback = document.createElement("p");
  feedback.className = "vaccine-feedback";
  feedback.setAttribute("aria-live", "polite");

  const controls = readOnly ? null : document.createElement("div");
  if (controls) {
    controls.className = "vaccine-tool-controls";

    const reset = document.createElement("button");
    reset.className = "secondary compact-tool-button";
    reset.type = "button";
    reset.textContent = "Reset";
    reset.addEventListener("click", () => {
      copyCounts(initialCounts, state);
      update();
    });

    controls.append(reset);
  }

  if (mode === "guided" && controls) {
    const example = document.createElement("button");
    example.className = "primary compact-tool-button";
    example.type = "button";
    example.textContent = "Try a strong imbalance";
    example.addEventListener("click", () => {
      copyCounts({
        A: {
          males: { effective: 50, notEffective: 50 },
          females: { effective: 7, notEffective: 3 }
        },
        B: {
          males: { effective: 4, notEffective: 6 },
          females: { effective: 60, notEffective: 40 }
        }
      }, state);
      update();
    });
    controls.prepend(example);
  }

  const layout = document.createElement("div");
  layout.className = "vaccine-layout";
  layout.append(table, graph);
  tool.append(layout);
  if (controls) tool.append(controls);
  tool.append(feedback);

  update();
  return tool;

  function update() {
    syncInputs(table, state);
    updateTotals(table, state);
    updateProbabilities(table, state);
    drawGraph(graph, state);

    const result = checkConditions(state);
    feedback.textContent = getFeedback(result, mode);

    if (!completed.value && result.success) {
      completed.value = true;
      tool.classList.add("vaccine-success");
      onComplete?.();
    } else if (!result.success) {
      completed.value = false;
      tool.classList.remove("vaccine-success");
    }
  }

  function createVaccineTable(counts) {
    const table = document.createElement("table");
    table.className = "vaccine-table";

    const head = document.createElement("thead");
    head.innerHTML = `
      <tr>
        <th rowspan="2">Vaccine</th>
        <th colspan="2">Males</th>
        <th colspan="2">Females</th>
        <th colspan="2">All people</th>
      </tr>
      <tr>
        <th>Effective</th>
        <th>Not effective</th>
        <th>Effective</th>
        <th>Not effective</th>
        <th>Effective</th>
        <th>Not effective</th>
      </tr>
    `;

    const body = document.createElement("tbody");
    vaccines.forEach((vaccine) => {
      const row = document.createElement("tr");
      row.className = `vaccine-row vaccine-${vaccine.toLowerCase()}-row`;
      const label = document.createElement("th");
      label.scope = "row";
      label.textContent = `Vaccine ${vaccine}`;
      row.append(label);

      groups.forEach((group) => {
        outcomes.forEach((outcome) => {
          const cell = document.createElement("td");
          const input = document.createElement("input");
          input.className = "vaccine-count-input";
          input.type = "number";
          input.min = "0";
          input.max = "200";
          input.step = "1";
          input.inputMode = "numeric";
          input.value = counts[vaccine][group][outcome];
          input.disabled = readOnly;
          input.dataset.vaccine = vaccine;
          input.dataset.group = group;
          input.dataset.outcome = outcome;
          input.setAttribute("aria-label", `Vaccine ${vaccine} ${group} ${outcome}`);
          input.addEventListener("input", () => {
            counts[vaccine][group][outcome] = clampCount(input.value);
            update();
          });
          cell.append(input);
          row.append(cell);
        });
      });

      outcomes.forEach((outcome) => {
        const cell = document.createElement("td");
        cell.className = "vaccine-total-cell";
        cell.dataset.vaccine = vaccine;
        cell.dataset.outcome = outcome;
        row.append(cell);
      });

      body.append(row);
    });

    const probabilityBody = document.createElement("tbody");
    probabilityBody.className = "vaccine-probability-body";
    vaccines.forEach((vaccine) => {
      const row = document.createElement("tr");
      row.className = `vaccine-probability-row vaccine-${vaccine.toLowerCase()}-probability-row`;
      const label = document.createElement("th");
      label.scope = "row";
      label.textContent = `Pr(effective | ${vaccine})`;
      row.append(label);

      ["males", "females", "total"].forEach((group) => {
        const cell = document.createElement("td");
        cell.className = "vaccine-probability-cell";
        cell.colSpan = 2;
        cell.dataset.vaccine = vaccine;
        cell.dataset.group = group;
        row.append(cell);
      });

      probabilityBody.append(row);
    });

    table.append(head, body, probabilityBody);
    return table;
  }

  function createGraph() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("vaccine-graph");
    svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Effective outcomes versus number treated for two vaccines");
    return svg;
  }
}

function drawGraph(svg, counts) {
  svg.replaceChildren();
  const paths = Object.fromEntries(vaccines.map((vaccine) => [vaccine, getCumulativePoints(counts[vaccine])]));
  const maxTreated = Math.max(10, ...vaccines.flatMap((vaccine) => paths[vaccine].map((point) => point.treated)));
  const maxEffective = Math.max(10, ...vaccines.flatMap((vaccine) => paths[vaccine].map((point) => point.effective)));
  const xMax = niceMax(maxTreated);
  const yMax = niceMax(maxEffective);

  for (let value = 0; value <= xMax; value += Math.max(5, xMax / 5)) {
    const x = graphX(value, xMax);
    svg.append(svgElement("line", { class: "vaccine-grid-line", x1: x, y1: plot.top, x2: x, y2: plot.bottom }));
    svg.append(svgElement("text", { class: "vaccine-x-tick", x, y: plot.bottom + 30 }, Math.round(value)));
  }

  for (let value = 0; value <= yMax; value += Math.max(5, yMax / 5)) {
    const y = graphY(value, yMax);
    svg.append(svgElement("line", { class: "vaccine-grid-line", x1: plot.left, y1: y, x2: plot.right, y2: y }));
    svg.append(svgElement("text", { class: "vaccine-y-tick", x: plot.left - 12, y: y + 5 }, Math.round(value)));
  }

  svg.append(svgElement("line", { class: "vaccine-axis-line", x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom }));
  svg.append(svgElement("line", { class: "vaccine-axis-line", x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.bottom }));
  svg.append(svgElement("text", { class: "vaccine-axis-label", x: plot.right - 10, y: plot.bottom + 64 }, "number treated"));
  svg.append(svgElement("text", { class: "vaccine-axis-label vaccine-y-label", x: 18, y: plot.top + 12 }, "effective"));

  vaccines.forEach((vaccine) => {
    const points = paths[vaccine];
    const colorClass = `vaccine-${vaccine.toLowerCase()}`;
    const total = points.at(-1);
    svg.append(svgElement("line", {
      class: `vaccine-overall-line ${colorClass}-overall-line`,
      x1: graphX(0, xMax),
      y1: graphY(0, yMax),
      x2: graphX(total.treated, xMax),
      y2: graphY(total.effective, yMax)
    }));

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      svg.append(svgElement("line", {
        class: `vaccine-segment-line ${colorClass}-segment-line segment-${index + 1}`,
        x1: graphX(start.treated, xMax),
        y1: graphY(start.effective, yMax),
        x2: graphX(end.treated, xMax),
        y2: graphY(end.effective, yMax)
      }));
    }

    points.forEach((point) => {
      svg.append(svgElement("circle", {
        class: `vaccine-point ${colorClass}-point`,
        cx: graphX(point.treated, xMax),
        cy: graphY(point.effective, yMax),
        r: 7
      }));
    });

    svg.append(svgElement("text", {
      class: `vaccine-player-label ${colorClass}-label`,
      x: graphX(total.treated, xMax) - 4,
      y: graphY(total.effective, yMax) + (vaccine === "A" ? -18 : 28)
    }, `Vaccine ${vaccine}`));
  });
}

function updateTotals(table, counts) {
  vaccines.forEach((vaccine) => {
    outcomes.forEach((outcome) => {
      const total = groups.reduce((sum, group) => sum + counts[vaccine][group][outcome], 0);
      table.querySelector(`[data-vaccine="${vaccine}"][data-outcome="${outcome}"].vaccine-total-cell`).textContent = total;
    });
  });
}

function updateProbabilities(table, counts) {
  const conditions = checkConditions(counts);
  ["males", "females", "total"].forEach((group) => {
    vaccines.forEach((vaccine) => {
      const cell = table.querySelector(`[data-vaccine="${vaccine}"][data-group="${group}"].vaccine-probability-cell`);
      const stat = group === "total" ? totalStats(counts[vaccine]) : counts[vaccine][group];
      cell.textContent = ratioLabel(stat);
      cell.classList.toggle("winning-probability", conditions.winners[group] === vaccine);
    });
  });
}

function syncInputs(table, counts) {
  table.querySelectorAll(".vaccine-count-input").forEach((input) => {
    const { vaccine, group, outcome } = input.dataset;
    if (document.activeElement !== input) input.value = counts[vaccine][group][outcome];
  });
}

function getFeedback(result, mode) {
  if (result.success) {
    return "You made the reversal: A wins for males and females, but B wins overall.";
  }

  if (mode === "guided") {
    return "Adjust the counts, or try the imbalance button. Aim for A, A, then B in the highlighted probabilities.";
  }

  const labels = [
    result.males ? "males ok" : "males need A",
    result.females ? "females ok" : "females need A",
    result.total ? "overall ok" : "overall needs B"
  ];
  return labels.join(" | ");
}

function checkConditions(counts) {
  const winners = {
    males: winnerFor(counts, "males"),
    females: winnerFor(counts, "females"),
    total: winnerFor(counts, "total")
  };
  const result = {
    winners,
    males: winners.males === "A",
    females: winners.females === "A",
    total: winners.total === "B"
  };
  result.success = result.males && result.females && result.total;
  return result;
}

function winnerFor(counts, group) {
  const a = group === "total" ? probability(totalStats(counts.A)) : probability(counts.A[group]);
  const b = group === "total" ? probability(totalStats(counts.B)) : probability(counts.B[group]);
  if (a > b) return "A";
  if (b > a) return "B";
  return "tie";
}

function getCumulativePoints(vaccineCounts) {
  const points = [{ treated: 0, effective: 0 }];
  groups.forEach((group) => {
    const last = points.at(-1);
    const stat = vaccineCounts[group];
    points.push({
      treated: last.treated + stat.effective + stat.notEffective,
      effective: last.effective + stat.effective
    });
  });
  return points;
}

function totalStats(vaccineCounts) {
  return groups.reduce(
    (total, group) => ({
      effective: total.effective + vaccineCounts[group].effective,
      notEffective: total.notEffective + vaccineCounts[group].notEffective
    }),
    { effective: 0, notEffective: 0 }
  );
}

function probability(stat) {
  const total = stat.effective + stat.notEffective;
  return total === 0 ? 0 : stat.effective / total;
}

function ratioLabel(stat) {
  const total = stat.effective + stat.notEffective;
  return `${stat.effective}/${total} = ${probability(stat).toFixed(3).replace(/^0/, "")}`;
}

function graphX(value, max) {
  return plot.left + (value / max) * (plot.right - plot.left);
}

function graphY(value, max) {
  return plot.bottom - (value / max) * (plot.bottom - plot.top);
}

function niceMax(value) {
  return Math.ceil(value / 20) * 20;
}

function clampCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(200, parsed));
}

function cloneCounts(counts) {
  return JSON.parse(JSON.stringify(counts));
}

function copyCounts(source, target) {
  vaccines.forEach((vaccine) => {
    groups.forEach((group) => {
      outcomes.forEach((outcome) => {
        target[vaccine][group][outcome] = source[vaccine][group][outcome];
      });
    });
  });
}

function svgElement(tag, attributes, text = "") {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}
