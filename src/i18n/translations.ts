import type { Locale } from "./types";

export type TranslationKey =
  | "app.title"
  | "app.subtitle"
  | "language.label"
  | "language.en"
  | "language.de"
  | "modes.ariaLabel"
  | "modes.explore"
  | "modes.explain"
  | "modes.practice"
  | "canvas.defaultLabel"
  | "canvas.engineLabel"
  | "problem.current"
  | "solution.progress"
  | "solution.goToStep"
  | "solution.stepCounter"
  | "solution.assumptions"
  | "practice.progress"
  | "practice.goToStep"
  | "practice.stepCounter"
  | "practice.check"
  | "practice.correct"
  | "practice.tryAgain"
  | "practice.hints"
  | "practice.showStepSolution"
  | "practice.canvasClickPrompt"
  | "practice.noCanvasSelection"
  | "practice.selectPlaceholder"
  | "practice.equationPreview"
  | "practice.emptyEquation"
  | "actions.back"
  | "actions.restart"
  | "actions.next";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "app.title": "Mechanics Playground",
    "app.subtitle": "Statics MVP",
    "language.label": "Language",
    "language.en": "EN",
    "language.de": "DE",
    "modes.ariaLabel": "Learning modes",
    "modes.explore": "Explore",
    "modes.explain": "Solve",
    "modes.practice": "Practice",
    "canvas.defaultLabel": "Mechanics canvas",
    "canvas.engineLabel": "Konva canvas",
    "problem.current": "Current problem",
    "solution.progress": "Solution progress",
    "solution.goToStep": "Go to {title}",
    "solution.stepCounter": "Step {current} / {total}",
    "solution.assumptions": "Assumptions",
    "practice.progress": "Practice progress",
    "practice.goToStep": "Go to {title}",
    "practice.stepCounter": "Step {current} / {total}",
    "practice.check": "Check",
    "practice.correct": "Correct",
    "practice.tryAgain": "Check this step",
    "practice.hints": "Hints",
    "practice.showStepSolution": "Show solution for this step",
    "practice.canvasClickPrompt": "Select the object directly in the canvas.",
    "practice.noCanvasSelection": "Nothing selected yet.",
    "practice.selectPlaceholder": "Choose...",
    "practice.equationPreview": "Equation",
    "practice.emptyEquation": "choose terms",
    "actions.back": "Back",
    "actions.restart": "Restart",
    "actions.next": "Next",
  },
  de: {
    "app.title": "Mechanics Playground",
    "app.subtitle": "Statik-MVP",
    "language.label": "Sprache",
    "language.en": "EN",
    "language.de": "DE",
    "modes.ariaLabel": "Lernmodi",
    "modes.explore": "Erkunden",
    "modes.explain": "Lösen",
    "modes.practice": "Üben",
    "canvas.defaultLabel": "Mechanik-Zeichenfläche",
    "canvas.engineLabel": "Konva-Zeichenfläche",
    "problem.current": "Aktuelle Aufgabe",
    "solution.progress": "Lösungsfortschritt",
    "solution.goToStep": "Gehe zu {title}",
    "solution.stepCounter": "Schritt {current} / {total}",
    "solution.assumptions": "Annahmen",
    "practice.progress": "Übungsfortschritt",
    "practice.goToStep": "Gehe zu {title}",
    "practice.stepCounter": "Schritt {current} / {total}",
    "practice.check": "Prüfen",
    "practice.correct": "Richtig",
    "practice.tryAgain": "Prüfe diesen Schritt",
    "practice.hints": "Hinweise",
    "practice.showStepSolution": "Lösung für diesen Schritt zeigen",
    "practice.canvasClickPrompt": "Wähle das Objekt direkt in der Zeichenfläche aus.",
    "practice.noCanvasSelection": "Noch nichts ausgewählt.",
    "practice.selectPlaceholder": "Auswählen...",
    "practice.equationPreview": "Gleichung",
    "practice.emptyEquation": "Terme wählen",
    "actions.back": "Zurück",
    "actions.restart": "Neu starten",
    "actions.next": "Weiter",
  },
};
