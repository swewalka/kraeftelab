import type { LoadedProblemContent } from "./types";
import type { CanvasState } from "../../mechanics/model/canvasState";

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const snapshot = (value: unknown): string => JSON.stringify(value);

const ids = (items: readonly { id: string }[]) => items.map((item) => item.id);

const canvasStateSnapshot = (canvasState: CanvasState | undefined) => ({
  visibleObjects: canvasState?.visibleObjects ?? [],
  highlightedObjects: canvasState?.highlightedObjects ?? [],
  dimmedObjects: canvasState?.dimmedObjects ?? [],
  annotations: canvasState?.annotations ?? [],
  solvedValueIds: Object.keys(canvasState?.solvedValues ?? {}),
  solvedObjects: canvasState?.solvedObjects ?? [],
});

const interactionSnapshot = (interaction: LoadedProblemContent["practice"]["steps"][number]["interaction"]) => {
  if (interaction.type === "checkbox") {
    return {
      type: interaction.type,
      optionIds: ids(interaction.options),
      correctOptionIds: interaction.correctOptionIds,
    };
  }
  if (interaction.type === "multiple-choice") {
    return {
      type: interaction.type,
      optionIds: ids(interaction.options),
      correctOptionId: interaction.correctOptionId,
    };
  }
  if (interaction.type === "canvas-click") {
    return {
      type: interaction.type,
      selectableIds: interaction.selectableIds,
      correctSelectableIds: interaction.correctSelectableIds,
      labelIds: interaction.labels === undefined ? [] : ids(interaction.labels),
    };
  }
  if (interaction.type === "matching") {
    return {
      type: interaction.type,
      leftIds: ids(interaction.leftItems),
      rightIds: ids(interaction.rightItems),
      correctPairs: interaction.correctPairs,
    };
  }
  if (interaction.type === "equation-builder") {
    return {
      type: interaction.type,
      equationTarget: interaction.equationTarget,
      aboutPoint: interaction.aboutPoint,
      availableTerms: interaction.availableTerms.map((term) => ({
        id: term.id,
        semantic: term.semantic,
      })),
      expectedEquation: interaction.expectedEquation,
    };
  }
  return {
    type: interaction.type,
    variable: interaction.variable,
    expectedExpression: interaction.expectedExpression,
    acceptedExpressions: interaction.acceptedExpressions ?? [],
  };
};

const diagramConfigSnapshot = (config: unknown) => {
  if (!isRecord(config)) {
    return {};
  }
  const beam = isRecord(config.beam) ? config.beam : {};
  const bounds = isRecord(config.bounds) ? config.bounds : {};
  const mapRecords = (key: string, project: (record: JsonRecord) => unknown) =>
    Array.isArray(config[key]) ? config[key].filter(isRecord).map(project) : [];

  return {
    beam: {
      bodyId: beam.bodyId,
      startPointId: beam.startPointId,
      endPointId: beam.endPointId,
    },
    bounds: {
      startPointId: bounds.startPointId,
      endPointId: bounds.endPointId,
    },
    supports: mapRecords("supports", (record) => ({
      supportId: record.supportId,
      pointId: record.pointId,
    })),
    loadArrows: mapRecords("loadArrows", (record) => ({
      loadId: record.loadId,
      pointId: record.pointId,
    })),
    freeBodyReactions: mapRecords("freeBodyReactions", (record) => ({
      reactionId: record.reactionId,
      pointId: record.pointId,
    })),
    overlayArrows: mapRecords("overlayArrows", (record) => ({
      id: record.id,
      pointId: record.pointId,
      componentId: record.componentId,
    })),
    polylineMarkers: mapRecords("polylineMarkers", (record) => ({
      id: record.id,
      pointId: record.pointId,
    })),
    dimensions: mapRecords("dimensions", (record) => ({
      id: record.id,
      startPointId: record.startPointId,
      endPointId: record.endPointId,
    })),
  };
};

const mechanicsSnapshot = (content: LoadedProblemContent) => ({
  problem: {
    id: content.problem.id,
    topic: content.problem.topic,
    problemType: content.problem.problemType,
    solverKey: content.problem.solverKey,
    diagramKey: content.problem.diagramKey,
    parameters: content.problem.parameters.map((parameter) => ({
      id: parameter.id,
      value: parameter.value,
      unit: parameter.unit,
    })),
    points: content.problem.points.map((point) => ({
      id: point.id,
      x: point.x,
      y: point.y,
    })),
    bodies: content.problem.bodies.map((body) => ({
      id: body.id,
      kind: body.kind,
      startPointId: body.startPointId,
      endPointId: body.endPointId,
    })),
    supports: content.problem.supports.map((support) => ({
      id: support.id,
      kind: support.kind,
      pointId: support.pointId,
      bodyId: support.bodyId,
    })),
    loads: content.problem.loads.map((load) => ({
      id: load.id,
      kind: load.kind,
      bodyId: load.bodyId,
      positionPointId: load.position.id,
      vector: load.vector,
    })),
    forceDecompositions: content.problem.forceDecompositions,
    unknownReactions: content.problem.unknownReactions.map((reaction) => ({
      id: reaction.id,
      supportId: reaction.supportId,
      component: reaction.component,
      direction: reaction.direction,
    })),
    solverConfig: content.problem.solverConfig,
  },
  solution: {
    equationIds: ids(content.solution.equations),
    steps: content.solution.steps.map((step) => ({
      id: step.id,
      equationIds: step.equationIds ?? [],
      canvasState: canvasStateSnapshot(step.canvasState),
    })),
  },
  practice: {
    stepIds: ids(content.practice.steps),
    steps: content.practice.steps.map((step) => ({
      id: step.id,
      canvasState: canvasStateSnapshot(step.canvasState),
      interaction: interactionSnapshot(step.interaction),
      successResult: {
        solvedValueIds: Object.keys(step.successResult?.solvedValues ?? {}),
        revealObjects: step.successResult?.revealObjects ?? [],
        markObjectsSolved: step.successResult?.markObjectsSolved ?? [],
      },
    })),
  },
  diagram: {
    diagramKey: content.diagram.diagramKey,
    config: diagramConfigSnapshot(content.diagram.config),
  },
});

export const validateLocalizedProblemPair = (
  en: LoadedProblemContent,
  de: LoadedProblemContent,
) => {
  const englishSnapshot = snapshot(mechanicsSnapshot(en));
  const germanSnapshot = snapshot(mechanicsSnapshot(de));
  if (englishSnapshot !== germanSnapshot) {
    throw new Error(`Localized mechanics content differs for problem "${en.problem.id}".`);
  }
};
