import { FactorizationResult } from "./types";

function formatSignedTerm(value: number, suffix: string = ""): string {
  return (value >= 0 ? "+ " : "- ") + Math.abs(value) + suffix;
}

function formatLinearFactor(xCoefficient: number, constant: number): string {
  const xTerm =
    xCoefficient === 1 ? "x" : xCoefficient === -1 ? "-x" : xCoefficient + "x";
  if (constant === 0) return "(" + xTerm + ")";
  return "(" + xTerm + " " + formatSignedTerm(constant) + ")";
}

export function factorizeQuadratic(a: number, b: number, c: number): FactorizationResult {
  if (![a, b, c].every(Number.isFinite) || ![a, b, c].every(Number.isInteger)) {
    throw new RangeError("Quadratic coefficients must be finite integers.");
  }
  if (a === 0) {
    throw new RangeError("Coefficient a must be non-zero for a quadratic expression.");
  }

  const ac = a * c;
  let factorTuple: [number, number, number, number] | null = null;

  if (c === 0) {
    factorTuple = [1, 0, a, b];
  } else {
    const aLimit = Math.abs(a);
    const cLimit = Math.abs(c);

    for (let leftX = 1; leftX <= aLimit && !factorTuple; leftX++) {
      for (const signedLeftX of [leftX, -leftX]) {
        if (a % signedLeftX !== 0) continue;
        const rightX = a / signedLeftX;

        for (let leftConstant = 1; leftConstant <= cLimit; leftConstant++) {
          for (const signedLeftConstant of [leftConstant, -leftConstant]) {
            if (c % signedLeftConstant !== 0) continue;
            const rightConstant = c / signedLeftConstant;
            if (
              signedLeftX * rightConstant + signedLeftConstant * rightX === b
            ) {
              factorTuple = [
                signedLeftX,
                signedLeftConstant,
                rightX,
                rightConstant,
              ];
              break;
            }
          }
          if (factorTuple) break;
        }
        if (factorTuple) break;
      }
    }
  }

  const p = factorTuple ? factorTuple[0] * factorTuple[3] : 0;
  const q = factorTuple ? factorTuple[1] * factorTuple[2] : 0;
  const leadingTerm = a === 1 ? "x^2" : a === -1 ? "-x^2" : a + "x^2";
  const expression =
    leadingTerm + " " + formatSignedTerm(b, "x") + " " + formatSignedTerm(c);

  const intermediateSteps = [
    "Expression: $" + expression + "$",
    "Identify $a = " + a + ", b = " + b + ", c = " + c +
      " \\implies a \\cdot c = " + ac + "$",
  ];

  if (factorTuple) {
    intermediateSteps.push(
      "Split the middle term using $p = " + p + "$ and $q = " + q +
        "$, where $p \\cdot q = a \\cdot c$ and $p + q = b$.",
      "Group the four terms and factor the common binomial."
    );
  } else {
    intermediateSteps.push(
      "No integer pair produces a valid pair of linear factors for this expression."
    );
  }

  return {
    expression,
    a,
    b,
    c,
    acProduct: ac,
    splitTerms: { p, q },
    intermediateSteps,
    finalFactors: factorTuple
      ? formatLinearFactor(factorTuple[0], factorTuple[1]) +
        formatLinearFactor(factorTuple[2], factorTuple[3])
      : "Cannot be factorized into integer linear factors",
  };
}
