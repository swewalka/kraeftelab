import type { LinearSystem } from "../../core/linearSystem";
import type { ProblemDefinition } from "../../model/problemDefinition";
import type { PlanarEquilibriumSolverConfig } from "../../model/solverConfig";
import { buildSemanticValueMap } from "../../semantic/equations";
import type {
  SemanticEquation,
  SemanticEquationSide,
  SemanticEquationTerm,
  SemanticExpression,
  SemanticExpressionNode,
} from "../../semantic/types";

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

type LinearExpression = Readonly<{
  constant: number;
  coefficients: ReadonlyMap<string, number>;
}>;

const emptyLinearExpression = (): LinearExpression => ({
  constant: 0,
  coefficients: new Map<string, number>(),
});

const constantLinearExpression = (constant: number): LinearExpression => ({
  constant,
  coefficients: new Map<string, number>(),
});

const variableLinearExpression = (unknownId: string): LinearExpression => ({
  constant: 0,
  coefficients: new Map([[unknownId, 1]]),
});

const hasUnknownTerms = (expression: LinearExpression): boolean => expression.coefficients.size > 0;

const addLinearExpressions = (left: LinearExpression, right: LinearExpression, rightScale = 1): LinearExpression => {
  const coefficients = new Map(left.coefficients);
  right.coefficients.forEach((coefficient, unknownId) => {
    coefficients.set(unknownId, (coefficients.get(unknownId) ?? 0) + rightScale * coefficient);
  });
  return {
    constant: left.constant + rightScale * right.constant,
    coefficients,
  };
};

const scaleLinearExpression = (expression: LinearExpression, scale: number): LinearExpression => ({
  constant: expression.constant * scale,
  coefficients: new Map([...expression.coefficients].map(([unknownId, coefficient]) => [unknownId, coefficient * scale])),
});

const multiplyLinearExpressions = (
  left: LinearExpression,
  right: LinearExpression,
  context: string,
): LinearExpression => {
  if (hasUnknownTerms(left) && hasUnknownTerms(right)) {
    throw new Error(`${context} is nonlinear because it multiplies unknown-dependent expressions.`);
  }
  if (hasUnknownTerms(left)) {
    return scaleLinearExpression(left, right.constant);
  }
  return scaleLinearExpression(right, left.constant);
};

const divideLinearExpressions = (
  numerator: LinearExpression,
  denominator: LinearExpression,
  context: string,
): LinearExpression => {
  if (hasUnknownTerms(denominator)) {
    throw new Error(`${context} is nonlinear because it divides by an unknown-dependent expression.`);
  }
  if (Math.abs(denominator.constant) < 1e-12) {
    throw new Error(`${context} divides by zero.`);
  }
  return scaleLinearExpression(numerator, 1 / denominator.constant);
};

const linearizeExpressionNode = (
  node: SemanticExpressionNode,
  expression: SemanticExpression,
  unknownIds: ReadonlySet<string>,
  valuesBySymbol: ReadonlyMap<string, number>,
  context: string,
): LinearExpression => {
  if (node.type === "constant") {
    return constantLinearExpression(node.value);
  }
  if (node.type === "symbol") {
    if (unknownIds.has(node.id)) {
      return variableLinearExpression(node.id);
    }
    const value = valuesBySymbol.get(node.id);
    if (value === undefined) {
      throw new Error(`${context} references missing known value "${node.id}".`);
    }
    return constantLinearExpression(value);
  }
  if (node.type === "unary") {
    return scaleLinearExpression(
      linearizeExpressionNode(node.argument, expression, unknownIds, valuesBySymbol, context),
      -1,
    );
  }
  if (node.type === "function") {
    const argument = linearizeExpressionNode(node.argument, expression, unknownIds, valuesBySymbol, context);
    if (hasUnknownTerms(argument)) {
      throw new Error(`${context} is nonlinear because ${node.name}(...) depends on an unknown quantity.`);
    }
    const radians = degreesToRadians(argument.constant);
    return constantLinearExpression(node.name === "sin" ? Math.sin(radians) : Math.cos(radians));
  }

  const left = linearizeExpressionNode(node.left, expression, unknownIds, valuesBySymbol, context);
  const right = linearizeExpressionNode(node.right, expression, unknownIds, valuesBySymbol, context);
  if (node.operator === "+") {
    return addLinearExpressions(left, right);
  }
  if (node.operator === "-") {
    return addLinearExpressions(left, right, -1);
  }
  if (node.operator === "*") {
    return multiplyLinearExpressions(left, right, context);
  }
  return divideLinearExpressions(left, right, context);
};

