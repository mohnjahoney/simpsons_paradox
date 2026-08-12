# Simpson's Paradox Migration Brief

This repo contains an old interactive notebook lesson about Simpson's Paradox. The original delivery stack was:

- Jupyter notebook: `simpsons.ipynb`
- Voila for code-hidden notebook rendering
- Binder launch URLs in `README.md`
- Python packages: `voila`, `ipywidgets`, `bqplot`, `numpy`, `pandas`, `sklearn`, `IPython`

The goal of a web rewrite should be to preserve the lesson arc, datasets, interaction ideas, and quiz prompts while replacing notebook widgets/plots with lightweight web-native components.

## Lesson Arc

1. Introduction
   - Hook: adding fruit and getting fewer, even negative, pieces of fruit.
   - Definition: "Combining subsets of data can result in counter-intuitive reversals of trends."
   - Goals: notice intuition failures, understand why they fail, see different flavors, and learn how to act in real scenarios.

2. Example 1: The Shape of Fish
   - Teaches correlation and regression through red and blue fish.
   - Within each color group, length and height are positively correlated.
   - When the two groups are aggregated, the overall regression trend becomes negative.
   - Take-home: two positive trends can combine to create a negative trend.

3. Three-Group Drag Challenge
   - User moves circles, squares, and triangles.
   - Goal: make each subgroup negatively correlated while the total trend is positive.
   - Feedback highlights which subgroup/overall regression conditions have been satisfied.

4. Example 2: Batting Averages
   - Jackie and Arlo each play two seasons.
   - Arlo has the better batting average in each season.
   - Jackie has the better overall batting average.
   - Graph shows hits vs. at-bats, where each segment slope is batting average.
   - Sorting by comparable at-bats explains the paradox.
   - Take-home: leading in each season is not enough to ensure leading overall; Simpson's Paradox depends on an imbalance in denominators.

5. Baseball Drag Challenge
   - User moves cumulative hit/at-bat points for Lian and Jose across three seasons.
   - Goal: Lian leads in each season while Jose leads overall.
   - Constraints: fixed origin, nondecreasing at-bats/hits, hits cannot exceed at-bats.
   - Feedback table shows leader by season and overall.

6. Example 3: Red Triangles
   - Ten objects are split into upper/lower groups.
   - Each object has hidden color and hidden shape.
   - User can reveal either color or shape first, then chooses which group has more red triangles.
   - After choosing, user can reveal both.
   - The separate marginal clues point one way, but the combined condition points the other.
   - Take-home: the two levels have opposing correlations between "red" and "triangle."

7. Application Challenge: Vaccines
   - User edits counts for vaccine A/B, split by males/females.
   - The target paradox: vaccine A is better for males and better for females, while vaccine B is better overall.
   - The table displays effective/not effective counts and probabilities.
   - The graph shows cumulative effective vs. treated; segment slopes represent subgroup success rates and total line slopes represent overall rates.
   - Decision prompt: for an individual, choose based on their subgroup; for production, weight subgroup success rates by the real target population mix.

8. Wrap-Up
   - Summarizes three flavors of Simpson's Paradox.
   - Goal: improve the learner's "Simpson Radar."

## Data To Preserve

### Fish

```js
const fish = [
  { color: "red", length: 1, height: 3, initX: 5, initY: 4.5 },
  { color: "red", length: 2, height: 5, initX: 8.5, initY: 4.5 },
  { color: "red", length: 3, height: 7, initX: 2, initY: 2 },
  { color: "blue", length: 4, height: 1, initX: 2, initY: 5.5 },
  { color: "blue", length: 5, height: 2, initX: 6.5, initY: 1.5 },
  { color: "blue", length: 6, height: 3, initX: 4.5, initY: 8 }
];
```

Regression facts:

- Red group: slope 2, intercept 1.
- Blue group: slope 1, intercept -3.
- Combined group: slope about -0.429, intercept 5.

Image assets already exist:

- `img/fish_red.png`
- `img/fish_blue.png`

### Three-Group Drag Challenge

Initial points:

```js
const points = [
  { group: "circle", x: 1, y: 8 },
  { group: "circle", x: 4, y: 6 },
  { group: "circle", x: 6, y: 9 },
  { group: "square", x: 4, y: 2 },
  { group: "square", x: 5, y: 1 },
  { group: "square", x: 8, y: 4 },
  { group: "triangle", x: 3, y: 1 },
  { group: "triangle", x: 5, y: 4 },
  { group: "triangle", x: 9, y: 3 }
];
```

Success condition:

- circle regression slope < 0
- square regression slope < 0
- triangle regression slope < 0
- combined regression slope > 0

Status copy:

- "Move the shapes"
- "You got one :)"
- "You got two!!"
- "Now for the total!"
- "You designed a Simpson's Paradox!"

