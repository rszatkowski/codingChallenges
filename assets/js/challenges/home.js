/**
 * Home category metadata.
 */
(function registerHomeChallenge(global) {
    const register = global && global.registerChallengeCategory;
    if (typeof register !== "function") {
        console.warn("registerChallengeCategory is unavailable for the home category.");
        return;
    }

    register({
        key: "home",
        label: "Home",
        heading: "Getting started",
        description:
            "Pick a category from the sidebar to focus on a specific type of coding challenge.",
        tasks: ["Strings", "Placeholder"],
        notes: [
            {
                text: "Placeholder"
            },
            {
                text: "Placeholder."
            }
        ]
    });
})(window);
