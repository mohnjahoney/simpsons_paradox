import { battingAverage, battingPlayers, formatAverage, playerTotal } from "./baseballData.js";

export function createBaseballStats({ onComplete, mode = "seasons" } = {}) {
  const tool = document.createElement("div");
  tool.className = "baseball-tool baseball-stats-tool";
  if (mode === "overall") tool.classList.add("overall-reveal");

  const table = document.createElement("table");
  table.className = "batting-table";
  table.append(createTableHead(mode === "overall"));

  const body = document.createElement("tbody");
  battingPlayers.forEach((player) => body.append(createPlayerRow(player, mode === "overall")));
  table.append(body);

  const feedback = document.createElement("p");
  feedback.className = "baseball-feedback";
  feedback.setAttribute("aria-live", "polite");

  if (mode === "overall") {
    const button = document.createElement("button");
    button.className = "primary compact-tool-button";
    button.type = "button";
    button.textContent = "Reveal overall totals";
    feedback.textContent = "First compare the two seasons, then reveal the combined totals.";
    tool.append(table, button, feedback);

    button.addEventListener("click", () => {
      tool.classList.add("show-overall");
      button.disabled = true;
      feedback.textContent = "Jackie wins overall: .250 beats .220, even though Arlo won both seasons.";
      onComplete?.();
    });
  } else {
    feedback.textContent = "Arlo has the higher batting average in 2018 and in 2019.";
    tool.append(table, feedback);
  }

  return tool;
}

function createTableHead(showOverall) {
  const head = document.createElement("thead");
  const row = document.createElement("tr");
  ["Player", "2018", "2019"].forEach((label) => row.append(createCell("th", label)));
  const overall = createCell("th", "Total");
  overall.className = "overall-column";
  if (!showOverall) overall.hidden = true;
  row.append(overall);
  head.append(row);
  return head;
}

function createPlayerRow(player, showOverall) {
  const row = document.createElement("tr");
  row.className = `batting-player-row ${player.className}-row`;

  const name = createCell("th", player.name);
  name.scope = "row";
  row.append(name);

  player.seasons.forEach((season) => {
    row.append(createCell("td", statLabel(season)));
  });

  const total = playerTotal(player);
  const overall = createCell("td", statLabel(total));
  overall.className = "overall-column";
  if (!showOverall) overall.hidden = true;
  row.append(overall);
  return row;
}

function statLabel(stat) {
  return `${stat.hits}/${stat.atBats} = ${formatAverage(battingAverage(stat))}`;
}

function createCell(tag, text) {
  const cell = document.createElement(tag);
  cell.textContent = text;
  return cell;
}
