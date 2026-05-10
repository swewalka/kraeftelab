import type { CheckboxInteraction } from "../../mechanics/practice/types";
import { InteractionOptionLabel } from "./InteractionOptionLabel";

type CheckboxInteractionViewProps = Readonly<{
  interaction: CheckboxInteraction;
  answer: unknown;
  validationState: "correct" | "incorrect" | undefined;
  onAnswerChange: (answer: readonly string[]) => void;
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

export const CheckboxInteractionView = ({ interaction, answer, validationState, onAnswerChange }: CheckboxInteractionViewProps) => {
  const selectedIds = new Set(Array.isArray(answer) ? answer.filter((item): item is string => typeof item === "string") : []);

  return (
    <div className="grid gap-2">
      {interaction.options.map((option) => {
        const isSelected = selectedIds.has(option.id);
        return (
          <label
            key={option.id}
            className={[
              "flex min-h-16 items-center gap-5 rounded border px-6 py-4 text-lg leading-7 transition",
              isSelected ? selectedClassName(validationState) : "border-line/80 bg-white text-ink hover:border-ink",
            ].join(" ")}
          >
            <input
              type="checkbox"
              className="h-5 w-5 accent-signal"
              checked={isSelected}
              onChange={() => {
                const next = new Set(selectedIds);
                if (isSelected) {
                  next.delete(option.id);
                } else {
                  next.add(option.id);
                }
                onAnswerChange([...next]);
              }}
            />
            <span className="min-w-0">
              <InteractionOptionLabel option={option} />
            </span>
          </label>
        );
      })}
    </div>
  );
};
