import type { PracticeInteraction } from "../../mechanics/practice/types";
import { CanvasClickInteractionView } from "./CanvasClickInteractionView";
import { CheckboxInteractionView } from "./CheckboxInteractionView";
import { EquationBuilderInteractionView } from "./EquationBuilderInteractionView";
import { ExpressionInputInteractionView } from "./ExpressionInputInteractionView";
import { MatchingInteractionView } from "./MatchingInteractionView";
import { MultipleChoiceInteractionView } from "./MultipleChoiceInteractionView";

type PracticeInteractionViewProps = Readonly<{
  interaction: PracticeInteraction;
  answer: unknown;
  validationState: "correct" | "incorrect" | undefined;
  onAnswerChange: (answer: unknown) => void;
}>;

export const PracticeInteractionView = ({ interaction, answer, validationState, onAnswerChange }: PracticeInteractionViewProps) => {
  if (interaction.type === "checkbox") {
    return <CheckboxInteractionView interaction={interaction} answer={answer} validationState={validationState} onAnswerChange={onAnswerChange} />;
  }
  if (interaction.type === "multiple-choice") {
    return <MultipleChoiceInteractionView interaction={interaction} answer={answer} validationState={validationState} onAnswerChange={onAnswerChange} />;
  }
  if (interaction.type === "canvas-click") {
    return <CanvasClickInteractionView interaction={interaction} answer={answer} validationState={validationState} onAnswerChange={onAnswerChange} />;
  }
  if (interaction.type === "matching") {
    return <MatchingInteractionView interaction={interaction} answer={answer} validationState={validationState} onAnswerChange={onAnswerChange} />;
  }
  if (interaction.type === "equation-builder") {
    return <EquationBuilderInteractionView interaction={interaction} answer={answer} validationState={validationState} onAnswerChange={onAnswerChange} />;
  }
  return <ExpressionInputInteractionView interaction={interaction} answer={answer} onAnswerChange={onAnswerChange} />;
};
