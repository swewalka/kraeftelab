import { Fragment } from "react";
import { Circle, Layer, Line } from "react-konva";
import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { LoadDefinition, PointDefinition, SupportDefinition } from "../../mechanics/model/types";
import type { SolverResult } from "../../mechanics/solvers/equilibrium2D/types";
import {
  getBeamDiagramDimensionId,
  type BeamDiagramConfig,
  type DiagramOffset,
  type OverlayArrowConfig,
} from "../../mechanics/diagram/beamDiagramConfig";
import { AngleMarker } from "./AngleMarker";
import { DimensionLine } from "./DimensionLine";
import { ForceArrow } from "./ForceArrow";
import { Label } from "./Label";
import { createOverlayState, diagramColors } from "./overlayStyle";
import { SupportSymbol } from "./SupportSymbol";
import type { CanvasPoint, DiagramInteractionState, DiagramMode, WorldToCanvas } from "./types";

type BeamDiagramLayerProps = Readonly<{
  problem: ProblemDefinition;
  solverResult: SolverResult;
  diagramConfig: BeamDiagramConfig;
  mode: DiagramMode;
  worldToCanvas: WorldToCanvas;
}> & DiagramInteractionState;

export type WorldBounds = Readonly<{
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}>;

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
  const overlayState = createOverlayState({ canvasState, selectedObjectIds });
  const hiddenBaseObjectIds = new Set(canvasState?.hiddenBaseObjects ?? []);
  const baseObjectIds = new Set([
    diagramConfig.beam.bodyId,
    diagramConfig.beam.startPointId,
    diagramConfig.beam.endPointId,
  ]);
  const selectableIds = new Set(selectableObjectIds);
  const interactivePointIds = new Set(
    [...selectableIds, ...overlayState.selectedIds].filter((id) => problem.points.some((point) => point.id === id)),
  );
  const isBaseObject = (objectId: string) => baseObjectIds.has(objectId);
  const shouldShowBaseObject = (objectId: string) => !hiddenBaseObjectIds.has(objectId);
  const shouldShowObject = (objectId: string) =>
    isBaseObject(objectId)
      ? shouldShowBaseObject(objectId)
      : usesAuthoredCanvasState
        ? overlayState.isVisible(objectId)
        : true;
  const shouldShowReaction = (reactionId: string) =>
    usesAuthoredCanvasState ? overlayState.isVisible(reactionId) : isFreeBody;
  const shouldShowOverlay = (objectId: string) =>
    usesAuthoredCanvasState ? overlayState.isVisible(objectId) : isFreeBody;
  const shouldShowPoint = (pointId: string) => shouldShowObject(pointId) || interactivePointIds.has(pointId);
  const shouldShowSupport = (supportId: string) => shouldShowObject(supportId);
  const beamPresentation = {
    ...overlayState.getPresentation(diagramConfig.beam.bodyId, diagramColors.neutral),
    opacity: 1,
  };

  const supportLayer = (
    <>
      {diagramConfig.supports.map((supportAnnotation) => {
        if (!shouldShowSupport(supportAnnotation.supportId)) {
          return null;
        }
        const support = findSupport(problem, supportAnnotation.supportId);
        const presentation = overlayState.getPresentation(supportAnnotation.supportId, diagramColors.neutral);
        return (
          <SupportSymbol
            key={supportAnnotation.supportId}
            kind={support.kind}
            point={worldToCanvas(findPoint(problem, supportAnnotation.pointId))}
            stroke={presentation.color}
            opacity={presentation.opacity}
          />
        );
      })}
    </>
  );

  return (
    <Layer>
      {shouldShowObject(diagramConfig.beam.bodyId) ? (
        <Line
          points={[beamStart.x, beamStart.y, beamEnd.x, beamEnd.y]}
          stroke={beamPresentation.color}
          strokeWidth={4}
          lineCap="round"
          opacity={beamPresentation.opacity}
        />
      ) : null}
      <Circle
        x={beamStart.x}
        y={beamStart.y}
        radius={5}
        fill={diagramColors.paper}
        stroke={diagramColors.neutral}
        strokeWidth={1.5}
        opacity={shouldShowPoint(diagramConfig.beam.startPointId) ? 1 : 0}
      />
      <Circle
        x={beamEnd.x}
        y={beamEnd.y}
        radius={5}
        fill={diagramColors.paper}
        stroke={diagramColors.neutral}
        strokeWidth={1.5}
        opacity={shouldShowPoint(diagramConfig.beam.endPointId) ? 1 : 0}
      />

      {diagramConfig.loadArrows.map((loadArrow) => {
        if (!shouldShowObject(loadArrow.loadId)) {
          return null;
        }
        const load = findLoad(problem, loadArrow.loadId);
        const loadPoint = worldToCanvas(findPoint(problem, loadArrow.pointId));
        const presentation = overlayState.getPresentation(loadArrow.loadId, loadArrow.color ?? diagramColors.externalForce);
        return (
          <ForceArrow
            key={loadArrow.loadId}
            start={offsetPoint(loadPoint, loadArrow.tailOffset)}
            end={offsetPoint(loadPoint, loadArrow.tipOffset)}
            label={load.label}
            color={presentation.color}
            labelOffset={loadArrow.labelOffset}
            fontSize={loadArrow.fontSize}
            opacity={presentation.opacity}
          />
        );
      })}

      {supportLayer}

      {diagramConfig.overlayArrows.map((overlayArrow) => {
        if (!shouldShowOverlay(overlayArrow.id)) {
          return null;
        }
        const point = worldToCanvas(findPoint(problem, overlayArrow.pointId));
        const presentation = overlayState.getPresentation(
          overlayArrow.id,
          overlayArrow.color ?? diagramColors.externalForceComponent,
        );
        return (
          <ForceArrow
            key={overlayArrow.id}
            start={offsetPoint(point, overlayArrow.tailOffset)}
            end={offsetPoint(point, overlayArrow.tipOffset)}
            label={getOverlayLabel(problem, overlayArrow)}
            color={presentation.color}
            labelOffset={overlayArrow.labelOffset}
            fontSize={overlayArrow.fontSize}
            strokeWidth={overlayArrow.strokeWidth ?? 2.5}
            opacity={presentation.opacity}
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
        const presentation = overlayState.getPresentation(marker.id, marker.color ?? diagramColors.neutralSoft);
        return (
          <Fragment key={marker.id}>
            <Line
              points={markerPoints}
              stroke={presentation.color}
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
              opacity={presentation.opacity}
            />
            <Label
              x={labelPoint.x}
              y={labelPoint.y}
              text={marker.label}
              fill={presentation.color}
              fontSize={marker.fontSize}
              fontStyle="500"
              opacity={presentation.opacity}
            />
          </Fragment>
        );
      })}

      {diagramConfig.angleMarkers.map((marker) => {
        if (!shouldShowOverlay(marker.id)) {
          return null;
        }
        const point = worldToCanvas(findPoint(problem, marker.pointId));
        const presentation = overlayState.getPresentation(marker.id, marker.color ?? diagramColors.neutralSoft);
        return (
          <AngleMarker
            key={marker.id}
            center={point}
            radius={marker.radius}
            startAngleDeg={marker.startAngleDeg}
            endAngleDeg={marker.endAngleDeg}
            label={marker.label}
            labelOffset={marker.labelOffset}
            color={presentation.color}
            fontSize={marker.fontSize}
            opacity={presentation.opacity}
          />
        );
      })}

      {isFreeBody || mode === "practice" ? (
        <>
          {diagramConfig.freeBodyReactions.map((reactionArrow) => {
            if (!shouldShowReaction(reactionArrow.reactionId)) {
              return null;
            }
            const reactionPoint = worldToCanvas(findPoint(problem, reactionArrow.pointId));
            const presentation = overlayState.getPresentation(
              reactionArrow.reactionId,
              reactionArrow.color ?? diagramColors.reactionForce,
            );
            return (
              <ForceArrow
                key={reactionArrow.reactionId}
                start={offsetPoint(reactionPoint, reactionArrow.tailOffset)}
                end={offsetPoint(reactionPoint, reactionArrow.tipOffset)}
                label={findReactionLabel(problem, solverResult, reactionArrow.reactionId)}
                color={presentation.color}
                labelOffset={reactionArrow.labelOffset}
                fontSize={reactionArrow.fontSize}
                opacity={presentation.opacity}
              />
            );
          })}
        </>
      ) : null}

      {diagramConfig.pointLabels.map((pointLabel) => {
        if (!shouldShowPoint(pointLabel.pointId)) {
          return null;
        }
        const point = worldToCanvas(findPoint(problem, pointLabel.pointId));
        const labelPoint = offsetPoint(point, pointLabel.offset);
        const presentation = overlayState.getPresentation(pointLabel.pointId, diagramColors.neutral);
        return (
          <Label
            key={`${pointLabel.pointId}-${pointLabel.text}`}
            x={labelPoint.x}
            y={labelPoint.y}
            text={pointLabel.text}
            fill={presentation.color}
            fontSize={pointLabel.fontSize}
            fontStyle="400"
            opacity={presentation.opacity}
          />
        );
      })}

      {diagramConfig.dimensions.map((dimension) => {
        const dimensionId = getBeamDiagramDimensionId(dimension);
        if (!shouldShowObject(dimensionId)) {
          return null;
        }
        const presentation = overlayState.getPresentation(dimensionId, diagramColors.neutral);
        return (
          <DimensionLine
            key={dimensionId}
            start={worldToCanvas(findPoint(problem, dimension.startPointId))}
            end={worldToCanvas(findPoint(problem, dimension.endPointId))}
            label={dimension.label}
            {...(dimension.yOffset === undefined ? {} : { yOffset: dimension.yOffset })}
            color={presentation.color}
            opacity={presentation.opacity}
          />
        );
      })}

      {[...interactivePointIds].map((pointId) => {
        const point = worldToCanvas(findPoint(problem, pointId));
        const presentation = overlayState.getPresentation(pointId, diagramColors.selection);
        const isSelected = presentation.isSelected;
        return (
          <Circle
            key={`hit-${pointId}`}
            x={point.x}
            y={point.y}
            radius={isSelected ? 19 : 15}
            fill={isSelected ? "rgba(0, 106, 97, 0.16)" : "rgba(0, 106, 97, 0.04)"}
            stroke={isSelected ? diagramColors.selection : "rgba(0, 106, 97, 0.55)"}
            strokeWidth={isSelected ? 3 : 1.5}
            onClick={() => onObjectSelect?.(pointId)}
            onTap={() => onObjectSelect?.(pointId)}
          />
        );
      })}
    </Layer>
  );
};
