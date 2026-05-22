import type {
  BodyDefinition,
  ForceDecomposition,
  LoadDefinition,
  ParameterDefinition,
  PointDefinition,
  SupportDefinition,
  UnknownReaction,
} from "../model/types";
import { parseSemanticExpression } from "./expression";
import type {
  SemanticEquation,
  SemanticEquationPurpose,
  SemanticEquationScope,
  SemanticEquationSide,
  SemanticEquationTerm,
  SemanticUnit,
} from "./types";

type JsonRecord = Record<string, unknown>;

export type SemanticProblemContext = Readonly<{
  points: readonly PointDefinition[];
  bodies: readonly BodyDefinition[];
  supports: readonly SupportDefinition[];
  loads: readonly LoadDefinition[];
  parameters: readonly ParameterDefinition[];
  forceDecompositions: readonly ForceDecomposition[];
  unknownReactions: readonly UnknownReaction[];
}>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireRecord = (value: unknown, context: string): JsonRecord => {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }
  return value;
};

const requireString = (record: JsonRecord, key: string, context: string): string => {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${context}.${key} must be a non-empty string.`);
  }
  return value;
};

const parseStringArray = (value: unknown, context: string): readonly string[] => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array.`);
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || item.length === 0) {
      throw new Error(`${context}[${index}] must be a non-empty string.`);
    }
    return item;
  });
};

const requireArray = (record: JsonRecord, key: string, context: string): readonly unknown[] => {
  const value = record[key];
  if (!Array.isArray(value)) {
    throw new Error(`${context}.${key} must be an array.`);
  }
  return value;
};

const parseSemanticUnit = (value: string, context: string): SemanticUnit => {
  if (value !== "dimensionless" && value !== "m" && value !== "N" && value !== "N*m" && value !== "deg") {
    throw new Error(`${context} must be "dimensionless", "m", "N", "N*m", or "deg".`);
  }
  return value;
};

const parsePurpose = (value: string, context: string): SemanticEquationPurpose => {
  if (value !== "sumForceX" && value !== "sumForceY" && value !== "sumMoment" && value !== "derivedResult") {
    throw new Error(`${context} must be "sumForceX", "sumForceY", "sumMoment", or "derivedResult".`);
  }
  return value;
};

const ensureUniqueIds = (items: readonly { id: string }[], context: string) => {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`${context} contains duplicate id "${item.id}".`);
    }
    ids.add(item.id);
  }
};

const requireId = (ids: ReadonlySet<string>, id: string, context: string) => {
  if (!ids.has(id)) {
    throw new Error(`${context} references missing id "${id}".`);
  }
};

const getComponentIds = (context: SemanticProblemContext): ReadonlySet<string> =>
  new Set(
    context.forceDecompositions.flatMap((decomposition) => [
      decomposition.components.x.id,
      decomposition.components.y.id,
    ]),
  );

export const getSemanticMechanicsObjectIds = (context: SemanticProblemContext): ReadonlySet<string> => {
  const componentIds = getComponentIds(context);
  return new Set([
    ...context.points.map((point) => point.id),
    ...context.bodies.map((body) => body.id),
    ...context.supports.map((support) => support.id),
    ...context.loads.map((load) => load.id),
    ...context.unknownReactions.map((reaction) => reaction.id),
    ...componentIds,
  ]);
};

const getSemanticSymbolIds = (context: SemanticProblemContext): ReadonlySet<string> =>
  new Set([
    ...context.parameters.map((parameter) => parameter.id),
    ...context.unknownReactions.map((reaction) => reaction.id),
    ...getComponentIds(context),
  ]);

const validateExpressionSymbols = (
  expressionSymbols: readonly string[],
  knownSymbolIds: ReadonlySet<string>,
  context: string,
) => expressionSymbols.forEach((symbol) => requireId(knownSymbolIds, symbol, context));

const parseScope = (value: unknown, problemContext: SemanticProblemContext, context: string): SemanticEquationScope => {
  const record = requireRecord(value, context);
  const kind = requireString(record, "kind", context);
  if (kind === "wholeSystem") {
    return { kind };
  }
  if (kind === "body") {
    const bodyId = requireString(record, "bodyId", context);
    requireId(new Set(problemContext.bodies.map((body) => body.id)), bodyId, `${context}.bodyId`);
    return { kind, bodyId };
  }
  throw new Error(`${context}.kind must be "wholeSystem" or "body".`);
};

