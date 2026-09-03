const HTML_SPACE_PATTERN = /(?:&#x20;|&#32;|&nbsp;)/gi;
const MARKDOWN_HEADING_PATTERN = /(^|\n)\s{0,3}#{1,6}\s+/g;

/**
 * Keeps generated answers readable while preserving KaTeX delimiters for the
 * mixed text-and-math renderer.
 */
export function cleanAIOutput(value: string): string {
  return value
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "")
    .replace(/^\s*(?:Thinking Process|Reasoning)\s*:\s*[\s\S]*?(?=\n\s*(?:Final Answer|Answer)\s*:)/i, "")
    .replace(/^\s*(?:Final Answer|Answer)\s*:\s*/i, "")
    .replace(HTML_SPACE_PATTERN, " ")
    .replace(MARKDOWN_HEADING_PATTERN, "$1")
    .replace(/#{2,6}/g, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
