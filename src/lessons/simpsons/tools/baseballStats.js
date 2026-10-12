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
    const question = createCombineQuestion(tool, feedback, onComplete);
    feedback.textContent = "Use the counts from both seasons to make one overall batting average.";
    tool.append(table, question, feedback);
  } else {
    const button = document.createElement("button");
    button.className = "primary compact-tool-button tool-button-placeholder";
    button.type = "button";
    button.textContent = "Reveal overall totals";
    button.disabled = true;
    button.setAttribute("aria-hidden", "true");
    feedback.textContent = "Arlo has the higher batting average in 2018 and in 2019.";
    tool.append(table, button, feedback);
  }

  return tool;
}

function createCombineQuestion(tool, feedback, onComplete) {
  const question = document.createElement("section");
  question.className = "baseball-combine-question";

  const heading = document.createElement("h3");
  heading.textContent = "You have one batting average for each season. How do you combine them?";

  const choices = document.createElement("div");
  choices.className = "choices";
  const options = [
    "(hits in 2018 + hits in 2019) ÷ (at-bats in 2018 + at-bats in 2019)",
    "(hits in 2018 ÷ at-bats in 2018) + (hits in 2019 ÷ at-bats in 2019)",
    "[(hits in 2018 ÷ at-bats in 2018) + (hits in 2019 ÷ at-bats in 2019)] ÷ 2"
  ];
  const buttons = options.map((option, index) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => {
      buttons.forEach((choice) => choice.classList.remove("incorrect"));

      if (index === 0) {
        button.classList.add("correct");
        buttons.forEach((choice) => { choice.disabled = true; });
        tool.classList.add("show-overall");
        feedback.textContent = "Yes. Add all the hits and all the at-bats first. Jackie wins overall: 0.250 beats 0.220, even though Arlo won both seasons.";
        onComplete?.();
        return;
      }

      button.classList.add("incorrect");
      feedback.textContent = index === 1
        ? "Adding the two averages does not make one overall average. Add the hits and at-bats first."
        : "A simple average gives both seasons equal weight, even though they have different numbers of at-bats.";
    });
    return button;
  });

  choices.append(...buttons);
  question.append(heading, choices);
  return question;
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
