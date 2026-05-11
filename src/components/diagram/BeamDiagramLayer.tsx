import { Fragment } from "react";
import { Circle, Layer, Line } from "react-konva";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { LoadDefinition, PointDefinition, SupportDefinition } from "../../mechanics/model/types";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import { DimensionLine } from "./DimensionLine";
import { ForceArrow } from "./ForceArrow";
import { Label } from "./Label";
import { SupportSymbol } from "./SupportSymbol";
import type { CanvasPoint, DiagramInteractionState, DiagramMode, WorldToCanvas } from "./types";

type DiagramOffset = Readonly<{
  x: number;
  y: number;
}>;

type BeamReferenceConfig = Readonly<{
  bodyId: string;
  startPointId: string;
  endPointId: string;
}>;

type SupportAnnotationConfig = Readonly<{
  supportId: string;
  pointId: string;
}>;

type LoadArrowConfig = Readonly<{
  loadId: string;
  pointId: string;
  tailOffset: DiagramOffset;
  tipOffset: DiagramOffset;
  labelOffset: DiagramOffset;
  fontSize: number;
  color: string;
}>;

type ReactionArrowConfig = Readonly<{
  reactionId: string;
  pointId: string;
  tailOffset: DiagramOffset;
  tipOffset: DiagramOffset;
  labelOffset: DiagramOffset;
  fontSize: number;
  color: string;
}>;

type PointLabelConfig = Readonly<{
  pointId: string;
  text: string;
  offset: DiagramOffset;
  fontSize: number;
}>;

type DimensionConfig = Readonly<{
  id?: string;
  startPointId: string;
  endPointId: string;
  label: string;
  yOffset?: number;
}>;

type OverlayArrowConfig = Readonly<{
  id: string;
  pointId: string;
  label?: string;
  componentId?: string;
  tailOffset: DiagramOffset;
  tipOffset: DiagramOffset;
  labelOffset: DiagramOffset;
  fontSize: number;
  color: string;
  strokeWidth?: number;
}>;

type PolylineMarkerConfig = Readonly<{
  id: string;
  pointId: string;
  label: string;
  offsets: readonly DiagramOffset[];
  labelOffset: DiagramOffset;
  fontSize: number;
  color: string;
}>;

export type BeamDiagramConfig = Readonly<{
  beam: BeamReferenceConfig;
  supports: readonly SupportAnnotationConfig[];
  loadArrows: readonly LoadArrowConfig[];
  freeBodyReactions: readonly ReactionArrowConfig[];
  overlayArrows: readonly OverlayArrowConfig[];
  polylineMarkers: readonly PolylineMarkerConfig[];
  pointLabels: readonly PointLabelConfig[];
  dimensions: readonly DimensionConfig[];
  bounds: Readonly<{
    startPointId: string;
    endPointId: string;
  }>;
}>;

type BeamDiagramLayerProps = Readonly<{
  problem: ProblemDefinition;
  solverResult: SolverResult;
  diagramConfig: BeamDiagramConfig;
  mode: DiagramMode;
  worldToCanvas: WorldToCanvas;
}> & DiagramInteractionState;

type JsonRecord = Record<string, unknown>;

