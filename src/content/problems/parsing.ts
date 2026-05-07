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
  PracticeContent,
} from "./types";
import type { SolutionContent, SolutionStepContent } from "../../mechanics/explanation/types";

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

const parsePractice = (raw: unknown): PracticeContent => {
  const record = requireRecord(raw, "practice");
  return {
    title: requireString(record, "title", "practice"),
    body: requireString(record, "body", "practice"),
    prompts: parseStringArray(record.prompts ?? [], "practice.prompts"),
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
