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
            "Inspect string length checks and casing helpers.",
            "Access characters by index, including negative `.at()` lookups.",
            "Extract substrings and combine text with concatenation or templates."
        ],
        notes: [
            {
                html: "Build strings with matching <code>'single'</code> or <code>\"double\"</code> quotes, or use template literals <code>`...`</code> when you need multi-line text or interpolation such as <code>${name}</code>.",
                code: "const single = 'Hello';\nconst double = \"Hello\";\nconst template = `Hi, ${name}!\nNice to meet you.`;",
                language: "js"
            },
            {
                html: "Use the <code>.length</code> property to count characters (no parentheses). When you need uppercase or lowercase output, invoke <code>.toUpperCase()</code> or <code>.toLowerCase()</code> with parentheses so the functions actually run.",
                code: "const sample = \"Hello\";\nsample.length; // 5\nsample.toUpperCase(); // \"HELLO\"\nsample.toLowerCase(); // \"hello\"",
                language: "js"
            },
            {
                html: "Indexing starts at <code>0</code>; reach characters with bracket notation (for example <code>word[0]</code>) or call <code>.at()</code>—it also accepts negative indexes like <code>.at(-1)</code> when paired with <code>.length</code>.",
                code: "const word = \"Pizza\";\nword[0]; // \"P\"\nword[word.length - 1]; // \"a\"\nword.at(-1); // \"a\"",
                language: "js"
            },
            {
                html: "Call <code>text.substring(indexStart, indexEnd)</code> to extract part of a string: start is included, the optional end marks the first character to skip, and the result stops right before it.",
                code: "const phrase = \"JavaScript\";\nphrase.substring(4, 10); // \"Script\"\nphrase.substring(4); // \"Script\"",
                language: "js"
            },
            {
                html: "The <code>+</code> operator adds numbers but concatenates strings, and <code>console.log(...)</code> is strictly for debugging—it never replaces a <code>return</code> statement.",
                code: "const age = 7 + 3; // 10\nconst greeting = \"Hi, \" + \"there\"; // \"Hi, there\"\nconsole.log(greeting); // logs the message",
                language: "js"
            }
        ]
    });
})(window);
