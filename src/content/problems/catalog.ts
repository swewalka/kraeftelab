import { simpleSupportedBeamCenterLoad } from "./statics/equilibrium/simple-supported-beam-center-load";
import type { LoadedProblemContent } from "./types";

export const problemCatalog: readonly LoadedProblemContent[] = [simpleSupportedBeamCenterLoad];

const firstProblem = problemCatalog[0];
if (!firstProblem) {
  throw new Error("Problem catalog must contain at least one problem.");
}

export const getProblemById = (problemId: string): LoadedProblemContent => {
  const problem = problemCatalog.find((entry) => entry.problem.id === problemId);
  if (!problem) {
    throw new Error(`Unknown problem id "${problemId}".`);
  }
  return problem;
};

export const defaultProblem = firstProblem;
