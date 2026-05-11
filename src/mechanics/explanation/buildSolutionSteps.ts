import type { SolutionStep } from "../model/types";
import type { SolutionContent } from "./types";
import type { SolverResult } from "../solvers/equilibrium2D/types";

export const buildSolutionSteps = (
  solution: SolutionContent,
  result: SolverResult,
): readonly SolutionStep[] => {
  const solverEquationsById = new Map(result.equations.map((equation) => [equation.id, equation]));
  const equationContentById = new Map(solution.equations.map((equation) => [equation.id, equation]));

  return solution.steps.map((step): SolutionStep => {
    const equations = step.equationIds?.map((equationId) => {
      const solverEquation = solverEquationsById.get(equationId);
      const equationContent = equationContentById.get(equationId);

      if (!solverEquation) {
        throw new Error(`Solution step "${step.id}" references missing solver equation "${equationId}".`);
      }
      if (!equationContent) {
        throw new Error(`Solution step "${step.id}" references missing equation content "${equationId}".`);
      }

      return {
        ...solverEquation,
        title: equationContent.title,
        explanation: equationContent.explanation,
      };
    });

    const solutionStep = {
      id: step.id,
      title: step.title,
      body: step.body,
      ...(step.canvasState === undefined ? {} : { canvasState: step.canvasState }),
    };

    return equations === undefined ? solutionStep : { ...solutionStep, equations };
  });
};
