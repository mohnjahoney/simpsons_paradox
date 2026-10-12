# Spec: Slide Lesson Core

Target: extract the reusable lesson-building structure from this Simpson's Paradox lesson while keeping the current lesson working.

The core should support:

- declarative pages with title, kicker, idea, body, callout, prompt, tool, tool options, and advance behavior
- consistent scene layouts with stable visual slots for related pages
- multiple choice questions and continue/back/home/skip navigation
- right-side guidance text separate from the main visual area
- simple tool mounting for custom interactives
- layout families so repeated visuals, such as graphs, keep stable dimensions across a section
- lightweight styling hooks for callouts, feedback, colors, and focused interaction text

Near-term scope:

- keep this inside the repo
- avoid publishing a package
- keep lesson-specific content and tools separate from reusable app/layout/quiz code
- prefer small, visible improvements over a large framework rewrite

Out of scope for now:

- external npm packaging
- a full authoring UI
- a generic plotting library
- automated visual regression beyond small browser bounding-box checks
