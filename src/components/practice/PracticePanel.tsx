import { ArrowRight, CheckCircle2, Lightbulb, Lock, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { createInitialPracticeSession } from "../../mechanics/practice/session";
import type { PracticeContent, PracticeSessionState, ValidationResult } from "../../mechanics/practice/types";
import { validatePracticeAnswer } from "../../mechanics/practice/validatePracticeAnswer";
import { PracticeInteractionView } from "./PracticeInteractionView";
import { ContentBlockRenderer } from "../content/ContentBlockRenderer";
import { StepProgress } from "../layout/StepProgress";

type PracticePanelProps = Readonly<{
  eyebrow: string;
  practice: PracticeContent;
  session: PracticeSessionState;
  onSessionChange: (session: PracticeSessionState) => void;
}>;

const getHintCountForAttempt = (attempts: number): number => Math.max(0, Math.min(3, attempts - 1));

export const PracticePanel = ({ eyebrow, practice, session, onSessionChange }: PracticePanelProps) => {
  const { t } = useI18n();
  const [validationByStep, setValidationByStep] = useState<Record<string, ValidationResult>>({});
  const activeStep = practice.steps.find((step) => step.id === session.currentStepId) ?? practice.steps[0];
  const activeStepIndex = activeStep === undefined ? -1 : practice.steps.findIndex((step) => step.id === activeStep.id);
  const latestValidation = activeStep === undefined ? undefined : validationByStep[activeStep.id];
  const nextStep = activeStep === undefined ? undefined : practice.steps[activeStepIndex + 1];
  const revealedHintCount = activeStep === undefined ? 0 : session.revealedHints[activeStep.id] ?? 0;
  const visibleHints = useMemo(
    () => (activeStep?.hints ?? []).filter((hint) => hint.level <= revealedHintCount),
    [activeStep, revealedHintCount],
  );

  if (!activeStep) {
    return null;
  }

  const updateAnswer = (answer: unknown) => {
    onSessionChange({
      ...session,
      answers: {
        ...session.answers,
        [activeStep.id]: answer,
      },
    });
  };

  const goToStep = (stepId: string) => {
    if (session.stepStatuses[stepId] === "locked") {
      return;
    }
    onSessionChange({ ...session, currentStepId: stepId });
  };

  const checkAnswer = () => {
    const validation = validatePracticeAnswer(activeStep, session.answers[activeStep.id]);
    const nextAttempts = validation.isCorrect ? session.attempts[activeStep.id] ?? 0 : (session.attempts[activeStep.id] ?? 0) + 1;
    const nextStepStatuses = validation.isCorrect
      ? {
          ...session.stepStatuses,
          [activeStep.id]: "completed" as const,
          ...(nextStep === undefined ? {} : { [nextStep.id]: "active" as const }),
        }
      : session.stepStatuses;

    setValidationByStep({ ...validationByStep, [activeStep.id]: validation });
    onSessionChange({
      ...session,
      currentStepId: activeStep.id,
      stepStatuses: nextStepStatuses,
      attempts: {
        ...session.attempts,
        [activeStep.id]: nextAttempts,
      },
      revealedHints: validation.isCorrect
        ? session.revealedHints
        : {
            ...session.revealedHints,
            [activeStep.id]: getHintCountForAttempt(nextAttempts),
          },
    });
  };

  const restart = () => {
    setValidationByStep({});
    onSessionChange(createInitialPracticeSession(practice.steps));
  };

  const showSolutionForStep = () => {
    const validation: ValidationResult = {
      isCorrect: true,
      feedbackMessages: activeStep.feedback.correct,
    };
    setValidationByStep({ ...validationByStep, [activeStep.id]: validation });
    onSessionChange({
      ...session,
      currentStepId: activeStep.id,
      stepStatuses: {
        ...session.stepStatuses,
        [activeStep.id]: "completed",
        ...(nextStep === undefined ? {} : { [nextStep.id]: "active" }),
      },
    });
  };

  const goToNextStep = () => {
    if (nextStep) {
      goToStep(nextStep.id);
    }
  };

  const attempts = session.attempts[activeStep.id] ?? 0;
  const isActiveStepCompleted = session.stepStatuses[activeStep.id] === "completed";

  return (
    <section className="flex min-h-0 flex-1 flex-col px-14 pb-10 pt-12">
      <div>
        <p className="technical-label text-signal">{eyebrow}</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-4xl font-semibold leading-[1.18] tracking-normal text-black">{activeStep.title}</h2>
          {isActiveStepCompleted ? (
            <CheckCircle2 className="practice-success-pop mt-2 h-7 w-7 shrink-0 text-signal" aria-hidden="true" />
          ) : null}
        </div>
        <StepProgress current={activeStepIndex + 1} total={practice.steps.length} ariaLabel={t("practice.progress")} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-12">
        <article className="rounded-lg border border-line/80 bg-white p-8">
          <ContentBlockRenderer
            blocks={activeStep.goal}
            className="space-y-4"
            paragraphClassName="text-lg leading-8 text-ink"
          />
          {activeStep.instructions ? (
            <ContentBlockRenderer
              blocks={activeStep.instructions}
              className="mt-4 space-y-3"
              paragraphClassName="text-base leading-7 text-steel"
            />
          ) : null}

          <div className="mt-8">
            <PracticeInteractionView
              interaction={activeStep.interaction}
              answer={session.answers[activeStep.id]}
              validationState={latestValidation ? (latestValidation.isCorrect ? "correct" : "incorrect") : undefined}
              onAnswerChange={updateAnswer}
            />
          </div>

          {latestValidation ? (
            <section
              className={[
                "-mx-8 -mb-8 mt-8 border-t px-8 py-5 text-sm leading-6",
                latestValidation.isCorrect ? "border-signal/25 bg-signalMist text-signal" : "border-load/25 bg-loadMist text-load",
              ].join(" ")}
            >
              <h4 className="flex items-center gap-2 font-display font-semibold text-ink">
                {latestValidation.isCorrect ? (
                  <CheckCircle2 className="practice-success-pop h-5 w-5 text-signal" aria-hidden="true" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-load" aria-hidden="true" />
                )}
                {latestValidation.isCorrect ? t("practice.correct") : t("practice.tryAgain")}
              </h4>
              <ContentBlockRenderer blocks={latestValidation.feedbackMessages} className="mt-3 space-y-3" paragraphClassName="text-sm leading-6" />
            </section>
          ) : null}
        </article>

        {visibleHints.length > 0 ? (
          <section className="mt-8 rounded-lg border border-line/80 bg-white p-6">
            <h4 className="technical-label flex items-center gap-2 text-steel">
              <Lightbulb className="h-4 w-4 text-signal" aria-hidden="true" />
              {t("practice.hints")}
            </h4>
            <div className="mt-4 space-y-4 text-sm leading-6 text-steel">
              {visibleHints.map((hint) => (
                <ContentBlockRenderer key={hint.level} blocks={hint.content} />
              ))}
            </div>
          </section>
        ) : null}

        {attempts >= 4 && session.stepStatuses[activeStep.id] !== "completed" ? (
          <button
            type="button"
            className="ui-focus mt-8 flex h-12 items-center gap-2 rounded border border-black bg-white px-4 font-display text-sm font-semibold text-black transition hover:bg-muted"
            onClick={showSolutionForStep}
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t("practice.showStepSolution")}
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 pt-8">
        {isActiveStepCompleted && nextStep ? (
          <button
            type="button"
            className="ui-focus flex h-16 items-center justify-center gap-3 rounded bg-black px-5 font-display text-lg font-semibold text-white transition hover:bg-ink"
            onClick={goToNextStep}
          >
            {t("actions.next")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="ui-focus flex h-16 items-center justify-center gap-3 rounded bg-black px-5 font-display text-lg font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isActiveStepCompleted && nextStep === undefined}
            onClick={checkAnswer}
          >
            {t("practice.check")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="ui-focus flex h-14 items-center justify-center gap-2 rounded border border-black bg-transparent px-4 font-display text-lg font-medium text-black transition hover:bg-white"
          onClick={restart}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("actions.restart")}
        </button>
      </div>
    </section>
  );
};
