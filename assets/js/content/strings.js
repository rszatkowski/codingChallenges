export const stringsNotes = [
  {
    title: "Helpful reminders",
    items: [
      "Strings in JavaScript are immutable, so return new values rather than editing in place.",
      "Use `.slice()` for grabbing parts of a string without mutating the original.",
      "Template literals (backticks) make combining text and variables easier to read.",
    ],
  },
  {
    title: "Suggested study flow",
    items: [
      "Review the notes and example below.",
      "Write the logic you want to test in the editable snippet.",
      "Type manual inputs in the practice field to simulate how your function behaves.",
    ],
  },
];

export const stringsExercise = {
  prompt:
    "Create a function that removes the last character from a string. It should handle empty strings gracefully.",
  starterCode: `function removeLastCharacter(text) {
  if (text.length === 0) {
    return text;
  }

  return text.slice(0, -1);
}
`,
};
