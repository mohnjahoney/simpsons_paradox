export const standardCelebration = {
  readyTitle: "Ready for the next scene?",
  correct: "Nice. You found the important idea.",
  retry: "Try again. One more attempt.",
  exhaustedPrefix: "Second try used. The answer was:"
};

export const pages = [
  {
    id: "intro",
    kicker: "Start",
    title: "A paradox about grouping",
    body: [
      "Simpson's Paradox appears when a trend that holds inside separate groups reverses after those groups are combined.",
      "The lesson moves one scene at a time: read the setup, make a prediction, and use each answer to sharpen your intuition before the next example."
    ],
    prompt: {
      question: "What is the core warning of Simpson's Paradox?",
      choices: [
        "Combining subsets can reverse a trend.",
        "All averages are unreliable.",
        "More data always removes ambiguity."
      ],
      answer: 0
    }
  },
  {
    id: "fish",
    kicker: "Example 1",
    title: "Move the fish around",
    body: [
      "Drag the two fish around the water. This scene is just for getting familiar with the objects before the lesson starts measuring them."
    ],
    tool: "fishCanvas",
    advance: "continue"
  },
  {
    id: "fish-observe",
    kicker: "Example 1",
    title: "Look for a pattern",
    body: [
      "Now there are more fish in the water. Let them drift for a moment and look for the broad visual pattern."
    ],
    tool: "floatingFishPond",
    prompt: {
      question: "What general idea do you notice about these fish?",
      choices: [
        "Red fish tend to be shorter, while blue fish tend to be longer.",
        "Red fish and blue fish are about the same length.",
        "Red fish tend to be longer, while blue fish tend to be shorter."
      ],
      answer: 0
    }
  },
  {
    id: "fish-measure",
    kicker: "Example 1",
    title: "Measure, then organize",
    idea: "Each fish belongs at the point given by its length and height.",
    body: [],
    instructions: "Use the rulers to measure the fish at full size. Then drag its center point to the matching target on the graph.",
    tool: "fishMeasureGraph",
    advance: "toolComplete"
  },
  {
    id: "fish-red-trend",
    kicker: "Example 1",
    title: "Fit the red fish",
    idea: "A trend line summarizes the direction of a group.",
    body: [],
    instructions: "Drag either handle. Keep the left handle on the y-axis and place the line through the middle of the red fish, with roughly as many fish above it as below it.",
    tool: "fishTrendGraph",
    toolOptions: { mode: "red" },
    advance: "toolComplete"
  },
  {
    id: "fish-blue-trend",
    kicker: "Example 1",
    title: "Fit the blue fish",
    idea: "Now describe the blue group on its own.",
    body: [],
    instructions: "Drag either handle. Keep the lower handle on the x-axis and place the line through the middle of the blue fish. The red fish are muted so you can focus on blue.",
    tool: "fishTrendGraph",
    toolOptions: { mode: "blue" },
    advance: "toolComplete"
  },
  {
    id: "fish-colorblind",
    kicker: "Example 1",
    title: "Now ignore color",
    idea: "Without color, the same six fish look like one group.",
    body: [],
    instructions: "Fit one line through all six fish. The constrained handle can move along either positive axis; move it through the origin to switch axes.",
    tool: "fishTrendGraph",
    toolOptions: { mode: "combined" },
    advance: "toolComplete"
  },
  {
    id: "fish-takeaway",
    kicker: "Example 1",
    title: "The trend reversed",
    body: [
      "When we consider the groups separately, we see that longer fish tend to be taller. But when the groups are combined, longer fish tend to be shorter.",
      "That's the key surprise:"
    ],
    callout: "Two positive trends can combine to create a negative trend.",
    advance: "continue"
  },
  {
    id: "batting-setup",
    kicker: "Example 2",
    title: "Who had the better seasons?",
    idea: "Batting average is hits divided by at-bats.",
    body: [],
    instructions: "Compare Jackie and Arlo in each season separately. The table reports hits, at-bats, and batting average.",
    tool: "baseballStats",
    prompt: {
      question: "Who had the better batting average in both individual seasons?",
      choices: [
        "Arlo",
        "Jackie",
        "They split the seasons."
      ],
      answer: 0
    }
  },
  {
    id: "batting-overall",
    kicker: "Example 2",
    title: "Now combine the seasons",
    idea: "Overall batting average uses total hits divided by total at-bats.",
    body: [],
    instructions: "Reveal the total column. This combines the two seasons before computing the batting average.",
    tool: "baseballStats",
    toolOptions: { mode: "overall" },
    advance: "toolComplete"
  },
  {
    id: "batting-slope",
    kicker: "Example 2",
    title: "Put the table on a graph",
    idea: "On a hits-vs-at-bats graph, slope is batting average.",
    body: [],
    instructions: "A steeper segment means more hits per at-bat. The solid lines show 2018 and the dashed lines show 2019.",
    tool: "baseballGraph",
    toolOptions: { mode: "season" },
    prompt: {
      question: "What does the slope of a hits-vs-at-bats line segment represent?",
      choices: [
        "Batting average for that segment.",
        "The number of seasons played.",
        "The total number of players."
      ],
      answer: 0
    }
  },
  {
    id: "batting-overall-graph",
    kicker: "Example 2",
    title: "The total line reverses it",
    idea: "The overall comparison is a new slope from the origin to the total.",
    body: [],
    instructions: "Show the pale overall lines. Compare the total slopes, not just the season-by-season segments.",
    tool: "baseballGraph",
    toolOptions: { mode: "overall" },
    advance: "toolComplete"
  },
  {
    id: "batting-sort",
    kicker: "Example 2",
    title: "Sort by comparable at-bats",
    idea: "The paradox softens when we compare similar denominators.",
    body: [],
    instructions: "Reorder each player’s two season segments by number of at-bats. The data do not change; only the organization changes.",
    tool: "baseballGraph",
    toolOptions: { mode: "atBats" },
    advance: "toolComplete"
  },
  {
    id: "batting-denominators",
    kicker: "Example 2",
    title: "Where the trick lives",
    body: [
      "Arlo’s best season came in the small 20 at-bat season. Jackie’s best season came in the large 80 at-bat season.",
      "The overall average gives more weight to the season where each player had more at-bats."
    ],
    prompt: {
      question: "What makes the reversal possible here?",
      choices: [
        "The players have different numbers of at-bats in the seasons where they do well.",
        "Batting average is impossible to graph.",
        "The two seasons have to be ignored."
      ],
      answer: 0
    }
  },
  {
    id: "batting-takeaway",
    kicker: "Example 2",
    title: "The baseball takeaway",
    body: [
      "Arlo leads in each season, but Jackie leads overall because the seasons carry different amounts of weight.",
      "That is the denominator version of Simpson’s Paradox:"
    ],
    callout: "Leading in every subgroup is not enough to guarantee leading overall.",
    advance: "continue"
  },
  {
    id: "triangles-setup",
    kicker: "Example 3",
    title: "Two clues can point the wrong way",
    idea: "Some objects have two hidden features: color and shape.",
    body: [],
    instructions: "Your goal is to find which row has more red triangles. At first, every object is shown as a plain gray square.",
    tool: "redTrianglePuzzle",
    advance: "continue"
  },
  {
    id: "triangles-shape",
    kicker: "Example 3",
    title: "First clue: shape",
    idea: "A clue about one feature can point you toward a row.",
    body: [],
    instructions: "Reveal shape only. You will see triangles and crosses, but the colors stay hidden.",
    tool: "redTrianglePuzzle",
    toolOptions: { mode: "shape" },
    advance: "toolComplete"
  },
  {
    id: "triangles-color",
    kicker: "Example 3",
    title: "Second clue: color",
    idea: "A second clue can point the same way.",
    body: [],
    instructions: "Reveal color only. You will see red and blue objects, but the shapes stay hidden.",
    tool: "redTrianglePuzzle",
    toolOptions: { mode: "color" },
    advance: "toolComplete"
  },
  {
    id: "triangles-guess",
    kicker: "Example 3",
    title: "Make the tempting guess",
    idea: "The separate clues both favor the bottom row.",
    body: [],
    instructions: "Use the clues to guess which row has more red triangles. This is the moment where intuition is supposed to feel pretty confident.",
    tool: "redTrianglePuzzle",
    toolOptions: { mode: "clues" },
    prompt: {
      question: "Which row do you think has more red triangles?",
      choices: [
        "Bottom",
        "Top",
        "They are tied."
      ],
      answer: 1
    }
  },
  {
    id: "triangles-reveal",
    kicker: "Example 3",
    title: "Reveal both features",
    idea: "The combined feature points the other way.",
    body: [],
    instructions: "Now color and shape are visible at the same time. The red triangles are highlighted.",
    tool: "redTrianglePuzzle",
    toolOptions: { mode: "answer" },
    prompt: {
      question: "Why did the separate clues point to the wrong row?",
      choices: [
        "The relationship between red and triangle is different in the two rows.",
        "The bottom row has no objects.",
        "Color and shape are the same feature."
      ],
      answer: 0
    }
  },
  {
    id: "triangles-takeaway",
    kicker: "Example 3",
    title: "The clue trap",
    body: [
      "The bottom row has more red objects and more triangles. But in that row, red and triangle mostly occur on different objects.",
      "The top row has fewer red objects and fewer triangles, but its red objects are the triangles."
    ],
    callout: "Two helpful clues can point the wrong way when the clues are correlated differently inside each group.",
    advance: "continue"
  },
  {
    id: "vaccines-setup",
    kicker: "Application",
    title: "Can the news be right?",
    idea: "A medical version of the baseball problem uses success rates instead of batting averages.",
    body: [
      "One report says vaccine A worked better for males and better for females. Another report says vaccine B worked better overall.",
      "Your friend asks: can both reports be true?"
    ],
    prompt: {
      question: "Which earlier example should this remind us of?",
      choices: [
        "The baseball example, because success rate is another ratio.",
        "The fish example, because vaccines are measured with rulers.",
        "The triangle example, because every object has a hidden shape."
      ],
      answer: 0
    }
  },
  {
    id: "vaccines-read-table",
    kicker: "Application",
    title: "Read the trial table",
    idea: "The success rate is effective divided by number treated.",
    body: [],
    instructions: "The table shows effective and not effective counts. The probability rows below the counts highlight whichever vaccine has the higher success rate in each column.",
    tool: "vaccineChallenge",
    toolOptions: { mode: "readOnly" },
    prompt: {
      question: "In the Males column, what does 2/5 mean for vaccine A?",
      choices: [
        "2 of the 5 males treated with vaccine A had an effective outcome.",
        "2 males took vaccine A and 5 males took vaccine B.",
        "The vaccine was tested for 2 out of 5 years."
      ],
      answer: 0
    }
  },
  {
    id: "vaccines-design",
    kicker: "Application",
    title: "Design the reversal",
    idea: "Try to make A win inside each subgroup, while B wins overall.",
    body: [],
    instructions: "Edit the four subgroup count pairs. Your target is: vaccine A highlighted for males, vaccine A highlighted for females, and vaccine B highlighted for all people.",
    tool: "vaccineChallenge",
    toolOptions: { mode: "guided" },
    advance: "toolComplete"
  },
  {
    id: "vaccines-slope",
    kicker: "Application",
    title: "The graph says the same thing",
    idea: "On this graph, slope is probability of an effective outcome.",
    body: [],
    instructions: "The x-axis is number treated. The y-axis is number effective. Segment slopes show subgroup success rates; pale total lines show overall success rates.",
    tool: "vaccineChallenge",
    toolOptions: { mode: "readOnly" },
    prompt: {
      question: "What does the slope of a vaccine segment represent?",
      choices: [
        "The success probability for that subgroup.",
        "The number of people not treated.",
        "The alphabetical order of the vaccine names."
      ],
      answer: 0
    }
  },
  {
    id: "vaccines-individual",
    kicker: "Application",
    title: "What should one person choose?",
    body: [
      "If you know the person’s subgroup, the subgroup comparison is the relevant comparison.",
      "In the news scenario, vaccine A is better for males and better for females."
    ],
    prompt: {
      question: "Based on those subgroup reports, which vaccine should an individual choose if they are male or female?",
      choices: [
        "Vaccine A",
        "Vaccine B",
        "Whichever vaccine has the better combined total only"
      ],
      answer: 0
    }
  },
  {
    id: "vaccines-production",
    kicker: "Application",
    title: "What should a population choose?",
    body: [
      "If only one vaccine can be produced, the question changes. Now we care about the real population mix: how many males and females will receive the vaccine.",
      "A production decision should weight each subgroup success rate by the number of people in that subgroup."
    ],
    prompt: {
      question: "For a population-wide production choice, what extra information matters?",
      choices: [
        "The number of males and females in the target population.",
        "Only the combined trial total.",
        "The color used to label each vaccine."
      ],
      answer: 0
    }
  },
  {
    id: "vaccines-takeaway",
    kicker: "Application",
    title: "The decision depends on the question",
    body: [
      "For an individual, compare inside the individual’s subgroup. For a production decision, combine subgroup success rates using the actual population mix.",
      "That is why Simpson’s Paradox is not just a math curiosity:"
    ],
    callout: "Grouped evidence can answer one question, while combined evidence answers another.",
    advance: "continue"
  }
];
