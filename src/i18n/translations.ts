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
    "actions.back": "Zurück",
    "actions.restart": "Neu starten",
    "actions.next": "Weiter",
  },
};
