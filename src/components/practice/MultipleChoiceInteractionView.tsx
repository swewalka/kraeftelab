import type { MultipleChoiceInteraction } from "../../mechanics/practice/types";

type MultipleChoiceInteractionViewProps = Readonly<{
  interaction: MultipleChoiceInteraction;
  answer: unknown;
  onAnswerChange: (answer: string) => void;
}>;

export const MultipleChoiceInteractionView = ({ interaction, answer, onAnswerChange }: MultipleChoiceInteractionViewProps) => {
  const selectedId = typeof answer === "string" ? answer : "";

  return (
    <div className="grid gap-2">
      {interaction.options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <label
            key={option.id}
            className={[
              "flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm transition",
              isSelected ? "border-signal bg-signal/10 text-ink" : "border-ink/15 bg-white text-steel hover:border-ink/30",
            ].join(" ")}
          >
            <input
              type="radio"
              className="h-4 w-4 accent-signal"
              checked={isSelected}
              name={`practice-choice-${interaction.correctOptionId}`}
              onChange={() => onAnswerChange(option.id)}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};
