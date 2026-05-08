import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ModeTabs, type AppMode } from "../components/layout/ModeTabs";
import { MechanicsCanvas } from "../components/diagram/MechanicsCanvas";
import { ProblemOverview } from "../components/problem/ProblemOverview";
import { SolutionPanel } from "../components/equations/SolutionPanel";
import { PracticePanel } from "../components/practice/PracticePanel";
import { getDefaultProblem } from "../content/problems/catalog";
import { useI18n } from "../i18n/I18nProvider";
import { buildSolutionSteps } from "../mechanics/explanation/buildSolutionSteps";
import {
  buildPracticeCanvasState,
  createInitialPracticeSession,
  getActivePracticeStep,
  getCurrentCanvasSelectableIds,
} from "../mechanics/practice/session";
import { solveProblem } from "../mechanics/solvers/solverRegistry";

export const App = () => {
  const { locale } = useI18n();
  const [activeMode, setActiveMode] = useState<AppMode>("explain");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const problemContent = getDefaultProblem(locale);
  const { diagram, explore, practice, problem, solution } = problemContent;
  const [practiceSession, setPracticeSession] = useState(() => createInitialPracticeSession(practice.steps));
  const solverResult = useMemo(() => solveProblem(problem), [problem]);
  const solutionSteps = useMemo(() => buildSolutionSteps(solution, solverResult), [solution, solverResult]);
  const stageLabel = activeMode === "explain" ? diagram.stageLabels.solution : diagram.stageLabels.default;
  const canvasMode: AppMode = activeMode === "explain" && activeStepIndex === 0 ? "explore" : activeMode;
  const activePracticeStep = getActivePracticeStep(practice, practiceSession);
  const practiceCanvasState = activeMode === "practice" ? buildPracticeCanvasState(practice, practiceSession) : undefined;
  const selectableObjectIds = activeMode === "practice" ? getCurrentCanvasSelectableIds(activePracticeStep) : [];
  const canvasAnswer = activePracticeStep?.interaction.type === "canvas-click" ? practiceSession.answers[activePracticeStep.id] : undefined;
  const selectedObjectIds =
    Array.isArray(canvasAnswer)
      ? canvasAnswer.filter((item): item is string => typeof item === "string")
      : [];

  useEffect(() => {
    if (!practice.steps.some((step) => step.id === practiceSession.currentStepId)) {
      setPracticeSession(createInitialPracticeSession(practice.steps));
    }
  }, [practice.steps, practiceSession.currentStepId]);

  const handleModeChange = (mode: AppMode) => {
    setActiveMode(mode);
    if (mode === "explain") {
      setActiveStepIndex(0);
    }
  };

  const handleCanvasObjectSelect = (objectId: string) => {
    if (activeMode !== "practice" || activePracticeStep?.interaction.type !== "canvas-click") {
      return;
    }
    if (!activePracticeStep.interaction.selectableIds.includes(objectId)) {
      return;
    }

    const selectedIds = new Set(selectedObjectIds);
    if (selectedIds.has(objectId)) {
      selectedIds.delete(objectId);
    } else if (activePracticeStep.interaction.correctSelectableIds.length === 1) {
      selectedIds.clear();
      selectedIds.add(objectId);
    } else {
      selectedIds.add(objectId);
    }

    setPracticeSession({
      ...practiceSession,
      answers: {
        ...practiceSession.answers,
        [activePracticeStep.id]: [...selectedIds],
      },
    });
  };

  return (
    <AppShell>
      <div className="grid h-full grid-cols-[minmax(720px,1fr)_520px]">
        <MechanicsCanvas
          problem={problem}
          solverResult={solverResult}
          diagram={diagram}
          mode={canvasMode}
          stageLabel={stageLabel}
          canvasState={practiceCanvasState}
          selectableObjectIds={selectableObjectIds}
          selectedObjectIds={selectedObjectIds}
          onObjectSelect={handleCanvasObjectSelect}
        />

        <aside className="flex min-h-0 flex-col border-l border-ink/10 bg-paper">
          <div className="border-b border-ink/15 bg-white px-5 py-4">
            <ModeTabs activeMode={activeMode} onModeChange={handleModeChange} />
          </div>

          {activeMode === "explore" ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <ProblemOverview problem={problem} />
              {explore.notices.length > 0 ? (
                <section className="mt-5 rounded-md border border-ink/15 bg-white p-4 shadow-sm">
                  {explore.noticeTitle ? <h3 className="font-semibold">{explore.noticeTitle}</h3> : null}
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-steel">
                    {explore.notices.map((notice) => (
                      <li key={notice}>{notice}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}

          {activeMode === "explain" ? (
            <SolutionPanel
              solution={solution}
              steps={solutionSteps}
              solverResult={solverResult}
              activeStepIndex={activeStepIndex}
              onStepChange={setActiveStepIndex}
            />
          ) : null}

          {activeMode === "practice" ? (
            <PracticePanel practice={practice} session={practiceSession} onSessionChange={setPracticeSession} />
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
};
