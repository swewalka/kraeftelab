import diagram from "./diagram.json";
import practice from "./practice.json";
import problem from "./problem.json";
import solution from "./solution.json";
import { parseLoadedProblemContent } from "../../../parsing";

export const simpleSupportedBeamCenterLoad = parseLoadedProblemContent(problem, solution, diagram, practice);
