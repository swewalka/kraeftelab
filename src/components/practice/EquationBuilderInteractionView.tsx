import { useI18n } from "../../i18n/I18nProvider";
import type { EquationBuilderInteraction } from "../../mechanics/practice/types";

type EquationBuilderInteractionViewProps = Readonly<{
  interaction: EquationBuilderInteraction;
  answer: unknown;
  onAnswerChange: (answer: readonly string[]) => void;
}>;

const equationLabel = (target: EquationBuilderInteraction["equationTarget"], aboutPoint?: string) => {
  if (target === "sumFx") {
    return "ΣF_x";
  }
  if (target === "sumFy") {
    return "ΣF_y";
  }
  return aboutPoint ? `ΣM_${aboutPoint}` : "ΣM";
};

export const EquationBuilderInteractionView = ({ interaction, answer, onAnswerChange }: EquationBuilderInteractionViewProps) => {
  const { t } = useI18n();
  const selectedIds = Array.isArray(answer) ? answer.filter((item): item is string => typeof item === "string") : [];
  const selectedSet = new Set(selectedIds);
  const selectedTerms = interaction.availableTerms.filter((term) => selectedSet.has(term.id));

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-ink/15 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{t("practice.equationPreview")}</p>
        <p className="mt-2 min-h-8 font-mono text-lg text-ink">
          {equationLabel(interaction.equationTarget, interaction.aboutPoint)}:{" "}
          {selectedTerms.length > 0 ? selectedTerms.map((term) => term.label).join(" ") : t("practice.emptyEquation")} = 0
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {interaction.availableTerms.map((term) => {
          const isSelected = selectedSet.has(term.id);
          return (
            <button
              key={term.id}
              type="button"
              className={[
                "min-h-10 rounded-md border px-3 font-mono text-sm transition",
                isSelected ? "border-signal bg-signal/10 text-ink" : "border-ink/15 bg-white text-steel hover:border-ink/30",
              ].join(" ")}
              onClick={() => {
                const next = isSelected ? selectedIds.filter((id) => id !== term.id) : [...selectedIds, term.id];
                onAnswerChange(next);
              }}
            >
              {term.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
