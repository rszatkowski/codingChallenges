/**
 * Arrays challenge metadata.
 */
(function registerArraysChallenge(global) {
    const register = global && global.registerChallengeCategory;
    if (typeof register !== "function") {
        console.warn("registerChallengeCategory is unavailable for the arrays category.");
        return;
    }

    register({
        key: "arrays",
        label: "Arrays",
        heading: "Arrays",
        description:
            "Arrays challenges develop data traversal, searching, and sorting techniques for numeric and mixed datasets.",
        tasks: [
            "Implement sorting algorithms (e.g., quicksort, mergesort).",
            "Find maximum, minimum, and average values.",
            "Perform binary search and work with two-dimensional arrays."
        ],
        notes: [
            {
                text: "Pay attention to algorithmic complexity; the same task often has both O(n log n) and O(n²) approaches."
            },
            {
                text: "Experiment with array helpers like map, filter, and reduce before reaching for manual loops.",
                code: `const sum = (values = []) =>
    values.reduce((total, current) => total + current, 0);`
            }
        ]
    });
})(window);
