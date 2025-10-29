import { runStringNotesSimulation } from "./strings.js";
import { runArrayNotesSimulation } from "./arrays.js";
import { runSettingsSimulation } from "./settings.js";

export const simulationBySection = {
  strings: runStringNotesSimulation,
  arrays: runArrayNotesSimulation,
  settings: runSettingsSimulation,
};
