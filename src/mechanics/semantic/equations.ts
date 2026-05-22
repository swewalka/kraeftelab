import type { ForceDecomposition, ParameterDefinition, UnknownReaction } from "../model/types";
import { resolveForceDecomposition } from "../core/forceDecomposition";
import { evaluateSemanticExpression, renderSemanticExpression } from "./expression";
import type {
  SemanticEquation,
  SemanticEquationEvaluation,
  SemanticEquationSide,
  SemanticEquationTerm,
  SemanticQuantityValue,
} from "./types";

type SemanticRuntimeContext = Readonly<{
  parameters: readonly ParameterDefinition[];
  unknownReactions: readonly UnknownReaction[];
  forceDecompositions: readonly ForceDecomposition[];
  quantities: readonly SemanticQuantityValue[];
}>;

const signMultiplier = (sign: "+" | "-"): number => sign === "+" ? 1 : -1;

export const buildSemanticValueMap = (context: SemanticRuntimeContext): ReadonlyMap<string, number> => {
  const values = new Map<string, number>();
  context.parameters.forEach((parameter) => values.set(parameter.id, parameter.value));
  context.quantities.forEach((quantity) => values.set(quantity.id, quantity.value));
  context.forceDecompositions.forEach((decomposition) => {
    const resolved = resolveForceDecomposition(decomposition, context.parameters);
    values.set(decomposition.components.x.id, resolved.components.x);
    values.set(decomposition.components.y.id, resolved.components.y);
  });
  return values;
};

export const buildSemanticLabelMap = (context: SemanticRuntimeContext): ReadonlyMap<string, string> => {
  const labels = new Map<string, string>();
  context.parameters.forEach((parameter) => labels.set(parameter.id, parameter.label));
  context.unknownReactions.forEach((reaction) => labels.set(reaction.id, reaction.label));
  context.quantities.forEach((quantity) => labels.set(quantity.id, quantity.label));
  context.forceDecompositions.forEach((decomposition) => {
    labels.set(decomposition.components.x.id, decomposition.components.x.latex);
    labels.set(decomposition.components.y.id, decomposition.components.y.latex);
  });
  return labels;
};

const evaluateTerm = (term: SemanticEquationTerm, valuesBySymbol: ReadonlyMap<string, number>): number => {
  const baseId = term.quantityId ?? term.parameterId ?? term.componentId;
  if (baseId === undefined) {
    throw new Error(`Semantic term "${term.id}" must reference a quantity, parameter, or component.`);
  }
  const baseValue = valuesBySymbol.get(baseId);
  if (baseValue === undefined) {
    throw new Error(`Semantic term "${term.id}" references missing value "${baseId}".`);
  }
  const factor = term.factor === undefined ? 1 : evaluateSemanticExpression(term.factor, valuesBySymbol);
  return signMultiplier(term.sign) * baseValue * factor;
};

const evaluateSide = (side: SemanticEquationSide, valuesBySymbol: ReadonlyMap<string, number>): number => {
  if (side.kind === "expression") {
    return evaluateSemanticExpression(side.expression, valuesBySymbol);
  }
  return side.terms.reduce((sum, term) => sum + evaluateTerm(term, valuesBySymbol), 0);
};

const renderTerm = (term: SemanticEquationTerm, labelsBySymbol: ReadonlyMap<string, string>): string => {
  const sign = term.sign === "+" ? "+" : "-";
  if (term.latex !== undefined) {
    return `${sign} ${term.latex}`;
  }

  const baseId = term.quantityId ?? term.parameterId ?? term.componentId;
  if (baseId === undefined) {
    throw new Error(`Semantic term "${term.id}" must reference a quantity, parameter, or component.`);
  }
  const base = labelsBySymbol.get(baseId) ?? baseId;
  const factor = term.factor === undefined ? "" : ` \\cdot ${renderSemanticExpression(term.factor, labelsBySymbol)}`;
  return `${sign} ${base}${factor}`;
};

const normalizeLeadingPlus = (latex: string): string => latex.replace(/^\+\s*/, "");

const renderSide = (side: SemanticEquationSide, labelsBySymbol: ReadonlyMap<string, string>): string => {
  if (side.kind === "expression") {
    return renderSemanticExpression(side.expression, labelsBySymbol);
  }
  if (side.terms.length === 0) {
    return "0";
  }
  return normalizeLeadingPlus(side.terms.map((term) => renderTerm(term, labelsBySymbol)).join(" "));
};

export const renderSemanticEquation = (
  equation: SemanticEquation,
  labelsBySymbol: ReadonlyMap<string, string>,
): string => {
  if (equation.displayLatex !== undefined) {
    return equation.displayLatex;
  }
  return `${renderSide(equation.lhs, labelsBySymbol)} = ${renderSide(equation.rhs, labelsBySymbol)}`;
};

export const evaluateSemanticEquations = (
  equations: readonly SemanticEquation[],
  context: SemanticRuntimeContext,
): readonly SemanticEquationEvaluation[] => {
  const valuesBySymbol = buildSemanticValueMap(context);
  const labelsBySymbol = buildSemanticLabelMap(context);
  return equations.map((equation) => ({
    id: equation.id,
    symbolic: renderSemanticEquation(equation, labelsBySymbol),
    residual: evaluateSide(equation.lhs, valuesBySymbol) - evaluateSide(equation.rhs, valuesBySymbol),
  }));
};

export const assertSemanticEquationResiduals = (
  evaluations: readonly SemanticEquationEvaluation[],
  tolerance = 1e-6,
) => {
  evaluations.forEach((evaluation) => {
    if (Math.abs(evaluation.residual) > tolerance) {
      throw new Error(
        `Semantic equation "${evaluation.id}" residual ${evaluation.residual.toExponential(3)} exceeds tolerance.`,
      );
    }
  });
};
