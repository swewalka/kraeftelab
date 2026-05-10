import { useI18n } from "../../i18n/I18nProvider";
import type { EquationBuilderInteraction } from "../../mechanics/practice/types";
import { MathBlock } from "../math/MathBlock";
import { MathInline } from "../math/MathInline";

type EquationBuilderInteractionViewProps = Readonly<{
  interaction: EquationBuilderInteraction;
  answer: unknown;
  validationState: "correct" | "incorrect" | undefined;
  onAnswerChange: (answer: readonly string[]) => void;
}>;

const equationLabel = (target: EquationBuilderInteraction["equationTarget"], aboutPoint?: string) => {
  if (target === "sumFx") {
    return "\\sum F_x";
  }
  if (target === "sumFy") {
    return "\\sum F_y";
  }
  return aboutPoint ? `\\sum M_${aboutPoint}` : "\\sum M";
};

const selectedClassName = (validationState: "correct" | "incorrect" | undefined) => {
  if (validationState === "incorrect") {
    return "border-load/70 bg-loadMist text-ink";
  }
  if (validationState === "correct") {
    return "border-signal bg-signalSoft text-ink";
  }
  return "border-signal bg-signal/10 text-ink";
};

export const EquationBuilderInteractionView = ({ interaction, answer, validationState, onAnswerChange }: EquationBuilderInteractionViewProps) => {
  const { t } = useI18n();
  const selectedIds = Array.isArray(answer) ? answer.filter((item): item is string => typeof item === "string") : [];
  const selectedSet = new Set(selectedIds);
  const selectedTerms = interaction.availableTerms.filter((term) => selectedSet.has(term.id));
  const previewLatex = `${equationLabel(interaction.equationTarget, interaction.aboutPoint)} = ${
    selectedTerms.length > 0 ? selectedTerms.map((term) => term.latex).join(" ") : "\\square"
  } = 0`;

  return (
    <div className="grid gap-6">
      <div className="rounded border border-line/80 bg-[#f8fafc] p-5">
        <p className="technical-label text-steel">{t("practice.equationPreview")}</p>
        <MathBlock latex={previewLatex} />
        {selectedTerms.length === 0 ? <p className="text-xs text-steel">{t("practice.emptyEquation")}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {interaction.availableTerms.map((term) => {
          const isSelected = selectedSet.has(term.id);
          return (
            <button
              key={term.id}
              type="button"
              className={[
                "ui-focus min-h-12 rounded border px-4 text-base transition",
                isSelected ? selectedClassName(validationState) : "border-line/80 bg-white text-ink hover:border-ink",
              ].join(" ")}
              onClick={() => {
                const next = isSelected ? selectedIds.filter((id) => id !== term.id) : [...selectedIds, term.id];
                onAnswerChange(next);
              }}
            >
              <MathInline latex={term.latex} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
