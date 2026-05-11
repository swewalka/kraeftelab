import type { ContentBlock } from "../content/types";
import type { CanvasState } from "../model/canvasState";

export type PracticeSessionState = Readonly<{
  currentStepId: string;
  stepStatuses: Record<string, "locked" | "active" | "completed">;
  answers: Record<string, unknown>;
  attempts: Record<string, number>;
  revealedHints: Record<string, number>;
}>;

export type PracticeCanvasState = CanvasState;

export type MistakeFeedback = Readonly<{
  id: string;
  content: readonly ContentBlock[];
}>;

export type PracticeHint = Readonly<{
  level: 1 | 2 | 3;
  content: readonly ContentBlock[];
  highlightCanvasIds?: readonly string[];
}>;

export type PracticeStep = Readonly<{
  id: string;
  title: string;
  goal: readonly ContentBlock[];
  instructions?: readonly ContentBlock[];
  canvasState?: PracticeCanvasState;
  interaction: PracticeInteraction;
  feedback: Readonly<{
    correct: readonly ContentBlock[];
    genericIncorrect: readonly ContentBlock[];
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
  latex?: string;
  content?: readonly ContentBlock[];
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
  latex: string;
  semantic: Readonly<{
    variable: string;
    direction?: "x" | "y";
    sign: "+" | "-";
    factor?: string;
    componentId?: string;
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
    componentId?: string;
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
  feedbackMessages: readonly ContentBlock[];
}>;
