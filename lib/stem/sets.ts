import { VennDiagramData } from "./types";

export function solveVenn2Sets(nU: number, nA: number, nB: number, nIntersection: number): VennDiagramData {
  const values = [nU, nA, nB, nIntersection];
  if (!values.every(Number.isFinite) || !values.every(Number.isInteger) || values.some((v) => v < 0)) {
    return {
      nU,
      nA,
      nB,
      nIntersection,
      nOnlyA: 0,
      nOnlyB: 0,
      nUnion: 0,
      nComplement: 0,
      isValid: false,
      validationError: "Set cardinalities must be non-negative finite integers.",
    };
  }

  if (nA > nU || nB > nU) {
    return {
      nU,
      nA,
      nB,
      nIntersection,
      nOnlyA: 0,
      nOnlyB: 0,
      nUnion: 0,
      nComplement: 0,
      isValid: false,
      validationError: "A subset cardinality cannot exceed the universal set cardinality.",
    };
  }

  if (nIntersection > nA || nIntersection > nB) {
    return {
      nU,
      nA,
      nB,
      nIntersection,
      nOnlyA: 0,
      nOnlyB: 0,
      nUnion: 0,
      nComplement: 0,
      isValid: false,
      validationError: `Intersection $n(A \\cap B) = ${nIntersection}$ cannot exceed $n(A) = ${nA}$ or $n(B) = ${nB}$.`,
    };
  }

  const nOnlyA = nA - nIntersection;
  const nOnlyB = nB - nIntersection;
  const nUnion = nA + nB - nIntersection;
  const nComplement = nU - nUnion;

  if (nUnion > nU) {
    return {
      nU,
      nA,
      nB,
      nIntersection,
      nOnlyA,
      nOnlyB,
      nUnion,
      nComplement: 0,
      isValid: false,
      validationError: `Union $n(A \\cup B) = ${nUnion}$ exceeds universal set $n(U) = ${nU}$.`,
    };
  }

  return {
    nU,
    nA,
    nB,
    nIntersection,
    nOnlyA,
    nOnlyB,
    nUnion,
    nComplement: Math.max(0, nComplement),
    isValid: true,
  };
}

export function generateVennStepsMarkdown(data: VennDiagramData): string {
  return `
### Step-by-Step CDC Derivation:
1. **Elements only in Set A ($n_o(A)$):**
   $$n_o(A) = n(A) - n(A \\cap B) = ${data.nA} - ${data.nIntersection} = ${data.nOnlyA}$$

2. **Elements only in Set B ($n_o(B)$):**
   $$n_o(B) = n(B) - n(A \\cap B) = ${data.nB} - ${data.nIntersection} = ${data.nOnlyB}$$

3. **Total Union ($n(A \\cup B)$):**
   $$n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = ${data.nA} + ${data.nB} - ${data.nIntersection} = ${data.nUnion}$$

4. **Neither Set (Complement $n(A \\cup B)'$):**
   $$n(A \\cup B)' = n(U) - n(A \\cup B) = ${data.nU} - ${data.nUnion} = ${data.nComplement}$$
  `;
}
