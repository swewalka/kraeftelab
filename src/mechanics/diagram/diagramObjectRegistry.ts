import type { ProblemDefinition } from "../model/problemDefinition";
import {
  getBeamDiagramBaseObjectIds,
  getBeamDiagramRendererObjectIds,
  parseBeamDiagramConfig,
  validateBeamDiagramProblemReferences,
} from "./beamDiagramConfig";

export type DiagramObjectReferenceSet = Readonly<{
  rendererObjectIds: ReadonlySet<string>;
  baseObjectIds: ReadonlySet<string>;
}>;

export const getDiagramObjectReferenceSet = (
  problem: ProblemDefinition,
  diagramKey: string,
  config: unknown,
): DiagramObjectReferenceSet => {
  if (diagramKey === "beam-diagram") {
    const beamConfig = parseBeamDiagramConfig(config, "diagram.config");
    validateBeamDiagramProblemReferences(problem, beamConfig, "diagram.config");
    return {
      rendererObjectIds: getBeamDiagramRendererObjectIds(beamConfig),
      baseObjectIds: getBeamDiagramBaseObjectIds(beamConfig),
    };
  }

  throw new Error(`No diagram object registry registered for diagramKey "${diagramKey}".`);
};
