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
            "Description Placeholder",
        tasks: [
            "Notes Placeholder"
        ],
        notes: [
            {
                text: "Notes Placeholder"
            },
            {
                text: "Notes Placeholder",
                code: `const hasOnlyLetters = (value = "") =>
    /^[\\p{L}]+$/u.test(value);`
            }
        ]
    });
})(window);
