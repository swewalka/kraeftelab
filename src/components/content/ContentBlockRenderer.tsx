import type { ContentBlock } from "../../mechanics/content/types";
import { MathBlock } from "../math/MathBlock";
import { MathInline } from "../math/MathInline";

type ContentBlockRendererProps = Readonly<{
  blocks: readonly ContentBlock[];
  className?: string;
  paragraphClassName?: string;
  listClassName?: string;
}>;

const bareMathPattern = /(ΣF_x|ΣF_y|ΣM_A|A_x|A_y|B_x|B_y|M_A|M_B|\bF\b|\bL\b)/g;

const toLatex = (text: string) =>
  text.replace("ΣF_x", "\\sum F_x").replace("ΣF_y", "\\sum F_y").replace("ΣM_A", "\\sum M_A");

const renderBareMath = (text: string, keyPrefix: string) =>
  text.split(bareMathPattern).map((segment, index) => {
    if (segment.match(bareMathPattern)) {
      return <MathInline key={`${keyPrefix}-${segment}-${index}`} latex={toLatex(segment)} />;
    }
    return segment;
  });

const renderInlineMath = (text: string) =>
  text.split(/(\$[^$]+\$)/g).flatMap((segment, index) => {
    if (segment.startsWith("$") && segment.endsWith("$") && segment.length > 2) {
      return <MathInline key={`${segment}-${index}`} latex={segment.slice(1, -1)} />;
    }
    return renderBareMath(segment, `${index}`);
  });

export const ContentBlockRenderer = ({
  blocks,
  className = "space-y-3",
  paragraphClassName = "text-base leading-7 text-steel",
  listClassName = "list-disc space-y-2 pl-5 text-base leading-7 text-steel",
}: ContentBlockRendererProps) => (
  <div className={className}>
    {blocks.map((block, index) => {
      if (block.type === "math") {
        return block.display === "inline" ? (
          <span key={`${block.latex}-${index}`}>
            <MathInline latex={block.latex} />
          </span>
        ) : (
          <MathBlock key={`${block.latex}-${index}`} latex={block.latex} {...(block.tone === undefined ? {} : { tone: block.tone })} />
        );
      }

      if (block.type === "list") {
        return (
          <ul key={`list-${index}`} className={listClassName}>
            {block.items.map((item) => (
              <li key={item}>{renderInlineMath(item)}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={`${block.text}-${index}`} className={paragraphClassName}>
          {renderInlineMath(block.text)}
        </p>
      );
    })}
  </div>
);
