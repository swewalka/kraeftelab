import { vector, type Vector2 } from "../../mechanics/core/vector";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type {
  BodyDefinition,
  LoadDefinition,
  ParameterDefinition,
  PointDefinition,
  SupportDefinition,
  UnknownReaction,
} from "../../mechanics/model/types";
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
  PracticeCanvasState,
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
  if (unit !== "m" && unit !== "N") {
    throw new Error(`${context}.unit must be "m" or "N".`);
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

const parseExplore = (value: unknown): ExploreContent => {
  if (value === undefined) {
    return { notices: [] };
  }

  const record = requireRecord(value, "problem.explore");
  const noticeTitle = record.noticeTitle === undefined ? undefined : requireString(record, "noticeTitle", "problem.explore");
  const notices = parseStringArray(record.notices ?? [], "problem.explore.notices");

  return noticeTitle === undefined ? { notices } : { noticeTitle, notices };
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
  const unknownReactions = requireArray(record, "unknownReactions", "problem").map((item, index) =>
    parseUnknownReaction(item, `problem.unknownReactions[${index}]`),
  );

  ensureUniqueIds(parameters, "problem.parameters");
  ensureUniqueIds(points, "problem.points");
  ensureUniqueIds(bodies, "problem.bodies");
  ensureUniqueIds(supports, "problem.supports");
  ensureUniqueIds(loads, "problem.loads");
  ensureUniqueIds(unknownReactions, "problem.unknownReactions");

  const pointIds = new Set(points.map((point) => point.id));
  const bodyIds = new Set(bodies.map((body) => body.id));
  const supportIds = new Set(supports.map((support) => support.id));

  bodies.forEach((body) => {
    requireId(pointIds, body.startPointId, `body "${body.id}"`);
    requireId(pointIds, body.endPointId, `body "${body.id}"`);
  });
  supports.forEach((support) => {
    requireId(pointIds, support.pointId, `support "${support.id}"`);
    requireId(bodyIds, support.bodyId, `support "${support.id}"`);
  });
  loads.forEach((load) => requireId(bodyIds, load.bodyId, `load "${load.id}"`));
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
    unknownReactions,
  } satisfies Omit<ProblemDefinition, "solverConfig">;

  const problem =
    record.solverConfig === undefined ? baseProblem : { ...baseProblem, solverConfig: record.solverConfig };

  return { problem, explore: parseExplore(record.explore) };
};

const parseSolution = (raw: unknown): SolutionContent => {
  const record = requireRecord(raw, "solution");
  const equations = requireArray(record, "equations", "solution").map((item, index) => {
    const equationRecord = requireRecord(item, `solution.equations[${index}]`);
    return {
      id: requireString(equationRecord, "id", `solution.equations[${index}]`),
      title: requireString(equationRecord, "title", `solution.equations[${index}]`),
      explanation: requireString(equationRecord, "explanation", `solution.equations[${index}]`),
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
      body: requireString(stepRecord, "body", `solution.steps[${index}]`),
    };

    return stepEquationIds === undefined ? step : { ...step, equationIds: stepEquationIds };
  });
  ensureUniqueIds(steps, "solution.steps");

  return {
    eyebrow: requireString(record, "eyebrow", "solution"),
    title: requireString(record, "title", "solution"),
    resultSummaryTitle: requireString(record, "resultSummaryTitle", "solution"),
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
    };
  });

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
    const parsed = {
      variable: requireString(term, "variable", `${context}.terms[${index}]`),
      sign,
    };
    return term.factor === undefined
      ? parsed
      : { ...parsed, factor: requireString(term, "factor", `${context}.terms[${index}]`) };
  });

  return record.aboutPoint === undefined
    ? { equationType, terms, rhs }
    : { equationType, aboutPoint: requireString(record, "aboutPoint", context), terms, rhs };
};

const parseEquationTerm = (value: unknown, context: string): EquationTerm => {
  const record = requireRecord(value, context);
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
    label: requireString(record, "label", context),
    semantic: {
      variable: requireString(semantic, "variable", `${context}.semantic`),
      sign,
      ...(direction === undefined ? {} : { direction }),
      ...(semantic.factor === undefined ? {} : { factor: requireString(semantic, "factor", `${context}.semantic`) }),
      ...(semantic.momentAbout === undefined
        ? {}
        : { momentAbout: requireString(semantic, "momentAbout", `${context}.semantic`) }),
    },
  };
};

const parsePracticeInteraction = (value: unknown, context: string): PracticeInteraction => {
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
        parseEquationTerm(item, `${context}.availableTerms[${index}]`),
      ),
      expectedEquation: parseExpectedEquation(record.expectedEquation, `${context}.expectedEquation`),
    };
    return record.aboutPoint === undefined
      ? parsed
      : { ...parsed, aboutPoint: requireString(record, "aboutPoint", context) };
  }

  if (type === "expression-input") {
    return {
      type,
      variable: requireString(record, "variable", context),
      expectedExpression: requireString(record, "expectedExpression", context),
      ...(record.acceptedExpressions === undefined
        ? {}
        : { acceptedExpressions: parseStringArray(record.acceptedExpressions, `${context}.acceptedExpressions`) }),
    };
  }

  throw new Error(`${context}.type "${type}" is not a supported practice interaction.`);
};

