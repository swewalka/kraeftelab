import { BlockMath } from "react-katex";

type MathBlockProps = Readonly<{
  latex: string;
  tone?: "default" | "success" | "dark";
}>;

export const MathBlock = ({ latex, tone = "default" }: MathBlockProps) => (
  <div
    className={[
      "my-3 overflow-x-auto rounded-lg px-5 py-4 text-center font-mono text-lg font-medium leading-relaxed ring-1",
      tone === "success" ? "bg-signalMist text-signal ring-signal/25" : "",
      tone === "dark" ? "bg-white/10 text-white ring-white/15" : "",
      tone === "default" ? "bg-[#f8fafc] text-ink ring-line/45" : "",
    ].join(" ")}
  >
    <BlockMath math={latex} />
  </div>
);
