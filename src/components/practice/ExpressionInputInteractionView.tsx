import type { ExpressionInputInteraction } from "../../mechanics/practice/types";
import { MathInline } from "../math/MathInline";

type ExpressionInputInteractionViewProps = Readonly<{
  interaction: ExpressionInputInteraction;
  answer: unknown;
  onAnswerChange: (answer: string) => void;
}>;

export const ExpressionInputInteractionView = ({ interaction, answer, onAnswerChange }: ExpressionInputInteractionViewProps) => (
  <label className="block rounded border border-line/80 bg-[#f8fafc] p-5">
    <span className="technical-label text-steel">
      <MathInline latex={interaction.variable} />
    </span>
    <input
      className="ui-focus mt-3 h-14 w-full rounded border border-line/80 bg-white px-4 font-mono text-lg transition focus-visible:border-signal"
      value={typeof answer === "string" ? answer : ""}
      placeholder={`${interaction.variable} = ...`}
      onChange={(event) => onAnswerChange(event.target.value)}
    />
  </label>
);
