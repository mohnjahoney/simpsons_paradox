import { getPageLayout } from "./lesson-core/pageSchema.js";
import { createSceneCopy, createSceneGuidance, createSummary, createTopbar } from "./lesson-core/layout.js";
import { createContinuePanel, createQuestionPanel } from "./lesson-core/quiz.js";

export function createApp(root, lesson) {
  const {
    celebration,
    interactiveSelector,
    layoutFamilies,
    pages,
    summary,
    toolRenderers
  } = lesson;
  const maxAttempts = lesson.maxAttempts ?? 2;

  const state = {
    index: getInitialIndex(),
    selected: null,
    locked: false,
    attempts: 0,
    results: pages.map(() => ({ answered: false, correct: false, attempts: 0 }))
  };

  function getInitialIndex() {
    const hash = window.location.hash.replace("#", "");
    if (hash === "summary") return pages.length;
    const index = pages.findIndex((page) => page.id === hash);
    return index >= 0 ? index : 0;
  }

  function setPage(index) {
    state.index = Math.max(0, Math.min(index, pages.length));
    state.selected = null;
    state.locked = false;
    state.attempts = 0;
    window.location.hash = state.index === pages.length ? "summary" : pages[state.index].id;
    render();
  }

  function render() {
    root.innerHTML = "";

    const shell = document.createElement("div");
    shell.className = "shell";
    const currentPage = pages[state.index];
    shell.append(createTopbar({
      brandName: lesson.title,
      currentIndex: state.index,
      totalPages: pages.length,
      sectionLabel: currentPage?.kicker ?? "Wrap-Up",
      collapsed: state.index > 0,
      onResetHome: resetHome,
      onResetHere: resetHere
    }));

    const stage = document.createElement("section");
    stage.className = "stage";
    const pageLayout = getPageLayout(currentPage, layoutFamilies);
    stage.classList.add(`stage-family-${pageLayout.family}`);
    if (pageLayout.isCompactVisual) {
      stage.classList.add("stage-compact-visual");
    }

    if (state.index >= pages.length) {
      stage.append(createSummary({
        pages,
        results: state.results,
        summary,
        onRestart: restart
      }));
    } else {
      stage.append(createScene(pages[state.index], state.index));
    }

    shell.append(stage);
    root.append(shell);
  }

  function createScene(page, index) {
    const wrapper = document.createElement("article");
    wrapper.className = "scene";
    const pageLayout = getPageLayout(page, layoutFamilies);
    wrapper.classList.add(`scene-family-${pageLayout.family}`);
    if (pageLayout.isToolGated) {
      wrapper.classList.add("scene-tool-gated");
    }

    const navigation = {
      backDisabled: index === 0,
      homeDisabled: index === 0
    };

    const continuePanel = page.advance === "continue" || page.advance === "toolComplete"
      ? createContinuePanel({
        title: celebration.readyTitle,
        continueDisabled: page.advance === "toolComplete",
        navigation,
        onContinue: () => completePage(index),
        onSkip: () => skipPage(index),
        onBack: () => setPage(index - 1),
        onHome: () => setPage(0)
      })
      : null;
    const panel = continuePanel ?? createQuestionPanel({
        page,
        selected: state.selected,
        locked: state.locked,
        attempts: state.attempts,
        result: state.results[index],
        maxAttempts,
        celebration,
        onSelect: (choiceIndex) => selectChoice(choiceIndex),
        onSubmit: () => submitAnswer(page, index),
        onContinue: () => setPage(index + 1),
        onSkip: () => skipPage(index),
        onBack: () => setPage(index - 1),
        onHome: () => setPage(0),
        navigation
      });

    const copy = createSceneCopy(page, lesson, {
      onComplete: () => {
        state.results[index] = { answered: true, correct: true, attempts: 1 };
        if (continuePanel) continuePanel.continueButton.disabled = false;
        window.requestAnimationFrame(() => {
          panel.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    });

    const sidebar = document.createElement("div");
    sidebar.className = "scene-sidebar";
    const guidance = createSceneGuidance(page);
    if (guidance) sidebar.append(guidance);
    sidebar.append(panel);

    wrapper.append(copy, sidebar);
    return wrapper;
  }

  function selectChoice(choiceIndex) {
    if (state.locked) return;
    state.selected = choiceIndex;
    render();
  }

  function completePage(index) {
    state.results[index] = { answered: true, correct: true, attempts: 1 };
    setPage(index + 1);
  }

  function skipPage(index) {
    state.results[index] = { answered: true, correct: true, attempts: 1 };
    setPage(index + 1);
  }

  function submitAnswer(page, index) {
    const isCorrect = state.selected === page.prompt.answer;
    state.attempts += 1;

    if (isCorrect) {
      state.results[index] = { answered: true, correct: true, attempts: state.attempts };
      state.locked = true;
      render();
      return;
    }

    if (state.attempts >= maxAttempts) {
      state.results[index] = { answered: true, correct: false, attempts: state.attempts };
      state.locked = true;
      render();
      return;
    }

    state.selected = null;
    render();
  }

  function restart() {
    clearResultsFrom(0);
    setPage(0);
  }

  function resetHome() {
    clearResultsFrom(0);
    setPage(0);
  }

  function resetHere() {
    if (state.index >= pages.length) {
      setPage(pages.length);
      return;
    }

    clearResultsFrom(state.index);
    setPage(state.index);
  }

  function clearResultsFrom(startIndex) {
    state.results.slice(startIndex).forEach((result) => {
      result.answered = false;
      result.correct = false;
      result.attempts = 0;
    });
  }

  function handleArrowNavigation(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isInteractiveTarget(event.target)) return;

    if (event.key === "ArrowLeft" && state.index > 0) {
      event.preventDefault();
      setPage(state.index - 1);
    } else if (event.key === "ArrowRight" && state.index < pages.length) {
      event.preventDefault();
      skipPage(state.index);
    }
  }

  function isInteractiveTarget(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest("button, input, textarea, select, [contenteditable='true']")) return true;
    return Boolean(interactiveSelector && target.closest(interactiveSelector));
  }

  window.addEventListener("hashchange", () => {
    const nextIndex = getInitialIndex();
    if (nextIndex !== state.index) {
      state.index = nextIndex;
      state.selected = null;
      state.locked = false;
      state.attempts = 0;
      render();
    }
  });
  window.addEventListener("keydown", handleArrowNavigation);

  render();
}
