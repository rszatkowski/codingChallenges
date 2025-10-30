/**
 * Lightweight registry for challenge categories.
 * Individual category files call `registerChallengeCategory` to append their data.
 */
(function registerChallengeDataBridge(global) {
    if (!global || typeof global !== "object") {
        return;
    }

    const categories = Array.isArray(global.challengeCategories)
        ? global.challengeCategories
        : [];
    categories.length = 0;

    const hasConsole = typeof global.console !== "undefined";
    const warn = (message, payload) => {
        if (hasConsole && typeof global.console.warn === "function") {
            global.console.warn(message, payload);
        }
    };

    const registerChallengeCategory = (category) => {
        if (!category || typeof category !== "object") {
            warn("registerChallengeCategory expects an object.", category);
            return;
        }

        if (!category.key || typeof category.key !== "string") {
            warn("Challenge categories require a unique string `key` property.", category);
            return;
        }

        categories.push(category);
    };

    global.challengeCategories = categories;
    global.registerChallengeCategory = registerChallengeCategory;
})(window);
