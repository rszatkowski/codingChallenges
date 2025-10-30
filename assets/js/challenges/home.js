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
        icon: "🏠",
        heading: "Getting started",
        description:
            "Pick a category from the sidebar to focus on a specific type of coding challenge.",
        tasks: ["Strings", "Arrays", "Functions"],
        notes: [
            {
                text: "Use the tabs on the left to jump between focus areas without scrolling through a long page."
            },
            {
                text: "Each category highlights a handful of starter tasks and links to hands-on practice once you are ready."
            }
        ]
    });
})(window);
