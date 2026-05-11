import type { Locale } from "./types";

export type TranslationKey =
  | "app.title"
  | "app.subtitle"
  | "app.account"
  | "language.label"
  | "language.en"
  | "language.de"
  | "modes.ariaLabel"
  | "modes.explore"
  | "modes.explain"
  | "modes.practice"
  | "canvas.defaultLabel"
  | "canvas.engineLabel"
  | "canvas.controls"
  | "canvas.zoomIn"
  | "canvas.zoomOut"
  | "canvas.resetView"
  | "topic.statics"
  | "problem.current"
  | "problem.select"
  | "progress.step"
  | "progress.complete"
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
  | "practice.debugNext"
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
    "app.title": "KraefteLab",
    "app.subtitle": "Statics MVP",
    "app.account": "Account",
    "language.label": "Language",
    "language.en": "EN",
    "language.de": "DE",
    "modes.ariaLabel": "Learning modes",
    "modes.explore": "Explore",
    "modes.explain": "Solve",
    "modes.practice": "Practice",
    "canvas.defaultLabel": "Mechanics canvas",
    "canvas.engineLabel": "Konva canvas",
    "canvas.controls": "Canvas controls",
    "canvas.zoomIn": "Zoom in",
    "canvas.zoomOut": "Zoom out",
    "canvas.resetView": "Reset view",
    "topic.statics": "Statics",
    "problem.current": "Current problem",
    "problem.select": "Problem",
    "progress.step": "Step {current} of {total}",
    "progress.complete": "{percent}% Complete",
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
    "practice.debugNext": "Debug: next",
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
    "app.title": "KraefteLab",
    "app.subtitle": "Statik-MVP",
    "app.account": "Konto",
    "language.label": "Sprache",
    "language.en": "EN",
    "language.de": "DE",
    "modes.ariaLabel": "Lernmodi",
    "modes.explore": "Explore",
    "modes.explain": "Solve",
    "modes.practice": "Practice",
    "canvas.defaultLabel": "Mechanik-Zeichenfläche",
    "canvas.engineLabel": "Konva-Zeichenfläche",
    "canvas.controls": "Zeichenflächen-Steuerung",
    "canvas.zoomIn": "Vergrößern",
    "canvas.zoomOut": "Verkleinern",
    "canvas.resetView": "Ansicht zurücksetzen",
    "topic.statics": "Statik",
    "problem.current": "Aktuelle Aufgabe",
    "problem.select": "Aufgabe",
    "progress.step": "Schritt {current} von {total}",
    "progress.complete": "{percent}% abgeschlossen",
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
    "practice.debugNext": "Debug: Weiter",
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
