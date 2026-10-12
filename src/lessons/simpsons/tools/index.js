import { createBaseballGraph } from "./baseballGraph.js";
import { createBaseballStats } from "./baseballStats.js";
import { createFishCanvas } from "./fishCanvas.js";
import { createFishMeasureGraph } from "./fishMeasureGraph.js";
import { createFishTrendGraph } from "./fishTrendGraph.js";
import { createFloatingFishPond } from "./floatingFishPond.js";
import { createFeatureGroupingChallenge } from "./featureGroupingChallenge.js";
import { createRedTrianglePuzzle } from "./redTrianglePuzzle.js";
import { createVaccineChallenge } from "./vaccineChallenge.js";

export const toolRenderers = {
  baseballGraph: createBaseballGraph,
  baseballStats: createBaseballStats,
  fishCanvas: createFishCanvas,
  fishMeasureGraph: createFishMeasureGraph,
  fishTrendGraph: createFishTrendGraph,
  floatingFishPond: createFloatingFishPond,
  featureGroupingChallenge: createFeatureGroupingChallenge,
  redTrianglePuzzle: createRedTrianglePuzzle,
  vaccineChallenge: createVaccineChallenge
};
