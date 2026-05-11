export type CanvasState = Readonly<{
  visibleObjects?: readonly string[];
  highlightedObjects?: readonly string[];
  dimmedObjects?: readonly string[];
  annotations?: readonly string[];
  solvedValues?: Record<string, string>;
  solvedObjects?: readonly string[];
}>;
