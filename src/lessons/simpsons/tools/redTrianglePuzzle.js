const objects = [
  { row: "bottom", x: 0, color: "red", shape: "triangle" },
  { row: "bottom", x: 1, color: "red", shape: "cross" },
  { row: "bottom", x: 2, color: "blue", shape: "triangle" },
  { row: "bottom", x: 3, color: "red", shape: "cross" },
  { row: "bottom", x: 4, color: "blue", shape: "triangle" },
  { row: "top", x: 0, color: "blue", shape: "cross" },
  { row: "top", x: 1, color: "blue", shape: "cross" },
  { row: "top", x: 2, color: "red", shape: "triangle" },
  { row: "top", x: 3, color: "red", shape: "triangle" },
  { row: "top", x: 4, color: "blue", shape: "cross" }
];

const modes = {
  hidden: { showColor: false, showShape: false },
  shape: { showColor: false, showShape: true },
  color: { showColor: true, showShape: false },
  clues: { showColor: false, showShape: false, splitClues: true },
  answer: { showColor: true, showShape: true, highlightAnswer: true }
};

const clueShuffleOrders = {
  shape: {
    top: [2, 0, 4, 1, 3],
    bottom: [3, 1, 4, 0, 2]
  },
  color: {
    top: [1, 3, 0, 4, 2],
    bottom: [4, 0, 2, 3, 1]
  }
};

export function createRedTrianglePuzzle({ onComplete, mode = "hidden" } = {}) {
  const settings = modes[mode] ?? modes.hidden;
  const tool = document.createElement("div");
  tool.className = `red-triangle-tool red-triangle-mode-${mode}`;

  if (settings.splitClues) {
    const split = document.createElement("div");
    split.className = "red-triangle-split";
    split.append(
      createPuzzleCard("Shape clue", { showShape: true, showColor: false }),
      createPuzzleCard("Color clue", { showShape: false, showColor: true })
    );
    tool.append(split, createFeedback("The clues agree: the bottom row has more triangles and more red objects."));
    return tool;
  }

  const startsHidden = mode === "shape" || mode === "color";
  let card = createPuzzleCard("Two hidden rows", startsHidden ? modes.hidden : settings);
  const feedback = createFeedback(getInitialFeedback(mode));
  tool.append(card);

  if (mode === "shape" || mode === "color") {
    const button = document.createElement("button");
    button.className = "primary compact-tool-button";
    button.type = "button";
    button.textContent = mode === "shape" ? "Reveal shapes" : "Reveal colors";
    tool.append(button);
    button.addEventListener("click", () => {
      button.disabled = true;
      feedback.textContent = "Mixing the rows...";
      shuffleThenReveal({
        card,
        mode,
        revealSettings: settings,
        onReveal: (revealedCard) => {
          card = revealedCard;
          feedback.textContent = mode === "shape"
            ? "The bottom row has more triangles: 3 instead of 2."
            : "The bottom row has more red objects: 3 instead of 2.";
          onComplete?.();
        }
      });
    });
  }

  tool.append(feedback);
  return tool;
}

function createPuzzleCard(label, settings, options = {}) {
  const card = document.createElement("div");
  card.className = "red-triangle-card";

  const title = document.createElement("div");
  title.className = "red-triangle-card-title";
  title.textContent = label;

  const board = document.createElement("div");
  board.className = "red-triangle-board";
  board.setAttribute("role", "img");
  board.setAttribute("aria-label", "Two rows of objects with hidden color and shape attributes");

  ["top", "bottom"].forEach((rowName) => {
    const row = document.createElement("div");
    row.className = `red-triangle-row ${rowName}-row`;

    const rowLabel = document.createElement("span");
    rowLabel.className = "red-triangle-row-label";
    rowLabel.textContent = rowName;
    row.append(rowLabel);

    getObjectsForRow(rowName, options.orderByRow?.[rowName])
      .forEach((object) => row.append(createObjectIcon(object, settings)));

    board.append(row);
  });

  card.append(title, board);
  return card;
}

function shuffleThenReveal({ card, mode, revealSettings, onReveal }) {
  const orderByRow = clueShuffleOrders[mode];
  const board = card.querySelector(".red-triangle-board");
  const rows = [...board.querySelectorAll(".red-triangle-row")];
  const firstPositions = new Map();

  rows.forEach((row) => {
    [...row.querySelectorAll(".red-triangle-icon")].forEach((icon, index) => {
      firstPositions.set(`${getRowName(row)}-${index}`, icon.getBoundingClientRect());
    });
  });

  rows.forEach((row) => {
    const rowName = getRowName(row);
    const label = row.querySelector(".red-triangle-row-label");
    const icons = [...row.querySelectorAll(".red-triangle-icon")];
    row.replaceChildren(label, ...orderByRow[rowName].map((index) => icons[index]));
  });

  rows.forEach((row) => {
    const rowName = getRowName(row);
    [...row.querySelectorAll(".red-triangle-icon")].forEach((icon, newIndex) => {
      const originalIndex = orderByRow[rowName][newIndex];
      const first = firstPositions.get(`${rowName}-${originalIndex}`);
      const last = icon.getBoundingClientRect();
      icon.style.setProperty("--shuffle-x", `${first.left - last.left}px`);
      icon.style.setProperty("--shuffle-y", `${first.top - last.top}px`);
      icon.classList.add("is-shuffling");
    });
  });

  window.setTimeout(() => {
    const revealedCard = createPuzzleCard("Two hidden rows", revealSettings, { orderByRow });
    card.replaceWith(revealedCard);
    onReveal(revealedCard);
  }, 520);
}

function getObjectsForRow(rowName, order) {
  const rowObjects = objects.filter((object) => object.row === rowName);
  return order ? order.map((index) => rowObjects[index]) : rowObjects;
}

function getRowName(row) {
  return row.classList.contains("top-row") ? "top" : "bottom";
}

function createObjectIcon(object, settings) {
  const icon = document.createElement("span");
  const visibleShape = settings.showShape ? object.shape : "square";
  const visibleColor = settings.showColor ? object.color : "gray";
  icon.className = `red-triangle-icon ${visibleShape}-icon ${visibleColor}-icon`;
  icon.setAttribute("aria-label", `${object.row} row ${settings.showColor ? object.color : "hidden-color"} ${settings.showShape ? object.shape : "hidden-shape"}`);

  if (settings.highlightAnswer && object.color === "red" && object.shape === "triangle") {
    icon.classList.add("answer-icon");
  }

  if (visibleShape === "cross") {
    icon.textContent = "+";
  }

  return icon;
}

function createFeedback(text) {
  const feedback = document.createElement("p");
  feedback.className = "red-triangle-feedback";
  feedback.setAttribute("aria-live", "polite");
  feedback.textContent = text;
  return feedback;
}

function getInitialFeedback(mode) {
  if (mode === "shape") return "Start with everything hidden. Reveal shape, but not color.";
  if (mode === "color") return "Now reveal color, but not shape.";
  if (mode === "answer") return "The top row has more red triangles: 2 instead of 1.";
  return "All objects start as plain gray squares.";
}
