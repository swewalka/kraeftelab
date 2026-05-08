import type { PracticeCanvasState, PracticeContent, PracticeSessionState, PracticeStep } from "./types";

export const createInitialPracticeSession = (steps: readonly PracticeStep[]): PracticeSessionState => {
  const firstStep = steps[0];
  return {
    currentStepId: firstStep?.id ?? "",
    stepStatuses: Object.fromEntries(
      steps.map((step, index) => [step.id, index === 0 ? "active" : "locked"]),
    ),
    answers: {},
    attempts: {},
    revealedHints: {},
  };
};

export const getActivePracticeStep = (
  practice: PracticeContent,
  session: PracticeSessionState,
): PracticeStep | undefined => practice.steps.find((step) => step.id === session.currentStepId) ?? practice.steps[0];

const unique = (items: readonly string[]): readonly string[] => [...new Set(items)];

export const buildPracticeCanvasState = (
  practice: PracticeContent,
  session: PracticeSessionState,
): PracticeCanvasState | undefined => {
  const activeStep = getActivePracticeStep(practice, session);
  const completedSteps = practice.steps.filter((step) => session.stepStatuses[step.id] === "completed");
  const revealedObjects = completedSteps.flatMap((step) => step.successResult?.revealObjects ?? []);
  const solvedObjects = completedSteps.flatMap((step) => step.successResult?.markObjectsSolved ?? []);
  const solvedValues = Object.assign({}, ...completedSteps.map((step) => step.successResult?.solvedValues ?? {}));
  const activeHighlights = activeStep?.canvasState?.highlightedObjects ?? [];
  const activeVisible = activeStep?.canvasState?.visibleObjects ?? [];
  const activeSolved = activeStep?.canvasState?.solvedObjects ?? [];
  const activeSolvedValues = activeStep?.canvasState?.solvedValues ?? {};

  return {
    ...activeStep?.canvasState,
    visibleObjects: unique([...revealedObjects, ...activeVisible]),
    highlightedObjects: unique([...activeHighlights]),
    solvedObjects: unique([...solvedObjects, ...activeSolved]),
    solvedValues: { ...solvedValues, ...activeSolvedValues },
  };
};

export const getCurrentCanvasSelectableIds = (
  activeStep: PracticeStep | undefined,
): readonly string[] =>
  activeStep?.interaction.type === "canvas-click" ? activeStep.interaction.selectableIds : [];
