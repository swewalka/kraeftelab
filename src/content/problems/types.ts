import type { ProblemDefinition } from "../../mechanics/model/problemDefinition";
import type { SolutionContent } from "../../mechanics/explanation/types";

export type ExploreContent = Readonly<{
  noticeTitle?: string;
  notices: readonly string[];
}>;

export type DiagramStageLabels = Readonly<{
  default: string;
  solution: string;
}>;

export type DiagramContent = Readonly<{
  diagramKey: string;
  stageLabels: DiagramStageLabels;
  config: unknown;
}>;

export type PracticeContent = Readonly<{
  title: string;
  body: string;
  prompts: readonly string[];
}>;

export type LoadedProblemContent = Readonly<{
  problem: ProblemDefinition;
  explore: ExploreContent;
  solution: SolutionContent;
  diagram: DiagramContent;
  practice: PracticeContent;
}>;
