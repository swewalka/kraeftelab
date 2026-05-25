import { solveLinearSystem } from "../../core/linearSystem";
import type { ProblemDefinition } from "../../model/problemDefinition";
import type { PlanarEquilibriumSolverConfig } from "../../model/solverConfig";
import { assertSemanticEquationResiduals, buildSemanticValueMap, evaluateSemanticEquations } from "../../semantic/equations";
import type { SemanticQuantityValue } from "../../semantic/types";
import { buildPlanarEquilibriumLinearSystem } from "./semanticLinearSystem";
import type { SolverResult } from "./types";

const getQuantityDefinition = (problem: ProblemDefinition, quantityId: string) => {
  const reaction = problem.unknownReactions.find((candidate) => candidate.id === quantityId);
  if (reaction !== undefined) {
    return { id: reaction.id, label: reaction.label, unit: "N" as const };
  }
  const quantity = problem.quantities.find((candidate) => candidate.id === quantityId);
  if (quantity !== undefined) {
    return { id: quantity.id, label: quantity.label, unit: quantity.unit };
  }
  throw new Error(`Planar equilibrium solver references missing quantity "${quantityId}".`);
};

const buildQuantityValue = (
  problem: ProblemDefinition,
  valuesById: ReadonlyMap<string, number>,
  quantityId: string,
): SemanticQuantityValue => {
  const definition = getQuantityDefinition(problem, quantityId);
  const value = valuesById.get(quantityId);
  if (value === undefined) {
    throw new Error(`Planar equilibrium solver did not produce value for result quantity "${quantityId}".`);
  }
  return {
    id: definition.id,
    label: definition.label,
    value,
    unit: definition.unit,
  };
};

const getResultQuantityIds = (config: PlanarEquilibriumSolverConfig): readonly string[] =>
  config.resultQuantityIds ?? config.unknownQuantityIds;

export const solvePlanarEquilibrium = (problem: ProblemDefinition): SolverResult => {
  if (problem.solverConfig.solverKey !== "planar-equilibrium") {
    throw new Error(`Planar equilibrium solver received solverKey "${problem.solverConfig.solverKey}".`);
  }
  const config = problem.solverConfig;
  const system = buildPlanarEquilibriumLinearSystem(problem, config);
  const solution = solveLinearSystem(system);
  const solvedValues = new Map(Object.entries(solution));
  const knownValues = buildSemanticValueMap({
    parameters: problem.parameters,
    unknownReactions: problem.unknownReactions,
    forceDecompositions: problem.forceDecompositions,
    quantityDefinitions: problem.quantities,
    quantities: [],
  });
  knownValues.forEach((value, id) => {
    if (!solvedValues.has(id)) {
      solvedValues.set(id, value);
    }
  });

  const quantities = getResultQuantityIds(config).map((quantityId) =>
    buildQuantityValue(problem, solvedValues, quantityId),
  );
  const solvedQuantities = config.unknownQuantityIds.map((quantityId) =>
    buildQuantityValue(problem, solvedValues, quantityId),
  );
  const evaluationEquationIds = new Set([...config.equationIds, ...config.checkEquationIds]);
  const equationsToEvaluate = problem.semanticEquations.filter((equation) => evaluationEquationIds.has(equation.id));
  const semanticEquationEvaluations = evaluateSemanticEquations(equationsToEvaluate, {
    parameters: problem.parameters,
    unknownReactions: problem.unknownReactions,
    forceDecompositions: problem.forceDecompositions,
    quantityDefinitions: problem.quantities,
    quantities: solvedQuantities,
  });
  assertSemanticEquationResiduals(semanticEquationEvaluations);

  return {
    problemId: problem.id,
    reactions: quantities
      .filter((quantity) => quantity.unit === "N" && problem.unknownReactions.some((reaction) => reaction.id === quantity.id))
      .map((quantity) => ({
        id: quantity.id,
        label: quantity.label,
        value: quantity.value,
        unit: "N",
      })),
    quantities,
    equations: semanticEquationEvaluations.map((equation) => ({
      id: equation.id,
      symbolic: equation.symbolic,
      residual: equation.residual,
    })),
  };
};
