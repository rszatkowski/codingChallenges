export function runStringNotesSimulation(inputValue) {
  if (!inputValue) {
    return "Type a sample string above, then press Run to preview how your logic could react.";
  }

  return `Preview input: ${inputValue}\n(Remember to update removeLastCharacter with your own logic.)`;
}
