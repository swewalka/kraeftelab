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

const dimOpacity = 0.28;
const contextOpacity = 0.38;

export type ObjectPresentation = Readonly<{
  color: string;
  opacity: number;
  isImportant: boolean;
  isSelected: boolean;
}>;

export type OverlayStateInput = Readonly<{
  canvasState?: CanvasState | undefined;
  selectedObjectIds?: readonly string[] | undefined;
}>;

export type OverlayState = Readonly<{
  visibleIds: ReadonlySet<string>;
  importantIds: ReadonlySet<string>;
  dimmedIds: ReadonlySet<string>;
  solvedIds: ReadonlySet<string>;
  selectedIds: ReadonlySet<string>;
  solvedValueIds: ReadonlySet<string>;
  hasImportantObjects: boolean;
  isVisible: (objectId: string) => boolean;
  isVisibleOrSolved: (objectId: string) => boolean;
  getPresentation: (objectId: string, fallbackColor: string) => ObjectPresentation;
}>;

export const createOverlayState = ({ canvasState, selectedObjectIds = [] }: OverlayStateInput): OverlayState => {
  const visibleIds = new Set(canvasState?.visibleObjects ?? []);
  const importantIds = new Set(canvasState?.highlightedObjects ?? []);
  const dimmedIds = new Set(canvasState?.dimmedObjects ?? []);
  const solvedIds = new Set(canvasState?.solvedObjects ?? []);
  const selectedIds = new Set(selectedObjectIds);
  const solvedValueIds = new Set(Object.keys(canvasState?.solvedValues ?? {}));
  const hasImportantObjects = importantIds.size > 0;

  const isVisible = (objectId: string) => visibleIds.has(objectId);
  const isVisibleOrSolved = (objectId: string) =>
    visibleIds.has(objectId) || solvedIds.has(objectId) || solvedValueIds.has(objectId);

  const getPresentation = (objectId: string, fallbackColor: string): ObjectPresentation => {
    const isSelected = selectedIds.has(objectId);
    const isImportant = importantIds.has(objectId) || isSelected;
    const opacity = dimmedIds.has(objectId)
      ? dimOpacity
      : hasImportantObjects && !isImportant
        ? contextOpacity
        : 1;

    return {
      color: fallbackColor,
      opacity,
      isImportant,
      isSelected,
    };
  };

  return {
    visibleIds,
    importantIds,
    dimmedIds,
    solvedIds,
    selectedIds,
    solvedValueIds,
    hasImportantObjects,
    isVisible,
    isVisibleOrSolved,
    getPresentation,
  };
};
