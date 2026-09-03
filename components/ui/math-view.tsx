"use client";

import * as React from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export function MathView({ math, displayMode = false, className = "" }: MathViewProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (containerRef.current && math) {
      try {
        katex.render(math, containerRef.current, {
          displayMode,
          throwOnError: false,
        });
      } catch (err) {
        console.warn("KaTeX rendering error:", err);
      }
    }
  }, [math, displayMode]);

  return <span ref={containerRef} className={className} />;
}
