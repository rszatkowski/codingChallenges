/**
 * Strings challenge metadata.
 */
(function registerStringsChallenge(global) {
    const register = global && global.registerChallengeCategory;
    if (typeof register !== "function") {
        console.warn("registerChallengeCategory is unavailable for the strings category.");
        return;
    }

    register({
        key: "strings",
        label: "Strings",
        heading: "Strings",
        description:
            "Strings challenges emphasise manipulation of text, from simple transformations to building reusable helpers.",
        tasks: [
            "Reverse text and validate palindromes.",
            "Count character occurrences in strings.",
            "Format text and convert letter casing."
        ],
        notes: [
            {
                text: "Prefer immutable helpers so you can reuse them without worrying about unexpected updates to the input string."
            },
            {
                text: "Test against whitespace, emoji, and accented characters to confirm your logic handles Unicode correctly.",
                code: `const hasOnlyLetters = (value = "") =>
    /^[\\p{L}]+$/u.test(value);`
            }
        ]
    });
})(window);
