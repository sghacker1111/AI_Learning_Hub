import { FormulaStamp } from "./types";

export const PRESET_FORMULA_STAMPS: FormulaStamp[] = [
  {
    id: "stamp-sets",
    label: "Sets Union Formula",
    latex: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
  },
  {
    id: "stamp-sp",
    label: "Selling Price Formula",
    latex: "\\text{SP} = \\text{MP} - \\text{Discount}",
  },
  {
    id: "stamp-vat",
    label: "Nepal 13% VAT Formula",
    latex: "\\text{VAT Amount} = \\text{SP} \\times 0.13",
  },
  {
    id: "stamp-pressure",
    label: "Liquid Pressure Formula",
    latex: "P = h \\cdot d \\cdot g",
  },
  {
    id: "stamp-archimedes",
    label: "Archimedes Upthrust",
    latex: "U = V \\cdot d \\cdot g",
  },
  {
    id: "stamp-quadratic",
    label: "Quadratic Equation",
    latex: "ax^2 + bx + c = 0",
  },
];

export const WHITEBOARD_COLORS = [
  "#000000", // Black
  "#DC2626", // Red (Crimson)
  "#2563EB", // Blue
  "#16A34A", // Green
  "#9333EA", // Purple
  "#D97706", // Amber
];
