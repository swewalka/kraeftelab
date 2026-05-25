import { solveLinearSystem } from "../../core/linearSystem";
import type { ProblemDefinition } from "../../model/problemDefinition";
import type { SemanticEquation } from "../../semantic/types";
import { buildPlanarEquilibriumLinearSystem } from "./semanticLinearSystem";

const getScopeId = (equation: SemanticEquation): string | undefined => {
  if (equation.scope.kind === "wholeSystem") {
    return equation.scope.scopeId;
  }
  if (equation.scope.kind === "body") {
    return equation.scope.scopeId;
  }
  return equation.scope.scopeId;
};

const validateSolveEquationUnit = (equation: SemanticEquation, context: string) => {
  if (equation.purpose === "sumMoment") {
    if (equation.unit !== "N*m") {
      throw new Error(`${context} references moment equation "${equation.id}" with unit "${equation.unit}", expected "N*m".`);
    }
    return;
  }

  if (equation.unit !== "N") {
    throw new Error(`${context} references force equation "${equation.id}" with unit "${equation.unit}", expected "N".`);
  }
};

export const validatePlanarEquilibriumSolverConfig = (problem: ProblemDefinition) => {
  if (problem.solverConfig.solverKey !== "planar-equilibrium") {
    return;
  }
  const config = problem.solverConfig;
  const equationsById = new Map(problem.semanticEquations.map((equation) => [equation.id, equation]));
  const configuredScopeIds = new Set(config.scopeIds);

  config.equationIds.forEach((equationId, index) => {
    const equation = equationsById.get(equationId);
    if (!equation) {
      throw new Error(`solverConfig.equationIds[${index}] references missing semantic equation "${equationId}".`);
    }
    if (equation.purpose === "derivedResult") {
      throw new Error(`solverConfig.equationIds[${index}] cannot reference derived-result equation "${equationId}".`);
    }
    validateSolveEquationUnit(equation, `solverConfig.equationIds[${index}]`);
    const scopeId = getScopeId(equation);
    if (scopeId === undefined) {
      throw new Error(`solverConfig.equationIds[${index}] references equation "${equationId}" without a scopeId.`);
    }
    if (!configuredScopeIds.has(scopeId)) {
      throw new Error(`solverConfig.equationIds[${index}] references equation "${equationId}" outside configured scopeIds.`);
    }
  });

  const system = buildPlanarEquilibriumLinearSystem(problem, config);
  solveLinearSystem(system);
};
