export function getAICoTeacherSuggestions(chapter: string = "13% VAT"): string[] {
  if (chapter.includes("VAT") || chapter.includes("Arithmetic")) {
    return [
      "💡 AI Insight: 3 students in chat asked if VAT is calculated on MP. Prompt the class with: 'Why does the government apply VAT after deducting the discount?'",
      "⚡ Formative Check: Launch a 30-second poll on 'A Rs. 1000 item has 10% discount. What is the SP before VAT?' (Answer: Rs. 900).",
      "🎯 Scaffolding Hint: Write the two-step formula on whiteboard: Step 1: SP = MP - Discount, Step 2: Total = SP + 13% VAT.",
    ];
  }

  if (chapter.includes("Pressure") || chapter.includes("Archimedes")) {
    return [
      "💡 AI Insight: Clarify that in U = V·d·g, 'd' represents the liquid density, not the solid object's density.",
      "⚡ Formative Check: Launch a live poll: 'Will upthrust be greater in pure water or salty seawater?' (Answer: Seawater due to higher density).",
      "🎯 Scaffolding Hint: Stamp the apparent weight formula on the whiteboard: Apparent Weight = Air Weight - Upthrust.",
    ];
  }

  return [
    "💡 AI Insight: Check if all students understand the difference between disjoint and overlapping sets.",
    "⚡ Formative Check: Ask students to draw a 2-set Venn diagram in their notebooks with intersection n(A ∩ B) shaded.",
  ];
}
