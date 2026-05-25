import type { ProblemDefinition } from "../model/problemDefinition";
import { solveBeamReactions } from "./equilibrium2D/solveBeamReactions";
import { solvePlanarEquilibrium } from "./equilibrium2D/solvePlanarEquilibrium";
import type { SolverResult } from "./equilibrium2D/types";

export type ProblemSolver = (problem: ProblemDefinition) => SolverResult;

const solverRegistry: Readonly<Record<string, ProblemSolver>> = {
  "simply-supported-beam-reactions": solveBeamReactions,
  "planar-equilibrium": solvePlanarEquilibrium,
};

export const solveProblem = (problem: ProblemDefinition): SolverResult => {
  const solver = solverRegistry[problem.solverKey];
  if (!solver) {
    throw new Error(`No solver registered for solverKey "${problem.solverKey}".`);
  }
  return solver(problem);
};
