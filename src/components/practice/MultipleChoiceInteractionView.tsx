import type { MultipleChoiceInteraction } from "../../mechanics/practice/types";
import { InteractionOptionLabel } from "./InteractionOptionLabel";

type MultipleChoiceInteractionViewProps = Readonly<{
  interaction: MultipleChoiceInteraction;
  answer: unknown;
  validationState: "correct" | "incorrect" | undefined;
  onAnswerChange: (answer: string) => void;
}>;

const selectedClassName = (validationState: "correct" | "incorrect" | undefined) => {
  if (validationState === "incorrect") {
    return "border-load/70 bg-loadMist text-ink";
  }
  if (validationState === "correct") {
    return "border-signal bg-signalSoft text-ink";
  }
  return "border-signal bg-signal/10 text-ink";
};

export const MultipleChoiceInteractionView = ({ interaction, answer, validationState, onAnswerChange }: MultipleChoiceInteractionViewProps) => {
  const selectedId = typeof answer === "string" ? answer : "";

  return (
    <div className="grid gap-2">
      {interaction.options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <label
            key={option.id}
            className={[
              "flex min-h-16 items-center gap-5 rounded border px-6 py-4 text-lg leading-7 transition",
              isSelected ? selectedClassName(validationState) : "border-line/80 bg-white text-ink hover:border-ink",
            ].join(" ")}
          >
            <input
              type="radio"
              className="h-5 w-5 accent-signal"
              checked={isSelected}
              name={`practice-choice-${interaction.correctOptionId}`}
              onChange={() => onAnswerChange(option.id)}
            />
            <div className="min-w-0 flex-1">
              <InteractionOptionLabel option={option} />
            </div>
          </label>
        );
      })}
    </div>
  );
};