const parsePracticeCanvasState = (value: unknown, context: string): PracticeCanvasState => {
  const record = requireRecord(value, context);
  const solvedValues =
    record.solvedValues === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(requireRecord(record.solvedValues, `${context}.solvedValues`)).map(([objectId, label]) => {
            if (typeof label !== "string" || label.length === 0) {
              throw new Error(`${context}.solvedValues.${objectId} must be a non-empty string.`);
            }
            return [objectId, label];
          }),
        );

  const canvasState: {
    visibleObjects?: readonly string[];
    highlightedObjects?: readonly string[];
    dimmedObjects?: readonly string[];
    annotations?: readonly string[];
    solvedValues?: Record<string, string>;
    solvedObjects?: readonly string[];
  } = {};
  const visibleObjects = parseOptionalStringArray(record, "visibleObjects", context);
  const highlightedObjects = parseOptionalStringArray(record, "highlightedObjects", context);
  const dimmedObjects = parseOptionalStringArray(record, "dimmedObjects", context);
  const annotations = parseOptionalStringArray(record, "annotations", context);
  const solvedObjects = parseOptionalStringArray(record, "solvedObjects", context);

  if (visibleObjects !== undefined) {
    canvasState.visibleObjects = visibleObjects;
  }
  if (highlightedObjects !== undefined) {
    canvasState.highlightedObjects = highlightedObjects;
  }
  if (dimmedObjects !== undefined) {
    canvasState.dimmedObjects = dimmedObjects;
  }
  if (annotations !== undefined) {
    canvasState.annotations = annotations;
  }
  if (solvedValues !== undefined) {
    canvasState.solvedValues = solvedValues;
  }
  if (solvedObjects !== undefined) {
    canvasState.solvedObjects = solvedObjects;
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
      text: requireString(record, "text", `${context}[${index}]`),
      ...(record.highlightCanvasIds === undefined
        ? {}
        : { highlightCanvasIds: parseStringArray(record.highlightCanvasIds, `${context}[${index}].highlightCanvasIds`) }),
    };
  });

const parsePractice = (raw: unknown): PracticeContent => {
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
              text: requireString(mistakeRecord, "text", `practice.steps[${index}].feedback.mistakes[${mistakeIndex}]`),
            };
          });
    const successResult =
      stepRecord.successResult === undefined
        ? undefined
        : requireRecord(stepRecord.successResult, `practice.steps[${index}].successResult`);
    const solvedValues =
      successResult?.solvedValues === undefined
        ? undefined
        : Object.fromEntries(
            Object.entries(requireRecord(successResult.solvedValues, `practice.steps[${index}].successResult.solvedValues`)).map(
              ([objectId, label]) => {
                if (typeof label !== "string" || label.length === 0) {
                  throw new Error(`practice.steps[${index}].successResult.solvedValues.${objectId} must be a non-empty string.`);
                }
                return [objectId, label];
              },
            ),
          );

    return {
      id: requireString(stepRecord, "id", `practice.steps[${index}]`),
      title: requireString(stepRecord, "title", `practice.steps[${index}]`),
      goal: requireString(stepRecord, "goal", `practice.steps[${index}]`),
      ...(stepRecord.instructions === undefined
        ? {}
        : { instructions: requireString(stepRecord, "instructions", `practice.steps[${index}]`) }),
      ...(stepRecord.canvasState === undefined
        ? {}
        : { canvasState: parsePracticeCanvasState(stepRecord.canvasState, `practice.steps[${index}].canvasState`) }),
      interaction: parsePracticeInteraction(stepRecord.interaction, `practice.steps[${index}].interaction`),
      feedback: {
        correct: requireString(feedback, "correct", `practice.steps[${index}].feedback`),
        genericIncorrect: requireString(feedback, "genericIncorrect", `practice.steps[${index}].feedback`),
        ...(mistakes === undefined ? {} : { mistakes }),
      },
      ...(stepRecord.hints === undefined ? {} : { hints: parsePracticeHints(stepRecord.hints, `practice.steps[${index}].hints`) }),
      ...(successResult === undefined
        ? {}
        : {
            successResult: {
              ...(solvedValues === undefined ? {} : { solvedValues }),
              ...(successResult.revealObjects === undefined
                ? {}
                : { revealObjects: parseStringArray(successResult.revealObjects, `practice.steps[${index}].successResult.revealObjects`) }),
              ...(successResult.markObjectsSolved === undefined
                ? {}
                : {
                    markObjectsSolved: parseStringArray(
                      successResult.markObjectsSolved,
                      `practice.steps[${index}].successResult.markObjectsSolved`,
                    ),
                  }),
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

export const parseLoadedProblemContent = (
  rawProblem: unknown,
  rawSolution: unknown,
  rawDiagram: unknown,
  rawPractice: unknown,
): LoadedProblemContent => {
  const { problem, explore } = parseProblem(rawProblem);

  return {
    problem,
    explore,
    solution: parseSolution(rawSolution),
    diagram: parseDiagram(rawDiagram, problem),
    practice: parsePractice(rawPractice),
  };
};
