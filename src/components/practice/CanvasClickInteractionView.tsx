import { MousePointer2, X } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import type { CanvasClickInteraction } from "../../mechanics/practice/types";

type CanvasClickInteractionViewProps = Readonly<{
  interaction: CanvasClickInteraction;
  answer: unknown;
  validationState: "correct" | "incorrect" | undefined;
  onAnswerChange: (answer: readonly string[]) => void;
}>;

export const CanvasClickInteractionView = ({ interaction, answer, validationState, onAnswerChange }: CanvasClickInteractionViewProps) => {
  const { t } = useI18n();
  const selectedIds = Array.isArray(answer) ? answer.filter((item): item is string => typeof item === "string") : [];
  const labels = new Map(interaction.labels?.map((label) => [label.id, label.label]) ?? []);

  return (
    <div
      className={[
        "rounded border border-dashed p-6",
        validationState === "incorrect" ? "border-load/45 bg-loadMist" : "border-line bg-[#f8fafc]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
        <MousePointer2 className="h-4 w-4 text-signal" aria-hidden="true" />
        {t("practice.canvasClickPrompt")}
      </div>
      <div className="mt-5 flex min-h-10 flex-wrap gap-2">
        {selectedIds.length > 0 ? (
          selectedIds.map((selectedId) => (
            <button
              key={selectedId}
              type="button"
              className={[
                "ui-focus inline-flex h-10 items-center gap-2 rounded border px-3 font-mono text-sm text-ink",
                validationState === "incorrect" ? "border-load/45 bg-white" : "border-signal/40 bg-signalMist",
              ].join(" ")}
              onClick={() => onAnswerChange(selectedIds.filter((id) => id !== selectedId))}
            >
              {labels.get(selectedId) ?? selectedId}
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))
        ) : (
          <p className="text-sm text-steel">{t("practice.noCanvasSelection")}</p>
        )}
      </div>
    </div>
  );
};
