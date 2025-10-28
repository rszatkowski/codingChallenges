export function runArrayNotesSimulation(inputValue) {
  if (!inputValue) {
    return "Enter numbers separated by commas to outline how your even-filter should behave.";
  }

  const values = inputValue
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return `You entered ${values.length} item(s). Decide which should stay when you build keepEvenNumbers.`;
}
