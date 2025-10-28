export const arraysNotes = [
  {
    title: "Iteration ideas",
    items: [
      "Use `.map`, `.filter`, and `.reduce` to keep transformations declarative.",
      "Spread syntax (`...array`) helps clone arrays without mutating originals.",
      "Prefer `const` when the variable reference does not need to change.",
    ],
  },
  {
    title: "Practice suggestions",
    items: [
      "Start with simple loops, then refactor into array helpers.",
      "Log out interim results to understand how data changes.",
      "Compare multiple approaches (loop vs. helper) to reinforce concepts.",
    ],
  },
];

export const arraysExercise = {
  prompt:
    "Write a function that returns a new array containing only the even numbers from the input array.",
  starterCode: `function keepEvenNumbers(values) {
  const result = [];

  for (const value of values) {
    if (value % 2 === 0) {
      result.push(value);
    }
  }

  return result;
}
`,
};
