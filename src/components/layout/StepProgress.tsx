import { useI18n } from "../../i18n/I18nProvider";

type StepProgressProps = Readonly<{
  current: number;
  total: number;
  ariaLabel: string;
}>;

export const StepProgress = ({ current, total, ariaLabel }: StepProgressProps) => {
  const { t } = useI18n();
  const boundedTotal = Math.max(1, total);
  const boundedCurrent = Math.min(Math.max(1, current), boundedTotal);
  const percent = Math.round((boundedCurrent / boundedTotal) * 100);

  return (
    <div className="mt-12" aria-label={ariaLabel}>
      <div className="flex items-center justify-between gap-4 text-base leading-none">
        <span className="font-display font-semibold text-ink">
          {t("progress.step", { current: boundedCurrent, total: boundedTotal })}
        </span>
        <span className="text-steel/65">{t("progress.complete", { percent })}</span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-line/45">
        <div className="h-full bg-signal transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
