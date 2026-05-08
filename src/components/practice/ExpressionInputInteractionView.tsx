import type { ExpressionInputInteraction } from "../../mechanics/practice/types";

type ExpressionInputInteractionViewProps = Readonly<{
  interaction: ExpressionInputInteraction;
  answer: unknown;
  onAnswerChange: (answer: string) => void;
}>;

export const ExpressionInputInteractionView = ({ interaction, answer, onAnswerChange }: ExpressionInputInteractionViewProps) => (
  <label className="block rounded-md border border-ink/15 bg-white p-4">
    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">{interaction.variable}</span>
    <input
      className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 font-mono text-lg outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
      value={typeof answer === "string" ? answer : ""}
      placeholder={`${interaction.variable} = ...`}
      onChange={(event) => onAnswerChange(event.target.value)}
    />
  </label>
);
