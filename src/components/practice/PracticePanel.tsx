import { CheckCircle2, Lightbulb, Lock, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { createInitialPracticeSession } from "../../mechanics/practice/session";
import type { PracticeContent, PracticeSessionState, ValidationResult } from "../../mechanics/practice/types";
import { validatePracticeAnswer } from "../../mechanics/practice/validatePracticeAnswer";
import { PracticeInteractionView } from "./PracticeInteractionView";

type PracticePanelProps = Readonly<{
  practice: PracticeContent;
  session: PracticeSessionState;
  onSessionChange: (session: PracticeSessionState) => void;
}>;

const getHintCountForAttempt = (attempts: number): number => Math.max(0, Math.min(3, attempts - 1));

export const PracticePanel = ({ practice, session, onSessionChange }: PracticePanelProps) => {
  const { t } = useI18n();
  const [validationByStep, setValidationByStep] = useState<Record<string, ValidationResult>>({});
  const activeStep = practice.steps.find((step) => step.id === session.currentStepId) ?? practice.steps[0];
  const activeStepIndex = activeStep === undefined ? -1 : practice.steps.findIndex((step) => step.id === activeStep.id);
  const latestValidation = activeStep === undefined ? undefined : validationByStep[activeStep.id];
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
    const nextStep = practice.steps[activeStepIndex + 1];
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
      currentStepId: validation.isCorrect && nextStep ? nextStep.id : activeStep.id,
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
      feedbackMessages: [activeStep.feedback.correct],
    };
    const nextStep = practice.steps[activeStepIndex + 1];
    setValidationByStep({ ...validationByStep, [activeStep.id]: validation });
    onSessionChange({
      ...session,
      currentStepId: nextStep?.id ?? activeStep.id,
      stepStatuses: {
        ...session.stepStatuses,
        [activeStep.id]: "completed",
        ...(nextStep === undefined ? {} : { [nextStep.id]: "active" }),
      },
    });
  };

  const attempts = session.attempts[activeStep.id] ?? 0;

  return (
    <section className="flex h-full flex-col bg-paper">
      <div className="border-b border-ink/15 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">{practice.title}</p>
        <h2 className="mt-1 text-xl font-semibold">{practice.body}</h2>
        <div
          className="mt-4 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${practice.steps.length}, minmax(0, 1fr))` }}
          aria-label={t("practice.progress")}
        >
          {practice.steps.map((step, index) => {
            const status = session.stepStatuses[step.id];
            return (
              <button
                key={step.id}
                type="button"
                aria-label={t("practice.goToStep", { title: step.title })}
                disabled={status === "locked"}
                className={[
                  "h-2 rounded-full transition disabled:cursor-not-allowed",
                  status === "completed" ? "bg-signal" : "",
                  status === "active" ? "bg-ink" : "",
                  status === "locked" ? "bg-ink/15" : "hover:bg-ink/35",
                  index === activeStepIndex ? "ring-2 ring-signal/30 ring-offset-1" : "",
                ].join(" ")}
                onClick={() => goToStep(step.id)}
              />
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <article>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-steel">
                {t("practice.stepCounter", { current: activeStepIndex + 1, total: practice.steps.length })}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{activeStep.title}</h3>
            </div>
            {session.stepStatuses[activeStep.id] === "completed" ? (
              <CheckCircle2 className="mt-1 h-5 w-5 text-signal" aria-hidden="true" />
            ) : null}
          </div>
          <p className="mt-4 text-base leading-7 text-steel">{activeStep.goal}</p>
          {activeStep.instructions ? <p className="mt-2 text-sm leading-6 text-steel">{activeStep.instructions}</p> : null}

          <div className="mt-6">
            <PracticeInteractionView
              interaction={activeStep.interaction}
              answer={session.answers[activeStep.id]}
              onAnswerChange={updateAnswer}
            />
          </div>
        </article>

        {latestValidation ? (
          <section
            className={[
              "mt-5 rounded-md border p-4 text-sm leading-6 shadow-sm",
              latestValidation.isCorrect ? "border-signal/40 bg-signal/10 text-ink" : "border-load/30 bg-load/5 text-steel",
            ].join(" ")}
          >
            <h4 className="font-semibold">{latestValidation.isCorrect ? t("practice.correct") : t("practice.tryAgain")}</h4>
            <ul className="mt-2 space-y-1">
              {latestValidation.feedbackMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {visibleHints.length > 0 ? (
          <section className="mt-5 rounded-md border border-ink/15 bg-white p-4 shadow-sm">
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-steel">
              <Lightbulb className="h-4 w-4 text-signal" aria-hidden="true" />
              {t("practice.hints")}
            </h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-steel">
              {visibleHints.map((hint) => (
                <li key={hint.level}>{hint.text}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {attempts >= 4 && session.stepStatuses[activeStep.id] !== "completed" ? (
          <button
            type="button"
            className="mt-5 flex h-10 items-center gap-2 rounded border border-ink/15 bg-white px-3 text-sm font-medium text-steel transition hover:bg-ink/5"
            onClick={showSolutionForStep}
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t("practice.showStepSolution")}
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink/15 bg-white px-5 py-4">
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded border border-ink/15 px-3 text-sm font-medium text-steel transition hover:bg-ink/5"
          onClick={restart}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("actions.restart")}
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded bg-ink px-4 text-sm font-medium text-white transition hover:bg-steel"
          onClick={checkAnswer}
        >
          {t("practice.check")}
        </button>
      </div>
    </section>
  );
};
