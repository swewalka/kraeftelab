import { useI18n } from "../../i18n/I18nProvider";
import type { MatchingInteraction } from "../../mechanics/practice/types";

type MatchingInteractionViewProps = Readonly<{
  interaction: MatchingInteraction;
  answer: unknown;
  onAnswerChange: (answer: Record<string, string>) => void;
}>;

const toPairs = (answer: unknown): Record<string, string> =>
  typeof answer === "object" && answer !== null && !Array.isArray(answer)
    ? Object.fromEntries(Object.entries(answer).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
    : {};

export const MatchingInteractionView = ({ interaction, answer, onAnswerChange }: MatchingInteractionViewProps) => {
  const { t } = useI18n();
  const pairs = toPairs(answer);

  return (
    <div className="grid gap-3">
      {interaction.leftItems.map((leftItem) => (
        <label key={leftItem.id} className="grid grid-cols-[minmax(0,1fr)_180px] items-center gap-3 text-sm">
          <span className="rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink">{leftItem.label}</span>
          <select
            className="h-10 rounded-md border border-ink/15 bg-white px-3 text-sm text-ink"
            value={pairs[leftItem.id] ?? ""}
            onChange={(event) => onAnswerChange({ ...pairs, [leftItem.id]: event.target.value })}
          >
            <option value="">{t("practice.selectPlaceholder")}</option>
            {interaction.rightItems.map((rightItem) => (
              <option key={rightItem.id} value={rightItem.id}>
                {rightItem.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
};
