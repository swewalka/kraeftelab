import diagramDe from "./diagram.de.json";
import diagramEn from "./diagram.en.json";
import practiceDe from "./practice.de.json";
import practiceEn from "./practice.en.json";
import problemDe from "./problem.de.json";
import problemEn from "./problem.en.json";
import solutionDe from "./solution.de.json";
import solutionEn from "./solution.en.json";
import { parseLoadedProblemContent } from "../../../parsing";

export const simpleSupportedBeamAngledLoad = {
  en: parseLoadedProblemContent(problemEn, solutionEn, diagramEn, practiceEn),
  de: parseLoadedProblemContent(problemDe, solutionDe, diagramDe, practiceDe),
} as const;
