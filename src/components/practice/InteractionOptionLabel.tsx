import type { InteractionOption } from "../../mechanics/practice/types";
import { ContentBlockRenderer } from "../content/ContentBlockRenderer";
import { MathInline } from "../math/MathInline";

type InteractionOptionLabelProps = Readonly<{
  option: InteractionOption;
}>;

export const InteractionOptionLabel = ({ option }: InteractionOptionLabelProps) => {
  if (option.content) {
    return <ContentBlockRenderer blocks={option.content} className="space-y-2" />;
  }

  if (option.latex) {
    return <MathInline latex={option.latex} />;
  }

  return option.label;
};
