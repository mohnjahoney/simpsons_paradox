import { layoutFamilies } from "./layout.js";
import { pages, standardCelebration } from "./pages.js";
import { toolRenderers } from "./tools/index.js";
import { visualRenderers } from "./visuals.js";

export const simpsonsLesson = {
  title: "Simpson's Paradox",
  pages,
  celebration: standardCelebration,
  layoutFamilies,
  toolRenderers,
  visualRenderers,
  interactiveSelector: ".trend-handle, .draggable-measure-fish",
  summary: {
    kicker: "Wrap-Up",
    title: "Your Simpson Radar is warming up",
    body: "Across these scenes, the recurring lesson is that grouped data can tell a different story than aggregated data. Before trusting a total, look for hidden subgroups, denominator imbalances, and relationships among the features.",
    restartLabel: "Restart"
  }
};
