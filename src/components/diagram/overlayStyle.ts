import type { CanvasState } from "../../mechanics/model/canvasState";

export const diagramColors = {
  neutral: "#191c1e",
  neutralSoft: "#444748",
  externalForce: "#00a86b",
  externalForceComponent: "#14b88f",
  reactionForce: "#ef4444",
  selection: "#006a61",
  paper: "#fbfaf5",
} as const;

export type ObjectPresentation = Readonly<{
  color: string;
  opacity: number;
  isSelected: boolean;
}>;

export type OverlayStateInput = Readonly<{
  canvasState?: CanvasState | undefined;
  selectedObjectIds?: readonly string[] | undefined;
}>;

export type OverlayState = Readonly<{
  visibleIds: ReadonlySet<string>;
  selectedIds: ReadonlySet<string>;
  isVisible: (objectId: string) => boolean;
  getPresentation: (objectId: string, fallbackColor: string) => ObjectPresentation;
}>;

export const createOverlayState = ({ canvasState, selectedObjectIds = [] }: OverlayStateInput): OverlayState => {
  const visibleIds = new Set(canvasState?.visibleObjects ?? []);
  const selectedIds = new Set(selectedObjectIds);

  const isVisible = (objectId: string) => visibleIds.has(objectId);

  const getPresentation = (objectId: string, fallbackColor: string): ObjectPresentation => {
    const isSelected = selectedIds.has(objectId);

    return {
      color: fallbackColor,
      opacity: 1,
      isSelected,
    };
  };

  return {
    visibleIds,
    selectedIds,
    isVisible,
    getPresentation,
  };
};
