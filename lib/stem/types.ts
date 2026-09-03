export interface VennDiagramData {
  nU: number;
  nA: number;
  nB: number;
  nIntersection: number;
  nOnlyA: number;
  nOnlyB: number;
  nUnion: number;
  nComplement: number;
  isValid: boolean;
  validationError?: string;
}

export interface VATCalculationResult {
  markedPrice: number;
  discountPercentage: number;
  discountAmount: number;
  priceAfterDiscount: number;
  vatPercentage: number;
  vatAmount: number;
  finalSellingPrice: number;
  stepsMarkdown: string;
}

export interface FactorizationResult {
  expression: string;
  a: number;
  b: number;
  c: number;
  acProduct: number;
  splitTerms: { p: number; q: number };
  intermediateSteps: string[];
  finalFactors: string;
}

export interface PhysicsSimulationData {
  volumeDisplacedM3: number;
  liquidDensityKgM3: number;
  gravityMs2: number;
  depthMeters?: number;
  upthrustNewtons: number;
  liquidPressurePascals?: number;
  objectWeightInAirNewtons: number;
  apparentWeightNewtons: number;
  flotationStatus: "FLOATS" | "SINKS" | "SUSPENDED";
}

export interface MathStepVerification {
  problemContext: string;
  stepGiven: string;
  isValid: boolean;
  isVerified: boolean;
  feedback: string;
  pinpointedError?: string;
  suggestedNextStep?: string;
  latexPreview?: string;
}
