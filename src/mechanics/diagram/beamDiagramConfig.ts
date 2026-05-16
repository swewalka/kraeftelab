import type { ProblemDefinition } from "../model/problemDefinition";

export type DiagramOffset = Readonly<{
  x: number;
  y: number;
}>;

export type BeamReferenceConfig = Readonly<{
  bodyId: string;
  startPointId: string;
  endPointId: string;
}>;

export type SupportAnnotationConfig = Readonly<{
  supportId: string;
  pointId: string;
}>;

export type LoadArrowConfig = Readonly<{
  loadId: string;
  pointId: string;
  tailOffset: DiagramOffset;
  tipOffset: DiagramOffset;
  labelOffset: DiagramOffset;
  fontSize: number;
  color?: string;
}>;

export type ReactionArrowConfig = Readonly<{
  reactionId: string;
  pointId: string;
  tailOffset: DiagramOffset;
  tipOffset: DiagramOffset;
  labelOffset: DiagramOffset;
  fontSize: number;
  color?: string;
}>;

export type PointLabelConfig = Readonly<{
  pointId: string;
  text: string;
  offset: DiagramOffset;
  fontSize: number;
}>;

export type DimensionConfig = Readonly<{
  id?: string;
  startPointId: string;
  endPointId: string;
  label: string;
  yOffset?: number;
}>;

export type OverlayArrowConfig = Readonly<{
  id: string;
  pointId: string;
  label?: string;
  componentId?: string;
  tailOffset: DiagramOffset;
  tipOffset: DiagramOffset;
  labelOffset: DiagramOffset;
  fontSize: number;
  color?: string;
  strokeWidth?: number;
}>;

export type PolylineMarkerConfig = Readonly<{
  id: string;
  pointId: string;
  label: string;
  offsets: readonly DiagramOffset[];
  labelOffset: DiagramOffset;
  fontSize: number;
  color?: string;
}>;

export type AngleMarkerConfig = Readonly<{
  id: string;
  pointId: string;
  label: string;
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  labelOffset: DiagramOffset;
  fontSize: number;
  color?: string;
}>;

export type BeamDiagramConfig = Readonly<{
  beam: BeamReferenceConfig;
  supports: readonly SupportAnnotationConfig[];
  loadArrows: readonly LoadArrowConfig[];
  freeBodyReactions: readonly ReactionArrowConfig[];
  overlayArrows: readonly OverlayArrowConfig[];
  polylineMarkers: readonly PolylineMarkerConfig[];
  angleMarkers: readonly AngleMarkerConfig[];
  pointLabels: readonly PointLabelConfig[];
  dimensions: readonly DimensionConfig[];
  bounds: Readonly<{
    startPointId: string;
    endPointId: string;
  }>;
}>;

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

