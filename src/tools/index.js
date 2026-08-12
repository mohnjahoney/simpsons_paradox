import { createFishCanvas } from "./fishCanvas.js";
import { createFishMeasureGraph } from "./fishMeasureGraph.js?v=20260611-27";
import { createFishTrendGraph } from "./fishTrendGraph.js?v=20260611-26";
import { createFloatingFishPond } from "./floatingFishPond.js";
import { createBaseballGraph } from "./baseballGraph.js?v=20260628-3";
import { createBaseballStats } from "./baseballStats.js?v=20260628-1";
import { createRedTrianglePuzzle } from "./redTrianglePuzzle.js?v=20260812-3";
import { createVaccineChallenge } from "./vaccineChallenge.js?v=20260812-3";

export const toolRenderers = {
  baseballGraph: createBaseballGraph,
  baseballStats: createBaseballStats,
  fishCanvas: createFishCanvas,
  fishMeasureGraph: createFishMeasureGraph,
  fishTrendGraph: createFishTrendGraph,
  floatingFishPond: createFloatingFishPond,
  redTrianglePuzzle: createRedTrianglePuzzle,
  vaccineChallenge: createVaccineChallenge
};
