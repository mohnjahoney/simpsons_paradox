export function createTopbar({ currentIndex, totalPages, sectionLabel, onResetHome, onResetHere }) {
  const topbar = document.createElement("header");
  topbar.className = "topbar";

  const brand = document.createElement("div");
  brand.className = "brand";
  const brandTitle = document.createElement("strong");
  brandTitle.textContent = "Simpson's Paradox";
  const brandSection = document.createElement("span");
  brandSection.textContent = sectionLabel;
  brand.append(brandTitle, brandSection);

  const progress = document.createElement("div");
  progress.className = "progress";

  const progressGroup = document.createElement("div");
  progressGroup.className = "progress-group";

  const track = document.createElement("div");
  track.className = "progress-track";
  track.setAttribute("aria-hidden", "true");

  const fill = document.createElement("div");
  fill.className = "progress-fill";
  const progressValue = currentIndex >= totalPages ? 100 : (currentIndex / totalPages) * 100;
  fill.style.setProperty("--progress", `${progressValue}%`);
  track.append(fill);

  const label = document.createElement("div");
  label.className = "progress-label";
  label.textContent = currentIndex >= totalPages ? "Done" : `${currentIndex + 1}/${totalPages}`;

  const resets = document.createElement("div");
  resets.className = "reset-links";
  resets.append(
    createResetButton("reset: home", onResetHome),
    createResetButton("reset: here", onResetHere)
  );

  progress.append(track, label);
  progressGroup.append(progress, resets);
  topbar.append(brand, progressGroup);
  return topbar;
}

function createResetButton(label, onClick) {
  const button = document.createElement("button");
  button.className = "reset-link";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

export function createSceneCopy(page, toolRenderers, toolContext = {}) {
  const copy = document.createElement("div");
  copy.className = "scene-copy";

  const title = document.createElement("h2");
  title.textContent = page.title;

  copy.append(title);

  if (page.idea) {
    const idea = document.createElement("p");
    idea.className = "scene-idea";
    idea.textContent = page.idea;
    copy.append(idea);
  }

  const body = document.createElement("div");
  body.className = "body-copy";
  (page.body ?? []).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    body.append(p);
  });

  if (body.childElementCount) copy.append(body);

  if (page.callout) {
    const callout = document.createElement("aside");
    callout.className = "take-home-callout";
    callout.setAttribute("aria-label", "Key takeaway");
    callout.textContent = page.callout;
    copy.append(callout);
  }

  if (page.tool && toolRenderers[page.tool]) {
    copy.append(toolRenderers[page.tool]({ ...toolContext, ...page.toolOptions }));
  }

  return copy;
}

export function createSceneGuidance(page) {
  if (!page.instructions) return null;

  const guidance = document.createElement("aside");
  guidance.className = "scene-guidance";

  const heading = document.createElement("h3");
  heading.textContent = "How to interact";
  guidance.append(heading);

  const paragraphs = Array.isArray(page.instructions) ? page.instructions : [page.instructions];
  paragraphs.forEach((instruction) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = instruction;
    guidance.append(paragraph);
  });

  return guidance;
}

export function createSummary({ pages, results, onRestart }) {
  const card = document.createElement("article");
  card.className = "score-card";

  const correct = results.filter((result) => result.correct).length;

  const kicker = document.createElement("div");
  kicker.className = "kicker";
  kicker.textContent = "Wrap-Up";

  const title = document.createElement("h1");
  title.textContent = "Your Simpson Radar is warming up";

  const score = document.createElement("div");
  score.className = "score-number";
  score.innerHTML = `<strong>${correct}</strong><span>/ ${pages.length}</span>`;

  const body = document.createElement("div");
  body.className = "body-copy";
  body.innerHTML = "<p>Across these scenes, the recurring lesson is that grouped data can tell a different story than aggregated data. Before trusting a total, look for hidden subgroups, denominator imbalances, and relationships among the features.</p>";

  const list = document.createElement("ul");
  list.className = "scene-list";
  pages.forEach((page, index) => {
    const result = results[index];
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = page.kicker;
    const status = document.createElement("span");
    status.className = result.correct ? "result-ok" : "result-miss";
    status.textContent = result.correct ? `Correct in ${result.attempts}` : "Moved on";
    item.append(name, status);
    list.append(item);
  });

  const restart = document.createElement("button");
  restart.className = "secondary";
  restart.type = "button";
  restart.textContent = "Restart";
  restart.addEventListener("click", onRestart);

  card.append(kicker, title, score, body, list, restart);
  return card;
}