const optionalString = (record: JsonRecord, key: string, context: string): string | undefined => {
  const value = record[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${context}.${key} must be a non-empty string.`);
  }
  return value;
};

const optionalNumber = (record: JsonRecord, key: string, context: string): number | undefined => {
  const value = record[key];
  if (value === undefined) {
    return undefined;
  }
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

const parseOffset = (value: unknown, context: string): DiagramOffset => {
  const record = requireRecord(value, context);
  return {
    x: requireNumber(record, "x", context),
    y: requireNumber(record, "y", context),
  };
};

const parseArrowBase = (record: JsonRecord, context: string) => {
  const color = optionalString(record, "color", context);
  return {
    pointId: requireString(record, "pointId", context),
    tailOffset: parseOffset(record.tailOffset, `${context}.tailOffset`),
    tipOffset: parseOffset(record.tipOffset, `${context}.tipOffset`),
    labelOffset: parseOffset(record.labelOffset, `${context}.labelOffset`),
    fontSize: requireNumber(record, "fontSize", context),
    ...(color === undefined ? {} : { color }),
  };
};

export const parseBeamDiagramConfig = (
  value: unknown,
  context = "beam diagram config",
): BeamDiagramConfig => {
  const record = requireRecord(value, context);
  const beam = requireRecord(record.beam, `${context}.beam`);
  const bounds = requireRecord(record.bounds, `${context}.bounds`);

  return {
    beam: {
      bodyId: requireString(beam, "bodyId", `${context}.beam`),
      startPointId: requireString(beam, "startPointId", `${context}.beam`),
      endPointId: requireString(beam, "endPointId", `${context}.beam`),
    },
    supports: requireArray(record, "supports", context).map((item, index) => {
      const support = requireRecord(item, `${context}.supports[${index}]`);
      return {
        supportId: requireString(support, "supportId", `${context}.supports[${index}]`),
        pointId: requireString(support, "pointId", `${context}.supports[${index}]`),
      };
    }),
    loadArrows: requireArray(record, "loadArrows", context).map((item, index) => {
      const arrow = requireRecord(item, `${context}.loadArrows[${index}]`);
      return {
        loadId: requireString(arrow, "loadId", `${context}.loadArrows[${index}]`),
        ...parseArrowBase(arrow, `${context}.loadArrows[${index}]`),
      };
    }),
    freeBodyReactions: requireArray(record, "freeBodyReactions", context).map((item, index) => {
      const arrow = requireRecord(item, `${context}.freeBodyReactions[${index}]`);
      return {
        reactionId: requireString(arrow, "reactionId", `${context}.freeBodyReactions[${index}]`),
        ...parseArrowBase(arrow, `${context}.freeBodyReactions[${index}]`),
      };
    }),
    overlayArrows:
      record.overlayArrows === undefined
        ? []
        : requireArray(record, "overlayArrows", context).map((item, index) => {
            const arrow = requireRecord(item, `${context}.overlayArrows[${index}]`);
            const strokeWidth = optionalNumber(arrow, "strokeWidth", `${context}.overlayArrows[${index}]`);
            if (arrow.label === undefined && arrow.componentId === undefined) {
              throw new Error(`${context}.overlayArrows[${index}] requires label or componentId.`);
            }
            return {
              id: requireString(arrow, "id", `${context}.overlayArrows[${index}]`),
              ...(arrow.label === undefined
                ? {}
                : { label: requireString(arrow, "label", `${context}.overlayArrows[${index}]`) }),
              ...(arrow.componentId === undefined
                ? {}
                : { componentId: requireString(arrow, "componentId", `${context}.overlayArrows[${index}]`) }),
              ...parseArrowBase(arrow, `${context}.overlayArrows[${index}]`),
              ...(strokeWidth === undefined ? {} : { strokeWidth }),
            };
          }),
    polylineMarkers:
      record.polylineMarkers === undefined
        ? []
        : requireArray(record, "polylineMarkers", context).map((item, index) => {
            const marker = requireRecord(item, `${context}.polylineMarkers[${index}]`);
            const color = optionalString(marker, "color", `${context}.polylineMarkers[${index}]`);
            return {
              id: requireString(marker, "id", `${context}.polylineMarkers[${index}]`),
              pointId: requireString(marker, "pointId", `${context}.polylineMarkers[${index}]`),
              label: requireString(marker, "label", `${context}.polylineMarkers[${index}]`),
              offsets: requireArray(marker, "offsets", `${context}.polylineMarkers[${index}]`).map(
                (offset, offsetIndex) =>
                  parseOffset(offset, `${context}.polylineMarkers[${index}].offsets[${offsetIndex}]`),
              ),
              labelOffset: parseOffset(marker.labelOffset, `${context}.polylineMarkers[${index}].labelOffset`),
              fontSize: requireNumber(marker, "fontSize", `${context}.polylineMarkers[${index}]`),
              ...(color === undefined ? {} : { color }),
            };
          }),
    angleMarkers:
      record.angleMarkers === undefined
        ? []
        : requireArray(record, "angleMarkers", context).map((item, index) => {
            const marker = requireRecord(item, `${context}.angleMarkers[${index}]`);
            const color = optionalString(marker, "color", `${context}.angleMarkers[${index}]`);
            return {
              id: requireString(marker, "id", `${context}.angleMarkers[${index}]`),
              pointId: requireString(marker, "pointId", `${context}.angleMarkers[${index}]`),
              label: requireString(marker, "label", `${context}.angleMarkers[${index}]`),
              radius: requireNumber(marker, "radius", `${context}.angleMarkers[${index}]`),
              startAngleDeg: requireNumber(marker, "startAngleDeg", `${context}.angleMarkers[${index}]`),
              endAngleDeg: requireNumber(marker, "endAngleDeg", `${context}.angleMarkers[${index}]`),
              labelOffset: parseOffset(marker.labelOffset, `${context}.angleMarkers[${index}].labelOffset`),
              fontSize: requireNumber(marker, "fontSize", `${context}.angleMarkers[${index}]`),
              ...(color === undefined ? {} : { color }),
            };
          }),
    pointLabels: requireArray(record, "pointLabels", context).map((item, index) => {
      const label = requireRecord(item, `${context}.pointLabels[${index}]`);
      return {
        pointId: requireString(label, "pointId", `${context}.pointLabels[${index}]`),
        text: requireString(label, "text", `${context}.pointLabels[${index}]`),
        offset: parseOffset(label.offset, `${context}.pointLabels[${index}].offset`),
        fontSize: requireNumber(label, "fontSize", `${context}.pointLabels[${index}]`),
      };
    }),
    dimensions: requireArray(record, "dimensions", context).map((item, index) => {
      const dimension = requireRecord(item, `${context}.dimensions[${index}]`);
      const yOffset =
        dimension.yOffset === undefined ? undefined : requireNumber(dimension, "yOffset", `${context}.dimensions[${index}]`);
      const parsed = {
        startPointId: requireString(dimension, "startPointId", `${context}.dimensions[${index}]`),
        endPointId: requireString(dimension, "endPointId", `${context}.dimensions[${index}]`),
        label: requireString(dimension, "label", `${context}.dimensions[${index}]`),
        ...(yOffset === undefined ? {} : { yOffset }),
      };
      return dimension.id === undefined
        ? parsed
        : { ...parsed, id: requireString(dimension, "id", `${context}.dimensions[${index}]`) };
    }),
    bounds: {
      startPointId: requireString(bounds, "startPointId", `${context}.bounds`),
      endPointId: requireString(bounds, "endPointId", `${context}.bounds`),
    },
  };
};

export const getBeamDiagramDimensionId = (dimension: DimensionConfig): string =>
  dimension.id ?? `${dimension.startPointId}-${dimension.endPointId}-${dimension.label}`;

export const getBeamDiagramBaseObjectIds = (config: BeamDiagramConfig): ReadonlySet<string> =>
  new Set([config.beam.bodyId, config.beam.startPointId, config.beam.endPointId]);

export const getBeamDiagramRendererObjectIds = (config: BeamDiagramConfig): ReadonlySet<string> =>
  new Set([
    config.beam.bodyId,
    config.beam.startPointId,
    config.beam.endPointId,
    ...config.supports.map((support) => support.supportId),
    ...config.loadArrows.map((loadArrow) => loadArrow.loadId),
    ...config.freeBodyReactions.map((reactionArrow) => reactionArrow.reactionId),
    ...config.overlayArrows.map((overlayArrow) => overlayArrow.id),
    ...config.polylineMarkers.map((marker) => marker.id),
    ...config.angleMarkers.map((marker) => marker.id),
    ...config.pointLabels.map((pointLabel) => pointLabel.pointId),
    ...config.dimensions.map(getBeamDiagramDimensionId),
  ]);

const requireKnownId = (
  ids: ReadonlySet<string>,
  id: string,
  context: string,
  label: string,
) => {
  if (!ids.has(id)) {
    throw new Error(`${context} references missing ${label} "${id}".`);
  }
};

export const validateBeamDiagramProblemReferences = (
  problem: ProblemDefinition,
  config: BeamDiagramConfig,
  context = "diagram.config",
) => {
  const bodyIds = new Set(problem.bodies.map((body) => body.id));
  const pointIds = new Set(problem.points.map((point) => point.id));
  const supportIds = new Set(problem.supports.map((support) => support.id));
  const loadIds = new Set(problem.loads.map((load) => load.id));
  const reactionIds = new Set(problem.unknownReactions.map((reaction) => reaction.id));
  const componentIds = new Set(
    problem.forceDecompositions.flatMap((decomposition) => [
      decomposition.components.x.id,
      decomposition.components.y.id,
    ]),
  );

  requireKnownId(bodyIds, config.beam.bodyId, `${context}.beam.bodyId`, "body id");
  requireKnownId(pointIds, config.beam.startPointId, `${context}.beam.startPointId`, "point id");
  requireKnownId(pointIds, config.beam.endPointId, `${context}.beam.endPointId`, "point id");
  requireKnownId(pointIds, config.bounds.startPointId, `${context}.bounds.startPointId`, "point id");
  requireKnownId(pointIds, config.bounds.endPointId, `${context}.bounds.endPointId`, "point id");

  config.supports.forEach((support, index) => {
    requireKnownId(supportIds, support.supportId, `${context}.supports[${index}].supportId`, "support id");
    requireKnownId(pointIds, support.pointId, `${context}.supports[${index}].pointId`, "point id");
  });

  config.loadArrows.forEach((loadArrow, index) => {
    requireKnownId(loadIds, loadArrow.loadId, `${context}.loadArrows[${index}].loadId`, "load id");
    requireKnownId(pointIds, loadArrow.pointId, `${context}.loadArrows[${index}].pointId`, "point id");
  });

  config.freeBodyReactions.forEach((reactionArrow, index) => {
    requireKnownId(reactionIds, reactionArrow.reactionId, `${context}.freeBodyReactions[${index}].reactionId`, "reaction id");
    requireKnownId(pointIds, reactionArrow.pointId, `${context}.freeBodyReactions[${index}].pointId`, "point id");
  });

  config.overlayArrows.forEach((overlayArrow, index) => {
    requireKnownId(pointIds, overlayArrow.pointId, `${context}.overlayArrows[${index}].pointId`, "point id");
    if (overlayArrow.componentId !== undefined) {
      requireKnownId(componentIds, overlayArrow.componentId, `${context}.overlayArrows[${index}].componentId`, "force component id");
    }
  });

  config.polylineMarkers.forEach((marker, index) =>
    requireKnownId(pointIds, marker.pointId, `${context}.polylineMarkers[${index}].pointId`, "point id"),
  );

  config.angleMarkers.forEach((marker, index) =>
    requireKnownId(pointIds, marker.pointId, `${context}.angleMarkers[${index}].pointId`, "point id"),
  );

  config.pointLabels.forEach((pointLabel, index) =>
    requireKnownId(pointIds, pointLabel.pointId, `${context}.pointLabels[${index}].pointId`, "point id"),
  );

  config.dimensions.forEach((dimension, index) => {
    requireKnownId(pointIds, dimension.startPointId, `${context}.dimensions[${index}].startPointId`, "point id");
    requireKnownId(pointIds, dimension.endPointId, `${context}.dimensions[${index}].endPointId`, "point id");
  });
};
