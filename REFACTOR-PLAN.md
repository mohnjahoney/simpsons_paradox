# Refactor Plan

## Phase 1: Make The Existing Contract Explicit

- Add a small lesson-core module for page normalization and generic layout lookup.
- Give each page a stable `layoutFamily`.
- Move hard-coded tool layout decisions out of `app.js`.
- Add predictable CSS hooks such as `.stage-family-*` and `.scene-family-*`.

Status: complete. `src/lesson-core/pageSchema.js` owns generic page normalization and layout lookup; Simpson-specific family names and settings live with the Simpson lesson.

## Phase 2: Stabilize Repeated Visuals

- Define family-level CSS contracts for fish, baseball, triangles, and vaccines.
- Reserve consistent tool, feedback, and sidebar space inside each family.
- Prefer mode changes inside one stable tool shell over different page-specific layouts.

Status: started. Family-level scene sizing and feedback-height variables are in place. Baseball graph pages now keep the graph in the same slot across question and reveal pages.

## Phase 3: Separate Lesson Content From Lesson Core

- Move Simpson-specific pages into a lesson folder.
- Keep reusable layout, quiz, navigation, and page-schema helpers in lesson-core.
- Keep custom interactives in lesson-specific tools unless they become clearly reusable.

Status: complete. `src/lessons/simpsons/index.js` exports the complete lesson definition: pages, celebration copy, layout settings, and tool renderers. The app consumes that definition without importing Simpson-specific modules itself.

## Phase 4: Add Thin Verification (deferred)

- Add a browser check that records key bounding boxes across related pages.
- Flag unexpected drift in graph/table/tool dimensions inside a layout family.
- Keep this lightweight; it should protect continuity, not become a testing project.

## Phase 5: Optional Package Boundary

- Once the internal boundary feels stable, consider extracting lesson-core into a small package.
- Only do this after another lesson wants to reuse it.
