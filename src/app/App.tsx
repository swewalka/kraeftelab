import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ModeTabs, type AppMode } from "../components/layout/ModeTabs";
import { MechanicsCanvas } from "../components/diagram/MechanicsCanvas";
import { ProblemCatalogLanding } from "../components/landing/ProblemCatalogLanding";
import { ProblemOverview } from "../components/problem/ProblemOverview";
import { SolutionPanel } from "../components/equations/SolutionPanel";
import { PracticePanel } from "../components/practice/PracticePanel";
import { getDefaultProblem, getProblemById, problemCatalog } from "../content/problems/catalog";
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
  const { locale, t } = useI18n();
  const [activeMode, setActiveMode] = useState<AppMode>("explain");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeProblemId, setActiveProblemId] = useState(() => getDefaultProblem(locale).problem.id);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const problemContent = getProblemById(activeProblemId, locale);
  const { diagram, explore, practice, problem, solution } = problemContent;
  const [practiceSession, setPracticeSession] = useState(() => createInitialPracticeSession(practice.steps));
  const solverResult = useMemo(() => solveProblem(problem), [problem]);
  const solutionSteps = useMemo(() => buildSolutionSteps(solution, solverResult), [solution, solverResult]);
  const stageLabel = activeMode === "explain" ? diagram.stageLabels.solution : diagram.stageLabels.default;
  const activePracticeStep = getActivePracticeStep(practice, practiceSession);
  const solutionCanvasState = activeMode === "explain" ? solutionSteps[activeStepIndex]?.canvasState : undefined;
  const practiceCanvasState = activeMode === "practice" ? buildPracticeCanvasState(practice, practiceSession) : undefined;
  const activeCanvasState = activeMode === "practice" ? practiceCanvasState : solutionCanvasState;
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

  useEffect(() => {
    setActiveStepIndex(0);
    setPracticeSession(createInitialPracticeSession(practice.steps));
  }, [practice.steps, problem.id]);

  const handleModeChange = (mode: AppMode) => {
    setActiveMode(mode);
    if (mode === "explain") {
      setActiveStepIndex(0);
    }
  };

  const handleProblemSelect = (problemId: string) => {
    setActiveProblemId(problemId);
    setIsCatalogOpen(false);
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

  const topicEyebrow = `${t("topic.statics")}: ${solution.title}`;

  if (isCatalogOpen) {
    return <ProblemCatalogLanding problems={problemCatalog[locale]} onProblemSelect={handleProblemSelect} />;
  }

  return (
    <AppShell
      problemTitle={problem.title}
      modeNavigation={<ModeTabs activeMode={activeMode} onModeChange={handleModeChange} />}
      onCatalogOpen={() => setIsCatalogOpen(true)}
    >
      <div className="grid h-full grid-cols-[minmax(680px,1fr)_560px]">
        <MechanicsCanvas
          problem={problem}
          solverResult={solverResult}
          diagram={diagram}
          mode={activeMode}
          stageLabel={stageLabel}
          canvasState={activeCanvasState}
          selectableObjectIds={selectableObjectIds}
          selectedObjectIds={selectedObjectIds}
          onObjectSelect={handleCanvasObjectSelect}
        />

        <aside className="flex min-h-0 flex-col border-l border-line/75 bg-surface">
          {activeMode === "explore" ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-14 pb-10 pt-12">
              <ProblemOverview problem={problem} eyebrow={topicEyebrow} />
              {explore.notices.length > 0 ? (
                <section className="mt-8 rounded-lg border border-line/80 bg-white p-6">
                  {explore.noticeTitle ? <h3 className="font-display text-lg font-semibold">{explore.noticeTitle}</h3> : null}
                  <ul className="mt-4 space-y-3 text-base leading-7 text-steel">
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
              eyebrow={topicEyebrow}
              solution={solution}
              steps={solutionSteps}
              activeStepIndex={activeStepIndex}
              onStepChange={setActiveStepIndex}
            />
          ) : null}

          {activeMode === "practice" ? (
            <PracticePanel eyebrow={topicEyebrow} practice={practice} session={practiceSession} onSessionChange={setPracticeSession} />
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
};
