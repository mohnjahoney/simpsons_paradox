# High-ROI Content Sprint

## Mission

Make a visible, meaningful improvement to the lesson in approximately 30 minutes of active compute time. This is a focused content sprint, not a chapter rewrite or infrastructure pass.

The intended learner shift is from **"I watched a reversal happen"** to **"I predicted the reversal, saw it fail, and can explain why."**

## Scope

Work on exactly three beats in two lesson segments:

| Segment | Beat | Intended improvement |
| --- | --- | --- |
| Fish | `fish-observe` | Turn passive observation into a prediction about the red and blue within-group trends. |
| Fish | `fish-colorblind` | Require a prediction before fitting the combined line, then connect the surprise to the group positions. |
| Baseball | `batting-denominators` | Replace prose-only explanation with a compact visual showing how unequal at-bat counts weight each player's seasonal rates. |

### Explicitly out of scope

- New examples, lesson-wide restructuring, or a new opening hook.
- Reworking the triangles or vaccine chapters.
- Generalizing lesson infrastructure, changing the architecture, or adding a test framework.
- Rewriting the rest of the copy just for stylistic consistency.

Those are valuable future projects; they are intentionally not bundled into this sprint.

## Definition of done

1. Fish has a real prediction → evidence → explanation arc.
2. The combined fish line feels surprising because the learner committed to an answer first.
3. Baseball makes the phrase “different amounts of weight” visually obvious without a paragraph of explanation.
4. The current lesson remains runnable, keyboard-operable, and visually stable at the three changed beats.
5. The result is committed and pushed on `codex/content-improvements`; `main` remains untouched.

## Design brief

### Fish prediction arc

For `fish-observe`, replace the broad “what pattern do you notice?” recall prompt with a prediction such as: “If each color gets its own trend line, what do you expect?” The learner should choose before fitting either line.

For `fish-colorblind`, keep the existing line-fitting interaction, but precede it with an in-tool prediction choice: “Both color-specific lines rose. When color is hidden, what will the one line do?” Possible answers should include *rise*, *fall*, and *stay roughly flat*. The learner sees the predicted answer retained beside the graph after the combined fit resolves.

The explanation should name the mechanism plainly: red fish occupy the shorter/taller region and blue fish the longer/shorter region. That between-group arrangement overwhelms the within-group rise.

### Baseball weighting visual

For `batting-denominators`, add a small purpose-built visual, not a new general charting system. It should show each player’s two seasons as width-proportional at-bat blocks with the rate printed inside or immediately above each block:

- Jackie: `.050` over 20 at-bats, then `.300` over 80 at-bats.
- Arlo: `.150` over 80 at-bats, then `.500` over 20 at-bats.

Use width to mean “how much this season counts toward the total,” and highlight the consequential asymmetry: Jackie’s better season is large; Arlo’s better season is small. Preserve the existing question and answer unless inspection shows the visual makes a tighter prompt necessary.

## Branch and Cloud setup

### Repository state

- Baseline branch: `main`, commit `170c528`.
- Improvement branch: `codex/content-improvements`.
- Local improvement worktree: `/Users/appleseed/.codex/worktrees/content-improvements/simpsons_paradox`.

Before editing, verify:

```sh
git branch --show-current
git status --short
git log -1 --oneline
```

Expected branch: `codex/content-improvements`; expected working tree: clean.

### Local side-by-side workflow

Run the baseline from `/Users/appleseed/Documents/code/simpsons_paradox` and the improvement worktree from the path above. Use different development-server ports when both are open (for example, `4173` for baseline and `4174` for the improvement checkout).

### Cloud workflow

1. Push `codex/content-improvements` before starting Cloud work so the remote branch contains this plan.
2. In a new Codex task, choose **Work in → Cloud** and select or create the `simpsons_paradox` environment.
3. Choose the improvement branch as the starting point, or state it explicitly in the initial task prompt.
4. Use this opening prompt:

   > Implement `CONTENT-IMPROVEMENT-PLAN.md` only. Work on `fish-observe`, `fish-colorblind`, and `batting-denominators`. Preserve all other lesson content and architecture. Send a concise progress report at every named checkpoint before proceeding.

5. Review the cloud task’s diff, build result, and visual smoke checks before committing or opening a PR.

Cloud environment creation or dependency installation can take variable wall-clock time. It is not part of the 30-minute active-compute budget; if it blocks progress, continue in the local worktree rather than expanding scope.

## Execution checkpoints and reporting protocol

Send a concise report after every checkpoint. A report must use this format:

> **Checkpoint N — name**
> Done: …
> Evidence: …
> Next: …
> Risk/decision: …

Do not wait for a response after ordinary progress reports. Pause only for a genuine content decision, a broken baseline, or missing access.

| # | Checkpoint | Work | Report must establish |
| ---: | --- | --- | --- |
| 1 | Branch confirmed | Verify branch, clean state, and baseline commit. | The task is isolated from `main`. |
| 2 | Environment ready | Install dependencies if needed; start the revised checkout. | The current lesson renders before edits. |
| 3 | Baseline inspected | Visit the three target beats and record their current copy, interaction, and layout. | The edit is based on observed behavior, not only source reading. |
| 4 | Micro-design locked | Write the exact learner question, correct answers, feedback, and visual labels. | The change has a coherent instructional arc. |
| 5 | Fish observation revised | Edit `fish-observe` copy/prompt. | Learners make an intelligible subgroup-trend prediction. |
| 6 | Fish combined prediction added | Add the pre-fit prediction state and post-fit explanation to the combined fish tool. | Prediction is required before the reversal is confirmed. |
| 7 | Fish checked | Run the complete fish sequence, including an incorrect prediction if supported. | Copy, completion flow, and visual state are clear. |
| 8 | Baseball visual added | Build the small width-weighted season visual for `batting-denominators`. | Width/rate encoding is legible at normal lesson size. |
| 9 | Baseball copy aligned | Tighten the explanatory text and question only as needed to match the new visual. | The learner can name the weighting mechanism. |
| 10 | Baseball checked | Run the baseball sequence through the target beat. | The visual reinforces rather than duplicates the earlier graph. |
| 11 | Regression checked | Build production assets and smoke-test intro, target beats, summary, reset, and hash navigation. | The three edits did not disturb lesson flow. |
| 12 | Review-ready snapshot | Inspect the diff against `main`, commit, push, and report the comparison branch/commit. | The user can open baseline and revision side by side. |

## Timebox

| Work | Active-compute target |
| --- | ---: |
| Checkpoints 1–4: setup, baseline, micro-design | 6 minutes |
| Checkpoints 5–7: fish | 10 minutes |
| Checkpoints 8–10: baseball | 9 minutes |
| Checkpoints 11–12: verification and handoff | 5 minutes |
| **Total** | **30 minutes** |

If the combined-fish prediction or baseball visual exceeds its timebox, simplify its presentation rather than starting a fourth beat. The goal is one excellent, reviewable slice of improvement.
