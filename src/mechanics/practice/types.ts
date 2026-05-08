export type PracticeSessionState = Readonly<{
  currentStepId: string;
  stepStatuses: Record<string, "locked" | "active" | "completed">;
  answers: Record<string, unknown>;
  attempts: Record<string, number>;
  revealedHints: Record<string, number>;
}>;

export type PracticeCanvasState = Readonly<{
  visibleObjects?: readonly string[];
  highlightedObjects?: readonly string[];
  dimmedObjects?: readonly string[];
  annotations?: readonly string[];
  solvedValues?: Record<string, string>;
  solvedObjects?: readonly string[];
}>;

export type MistakeFeedback = Readonly<{
  id: string;
  text: string;
}>;

export type PracticeHint = Readonly<{
  level: 1 | 2 | 3;
  text: string;
  highlightCanvasIds?: readonly string[];
}>;

export type PracticeStep = Readonly<{
  id: string;
  title: string;
  goal: string;
  instructions?: string;
  canvasState?: PracticeCanvasState;
  interaction: PracticeInteraction;
  feedback: Readonly<{
    correct: string;
    genericIncorrect: string;
    mistakes?: readonly MistakeFeedback[];
  }>;
  hints?: readonly PracticeHint[];
  successResult?: Readonly<{
    solvedValues?: Record<string, string>;
    revealObjects?: readonly string[];
    markObjectsSolved?: readonly string[];
  }>;
}>;

export type PracticeContent = Readonly<{
  title: string;
  body: string;
  steps: readonly PracticeStep[];
}>;

export type InteractionOption = Readonly<{
  id: string;
  label: string;
}>;

export type CheckboxInteraction = Readonly<{
  type: "checkbox";
  options: readonly InteractionOption[];
  correctOptionIds: readonly string[];
}>;

export type MultipleChoiceInteraction = Readonly<{
  type: "multiple-choice";
  options: readonly InteractionOption[];
  correctOptionId: string;
}>;

export type CanvasClickInteraction = Readonly<{
  type: "canvas-click";
  selectableIds: readonly string[];
  correctSelectableIds: readonly string[];
  labels?: readonly InteractionOption[];
}>;

export type MatchingInteraction = Readonly<{
  type: "matching";
  leftItems: readonly InteractionOption[];
  rightItems: readonly InteractionOption[];
  correctPairs: Record<string, string>;
}>;

export type EquationBuilderInteraction = Readonly<{
  type: "equation-builder";
  equationTarget: "sumFx" | "sumFy" | "sumMoment";
  aboutPoint?: string;
  availableTerms: readonly EquationTerm[];
  expectedEquation: ExpectedEquation;
}>;

export type EquationTerm = Readonly<{
  id: string;
  label: string;
  semantic: Readonly<{
    variable: string;
    direction?: "x" | "y";
    sign: "+" | "-";
    factor?: string;
    momentAbout?: string;
  }>;
}>;

export type ExpectedEquation = Readonly<{
  equationType: "sumFx" | "sumFy" | "sumMoment";
  aboutPoint?: string;
  terms: readonly Readonly<{
    variable: string;
    sign: "+" | "-";
    factor?: string;
  }>[];
  rhs: "0";
}>;

export type ExpressionInputInteraction = Readonly<{
  type: "expression-input";
  variable: string;
  expectedExpression: string;
  acceptedExpressions?: readonly string[];
}>;

export type PracticeInteraction =
  | CheckboxInteraction
  | MultipleChoiceInteraction
  | CanvasClickInteraction
  | MatchingInteraction
  | EquationBuilderInteraction
  | ExpressionInputInteraction;

export type ValidationResult = Readonly<{
  isCorrect: boolean;
  mistakeIds?: readonly string[];
  feedbackMessages: readonly string[];
}>;