export type WorldBounds = Readonly<{
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
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

const parseOffset = (value: unknown, context: string): DiagramOffset => {
  const record = requireRecord(value, context);
  return {
    x: requireNumber(record, "x", context),
    y: requireNumber(record, "y", context),
  };
};

const parseArrowBase = (record: JsonRecord, context: string) => ({
  pointId: requireString(record, "pointId", context),
  tailOffset: parseOffset(record.tailOffset, `${context}.tailOffset`),
  tipOffset: parseOffset(record.tipOffset, `${context}.tipOffset`),
  labelOffset: parseOffset(record.labelOffset, `${context}.labelOffset`),
  fontSize: requireNumber(record, "fontSize", context),
  color: requireString(record, "color", context),
});

export const parseBeamDiagramConfig = (value: unknown): BeamDiagramConfig => {
  const record = requireRecord(value, "beam diagram config");
  const beam = requireRecord(record.beam, "beam diagram config.beam");
  const bounds = requireRecord(record.bounds, "beam diagram config.bounds");

  return {
    beam: {
      bodyId: requireString(beam, "bodyId", "beam diagram config.beam"),
      startPointId: requireString(beam, "startPointId", "beam diagram config.beam"),
      endPointId: requireString(beam, "endPointId", "beam diagram config.beam"),
    },
    supports: requireArray(record, "supports", "beam diagram config").map((item, index) => {
      const support = requireRecord(item, `beam diagram config.supports[${index}]`);
      return {
        supportId: requireString(support, "supportId", `beam diagram config.supports[${index}]`),
        pointId: requireString(support, "pointId", `beam diagram config.supports[${index}]`),
      };
    }),
    loadArrows: requireArray(record, "loadArrows", "beam diagram config").map((item, index) => {
      const arrow = requireRecord(item, `beam diagram config.loadArrows[${index}]`);
      return {
        loadId: requireString(arrow, "loadId", `beam diagram config.loadArrows[${index}]`),
        ...parseArrowBase(arrow, `beam diagram config.loadArrows[${index}]`),
      };
    }),
    freeBodyReactions: requireArray(record, "freeBodyReactions", "beam diagram config").map((item, index) => {
      const arrow = requireRecord(item, `beam diagram config.freeBodyReactions[${index}]`);
      return {
        reactionId: requireString(arrow, "reactionId", `beam diagram config.freeBodyReactions[${index}]`),
        ...parseArrowBase(arrow, `beam diagram config.freeBodyReactions[${index}]`),
      };
    }),
    overlayArrows:
      record.overlayArrows === undefined
        ? []
        : requireArray(record, "overlayArrows", "beam diagram config").map((item, index) => {
            const arrow = requireRecord(item, `beam diagram config.overlayArrows[${index}]`);
            const strokeWidth =
              arrow.strokeWidth === undefined
                ? undefined
                : requireNumber(arrow, "strokeWidth", `beam diagram config.overlayArrows[${index}]`);
            if (arrow.label === undefined && arrow.componentId === undefined) {
              throw new Error(`beam diagram config.overlayArrows[${index}] requires label or componentId.`);
            }
            return {
              id: requireString(arrow, "id", `beam diagram config.overlayArrows[${index}]`),
              ...(arrow.label === undefined
                ? {}
                : { label: requireString(arrow, "label", `beam diagram config.overlayArrows[${index}]`) }),
              ...(arrow.componentId === undefined
                ? {}
                : { componentId: requireString(arrow, "componentId", `beam diagram config.overlayArrows[${index}]`) }),
              ...parseArrowBase(arrow, `beam diagram config.overlayArrows[${index}]`),
              ...(strokeWidth === undefined ? {} : { strokeWidth }),
            };
          }),
    polylineMarkers:
      record.polylineMarkers === undefined
        ? []
        : requireArray(record, "polylineMarkers", "beam diagram config").map((item, index) => {
            const marker = requireRecord(item, `beam diagram config.polylineMarkers[${index}]`);
            return {
              id: requireString(marker, "id", `beam diagram config.polylineMarkers[${index}]`),
              pointId: requireString(marker, "pointId", `beam diagram config.polylineMarkers[${index}]`),
              label: requireString(marker, "label", `beam diagram config.polylineMarkers[${index}]`),
              offsets: requireArray(marker, "offsets", `beam diagram config.polylineMarkers[${index}]`).map(
                (offset, offsetIndex) =>
                  parseOffset(offset, `beam diagram config.polylineMarkers[${index}].offsets[${offsetIndex}]`),
              ),
              labelOffset: parseOffset(marker.labelOffset, `beam diagram config.polylineMarkers[${index}].labelOffset`),
              fontSize: requireNumber(marker, "fontSize", `beam diagram config.polylineMarkers[${index}]`),
              color: requireString(marker, "color", `beam diagram config.polylineMarkers[${index}]`),
            };
          }),
    pointLabels: requireArray(record, "pointLabels", "beam diagram config").map((item, index) => {
      const label = requireRecord(item, `beam diagram config.pointLabels[${index}]`);
      return {
        pointId: requireString(label, "pointId", `beam diagram config.pointLabels[${index}]`),
        text: requireString(label, "text", `beam diagram config.pointLabels[${index}]`),
        offset: parseOffset(label.offset, `beam diagram config.pointLabels[${index}].offset`),
        fontSize: requireNumber(label, "fontSize", `beam diagram config.pointLabels[${index}]`),
      };
    }),
    dimensions: requireArray(record, "dimensions", "beam diagram config").map((item, index) => {
      const dimension = requireRecord(item, `beam diagram config.dimensions[${index}]`);
      const yOffset =
        dimension.yOffset === undefined
          ? undefined
          : requireNumber(dimension, "yOffset", `beam diagram config.dimensions[${index}]`);
      const parsed = {
        startPointId: requireString(dimension, "startPointId", `beam diagram config.dimensions[${index}]`),
        endPointId: requireString(dimension, "endPointId", `beam diagram config.dimensions[${index}]`),
        label: requireString(dimension, "label", `beam diagram config.dimensions[${index}]`),
        ...(yOffset === undefined ? {} : { yOffset }),
      };
      return dimension.id === undefined
        ? parsed
        : { ...parsed, id: requireString(dimension, "id", `beam diagram config.dimensions[${index}]`) };
    }),
    bounds: {
      startPointId: requireString(bounds, "startPointId", "beam diagram config.bounds"),
      endPointId: requireString(bounds, "endPointId", "beam diagram config.bounds"),
    },
  };
};

const findPoint = (problem: ProblemDefinition, pointId: string): PointDefinition => {
  const point = problem.points.find((candidate) => candidate.id === pointId);
  if (!point) {
    throw new Error(`Beam diagram references missing point "${pointId}".`);
  }
  return point;
};

const findSupport = (problem: ProblemDefinition, supportId: string): SupportDefinition => {
  const support = problem.supports.find((candidate) => candidate.id === supportId);
  if (!support) {
    throw new Error(`Beam diagram references missing support "${supportId}".`);
  }
  return support;
};

const findLoad = (problem: ProblemDefinition, loadId: string): LoadDefinition => {
  const load = problem.loads.find((candidate) => candidate.id === loadId);
  if (!load) {
    throw new Error(`Beam diagram references missing load "${loadId}".`);
  }
  return load;
};

const findReactionLabel = (problem: ProblemDefinition, solverResult: SolverResult, reactionId: string): string => {
  const resultReaction = solverResult.reactions.find((reaction) => reaction.id === reactionId);
  if (resultReaction) {
    return resultReaction.label;
  }

  const unknownReaction = problem.unknownReactions.find((reaction) => reaction.id === reactionId);
  if (!unknownReaction) {
    throw new Error(`Beam diagram references missing reaction "${reactionId}".`);
  }

  return unknownReaction.label;
};

const findComponentLabel = (problem: ProblemDefinition, componentId: string): string => {
  const component = problem.forceDecompositions
    .flatMap((decomposition) => [decomposition.components.x, decomposition.components.y])
    .find((candidate) => candidate.id === componentId);
  if (!component) {
    throw new Error(`Beam diagram references missing force component "${componentId}".`);
  }
  return component.latex;
};

const getOverlayLabel = (problem: ProblemDefinition, overlayArrow: OverlayArrowConfig): string => {
  if (overlayArrow.componentId !== undefined) {
    return findComponentLabel(problem, overlayArrow.componentId);
  }
  if (overlayArrow.label !== undefined) {
    return overlayArrow.label;
  }
  throw new Error(`Beam diagram overlay "${overlayArrow.id}" requires label or componentId.`);
};

const offsetPoint = (point: CanvasPoint, offset: DiagramOffset): CanvasPoint => ({
  x: point.x + offset.x,
  y: point.y + offset.y,
});

export const getBeamDiagramWorldBounds = (problem: ProblemDefinition, config: BeamDiagramConfig): WorldBounds => {
  const start = findPoint(problem, config.bounds.startPointId);
  const end = findPoint(problem, config.bounds.endPointId);

  return {
    minX: Math.min(start.x, end.x),
    maxX: Math.max(start.x, end.x),
    minY: Math.min(start.y, end.y),
    maxY: Math.max(start.y, end.y),
  };
};

export const BeamDiagramLayer = ({
  problem,
  solverResult,
  diagramConfig,
  mode,
  worldToCanvas,
  canvasState,
  selectableObjectIds = [],
  selectedObjectIds = [],
  onObjectSelect,
}: BeamDiagramLayerProps) => {
  const beamStart = worldToCanvas(findPoint(problem, diagramConfig.beam.startPointId));
  const beamEnd = worldToCanvas(findPoint(problem, diagramConfig.beam.endPointId));
  const isFreeBody = mode === "explain";
  const usesAuthoredCanvasState = canvasState !== undefined && (mode === "explain" || mode === "practice");
  const highlightedIds = new Set(canvasState?.highlightedObjects ?? []);
  const dimmedIds = new Set(canvasState?.dimmedObjects ?? []);
  const visibleIds = new Set(canvasState?.visibleObjects ?? []);
  const solvedIds = new Set(canvasState?.solvedObjects ?? []);
  const selectableIds = new Set(selectableObjectIds);
  const selectedIds = new Set(selectedObjectIds);
  const interactivePointIds = new Set([...selectableIds, ...selectedIds].filter((id) => problem.points.some((point) => point.id === id)));
  const highlightColor = "#0d9488";
  const dimOpacity = 0.28;
  const getStroke = (objectId: string, fallback: string) =>
    highlightedIds.has(objectId) || selectedIds.has(objectId) || solvedIds.has(objectId) ? highlightColor : fallback;
  const getOpacity = (objectId: string) => (dimmedIds.has(objectId) ? dimOpacity : 1);
  const shouldShowReaction = (reactionId: string) =>
    usesAuthoredCanvasState
      ? visibleIds.has(reactionId) || canvasState?.solvedValues?.[reactionId] !== undefined
      : isFreeBody;
  const shouldShowOverlay = (objectId: string) =>
    usesAuthoredCanvasState
      ? visibleIds.has(objectId) || highlightedIds.has(objectId) || solvedIds.has(objectId)
      : isFreeBody;

  const supportLayer = !isFreeBody ? (
    <>
      {diagramConfig.supports.map((supportAnnotation) => {
        const support = findSupport(problem, supportAnnotation.supportId);
        const stroke = getStroke(supportAnnotation.supportId, "#111111");
        return (
          <SupportSymbol
            key={supportAnnotation.supportId}
            kind={support.kind}
            point={worldToCanvas(findPoint(problem, supportAnnotation.pointId))}
            stroke={stroke}
            opacity={getOpacity(supportAnnotation.supportId)}
          />
        );
      })}
    </>
  ) : null;

  return (
    <Layer>
      <Line
        points={[beamStart.x, beamStart.y, beamEnd.x, beamEnd.y]}
        stroke={getStroke(diagramConfig.beam.bodyId, "#111111")}
        strokeWidth={4}
        lineCap="round"
        opacity={getOpacity(diagramConfig.beam.bodyId)}
      />
      <Circle x={beamStart.x} y={beamStart.y} radius={5} fill="#fbfaf5" stroke="#111111" strokeWidth={1.5} />
      <Circle x={beamEnd.x} y={beamEnd.y} radius={5} fill="#fbfaf5" stroke="#111111" strokeWidth={1.5} />

      {diagramConfig.loadArrows.map((loadArrow) => {
        const load = findLoad(problem, loadArrow.loadId);
        const loadPoint = worldToCanvas(findPoint(problem, loadArrow.pointId));
        const color = getStroke(loadArrow.loadId, loadArrow.color);
        return (
          <ForceArrow
            key={loadArrow.loadId}
            start={offsetPoint(loadPoint, loadArrow.tailOffset)}
            end={offsetPoint(loadPoint, loadArrow.tipOffset)}
            label={load.label}
            color={color}
            labelOffset={loadArrow.labelOffset}
            fontSize={loadArrow.fontSize}
            opacity={getOpacity(loadArrow.loadId)}
          />
        );
      })}

      {supportLayer}

      {diagramConfig.overlayArrows.map((overlayArrow) => {
        if (!shouldShowOverlay(overlayArrow.id)) {
          return null;
        }
        const point = worldToCanvas(findPoint(problem, overlayArrow.pointId));
        const color = getStroke(overlayArrow.id, overlayArrow.color);
        return (
          <ForceArrow
            key={overlayArrow.id}
            start={offsetPoint(point, overlayArrow.tailOffset)}
            end={offsetPoint(point, overlayArrow.tipOffset)}
            label={getOverlayLabel(problem, overlayArrow)}
            color={color}
            labelOffset={overlayArrow.labelOffset}
            fontSize={overlayArrow.fontSize}
            {...(overlayArrow.strokeWidth === undefined ? {} : { strokeWidth: overlayArrow.strokeWidth })}
            opacity={getOpacity(overlayArrow.id)}
          />
        );
      })}

      {diagramConfig.polylineMarkers.map((marker) => {
        if (!shouldShowOverlay(marker.id) || marker.offsets.length < 2) {
          return null;
        }
        const point = worldToCanvas(findPoint(problem, marker.pointId));
        const markerPoints = marker.offsets.flatMap((offset) => [point.x + offset.x, point.y + offset.y]);
        const labelPoint = offsetPoint(point, marker.labelOffset);
        const color = getStroke(marker.id, marker.color);
        return (
          <Fragment key={marker.id}>
            <Line
              points={markerPoints}
              stroke={color}
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
              opacity={getOpacity(marker.id)}
            />
            <Label
              x={labelPoint.x}
              y={labelPoint.y}
              text={marker.label}
              fill={color}
              fontSize={marker.fontSize}
              fontStyle="500"
            />
          </Fragment>
        );
      })}

      {isFreeBody || mode === "practice" ? (
        <>
          {diagramConfig.freeBodyReactions.map((reactionArrow) => {
            if (!shouldShowReaction(reactionArrow.reactionId)) {
              return null;
            }
            const reactionPoint = worldToCanvas(findPoint(problem, reactionArrow.pointId));
            const color = getStroke(reactionArrow.reactionId, reactionArrow.color);
            return (
              <ForceArrow
                key={reactionArrow.reactionId}
                start={offsetPoint(reactionPoint, reactionArrow.tailOffset)}
                end={offsetPoint(reactionPoint, reactionArrow.tipOffset)}
                label={canvasState?.solvedValues?.[reactionArrow.reactionId] ?? findReactionLabel(problem, solverResult, reactionArrow.reactionId)}
                color={color}
                labelOffset={reactionArrow.labelOffset}
                fontSize={reactionArrow.fontSize}
                opacity={getOpacity(reactionArrow.reactionId)}
              />
            );
          })}
        </>
      ) : null}

      {diagramConfig.pointLabels.map((pointLabel) => {
        const point = worldToCanvas(findPoint(problem, pointLabel.pointId));
        const labelPoint = offsetPoint(point, pointLabel.offset);
        return (
          <Label
            key={`${pointLabel.pointId}-${pointLabel.text}`}
            x={labelPoint.x}
            y={labelPoint.y}
            text={pointLabel.text}
            fill={getStroke(pointLabel.pointId, "#17201a")}
            fontSize={pointLabel.fontSize}
            fontStyle="400"
          />
        );
      })}

      {diagramConfig.dimensions.map((dimension) => {
        const dimensionId = dimension.id ?? `${dimension.startPointId}-${dimension.endPointId}-${dimension.label}`;
        return (
          <DimensionLine
            key={dimensionId}
            start={worldToCanvas(findPoint(problem, dimension.startPointId))}
            end={worldToCanvas(findPoint(problem, dimension.endPointId))}
            label={dimension.label}
            {...(dimension.yOffset === undefined ? {} : { yOffset: dimension.yOffset })}
            color={getStroke(dimensionId, "#111111")}
            opacity={getOpacity(dimensionId)}
          />
        );
      })}

      {[...interactivePointIds].map((pointId) => {
        const point = worldToCanvas(findPoint(problem, pointId));
        const isSelected = selectedIds.has(pointId);
        const isHighlighted = highlightedIds.has(pointId);
        return (
          <Circle
            key={`hit-${pointId}`}
            x={point.x}
            y={point.y}
            radius={isSelected || isHighlighted ? 19 : 15}
            fill={isSelected ? "rgba(13, 148, 136, 0.16)" : "rgba(13, 148, 136, 0.04)"}
            stroke={isSelected || isHighlighted ? highlightColor : "rgba(13, 148, 136, 0.55)"}
            strokeWidth={isSelected || isHighlighted ? 3 : 1.5}
            onClick={() => onObjectSelect?.(pointId)}
            onTap={() => onObjectSelect?.(pointId)}
          />
        );
      })}
    </Layer>
  );
};
