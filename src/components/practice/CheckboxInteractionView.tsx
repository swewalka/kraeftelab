import type { CheckboxInteraction } from "../../mechanics/practice/types";

type CheckboxInteractionViewProps = Readonly<{
  interaction: CheckboxInteraction;
  answer: unknown;
  onAnswerChange: (answer: readonly string[]) => void;
}>;

export const CheckboxInteractionView = ({ interaction, answer, onAnswerChange }: CheckboxInteractionViewProps) => {
  const selectedIds = new Set(Array.isArray(answer) ? answer.filter((item): item is string => typeof item === "string") : []);

  return (
    <div className="grid gap-2">
      {interaction.options.map((option) => {
        const isSelected = selectedIds.has(option.id);
        return (
          <label
            key={option.id}
            className={[
              "flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm transition",
              isSelected ? "border-signal bg-signal/10 text-ink" : "border-ink/15 bg-white text-steel hover:border-ink/30",
            ].join(" ")}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-signal"
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
            <span className="font-mono">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};
