/**
 * Function tests specific to the Numbers category.
 * Mirrors the structure used by other challenge tabs so new helpers
 * automatically appear inside the shared function-tests UI.
 */
if (typeof window.configureFunctionTests === "function") {
    window.configureFunctionTests("numbers", {
        title: "Number Tasks",
        intro: "Experiment with numeric helpers by entering different values."
    });
}

// ---------------------------------------------------------------------------
// Number utility functions

const toNumber = (value) => {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? NaN : parsed;
};

function doubleNumber(value) {
    const number = toNumber(value);
    return number * 2;
}

function halfNumber(value) {
    const number = toNumber(value);
    return number / 2;
}

function squareNumber(value) {
    const number = toNumber(value);
    return number * number;
}

function cubeNumber(value) {
    const number = toNumber(value);
    return number * number * number;
}

function absoluteNumber(value) {
    const number = toNumber(value);
    return Math.abs(number);
}

function isEvenNumber(value) {
    const number = toNumber(value);
    if (Number.isNaN(number)) {
        return false;
    }
    return number % 2 === 0;
}

// ---------------------------------------------------------------------------
// Registration helper for number function tests

const registerNumbersTest = (() => {
    const defaults = {
        inputLabel: "Input number",
        inputPlaceholder: "Enter a numeric value…",
        buttonLabel: "Run helper",
        outputLabel: "Result",
        emptyMessage: "Provide a number to evaluate the helper.",
        emptyAnnounce: "Enter a number to evaluate the helper.",
        prepareInput: Number
    };

    let autoId = 0;

    return (config = {}) => {
        const hasRunnable = typeof config.fn === "function" || typeof config.run === "function";
        if (!hasRunnable) {
            console.warn(
                "Skipping number function test registration because no fn/run was supplied.",
                config
            );
            return;
        }

        const registerFn =
            typeof window.registerFunctionTest === "function" ? window.registerFunctionTest : null;
        if (!registerFn) {
            console.warn(
                "registerFunctionTest is unavailable for the numbers category; ensure function-tests.js is loaded first."
            );
            return;
        }

        const identifier =
            typeof config.id === "string" && config.id.trim().length
                ? config.id
                : `numbers-task-${++autoId}`;

        registerFn("numbers", {
            ...defaults,
            ...config,
            prepareInput:
                typeof config.prepareInput === "function" ? config.prepareInput : Number,
            id: identifier
        });
    };
})();

// ---------------------------------------------------------------------------
// Define and register number function tests

const numberTestDefinitions = [
    {
        id: "numbers-double",
        title: "Task 1: Double the number",
        description: "Return the input multiplied by two.",
        fn: doubleNumber
    },
    {
        id: "numbers-half",
        title: "Task 2: Half the number",
        description: "Divide the input by two.",
        fn: halfNumber
    },
    {
        id: "numbers-square",
        title: "Task 3: Square the number",
        description: "Return the input raised to the second power.",
        fn: squareNumber
    },
    {
        id: "numbers-cube",
        title: "Task 4: Cube the number",
        description: "Return the input raised to the third power.",
        fn: cubeNumber
    },
    {
        id: "numbers-absolute",
        title: "Task 5: Absolute value",
        description: "Return the distance from zero.",
        fn: absoluteNumber
    },
    {
        id: "numbers-is-even",
        title: "Task 6: Check even",
        description: "Return true when the number is even.",
        fn: isEvenNumber
    }
];

const registerAllNumberTests = () => {
    numberTestDefinitions.forEach((testConfig) => {
        registerNumbersTest(testConfig);
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerAllNumberTests);
} else {
    registerAllNumberTests();
}
