import type { MatchingInteraction } from "../../mechanics/practice/types";
import { InteractionOptionLabel } from "./InteractionOptionLabel";

type MatchingInteractionViewProps = Readonly<{
  interaction: MatchingInteraction;
  answer: unknown;
  validationState: "correct" | "incorrect" | undefined;
  onAnswerChange: (answer: Record<string, string>) => void;
}>;

const toPairs = (answer: unknown): Record<string, string> =>
  typeof answer === "object" && answer !== null && !Array.isArray(answer)
    ? Object.fromEntries(Object.entries(answer).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
    : {};

const selectedClassName = (validationState: "correct" | "incorrect" | undefined) => {
  if (validationState === "incorrect") {
    return "border-load/70 bg-loadMist text-ink";
  }
  if (validationState === "correct") {
    return "border-signal bg-signalSoft text-ink";
  }
  return "border-signal bg-signal/10 text-ink";
};

export const MatchingInteractionView = ({ interaction, answer, validationState, onAnswerChange }: MatchingInteractionViewProps) => {
  const pairs = toPairs(answer);

  return (
    <div className="grid gap-3">
      {interaction.leftItems.map((leftItem) => (
        <div key={leftItem.id} className="grid gap-3 text-base sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] sm:items-center">
          <div className="rounded border border-line/80 bg-[#f8fafc] px-4 py-3 text-ink">
            <InteractionOptionLabel option={leftItem} />
          </div>
          <div className="flex flex-wrap gap-2">
            {interaction.rightItems.map((rightItem) => {
              const isSelected = pairs[leftItem.id] === rightItem.id;
              return (
                <button
                  key={rightItem.id}
                  type="button"
                  className={[
                    "ui-focus min-h-11 rounded border px-4 text-base transition",
                    isSelected ? selectedClassName(validationState) : "border-line/80 bg-white text-ink hover:border-ink",
                  ].join(" ")}
                  onClick={() => onAnswerChange({ ...pairs, [leftItem.id]: rightItem.id })}
                >
                  <InteractionOptionLabel option={rightItem} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
