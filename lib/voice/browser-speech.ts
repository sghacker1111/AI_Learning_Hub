export function cleanTextForSpeech(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " code example omitted ")
    .replace(/\\(?:\[|\]|\(|\))/g, " ")
    .replace(/\$+/g, " ")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, " $1 divided by $2 ")
    .replace(/\\sqrt\{([^{}]+)\}/g, " square root of $1 ")
    .replace(/\\text\{([^{}]+)\}/g, " $1 ")
    .replace(/\\(?:times|cdot)/g, " times ")
    .replace(/\\pm/g, " plus or minus ")
    .replace(/\^\{?2\}?/g, " squared ")
    .replace(/\^\{?3\}?/g, " cubed ")
    .replace(/\^\{([^{}]+)\}/g, " to the power $1 ")
    .replace(/[{}]/g, " ")
    .replace(/[`*_#>]/g, " ")
    .replace(/https?:\/\/\S+/g, " link ")
    .replace(/\s+/g, " ")
    .trim();
}

export function chunkTextForSpeech(input: string, maxLength = 220): string[] {
  const cleaned = cleanTextForSpeech(input);
  if (!cleaned) return [];

  const sentences = cleaned.match(/[^.!?।]+[.!?।]?/g) || [cleaned];
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length > maxLength) {
      pushCurrent();
      const words = trimmed.split(/\s+/);
      for (const word of words) {
        if (`${current} ${word}`.trim().length > maxLength) pushCurrent();
        current = `${current} ${word}`.trim();
      }
      pushCurrent();
      continue;
    }

    if (`${current} ${trimmed}`.trim().length > maxLength) pushCurrent();
    current = `${current} ${trimmed}`.trim();
  }

  pushCurrent();
  return chunks;
}
