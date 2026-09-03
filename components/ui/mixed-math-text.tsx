"use client";

import { MathView } from "@/components/ui/math-view";
import { parseMixedMathContent } from "@/lib/math/mixed-content";
import { cn } from "@/lib/utils";

interface MixedMathTextProps {
  content: string;
  className?: string;
}

export function MixedMathText({ content, className }: MixedMathTextProps) {
  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      {parseMixedMathContent(content).map((part, index) => {
        if (part.type === "display-math") {
          return (
            <div key={`${part.type}-${index}`} className="my-2 overflow-x-auto py-1">
              <MathView math={part.value} displayMode />
            </div>
          );
        }
        if (part.type === "inline-math") {
          return (
            <MathView
              key={`${part.type}-${index}`}
              math={part.value}
              className="mx-0.5 inline-block max-w-full overflow-x-auto align-middle"
            />
          );
        }
        return <span key={`${part.type}-${index}`}>{part.value}</span>;
      })}
    </div>
  );
}
