/**
 * Numbers challenge metadata.
 */
(function registerNumbersChallenge(global) {
    const register = global && global.registerChallengeCategory;
    if (typeof register !== "function") {
        console.warn("registerChallengeCategory is unavailable for the numbers category.");
        return;
    }

    register({
        key: "numbers",
        label: "Numbers",
        heading: "Numbers",
        description:
            "Description Placeholder",
        tasks: [
            "Convert inputs to numbers with Number(value) or parseFloat before doing math.",
            "Use Math helpers for absolute values, rounding, and min/max comparisons.",
            "Rely on operators like *, /, %, and ** to scale, divide, or check parity."
        ],
        notes: [
            {
                html: "Turn user input into a number first—<code>Number(value)</code> handles decimals, while <code>parseInt(value, 10)</code> trims to integers.",
                code: "const raw = \"42.7\";\nNumber(raw); // 42.7\nparseInt(raw, 10); // 42",
                language: "js"
            },
            {
                html: "Math helpers such as <code>Math.abs()</code>, <code>Math.round()</code>, and <code>Math.max()</code> cover most everyday adjustments.",
                code: "Math.abs(-3); // 3\nMath.round(2.6); // 3\nMath.max(4, 9, 1); // 9",
                language: "js"
            },
            {
                html: "Use exponentiation with <code>**</code> (or <code>Math.pow()</code>) to square, cube, or raise values to custom powers.",
                code: "const base = 3;\nbase ** 2; // 9\nMath.pow(base, 3); // 27",
                language: "js"
            },
            {
                html: "Check whether a value is a valid number with <code>Number.isNaN()</code>; it only returns true for actual NaN results.",
                code: "Number.isNaN(NaN); // true\nNumber.isNaN(\"hello\"); // false\nNumber.isNaN(Number(\"hello\")); // true",
                language: "js"
            },
            {
                html: "The remainder operator <code>%</code> is handy for parity checks or cycling through limited ranges.",
                code: "const value = 18;\nvalue % 2 === 0; // true (even)\nvalue % 3; // 0",
                language: "js"
            }
        ]
    });
})(window);
