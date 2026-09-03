function chapterWords(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").split(" ").filter((word) => word && !/^(chapter|unit|of|and|the|\d+)$/.test(word));
}
export function matchesCurriculumChapter(selected: string, candidate: string) {
  const a = chapterWords(selected), b = chapterWords(candidate);
  if (!a.length || !b.length) return false;
  return a.every((word) => b.includes(word)) || b.every((word) => a.includes(word));
}