const parseTerm = (
  value: unknown,
  equationUnit: SemanticUnit,
  knownSymbolIds: ReadonlySet<string>,
  knownMechanicsObjectIds: ReadonlySet<string>,
  problemContext: SemanticProblemContext,
  context: string,
): SemanticEquationTerm => {
  const record = requireRecord(value, context);
  const sign = requireString(record, "sign", context);
  if (sign !== "+" && sign !== "-") {
    throw new Error(`${context}.sign must be "+" or "-".`);
  }
  const unit = parseSemanticUnit(requireString(record, "unit", context), `${context}.unit`);
  if (unit !== equationUnit) {
    throw new Error(`${context}.unit "${unit}" must match equation unit "${equationUnit}".`);
  }

  const quantityId = record.quantityId === undefined ? undefined : requireString(record, "quantityId", context);
  const parameterId = record.parameterId === undefined ? undefined : requireString(record, "parameterId", context);
  const componentId = record.componentId === undefined ? undefined : requireString(record, "componentId", context);
  if (quantityId === undefined && parameterId === undefined && componentId === undefined) {
    throw new Error(`${context} must reference quantityId, parameterId, or componentId.`);
  }

  const quantityIds = new Set(problemContext.unknownReactions.map((reaction) => reaction.id));
  const parameterIds = new Set(problemContext.parameters.map((parameter) => parameter.id));
  const componentIds = getComponentIds(problemContext);
  if (quantityId !== undefined) {
    requireId(quantityIds, quantityId, `${context}.quantityId`);
  }
  if (parameterId !== undefined) {
    requireId(parameterIds, parameterId, `${context}.parameterId`);
  }
  if (componentId !== undefined) {
    requireId(componentIds, componentId, `${context}.componentId`);
  }

  const factor =
    record.factor === undefined ? undefined : parseSemanticExpression(requireString(record, "factor", context));
  if (factor !== undefined) {
    validateExpressionSymbols(factor.symbols, knownSymbolIds, `${context}.factor`);
  }

  const mechanicsObjectIds = parseStringArray(record.mechanicsObjectIds, `${context}.mechanicsObjectIds`);
  mechanicsObjectIds.forEach((id) => requireId(knownMechanicsObjectIds, id, `${context}.mechanicsObjectIds`));

  return {
    id: requireString(record, "id", context),
    sign,
    unit,
    ...(quantityId === undefined ? {} : { quantityId }),
    ...(parameterId === undefined ? {} : { parameterId }),
    ...(componentId === undefined ? {} : { componentId }),
    ...(factor === undefined ? {} : { factor }),
    mechanicsObjectIds,
    ...(record.latex === undefined ? {} : { latex: requireString(record, "latex", context) }),
  };
};

const parseSide = (
  value: unknown,
  equationUnit: SemanticUnit,
  knownSymbolIds: ReadonlySet<string>,
  knownMechanicsObjectIds: ReadonlySet<string>,
  problemContext: SemanticProblemContext,
  context: string,
): SemanticEquationSide => {
  if (typeof value === "string") {
    const expression = parseSemanticExpression(value);
    validateExpressionSymbols(expression.symbols, knownSymbolIds, context);
    return { kind: "expression", expression };
  }

  const record = requireRecord(value, context);
  if (record.expression !== undefined) {
    const expression = parseSemanticExpression(requireString(record, "expression", context));
    validateExpressionSymbols(expression.symbols, knownSymbolIds, `${context}.expression`);
    return { kind: "expression", expression };
  }

  const terms = requireArray(record, "terms", context).map((term, index) =>
    parseTerm(
      term,
      equationUnit,
      knownSymbolIds,
      knownMechanicsObjectIds,
      problemContext,
      `${context}.terms[${index}]`,
    ),
  );
  ensureUniqueIds(terms, `${context}.terms`);
  return { kind: "terms", terms };
};

export const parseSemanticEquations = (
  value: unknown,
  problemContext: SemanticProblemContext,
): readonly SemanticEquation[] => {
  const rawEquations = Array.isArray(value) ? value : (() => {
    throw new Error("problem.semanticEquations must be an array.");
  })();
  const knownSymbolIds = getSemanticSymbolIds(problemContext);
  const knownMechanicsObjectIds = getSemanticMechanicsObjectIds(problemContext);
  const pointIds = new Set(problemContext.points.map((point) => point.id));

  const equations = rawEquations.map((item, index): SemanticEquation => {
    const record = requireRecord(item, `problem.semanticEquations[${index}]`);
    const purpose = parsePurpose(requireString(record, "purpose", `problem.semanticEquations[${index}]`), `problem.semanticEquations[${index}].purpose`);
    const unit = parseSemanticUnit(requireString(record, "unit", `problem.semanticEquations[${index}]`), `problem.semanticEquations[${index}].unit`);
    const momentPointId =
      record.momentPointId === undefined
        ? undefined
        : requireString(record, "momentPointId", `problem.semanticEquations[${index}]`);
    if (purpose === "sumMoment" && momentPointId === undefined) {
      throw new Error(`problem.semanticEquations[${index}].momentPointId is required for sumMoment equations.`);
    }
    if (momentPointId !== undefined) {
      requireId(pointIds, momentPointId, `problem.semanticEquations[${index}].momentPointId`);
    }

    return {
      id: requireString(record, "id", `problem.semanticEquations[${index}]`),
      purpose,
      scope: parseScope(record.scope, problemContext, `problem.semanticEquations[${index}].scope`),
      unit,
      ...(momentPointId === undefined ? {} : { momentPointId }),
      lhs: parseSide(record.lhs, unit, knownSymbolIds, knownMechanicsObjectIds, problemContext, `problem.semanticEquations[${index}].lhs`),
      rhs: parseSide(record.rhs, unit, knownSymbolIds, knownMechanicsObjectIds, problemContext, `problem.semanticEquations[${index}].rhs`),
      ...(record.displayLatex === undefined
        ? {}
        : { displayLatex: requireString(record, "displayLatex", `problem.semanticEquations[${index}]`) }),
    };
  });

  ensureUniqueIds(equations, "problem.semanticEquations");
  return equations;
};

export const findSemanticEquationTerm = (
  equations: readonly SemanticEquation[],
  equationId: string,
  termId: string,
): SemanticEquationTerm => {
  const equation = equations.find((candidate) => candidate.id === equationId);
  if (!equation) {
    throw new Error(`Semantic equation "${equationId}" does not exist.`);
  }
  if (equation.lhs.kind !== "terms") {
    throw new Error(`Semantic equation "${equationId}" does not expose lhs terms.`);
  }
  const term = equation.lhs.terms.find((candidate) => candidate.id === termId);
  if (!term) {
    throw new Error(`Semantic equation "${equationId}" does not contain term "${termId}".`);
  }
  return term;
};
