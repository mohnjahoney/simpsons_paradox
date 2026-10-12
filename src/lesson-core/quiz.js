export function createContinuePanel({ title, continueDisabled = false, navigation, onContinue, onSkip, onBack, onHome }) {
  const panel = document.createElement("aside");
  panel.className = "question-panel continue-panel";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const button = document.createElement("button");
  button.className = "primary";
  button.type = "button";
  button.textContent = "Continue";
  button.disabled = continueDisabled;
  button.addEventListener("click", onContinue);

  const actions = document.createElement("div");
  actions.className = "continue-actions";
  actions.append(
    button,
    createNavigationButton("BACK", onBack, navigation.backDisabled),
    createNavigationButton("HOME", onHome, navigation.homeDisabled),
    createNavigationButton("SKIP", onSkip)
  );

  panel.append(heading, actions);
  panel.continueButton = button;
  return panel;
}

export function createQuestionPanel({
  page,
  selected,
  locked,
  attempts,
  result,
  maxAttempts,
  celebration,
  onSelect,
  onSubmit,
  onContinue,
  onSkip,
  onBack,
  onHome,
  navigation
}) {
  const panel = document.createElement("aside");
  panel.className = "question-panel";

  const question = document.createElement("h3");
  question.textContent = page.prompt.question;

  const choices = document.createElement("div");
  choices.className = "choices";

  page.prompt.choices.forEach((choice, choiceIndex) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.textContent = choice;
    button.disabled = locked;

    if (selected === choiceIndex) {
      button.classList.add("selected");
      if (locked) {
        button.classList.add(choiceIndex === page.prompt.answer ? "correct" : "incorrect");
      }
    }

    button.addEventListener("click", () => onSelect(choiceIndex));
    choices.append(button);
  });

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.textContent = "Choose an answer, then submit.";

  if (locked && result.correct) {
    feedback.classList.add("good", "spark");
    feedback.textContent = celebration.correct;
  } else if (locked && !result.correct) {
    feedback.classList.add("neutral");
    feedback.textContent = `${celebration.exhaustedPrefix} ${page.prompt.choices[page.prompt.answer]}`;
  } else if (attempts === 1) {
    feedback.classList.add("bad");
    feedback.textContent = celebration.retry;
  }

  const actions = document.createElement("div");
  actions.className = "actions";

  const attemptLabel = document.createElement("span");
  attemptLabel.className = "attempts";
  attemptLabel.textContent = `Attempt ${Math.min(attempts + 1, maxAttempts)} of ${maxAttempts}`;

  const submit = document.createElement("button");
  submit.className = "primary";
  submit.type = "button";
  submit.textContent = locked ? "Continue" : "Submit";
  submit.disabled = selected === null && !locked;
  submit.addEventListener("click", () => {
    if (locked) {
      onContinue();
      return;
    }
    onSubmit();
  });

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "question-action-buttons";
  buttonGroup.append(
    submit,
    createNavigationButton("BACK", onBack, navigation.backDisabled),
    createNavigationButton("HOME", onHome, navigation.homeDisabled),
    createNavigationButton("SKIP", onSkip)
  );

  actions.append(attemptLabel, buttonGroup);
  panel.append(question, choices, feedback, actions);
  return panel;
}

function createNavigationButton(label, onClick, disabled = false) {
  const button = document.createElement("button");
  button.className = `secondary ${label.toLowerCase()}-button`;
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", onClick);
  return button;
}
