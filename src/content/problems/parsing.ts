import { vector, type Vector2 } from "../../mechanics/core/vector";
import type { ContentBlock } from "../../mechanics/content/types";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { CanvasState } from "../../mechanics/model/canvasState";
import { getDiagramObjectReferenceSet } from "../../mechanics/diagram/diagramObjectRegistry";
import type {
  BodyDefinition,
  ForceDecomposition,
  ForceDecompositionComponent,
  LoadDefinition,
  ParameterDefinition,
  PointDefinition,
  SupportDefinition,
  UnknownReaction,
} from "../../mechanics/model/types";
import {
  assertVectorMatchesForceDecomposition,
  resolveForceDecomposition,
} from "../../mechanics/core/forceDecomposition";
import {
  parseSolverConfig,
  validateSolverConfigEquationIds,
} from "../../mechanics/solvers/solverConfigRegistry";
import {
  findSemanticEquationTerm,
  parseSemanticEquations,
} from "../../mechanics/semantic/parsing";
import { renderSemanticExpression } from "../../mechanics/semantic/expression";
import type { SemanticEquation, SemanticEquationTerm } from "../../mechanics/semantic/types";
import type {
  DiagramContent,
  ExploreContent,
  LoadedProblemContent,
} from "./types";
import type { SolutionContent, SolutionStepContent } from "../../mechanics/explanation/types";
import type {
  CanvasClickInteraction,
  EquationBuilderInteraction,
  EquationTerm,
  ExpectedEquation,
  PracticeContent,
  PracticeHint,
  PracticeInteraction,
  PracticeStep,
} from "../../mechanics/practice/types";

type JsonRecord = Record<string, unknown>;

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

