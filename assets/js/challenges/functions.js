/**
 * Functions challenge metadata.
 */
(function registerFunctionsChallenge(global) {
    const register = global && global.registerChallengeCategory;
    if (typeof register !== "function") {
        console.warn("registerChallengeCategory is unavailable for the functions category.");
        return;
    }

    register({
        key: "functions",
        label: "Functions",
        heading: "Functions",
        description:
            "Function-focused exercises reinforce composition, higher-order abstractions, and defensive testing habits.",
        tasks: [
            "Create pure functions and analyse their side effects.",
            "Build higher-order functions that operate on arrays.",
            "Implement memoisation and manage recursion."
        ],
        notes: [
            {
                text: "Sketch the function signature you expect to export before writing the implementation to keep the API focused."
            },
            {
                text: "Add runtime guards or TypeScript annotations when you expect to call the function from different modules.",
                code: `export const assertNumber = (input) => {
    if (typeof input !== "number" || Number.isNaN(input)) {
        throw new TypeError("Expected a valid number");
    }
    return input;
};`
            }
        ]
    });
})(window);
