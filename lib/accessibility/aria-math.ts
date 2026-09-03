export function generateMathAriaDescription(latex: string): string {
  if (latex.includes("\\cup")) {
    return "Mathematical equation: n of A union B equals n of A plus n of B minus n of A intersection B.";
  }
  if (latex.includes("SP") && latex.includes("VAT")) {
    return "Mathematical formula: Total amount equals Selling Price plus 13 percent VAT on Selling Price.";
  }
  if (latex.includes("P = h")) {
    return "Physics equation: Liquid pressure P equals height h multiplied by liquid density d multiplied by gravitational acceleration g.";
  }
  if (latex.includes("U = V")) {
    return "Physics equation: Archimedes Upthrust U equals displaced volume V multiplied by density d multiplied by g.";
  }
  if (latex.includes("ax^2")) {
    return "Algebraic quadratic equation: a x squared plus b x plus c equals zero.";
  }

  // Generic sanitized fallback for screen readers
  return `Mathematical formula: ${latex
    .replace(/\\/g, "")
    .replace(/\{|\}/g, " ")
    .replace(/\^2/g, " squared ")
    .replace(/=/g, " equals ")
    .replace(/\+/g, " plus ")
    .replace(/-/g, " minus ")
    .trim()}`;
}