const requireNumber = (record: JsonRecord, key: string, context: string): number => {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${context}.${key} must be a finite number.`);
  }
  return value;
};

const requireArray = (record: JsonRecord, key: string, context: string): readonly unknown[] => {
  const value = record[key];
  if (!Array.isArray(value)) {
    throw new Error(`${context}.${key} must be an array.`);
  }
  return value;
};

const parseStringArray = (value: unknown, context: string): readonly string[] => {
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

const parseOptionalStringArray = (record: JsonRecord, key: string, context: string): readonly string[] | undefined =>
  record[key] === undefined ? undefined : parseStringArray(record[key], `${context}.${key}`);

const parseContentBlock = (value: unknown, context: string): ContentBlock => {
  const record = requireRecord(value, context);
  const type = requireString(record, "type", context);

  if (type === "paragraph") {
    return { type, text: requireString(record, "text", context) };
  }

  if (type === "math") {
    const display = record.display === undefined ? undefined : requireString(record, "display", context);
    if (display !== undefined && display !== "block" && display !== "inline") {
      throw new Error(`${context}.display must be "block" or "inline".`);
    }
    const tone = record.tone === undefined ? undefined : requireString(record, "tone", context);
    if (tone !== undefined && tone !== "default" && tone !== "result") {
      throw new Error(`${context}.tone must be "default" or "result".`);
    }
    return {
      type,
      latex: requireString(record, "latex", context),
      ...(display === undefined ? {} : { display }),
      ...(tone === undefined ? {} : { tone }),
    };
  }

  if (type === "list") {
    return { type, items: parseStringArray(record.items, `${context}.items`) };
  }

  throw new Error(`${context}.type "${type}" is not a supported content block type.`);
};

const parseContentBlocks = (value: unknown, context: string): readonly ContentBlock[] => {
  if (typeof value === "string") {
    return [{ type: "paragraph", text: value }];
  }
  return requireArray({ content: value }, "content", context).map((item, index) =>
    parseContentBlock(item, `${context}[${index}]`),
  );
};

const parseVector = (value: unknown, context: string): Vector2 => {
  const record = requireRecord(value, context);
  return vector(requireNumber(record, "x", context), requireNumber(record, "y", context));
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

const parsePoint = (value: unknown, context: string): PointDefinition => {
  const record = requireRecord(value, context);
  return {
    id: requireString(record, "id", context),
    label: requireString(record, "label", context),
    x: requireNumber(record, "x", context),
    y: requireNumber(record, "y", context),
  };
};

const parseParameter = (value: unknown, context: string): ParameterDefinition => {
  const record = requireRecord(value, context);
  const unit = requireString(record, "unit", context);
  if (unit !== "m" && unit !== "N" && unit !== "deg") {
    throw new Error(`${context}.unit must be "m", "N", or "deg".`);
  }

  return {
    id: requireString(record, "id", context),
    label: requireString(record, "label", context),
    value: requireNumber(record, "value", context),
    unit,
    displayValue: requireString(record, "displayValue", context),
  };
};

const parseBody = (value: unknown, context: string): BodyDefinition => {
  const record = requireRecord(value, context);
  const kind = requireString(record, "kind", context);
  if (kind !== "rigidBeam") {
    throw new Error(`${context}.kind must be "rigidBeam".`);
  }

  return {
    id: requireString(record, "id", context),
    label: requireString(record, "label", context),
    kind,
    startPointId: requireString(record, "startPointId", context),
    endPointId: requireString(record, "endPointId", context),
  };
};

const parseSupport = (value: unknown, context: string): SupportDefinition => {
  const record = requireRecord(value, context);
  const kind = requireString(record, "kind", context);
  if (kind !== "pin" && kind !== "roller") {
    throw new Error(`${context}.kind must be "pin" or "roller".`);
  }

  return {
    id: requireString(record, "id", context),
    label: requireString(record, "label", context),
    kind,
    pointId: requireString(record, "pointId", context),
    bodyId: requireString(record, "bodyId", context),
  };
};

const parseLoad = (
  value: unknown,
  context: string,
  pointsById: ReadonlyMap<string, PointDefinition>,
): LoadDefinition => {
  const record = requireRecord(value, context);
  const kind = requireString(record, "kind", context);
  if (kind !== "pointForce") {
    throw new Error(`${context}.kind must be "pointForce".`);
  }

  const positionPointId = requireString(record, "positionPointId", context);
  const position = pointsById.get(positionPointId);
  if (!position) {
    throw new Error(`${context}.positionPointId references missing point "${positionPointId}".`);
  }

  return {
    id: requireString(record, "id", context),
    label: requireString(record, "label", context),
    kind,
    bodyId: requireString(record, "bodyId", context),
    position,
    vector: parseVector(record.vector, `${context}.vector`),
    displayMagnitude: requireString(record, "displayMagnitude", context),
  };
};

const parseUnknownReaction = (value: unknown, context: string): UnknownReaction => {
  const record = requireRecord(value, context);
  const component = requireString(record, "component", context);
  if (component !== "x" && component !== "y") {
    throw new Error(`${context}.component must be "x" or "y".`);
  }

  return {
    id: requireString(record, "id", context),
    label: requireString(record, "label", context),
    supportId: requireString(record, "supportId", context),
    component,
    direction: parseVector(record.direction, `${context}.direction`),
  };
};

const parseForceDecompositionComponent = (
  value: unknown,
  axis: "x" | "y",
  context: string,
): ForceDecompositionComponent => {
  const record = requireRecord(value, context);
  const parsedAxis = requireString(record, "axis", context);
  if (parsedAxis !== axis) {
    throw new Error(`${context}.axis must be "${axis}".`);
  }
  const sign = requireString(record, "sign", context);
  if (sign !== "+" && sign !== "-") {
    throw new Error(`${context}.sign must be "+" or "-".`);
  }

  return {
    id: requireString(record, "id", context),
    axis,
    sign,
    factor: requireString(record, "factor", context),
    expression: requireString(record, "expression", context),
    latex: requireString(record, "latex", context),
  };
};

const parseForceDecomposition = (value: unknown, context: string): ForceDecomposition => {
  const record = requireRecord(value, context);
  const angleReference = requireString(record, "angleReference", context);
  if (angleReference !== "positive-x") {
    throw new Error(`${context}.angleReference must be "positive-x".`);
  }

  const components = requireRecord(record.components, `${context}.components`);
  return {
    id: requireString(record, "id", context),
    forceId: requireString(record, "forceId", context),
    magnitudeParameterId: requireString(record, "magnitudeParameterId", context),
    angleParameterId: requireString(record, "angleParameterId", context),
    angleReference,
    components: {
      x: parseForceDecompositionComponent(components.x, "x", `${context}.components.x`),
      y: parseForceDecompositionComponent(components.y, "y", `${context}.components.y`),
    },
  };
};

const parseExplore = (value: unknown): ExploreContent => {
  if (value === undefined) {
    return { notices: [] };
  }

  const record = requireRecord(value, "problem.explore");
  const noticeTitle = record.noticeTitle === undefined ? undefined : requireString(record, "noticeTitle", "problem.explore");
  const notices = parseStringArray(record.notices ?? [], "problem.explore.notices");
  const observedQuantityIds =
    record.observedQuantityIds === undefined
      ? undefined
      : parseStringArray(record.observedQuantityIds, "problem.explore.observedQuantityIds");

  return {
    ...(noticeTitle === undefined ? {} : { noticeTitle }),
    notices,
    ...(observedQuantityIds === undefined ? {} : { observedQuantityIds }),
  };
};

const parseProblem = (raw: unknown): { problem: ProblemDefinition; explore: ExploreContent } => {
  const record = requireRecord(raw, "problem");
  const topic = requireString(record, "topic", "problem");
  if (topic !== "statics.equilibrium") {
    throw new Error('problem.topic must be "statics.equilibrium".');
  }

  const parameters = requireArray(record, "parameters", "problem").map((item, index) =>
    parseParameter(item, `problem.parameters[${index}]`),
  );
  const points = requireArray(record, "points", "problem").map((item, index) =>
    parsePoint(item, `problem.points[${index}]`),
  );
  const bodies = requireArray(record, "bodies", "problem").map((item, index) =>
    parseBody(item, `problem.bodies[${index}]`),
  );
  const supports = requireArray(record, "supports", "problem").map((item, index) =>
    parseSupport(item, `problem.supports[${index}]`),
  );
  const pointsById = new Map(points.map((point) => [point.id, point]));
  const loads = requireArray(record, "loads", "problem").map((item, index) =>
    parseLoad(item, `problem.loads[${index}]`, pointsById),
  );
  const forceDecompositions =
    record.forceDecompositions === undefined
      ? []
      : requireArray(record, "forceDecompositions", "problem").map((item, index) =>
          parseForceDecomposition(item, `problem.forceDecompositions[${index}]`),
        );
  const unknownReactions = requireArray(record, "unknownReactions", "problem").map((item, index) =>
    parseUnknownReaction(item, `problem.unknownReactions[${index}]`),
  );

  ensureUniqueIds(parameters, "problem.parameters");
  ensureUniqueIds(points, "problem.points");
  ensureUniqueIds(bodies, "problem.bodies");
  ensureUniqueIds(supports, "problem.supports");
  ensureUniqueIds(loads, "problem.loads");
  ensureUniqueIds(forceDecompositions, "problem.forceDecompositions");
  ensureUniqueIds(
    forceDecompositions.flatMap((decomposition) => [decomposition.components.x, decomposition.components.y]),
    "problem.forceDecompositions.components",
  );
  ensureUniqueIds(unknownReactions, "problem.unknownReactions");

  const pointIds = new Set(points.map((point) => point.id));
  const bodyIds = new Set(bodies.map((body) => body.id));
  const supportIds = new Set(supports.map((support) => support.id));
  const loadIds = new Set(loads.map((load) => load.id));
  const parameterIds = new Set(parameters.map((parameter) => parameter.id));

  bodies.forEach((body) => {
    requireId(pointIds, body.startPointId, `body "${body.id}"`);
    requireId(pointIds, body.endPointId, `body "${body.id}"`);
  });
  supports.forEach((support) => {
    requireId(pointIds, support.pointId, `support "${support.id}"`);
    requireId(bodyIds, support.bodyId, `support "${support.id}"`);
  });
  loads.forEach((load) => requireId(bodyIds, load.bodyId, `load "${load.id}"`));
  forceDecompositions.forEach((decomposition) => {
    requireId(loadIds, decomposition.forceId, `force decomposition "${decomposition.id}"`);
    requireId(parameterIds, decomposition.magnitudeParameterId, `force decomposition "${decomposition.id}"`);
    requireId(parameterIds, decomposition.angleParameterId, `force decomposition "${decomposition.id}"`);
    const magnitudeParameter = parameters.find((parameter) => parameter.id === decomposition.magnitudeParameterId);
    const angleParameter = parameters.find((parameter) => parameter.id === decomposition.angleParameterId);
    if (magnitudeParameter?.unit !== "N") {
      throw new Error(`force decomposition "${decomposition.id}" requires a magnitude parameter with unit "N".`);
    }
    if (angleParameter?.unit !== "deg") {
      throw new Error(`force decomposition "${decomposition.id}" requires an angle parameter with unit "deg".`);
    }
    const load = loads.find((candidate) => candidate.id === decomposition.forceId);
    if (load) {
      assertVectorMatchesForceDecomposition(
        load.vector,
        resolveForceDecomposition(decomposition, parameters),
        `load "${load.id}"`,
      );
    }
  });
  unknownReactions.forEach((reaction) => requireId(supportIds, reaction.supportId, `reaction "${reaction.id}"`));

  const baseProblem = {
    id: requireString(record, "id", "problem"),
    title: requireString(record, "title", "problem"),
    topic,
    problemType: requireString(record, "problemType", "problem"),
    solverKey: requireString(record, "solverKey", "problem"),
    diagramKey: requireString(record, "diagramKey", "problem"),
    statement: requireString(record, "statement", "problem"),
    parameters,
    points,
    bodies,
    supports,
    loads,
    forceDecompositions,
    unknownReactions,
  } satisfies Omit<ProblemDefinition, "solverConfig" | "semanticEquations">;

  const semanticEquations = parseSemanticEquations(record.semanticEquations, baseProblem);

  const problem = {
    ...baseProblem,
    semanticEquations,
    solverConfig: parseSolverConfig(record.solverConfig, baseProblem),
  };

  return { problem, explore: parseExplore(record.explore) };
};

const parseSolution = (raw: unknown): SolutionContent => {
  const record = requireRecord(raw, "solution");
  const equations = requireArray(record, "equations", "solution").map((item, index) => {
    const equationRecord = requireRecord(item, `solution.equations[${index}]`);
    return {
      id: requireString(equationRecord, "id", `solution.equations[${index}]`),
      title: requireString(equationRecord, "title", `solution.equations[${index}]`),
      explanation: parseContentBlocks(equationRecord.explanation, `solution.equations[${index}].explanation`),
    };
  });
  ensureUniqueIds(equations, "solution.equations");
  const equationIds = new Set(equations.map((equation) => equation.id));

  const steps = requireArray(record, "steps", "solution").map((item, index): SolutionStepContent => {
    const stepRecord = requireRecord(item, `solution.steps[${index}]`);
    const stepEquationIds =
      stepRecord.equationIds === undefined
        ? undefined
        : parseStringArray(stepRecord.equationIds, `solution.steps[${index}].equationIds`);
    stepEquationIds?.forEach((equationId) =>
      requireId(equationIds, equationId, `solution step "${requireString(stepRecord, "id", `solution.steps[${index}]`)}"`),
    );

    const step = {
      id: requireString(stepRecord, "id", `solution.steps[${index}]`),
      title: requireString(stepRecord, "title", `solution.steps[${index}]`),
      body: parseContentBlocks(stepRecord.body, `solution.steps[${index}].body`),
      ...(stepRecord.canvasState === undefined
        ? {}
        : { canvasState: parseCanvasState(stepRecord.canvasState, `solution.steps[${index}].canvasState`) }),
    };

    return stepEquationIds === undefined ? step : { ...step, equationIds: stepEquationIds };
  });
  ensureUniqueIds(steps, "solution.steps");

  return {
    eyebrow: requireString(record, "eyebrow", "solution"),
    title: requireString(record, "title", "solution"),
    assumptions: parseStringArray(record.assumptions, "solution.assumptions"),
    equations,
    steps,
  };
};

const parseDiagram = (raw: unknown, problem: ProblemDefinition): DiagramContent => {
  const record = requireRecord(raw, "diagram");
  const diagramKey = requireString(record, "diagramKey", "diagram");
  if (diagramKey !== problem.diagramKey) {
    throw new Error(`diagram.diagramKey "${diagramKey}" does not match problem.diagramKey "${problem.diagramKey}".`);
  }

  const stageLabelRecord = requireRecord(record.stageLabels, "diagram.stageLabels");
  return {
    diagramKey,
    stageLabels: {
      default: requireString(stageLabelRecord, "default", "diagram.stageLabels"),
      solution: requireString(stageLabelRecord, "solution", "diagram.stageLabels"),
    },
    config: requireRecord(record.config, "diagram.config"),
  };
};

const parseInteractionOptions = (value: unknown, context: string) =>
  requireArray({ options: value }, "options", context).map((item, index) => {
    const record = requireRecord(item, `${context}[${index}]`);
    return {
      id: requireString(record, "id", `${context}[${index}]`),
      label: requireString(record, "label", `${context}[${index}]`),
      ...(record.latex === undefined ? {} : { latex: requireString(record, "latex", `${context}[${index}]`) }),
      ...(record.content === undefined ? {} : { content: parseContentBlocks(record.content, `${context}[${index}].content`) }),
    };
  });

const equationTypeFromPurpose = (purpose: SemanticEquation["purpose"], context: string): ExpectedEquation["equationType"] => {
  if (purpose === "sumForceX") {
    return "sumFx";
  }
  if (purpose === "sumForceY") {
    return "sumFy";
  }
  if (purpose === "sumMoment") {
    return "sumMoment";
  }
  throw new Error(`${context} must reference an equilibrium semantic equation.`);
};

const directionFromPurpose = (purpose: SemanticEquation["purpose"]): "x" | "y" | undefined => {
  if (purpose === "sumForceX") {
    return "x";
  }
  if (purpose === "sumForceY") {
    return "y";
  }
  return undefined;
};

const getSemanticVariableLabel = (
  term: SemanticEquationTerm,
  problem: ProblemDefinition,
): string => {
  const id = term.quantityId ?? term.parameterId ?? term.componentId;
  if (id === undefined) {
    return term.id;
  }

  const reaction = problem.unknownReactions.find((candidate) => candidate.id === id);
  if (reaction) {
    return reaction.label;
  }
  const parameter = problem.parameters.find((candidate) => candidate.id === id);
  if (parameter) {
    return parameter.label.replaceAll("\\", "").replaceAll("{", "").replaceAll("}", "");
  }
  const component = problem.forceDecompositions
    .flatMap((decomposition) => [decomposition.components.x, decomposition.components.y])
    .find((candidate) => candidate.id === id);
  return component?.latex ?? id;
};

const sanitizePracticeFactor = (latex: string): string =>
  latex
    .replaceAll("\\cdot", "*")
    .replaceAll("\\alpha", "alpha")
    .replaceAll("\\", "")
    .replaceAll("{", "")
    .replaceAll("}", "")
    .replaceAll(" ", "");

const practiceFactorFromSemanticTerm = (
  term: SemanticEquationTerm,
  problem: ProblemDefinition,
): string | undefined => {
  if (term.factor === undefined) {
    return undefined;
  }
  const labels = new Map<string, string>();
  problem.parameters.forEach((parameter) => labels.set(parameter.id, parameter.label));
  problem.unknownReactions.forEach((reaction) => labels.set(reaction.id, reaction.label));
  return sanitizePracticeFactor(renderSemanticExpression(term.factor, labels));
};

const expectedTermFromSemanticTerm = (
  semanticEquation: SemanticEquation,
  term: SemanticEquationTerm,
  problem: ProblemDefinition,
): ExpectedEquation["terms"][number] => {
  const factor = practiceFactorFromSemanticTerm(term, problem);
  return {
    equationId: semanticEquation.id,
    termId: term.id,
    variable: getSemanticVariableLabel(term, problem),
    sign: term.sign,
    ...(factor === undefined ? {} : { factor }),
    ...(term.componentId === undefined ? {} : { componentId: term.componentId }),
  };
};

const parseExpectedSemanticEquation = (
  value: unknown,
  problem: ProblemDefinition,
  context: string,
): ExpectedEquation => {
  const record = requireRecord(value, context);
  const equationId = requireString(record, "equationId", context);
  const equation = problem.semanticEquations.find((candidate) => candidate.id === equationId);
  if (!equation) {
    throw new Error(`${context}.equationId references missing semantic equation "${equationId}".`);
  }
  const termIds = parseStringArray(record.termIds, `${context}.termIds`);
  if (termIds.length === 0) {
    throw new Error(`${context}.termIds must contain at least one term id.`);
  }

  return {
    equationType: equationTypeFromPurpose(equation.purpose, `${context}.equationId`),
    ...(equation.momentPointId === undefined ? {} : { aboutPoint: equation.momentPointId }),
    semanticEquationId: equation.id,
    terms: termIds.map((termId) => expectedTermFromSemanticTerm(
      equation,
      findSemanticEquationTerm(problem.semanticEquations, equation.id, termId),
      problem,
    )),
    rhs: "0",
  };
};

const parseExpectedEquation = (value: unknown, context: string): ExpectedEquation => {
  const record = requireRecord(value, context);
  const rawEquationType = requireString(record, "equationType", context);
  const equationType = rawEquationType;
  if (equationType !== "sumFx" && equationType !== "sumFy" && equationType !== "sumMoment") {
    throw new Error(`${context}.equationType must be "sumFx", "sumFy", or "sumMoment".`);
  }
  const rhs = requireString(record, "rhs", context);
  if (rhs !== "0") {
    throw new Error(`${context}.rhs must be "0".`);
  }

  const terms: ExpectedEquation["terms"] = requireArray(record, "terms", context).map((item, index) => {
    const term = requireRecord(item, `${context}.terms[${index}]`);
    const rawSign = requireString(term, "sign", `${context}.terms[${index}]`);
    if (rawSign !== "+" && rawSign !== "-") {
      throw new Error(`${context}.terms[${index}].sign must be "+" or "-".`);
    }
    const sign: "+" | "-" = rawSign;
    const equationId = term.equationId === undefined ? undefined : requireString(term, "equationId", `${context}.terms[${index}]`);
    const termId = term.termId === undefined ? undefined : requireString(term, "termId", `${context}.terms[${index}]`);
    const parsed = {
      variable: requireString(term, "variable", `${context}.terms[${index}]`),
      sign,
    };
    return {
      ...parsed,
      ...(equationId === undefined ? {} : { equationId }),
      ...(termId === undefined ? {} : { termId }),
      ...(term.factor === undefined
        ? {}
        : { factor: requireString(term, "factor", `${context}.terms[${index}]`) }),
      ...(term.componentId === undefined
        ? {}
        : { componentId: requireString(term, "componentId", `${context}.terms[${index}]`) }),
    };
  });

  return record.aboutPoint === undefined
    ? { equationType, terms, rhs }
    : { equationType, aboutPoint: requireString(record, "aboutPoint", context), terms, rhs };
};

const parseEquationTerm = (value: unknown, problem: ProblemDefinition, context: string): EquationTerm => {
  const record = requireRecord(value, context);
  if (record.semanticTerm !== undefined) {
    const semanticTermReference = requireRecord(record.semanticTerm, `${context}.semanticTerm`);
    const equationId = requireString(semanticTermReference, "equationId", `${context}.semanticTerm`);
    const termId = requireString(semanticTermReference, "termId", `${context}.semanticTerm`);
    const semanticEquation = problem.semanticEquations.find((candidate) => candidate.id === equationId);
    if (!semanticEquation) {
      throw new Error(`${context}.semanticTerm.equationId references missing semantic equation "${equationId}".`);
    }
    const semanticTerm = findSemanticEquationTerm(problem.semanticEquations, equationId, termId);
    const direction = directionFromPurpose(semanticEquation.purpose);
    const factor = practiceFactorFromSemanticTerm(semanticTerm, problem);
    return {
      id: requireString(record, "id", context),
      latex: record.latex === undefined ? semanticTerm.latex ?? termId : requireString(record, "latex", context),
      semantic: {
        equationId,
        termId,
        variable: getSemanticVariableLabel(semanticTerm, problem),
        ...(direction === undefined ? {} : { direction }),
        sign: semanticTerm.sign,
        ...(factor === undefined ? {} : { factor }),
        ...(semanticTerm.componentId === undefined ? {} : { componentId: semanticTerm.componentId }),
        ...(semanticEquation.momentPointId === undefined ? {} : { momentAbout: semanticEquation.momentPointId }),
      },
    };
  }

  const semantic = requireRecord(record.semantic, `${context}.semantic`);
  const sign = requireString(semantic, "sign", `${context}.semantic`);
  if (sign !== "+" && sign !== "-") {
    throw new Error(`${context}.semantic.sign must be "+" or "-".`);
  }
  const direction = semantic.direction === undefined ? undefined : requireString(semantic, "direction", `${context}.semantic`);
  if (direction !== undefined && direction !== "x" && direction !== "y") {
    throw new Error(`${context}.semantic.direction must be "x" or "y".`);
  }

  return {
    id: requireString(record, "id", context),
    latex: requireString(record, "latex", context),
    semantic: {
      ...(semantic.equationId === undefined
        ? {}
        : { equationId: requireString(semantic, "equationId", `${context}.semantic`) }),
      ...(semantic.termId === undefined ? {} : { termId: requireString(semantic, "termId", `${context}.semantic`) }),
      variable: requireString(semantic, "variable", `${context}.semantic`),
      sign,
      ...(direction === undefined ? {} : { direction }),
      ...(semantic.factor === undefined ? {} : { factor: requireString(semantic, "factor", `${context}.semantic`) }),
      ...(semantic.componentId === undefined
        ? {}
        : { componentId: requireString(semantic, "componentId", `${context}.semantic`) }),
      ...(semantic.momentAbout === undefined
        ? {}
        : { momentAbout: requireString(semantic, "momentAbout", `${context}.semantic`) }),
    },
  };
};

const parsePracticeInteraction = (value: unknown, problem: ProblemDefinition, context: string): PracticeInteraction => {
  const record = requireRecord(value, context);
  const type = requireString(record, "type", context);

  if (type === "checkbox") {
    return {
      type,
      options: parseInteractionOptions(record.options, `${context}.options`),
      correctOptionIds: parseStringArray(record.correctOptionIds, `${context}.correctOptionIds`),
    };
  }

  if (type === "multiple-choice") {
    return {
      type,
      options: parseInteractionOptions(record.options, `${context}.options`),
      correctOptionId: requireString(record, "correctOptionId", context),
    };
  }

  if (type === "canvas-click") {
    const base: CanvasClickInteraction = {
      type,
      selectableIds: parseStringArray(record.selectableIds, `${context}.selectableIds`),
      correctSelectableIds: parseStringArray(record.correctSelectableIds, `${context}.correctSelectableIds`),
    };
    return record.labels === undefined
      ? base
      : { ...base, labels: parseInteractionOptions(record.labels, `${context}.labels`) };
  }

  if (type === "matching") {
    return {
      type,
      leftItems: parseInteractionOptions(record.leftItems, `${context}.leftItems`),
      rightItems: parseInteractionOptions(record.rightItems, `${context}.rightItems`),
      correctPairs: Object.fromEntries(
        Object.entries(requireRecord(record.correctPairs, `${context}.correctPairs`)).map(([leftId, rightId]) => {
          if (typeof rightId !== "string" || rightId.length === 0) {
            throw new Error(`${context}.correctPairs.${leftId} must be a non-empty string.`);
          }
          return [leftId, rightId];
        }),
      ),
    };
  }

  if (type === "equation-builder") {
    const equationTarget = requireString(record, "equationTarget", context);
    if (equationTarget !== "sumFx" && equationTarget !== "sumFy" && equationTarget !== "sumMoment") {
      throw new Error(`${context}.equationTarget must be "sumFx", "sumFy", or "sumMoment".`);
    }
    const parsed: EquationBuilderInteraction = {
      type,
      equationTarget,
      availableTerms: requireArray(record, "availableTerms", context).map((item, index) =>
        parseEquationTerm(item, problem, `${context}.availableTerms[${index}]`),
      ),
      expectedEquation:
        record.expectedSemanticEquation === undefined
          ? parseExpectedEquation(record.expectedEquation, `${context}.expectedEquation`)
          : parseExpectedSemanticEquation(record.expectedSemanticEquation, problem, `${context}.expectedSemanticEquation`),
    };
    return record.aboutPoint === undefined
      ? parsed
      : { ...parsed, aboutPoint: requireString(record, "aboutPoint", context) };
  }

  if (type === "expression-input") {
    const expectedSemanticEquation =
      record.expectedSemanticEquation === undefined
        ? undefined
        : requireRecord(record.expectedSemanticEquation, `${context}.expectedSemanticEquation`);
    if (expectedSemanticEquation !== undefined) {
      const equationId = requireString(expectedSemanticEquation, "equationId", `${context}.expectedSemanticEquation`);
      const equation = problem.semanticEquations.find((candidate) => candidate.id === equationId);
      if (!equation) {
        throw new Error(`${context}.expectedSemanticEquation.equationId references missing semantic equation "${equationId}".`);
      }
      const side = requireString(expectedSemanticEquation, "side", `${context}.expectedSemanticEquation`);
      if (side !== "rhs") {
        throw new Error(`${context}.expectedSemanticEquation.side must be "rhs".`);
      }
    }

    return {
      type,
      variable: requireString(record, "variable", context),
      expectedExpression: requireString(record, "expectedExpression", context),
      ...(record.acceptedExpressions === undefined
        ? {}
        : { acceptedExpressions: parseStringArray(record.acceptedExpressions, `${context}.acceptedExpressions`) }),
      ...(expectedSemanticEquation === undefined
        ? {}
        : {
            expectedSemanticEquation: {
              equationId: requireString(expectedSemanticEquation, "equationId", `${context}.expectedSemanticEquation`),
              side: "rhs" as const,
            },
          }),
    };
  }

  throw new Error(`${context}.type "${type}" is not a supported practice interaction.`);
};

const parseCanvasState = (value: unknown, context: string): CanvasState => {
  const record = requireRecord(value, context);
  const deprecatedFields = ["highlightedObjects", "dimmedObjects", "solvedValues", "solvedObjects"] as const;
  deprecatedFields.forEach((field) => {
    if (record[field] !== undefined) {
      throw new Error(`${context}.${field} is no longer supported. Put every shown diagram id in visibleObjects.`);
    }
  });

  const canvasState: {
    visibleObjects?: readonly string[];
    hiddenBaseObjects?: readonly string[];
    annotations?: readonly string[];
  } = {};
  const visibleObjects = parseOptionalStringArray(record, "visibleObjects", context);
  const hiddenBaseObjects = parseOptionalStringArray(record, "hiddenBaseObjects", context);
  const annotations = parseOptionalStringArray(record, "annotations", context);

  if (visibleObjects !== undefined) {
    canvasState.visibleObjects = visibleObjects;
  }
  if (hiddenBaseObjects !== undefined) {
    canvasState.hiddenBaseObjects = hiddenBaseObjects;
  }
  if (annotations !== undefined) {
    canvasState.annotations = annotations;
  }

  return canvasState;
};

const parsePracticeHints = (value: unknown, context: string): readonly PracticeHint[] =>
  requireArray({ hints: value }, "hints", context).map((item, index) => {
    const record = requireRecord(item, `${context}[${index}]`);
    const level = requireNumber(record, "level", `${context}[${index}]`);
    if (level !== 1 && level !== 2 && level !== 3) {
      throw new Error(`${context}[${index}].level must be 1, 2, or 3.`);
    }
    return {
      level,
      content: parseContentBlocks(record.content ?? record.text, `${context}[${index}].content`),
      ...(record.highlightCanvasIds === undefined
        ? {}
        : { highlightCanvasIds: parseStringArray(record.highlightCanvasIds, `${context}[${index}].highlightCanvasIds`) }),
    };
  });

const parsePractice = (raw: unknown, problem: ProblemDefinition): PracticeContent => {
  const record = requireRecord(raw, "practice");
  const steps = requireArray(record, "steps", "practice").map((item, index): PracticeStep => {
    const stepRecord = requireRecord(item, `practice.steps[${index}]`);
    const feedback = requireRecord(stepRecord.feedback, `practice.steps[${index}].feedback`);
    const mistakes =
      feedback.mistakes === undefined
        ? undefined
        : requireArray(feedback, "mistakes", `practice.steps[${index}].feedback`).map((mistake, mistakeIndex) => {
            const mistakeRecord = requireRecord(mistake, `practice.steps[${index}].feedback.mistakes[${mistakeIndex}]`);
            return {
              id: requireString(mistakeRecord, "id", `practice.steps[${index}].feedback.mistakes[${mistakeIndex}]`),
              content: parseContentBlocks(
                mistakeRecord.content ?? mistakeRecord.text,
                `practice.steps[${index}].feedback.mistakes[${mistakeIndex}].content`,
              ),
            };
          });
    const successResult =
      stepRecord.successResult === undefined
        ? undefined
        : requireRecord(stepRecord.successResult, `practice.steps[${index}].successResult`);
    if (successResult?.solvedValues !== undefined) {
      throw new Error(`practice.steps[${index}].successResult.solvedValues is no longer supported. Use revealObjects.`);
    }
    if (successResult?.markObjectsSolved !== undefined) {
      throw new Error(`practice.steps[${index}].successResult.markObjectsSolved is no longer supported. Use revealObjects.`);
    }

    return {
      id: requireString(stepRecord, "id", `practice.steps[${index}]`),
      title: requireString(stepRecord, "title", `practice.steps[${index}]`),
      goal: parseContentBlocks(stepRecord.goal, `practice.steps[${index}].goal`),
      ...(stepRecord.instructions === undefined
        ? {}
        : { instructions: parseContentBlocks(stepRecord.instructions, `practice.steps[${index}].instructions`) }),
      ...(stepRecord.canvasState === undefined
        ? {}
        : { canvasState: parseCanvasState(stepRecord.canvasState, `practice.steps[${index}].canvasState`) }),
      interaction: parsePracticeInteraction(stepRecord.interaction, problem, `practice.steps[${index}].interaction`),
      feedback: {
        correct: parseContentBlocks(feedback.correct, `practice.steps[${index}].feedback.correct`),
        genericIncorrect: parseContentBlocks(feedback.genericIncorrect, `practice.steps[${index}].feedback.genericIncorrect`),
        ...(mistakes === undefined ? {} : { mistakes }),
      },
      ...(stepRecord.hints === undefined ? {} : { hints: parsePracticeHints(stepRecord.hints, `practice.steps[${index}].hints`) }),
      ...(successResult === undefined
        ? {}
        : {
            successResult: {
              ...(successResult.revealObjects === undefined
                ? {}
                : { revealObjects: parseStringArray(successResult.revealObjects, `practice.steps[${index}].successResult.revealObjects`) }),
            },
          }),
    };
  });
  ensureUniqueIds(steps, "practice.steps");

  return {
    title: requireString(record, "title", "practice"),
    body: requireString(record, "body", "practice"),
    steps,
  };
};

const normalizeFactor = (factor: string): string => factor.replaceAll(" ", "").replaceAll("·", "*").toLowerCase();

const validatePracticeComponentReferences = (problem: ProblemDefinition, practice: PracticeContent) => {
  const componentsById = new Map(
    problem.forceDecompositions.flatMap((decomposition) => [
      [decomposition.components.x.id, decomposition.components.x] as const,
      [decomposition.components.y.id, decomposition.components.y] as const,
    ]),
  );

  practice.steps.forEach((step) => {
    if (step.interaction.type !== "equation-builder") {
      return;
    }

    step.interaction.availableTerms.forEach((term) => {
      const componentId = term.semantic.componentId;
      if (componentId === undefined) {
        return;
      }
      const component = componentsById.get(componentId);
      if (!component) {
        throw new Error(`practice step "${step.id}" term "${term.id}" references missing force component "${componentId}".`);
      }
      if (term.semantic.direction !== undefined && term.semantic.direction !== component.axis) {
        throw new Error(`practice step "${step.id}" term "${term.id}" component axis does not match semantic direction.`);
      }
      const termFactor = term.semantic.factor === undefined ? undefined : normalizeFactor(term.semantic.factor);
      const componentFactor = normalizeFactor(component.factor);
      if (termFactor !== undefined && termFactor !== "0" && !termFactor.includes(componentFactor)) {
        throw new Error(`practice step "${step.id}" term "${term.id}" factor does not match force component "${componentId}".`);
      }
    });

    step.interaction.expectedEquation.terms.forEach((term, index) => {
      const componentId = term.componentId;
      if (componentId === undefined) {
        return;
      }
      const component = componentsById.get(componentId);
      if (!component) {
        throw new Error(`practice step "${step.id}" expected term ${index} references missing force component "${componentId}".`);
      }
      const termFactor = term.factor === undefined ? undefined : normalizeFactor(term.factor);
      const componentFactor = normalizeFactor(component.factor);
      if (termFactor !== undefined && termFactor !== "0" && !termFactor.includes(componentFactor)) {
        throw new Error(`practice step "${step.id}" expected term ${index} factor does not match force component "${componentId}".`);
      }
    });
  });
};

const validateSolutionSemanticEquationReferences = (
  problem: ProblemDefinition,
  solution: SolutionContent,
) => {
  const semanticEquationIds = new Set(problem.semanticEquations.map((equation) => equation.id));
  solution.equations.forEach((equation) =>
    requireId(semanticEquationIds, equation.id, `solution.equations "${equation.id}"`),
  );
};

const validateExploreSemanticReferences = (
  problem: ProblemDefinition,
  explore: ExploreContent,
) => {
  const quantityIds = new Set(problem.unknownReactions.map((reaction) => reaction.id));
  validateIdArrayReferences(
    explore.observedQuantityIds,
    quantityIds,
    "problem.explore.observedQuantityIds",
    "semantic quantity id",
  );
};

const getProblemCanvasObjectIds = (problem: ProblemDefinition): ReadonlySet<string> =>
  new Set([
    ...problem.points.map((point) => point.id),
    ...problem.bodies.map((body) => body.id),
    ...problem.supports.map((support) => support.id),
    ...problem.loads.map((load) => load.id),
    ...problem.unknownReactions.map((reaction) => reaction.id),
    ...problem.forceDecompositions.flatMap((decomposition) => [
      decomposition.components.x.id,
      decomposition.components.y.id,
    ]),
  ]);

const validateIdArrayReferences = (
  ids: readonly string[] | undefined,
  knownIds: ReadonlySet<string>,
  context: string,
  expectedLabel: string,
) => {
  ids?.forEach((id, index) => {
    if (!knownIds.has(id)) {
      throw new Error(`${context}[${index}] references missing ${expectedLabel} "${id}".`);
    }
  });
};

const validateCanvasStateObjectReferences = (
  canvasState: CanvasState | undefined,
  visibleObjectIds: ReadonlySet<string>,
  baseObjectIds: ReadonlySet<string>,
  context: string,
) => {
  validateIdArrayReferences(
    canvasState?.visibleObjects,
    visibleObjectIds,
    `${context}.visibleObjects`,
    "canvas object id",
  );
  validateIdArrayReferences(
    canvasState?.hiddenBaseObjects,
    baseObjectIds,
    `${context}.hiddenBaseObjects`,
    "base canvas object id",
  );
};

const validateCanvasObjectReferences = (
  problem: ProblemDefinition,
  diagram: DiagramContent,
  solution: SolutionContent,
  practice: PracticeContent,
) => {
  const diagramReferenceSet = getDiagramObjectReferenceSet(problem, diagram.diagramKey, diagram.config);
  const visibleObjectIds = new Set([
    ...getProblemCanvasObjectIds(problem),
    ...diagramReferenceSet.rendererObjectIds,
  ]);

  solution.steps.forEach((step, index) =>
    validateCanvasStateObjectReferences(
      step.canvasState,
      visibleObjectIds,
      diagramReferenceSet.baseObjectIds,
      `solution.steps[${index}].canvasState`,
    ),
  );

  practice.steps.forEach((step, index) => {
    validateCanvasStateObjectReferences(
      step.canvasState,
      visibleObjectIds,
      diagramReferenceSet.baseObjectIds,
      `practice.steps[${index}].canvasState`,
    );
    validateIdArrayReferences(
      step.successResult?.revealObjects,
      visibleObjectIds,
      `practice.steps[${index}].successResult.revealObjects`,
      "canvas object id",
    );
  });
};

export const parseLoadedProblemContent = (
  rawProblem: unknown,
  rawSolution: unknown,
  rawDiagram: unknown,
  rawPractice: unknown,
): LoadedProblemContent => {
  const { problem, explore } = parseProblem(rawProblem);
  const solution = parseSolution(rawSolution);
  const practice = parsePractice(rawPractice, problem);
  const diagram = parseDiagram(rawDiagram, problem);
  validateSolutionSemanticEquationReferences(problem, solution);
  validateExploreSemanticReferences(problem, explore);
  validateSolverConfigEquationIds(problem.solverConfig, new Set(problem.semanticEquations.map((equation) => equation.id)));
  validatePracticeComponentReferences(problem, practice);
  validateCanvasObjectReferences(problem, diagram, solution, practice);

  return {
    problem,
    explore,
    solution,
    diagram,
    practice,
  };
};
