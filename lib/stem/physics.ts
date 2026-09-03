import { PhysicsSimulationData } from "./types";

export const LIQUID_DENSITIES: Record<string, { name: string; densityKgM3: number; description: string }> = {
  water: { name: "Pure Water", densityKgM3: 1000, description: "Standard fresh water at 4°C" },
  kerosene: { name: "Kerosene Oil", densityKgM3: 800, description: "Less dense than water, lighter upthrust" },
  seawater: { name: "Sea Water", densityKgM3: 1025, description: "Higher salinity, greater buoyant force" },
  glycerin: { name: "Glycerin", densityKgM3: 1260, description: "Viscous dense liquid" },
  mercury: { name: "Liquid Mercury", densityKgM3: 13600, description: "Dense liquid metal, very high upthrust" },
};

export function simulateUpthrust(
  volumeDisplacedM3: number,
  liquidKey: string = "water",
  objectWeightInAirNewtons: number = 50,
  depthMeters: number = 0.5
): PhysicsSimulationData {
  if (
    ![volumeDisplacedM3, objectWeightInAirNewtons, depthMeters].every(Number.isFinite) ||
    volumeDisplacedM3 < 0 ||
    objectWeightInAirNewtons < 0 ||
    depthMeters < 0
  ) {
    throw new RangeError("Volume, weight, and depth must be finite non-negative numbers.");
  }
  if (!LIQUID_DENSITIES[liquidKey]) {
    throw new RangeError("Unknown liquid type.");
  }
  const liquid = LIQUID_DENSITIES[liquidKey] || LIQUID_DENSITIES.water;
  const g = 9.8; // m/s^2

  const upthrustNewtons = volumeDisplacedM3 * liquid.densityKgM3 * g;
  const liquidPressurePascals = depthMeters * liquid.densityKgM3 * g;
  const apparentWeightNewtons = Math.max(0, objectWeightInAirNewtons - upthrustNewtons);

  let flotationStatus: PhysicsSimulationData["flotationStatus"] = "SINKS";
  if (Math.abs(upthrustNewtons - objectWeightInAirNewtons) < 0.1) {
    flotationStatus = "SUSPENDED";
  } else if (upthrustNewtons > objectWeightInAirNewtons) {
    flotationStatus = "FLOATS";
  }

  return {
    volumeDisplacedM3,
    liquidDensityKgM3: liquid.densityKgM3,
    gravityMs2: g,
    depthMeters,
    upthrustNewtons,
    liquidPressurePascals,
    objectWeightInAirNewtons,
    apparentWeightNewtons,
    flotationStatus,
  };
}