### Batting Averages

```js
const batting = {
  Jackie: {
    2018: { hits: 1, atBats: 20 },
    2019: { hits: 24, atBats: 80 }
  },
  Arlo: {
    2018: { hits: 12, atBats: 80 },
    2019: { hits: 10, atBats: 20 }
  }
};
```

Computed batting averages:

- Jackie 2018: 1/20 = 0.050
- Jackie 2019: 24/80 = 0.300
- Jackie total: 25/100 = 0.250
- Arlo 2018: 12/80 = 0.150
- Arlo 2019: 10/20 = 0.500
- Arlo total: 22/100 = 0.220

Controls:

- Show/hide overall stats.
- Sort graph by `season` or `at-bats`.
- Show/hide overall slope lines.

### Baseball Drag Challenge

Initial cumulative points:

```js
const lian = [
  { atBats: 0, hits: 0 },
  { atBats: 20, hits: 15 },
  { atBats: 40, hits: 25 },
  { atBats: 60, hits: 30 }
];

const jose = [
  { atBats: 0, hits: 0 },
  { atBats: 20, hits: 20 },
  { atBats: 40, hits: 30 },
  { atBats: 60, hits: 35 }
];
```

Success condition:

- Lian has greater slope than Jose for 2020.
- Lian has greater slope than Jose for 2021.
- Lian has greater slope than Jose for 2022.
- Jose has greater overall slope than Lian.

### Red Triangles

Original object data, where the first five objects are one row and the last five are the other:

```js
const objects = [
  { x: 0, row: 0, color: "red", shape: "triangle" },
  { x: 1, row: 0, color: "red", shape: "cross" },
  { x: 2, row: 0, color: "blue", shape: "triangle" },
  { x: 3, row: 0, color: "red", shape: "cross" },
  { x: 4, row: 0, color: "blue", shape: "triangle" },
  { x: 0, row: 1, color: "blue", shape: "cross" },
  { x: 1, row: 1, color: "blue", shape: "cross" },
  { x: 2, row: 1, color: "red", shape: "triangle" },
  { x: 3, row: 1, color: "red", shape: "triangle" },
  { x: 4, row: 1, color: "blue", shape: "cross" }
];
```

Counts:

- One row has more triangles.
- One row has more red shapes.
- The opposite row has more red triangles.

The notebook labels the quiz answers as:

- more triangles: bottom
- more red shapes: bottom
- most red triangles: top
- top red/triangle correlation: positive
- bottom red/triangle correlation: negative

When porting, verify row orientation visually so the labels match what the learner sees.

### Vaccines

Initial counts:

```js
const vaccines = {
  A: {
    males: { effective: 2, notEffective: 3 },
    females: { effective: 2, notEffective: 0 }
  },
  B: {
    males: { effective: 0, notEffective: 2 },
    females: { effective: 3, notEffective: 2 }
  }
};
```

Initial probabilities:

- Males: A = 2/5, B = 0/2, so A leads.
- Females: A = 2/2, B = 3/5, so A leads.
- All people: A = 4/7, B = 3/7, so A leads initially.

The learner must adjust counts until:

- A leads among males.
- A leads among females.
- B leads overall.

Plot mapping:

- x-axis: number treated = effective + not effective.
- y-axis: effective.
- Each vaccine path is cumulative across males then females.
- Segment slope = subgroup success probability.
- Overall line slope = overall success probability.

## Web Implementation Notes

The notebook maps cleanly to a client-side web app. A first pass can be plain HTML/CSS/JavaScript with SVG plots:

- SVG is enough for scatterplots, regression lines, draggable points, and red-triangle objects.
- No backend is needed.
- The existing PNG fish assets can be reused.
- Regression is simple least-squares and can be implemented in a small helper.
- Tables and numeric inputs can be native HTML controls.

A slightly more structured version could use Vite with React or Svelte:

- Better component boundaries for each lesson section.
- Easier state management for interactivity.
- Still lightweight, static-hostable, and Binder-free.

Suggested first build target:

- A static single-page app with sections matching the lesson arc.
- Start with the fish example, batting example, red triangles, and vaccine tool.
- Add the two open-ended drag challenges once the core explanatory sections are working.

## Content Cleanup Opportunities

- Fix small typos: "Let's dig in!.", "As the fish..." capitalization, "Simpson's Paradox relies requires..."
- Convert hidden quiz answers into collapsible answer reveals.
- Replace notebook-specific phrases like "Try the button" with direct UI labels.
- Make row labels explicit in the red-triangle puzzle to avoid top/bottom ambiguity.
- Add accessibility labels for plots and controls.
- Consider a compact "what changed?" panel beside each interactive to make the paradox visible without relying only on color.
