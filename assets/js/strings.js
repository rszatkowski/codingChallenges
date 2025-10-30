/**
 * Function tests specific to the Strings category.
 * Each test registers both the executable helper and the UI copy used
 * to render its card inside the tab.
 */
if (typeof window.configureFunctionTests === "function") {
    window.configureFunctionTests("strings", {
        title: "String manipulation challenges:",
        intro: "Test each function with different string inputs to see how they behave, including edge cases like empty strings or special characters."
    });
}

// String manipulation functions

function getCharCount(text) {
    return text.length;
}

function strToUpperCase(text) {
    return text.toUpperCase();
}

function strToLowerCase(text) {
    return text.toLowerCase();
}

function getFirstCharacter(text) {
    return text[0];
}

function getLastCharacter(text) {
    return text[text.length - 1];
}

function skipFirstCharacter(text) {
    return text.substring(1);
}


// Registration helper for string function tests
const registerFunctionTestRef =
    typeof window.registerFunctionTest === "function" ? window.registerFunctionTest : null;

const registerStringsTest = (() => {
    const defaults = {
        inputLabel: "Input value",
        inputPlaceholder: "Provide sample text…",
        buttonLabel: "Run function",
        outputLabel: "Result",
        emptyMessage: "Provide at least one character to evaluate the function.",
        emptyAnnounce: "Enter at least one character to evaluate the function."
    };

    let autoId = 0;

    return (config = {}) => {
        if (!registerFunctionTestRef) {
            return;
        }

        const hasRunnable = typeof config.fn === "function" || typeof config.run === "function";
        if (!hasRunnable) {
            console.warn(
                "Skipping string function test registration because no fn/run was supplied.",
                config
            );
            return;
        }

        const identifier =
            typeof config.id === "string" && config.id.trim().length
                ? config.id
                : `strings-task-${++autoId}`;

        registerFunctionTestRef("strings", {
            ...defaults,
            ...config,
            id: identifier
        });
    };
})();


// Define and register string function tests
const stringTestDefinitions = [
    {
        id: "strings-length-character",
        title: "Task 1: Return the last character",
        description: "Given any string, return only the final character",
        fn: getCharCount
    },
    {
        id: "strings-to-uppercase",
        title: "Task 2: Change string to uppercase",
        description: "Given any string, return the string with all uppercase letters.",
        fn: strToUpperCase
    },
    {
        id: "strings-to-lowercase",
        title: "Task 3: Change string to lowercase",
        description: "Given any string, return the string with all lowercase letters.",
        fn: strToLowerCase
    },
    {
        id: "strings-first-character",
        title: "Task 4: Return the first character",
        description: "Given any string, return only the first character.",
        fn: getFirstCharacter
    },
    {
        id: "strings-last-character",
        title: "Task 5: Return the last character",
        description: "Given any string, return only the final character.",
        fn: getLastCharacter
    },
    {
        id: "strings-skip-first-character",
        title: "Task 6: Skip the first character",
        description: "Given any string, return the string without its first character.",
        fn: skipFirstCharacter
    }
];


// Register all string function tests
stringTestDefinitions.forEach((testConfig) => {
    registerStringsTest(testConfig);
});
