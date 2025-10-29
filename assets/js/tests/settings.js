export function runSettingsSimulation(inputValue) {
  if (!inputValue) {
    return "Use the practice box to jot down goals, shortcuts, or rules you want to remember.";
  }

  return `Saved note:\n${inputValue}`;
}