const linearizeSemanticExpression = (
  expression: SemanticExpression,
  unknownIds: ReadonlySet<string>,
  valuesBySymbol: ReadonlyMap<string, number>,
  context: string,
): LinearExpression => linearizeExpressionNode(expression.ast, expression, unknownIds, valuesBySymbol, context);

const signScale = (sign: "+" | "-"): number => sign === "+" ? 1 : -1;

const linearizeTerm = (
  term: SemanticEquationTerm,
  unknownIds: ReadonlySet<string>,
  valuesBySymbol: ReadonlyMap<string, number>,
  context: string,
): LinearExpression => {
  const baseId = term.quantityId ?? term.parameterId ?? term.componentId;
  if (baseId === undefined) {
    throw new Error(`${context} must reference quantityId, parameterId, or componentId.`);
  }

  const base = unknownIds.has(baseId)
    ? variableLinearExpression(baseId)
    : (() => {
        const value = valuesBySymbol.get(baseId);
        if (value === undefined) {
          throw new Error(`${context} references missing known value "${baseId}".`);
        }
        return constantLinearExpression(value);
      })();
  const factor = term.factor === undefined
    ? constantLinearExpression(1)
    : linearizeSemanticExpression(term.factor, unknownIds, valuesBySymbol, `${context}.factor`);
  return scaleLinearExpression(multiplyLinearExpressions(base, factor, context), signScale(term.sign));
};

const linearizeSide = (
  side: SemanticEquationSide,
  unknownIds: ReadonlySet<string>,
  valuesBySymbol: ReadonlyMap<string, number>,
  context: string,
): LinearExpression => {
  if (side.kind === "expression") {
    return linearizeSemanticExpression(side.expression, unknownIds, valuesBySymbol, context);
  }
  return side.terms.reduce(
    (sum, term, index) =>
      addLinearExpressions(sum, linearizeTerm(term, unknownIds, valuesBySymbol, `${context}.terms[${index}]`)),
    emptyLinearExpression(),
  );
};

export const linearizeSemanticEquation = (
  equation: SemanticEquation,
  unknownIds: ReadonlySet<string>,
  valuesBySymbol: ReadonlyMap<string, number>,
): LinearExpression => {
  if (equation.purpose === "derivedResult") {
    throw new Error(`Semantic equation "${equation.id}" cannot be used as a planar-equilibrium solve equation.`);
  }
  if (equation.unit !== "N" && equation.unit !== "N*m") {
    throw new Error(`Semantic equation "${equation.id}" has unsupported solver unit "${equation.unit}".`);
  }
  const lhs = linearizeSide(equation.lhs, unknownIds, valuesBySymbol, `semantic equation "${equation.id}".lhs`);
  const rhs = linearizeSide(equation.rhs, unknownIds, valuesBySymbol, `semantic equation "${equation.id}".rhs`);
  return addLinearExpressions(lhs, rhs, -1);
};

export const buildPlanarEquilibriumLinearSystem = (
  problem: ProblemDefinition,
  config: PlanarEquilibriumSolverConfig,
): LinearSystem => {
  const unknownIds = new Set(config.unknownQuantityIds);
  const valuesBySymbol = buildSemanticValueMap({
    parameters: problem.parameters,
    unknownReactions: problem.unknownReactions,
    forceDecompositions: problem.forceDecompositions,
    quantityDefinitions: problem.quantities,
    quantities: [],
  });
  const equationsById = new Map(problem.semanticEquations.map((equation) => [equation.id, equation]));

  const rows = config.equationIds.map((equationId) => {
    const equation = equationsById.get(equationId);
    if (!equation) {
      throw new Error(`solverConfig.equationIds references missing semantic equation "${equationId}".`);
    }
    const linearized = linearizeSemanticEquation(equation, unknownIds, valuesBySymbol);
    return {
      coefficients: config.unknownQuantityIds.map((unknownId) => linearized.coefficients.get(unknownId) ?? 0),
      constant: -linearized.constant,
    };
  });

  return {
    coefficients: rows.map((row) => row.coefficients),
    constants: rows.map((row) => row.constant),
    unknownIds: config.unknownQuantityIds,
  };
};
