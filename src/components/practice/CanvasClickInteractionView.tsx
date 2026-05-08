import { MousePointer2, X } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import type { CanvasClickInteraction } from "../../mechanics/practice/types";

type CanvasClickInteractionViewProps = Readonly<{
  interaction: CanvasClickInteraction;
  answer: unknown;
  onAnswerChange: (answer: readonly string[]) => void;
}>;

export const CanvasClickInteractionView = ({ interaction, answer, onAnswerChange }: CanvasClickInteractionViewProps) => {
  const { t } = useI18n();
  const selectedIds = Array.isArray(answer) ? answer.filter((item): item is string => typeof item === "string") : [];
  const labels = new Map(interaction.labels?.map((label) => [label.id, label.label]) ?? []);

  return (
    <div className="rounded-md border border-ink/15 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <MousePointer2 className="h-4 w-4 text-signal" aria-hidden="true" />
        {t("practice.canvasClickPrompt")}
      </div>
      <div className="mt-3 flex min-h-9 flex-wrap gap-2">
        {selectedIds.length > 0 ? (
          selectedIds.map((selectedId) => (
            <button
              key={selectedId}
              type="button"
              className="inline-flex h-8 items-center gap-2 rounded border border-signal/30 bg-signal/10 px-2 font-mono text-sm text-ink"
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
