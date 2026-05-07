import type { ReactNode } from "react";
import type { DiagramContent } from "../../content/problems/types";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import {
  BeamDiagramLayer,
  getBeamDiagramWorldBounds,
  parseBeamDiagramConfig,
  type WorldBounds,
} from "./BeamDiagramLayer";
import type { DiagramMode, WorldToCanvas } from "./types";

type DiagramRenderInput = Readonly<{
  problem: ProblemDefinition;
  solverResult: SolverResult;
  diagram: DiagramContent;
  mode: DiagramMode;
  worldToCanvas: WorldToCanvas;
}>;

export type DiagramAdapter = Readonly<{
  getWorldBounds: (problem: ProblemDefinition, diagram: DiagramContent) => WorldBounds;
  renderLayer: (input: DiagramRenderInput) => ReactNode;
}>;

const beamDiagramAdapter: DiagramAdapter = {
  getWorldBounds: (problem, diagram) => getBeamDiagramWorldBounds(problem, parseBeamDiagramConfig(diagram.config)),
  renderLayer: ({ problem, solverResult, diagram, mode, worldToCanvas }) => (
    <BeamDiagramLayer
      problem={problem}
      solverResult={solverResult}
      diagramConfig={parseBeamDiagramConfig(diagram.config)}
      mode={mode}
      worldToCanvas={worldToCanvas}
    />
  ),
};

const diagramRegistry: Readonly<Record<string, DiagramAdapter>> = {
  "beam-diagram": beamDiagramAdapter,
};

export const getDiagramAdapter = (diagramKey: string): DiagramAdapter => {
  const adapter = diagramRegistry[diagramKey];
  if (!adapter) {
    throw new Error(`No diagram renderer registered for diagramKey "${diagramKey}".`);
  }
  return adapter;
};
