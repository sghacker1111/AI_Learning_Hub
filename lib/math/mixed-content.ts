export type MixedContentPart = {
  type: "text" | "inline-math" | "display-math";
  value: string;
};

const OPENERS = [
  { open: "$$", close: "$$", type: "display-math" as const },
  { open: "\\[", close: "\\]", type: "display-math" as const },
  { open: "\\(", close: "\\)", type: "inline-math" as const },
  { open: "$", close: "$", type: "inline-math" as const },
];

export function parseMixedMathContent(content: string): MixedContentPart[] {
  if (!content) return [];

  const parts: MixedContentPart[] = [];
  let textStart = 0;
  let cursor = 0;

  while (cursor < content.length) {
    const delimiter = OPENERS.find(({ open }) => content.startsWith(open, cursor));
    if (!delimiter || (delimiter.open === "$" && content.startsWith("$$", cursor))) {
      cursor += 1;
      continue;
    }

    const mathStart = cursor + delimiter.open.length;
    const mathEnd = content.indexOf(delimiter.close, mathStart);
    if (mathEnd < 0) {
      cursor += delimiter.open.length;
      continue;
    }

    const math = content.slice(mathStart, mathEnd).trim();
    if (!math || (delimiter.open === "$" && math.includes("\n"))) {
      cursor += delimiter.open.length;
      continue;
    }

    if (cursor > textStart) {
      parts.push({ type: "text", value: content.slice(textStart, cursor) });
    }
    parts.push({ type: delimiter.type, value: math });
    cursor = mathEnd + delimiter.close.length;
    textStart = cursor;
  }

  if (textStart < content.length) {
    parts.push({ type: "text", value: content.slice(textStart) });
  }

  return parts.length ? parts : [{ type: "text", value: content }];
}
