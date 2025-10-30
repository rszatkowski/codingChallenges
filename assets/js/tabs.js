document.addEventListener("DOMContentLoaded", () => {
    const categories = Array.isArray(window.challengeCategories)
        ? window.challengeCategories.filter((category) => category && category.key)
        : [];

    if (!categories.length) {
        console.warn("No challenge categories found. Check assets/js/challenges-data.js.");
        return;
    }

    const tablist = document.querySelector('[role="tablist"][data-tablist]');
    const panelsHost = document.querySelector("[data-tab-panels]");
    const testsHost = document.querySelector("[data-tests-panels]");
    const testsContainerSection = testsHost ? testsHost.closest(".section--tests") : null;

    if (!tablist || !panelsHost) {
        console.warn("Tab containers missing from the DOM.");
        return;
    }

    const navFragment = document.createDocumentFragment();
    const panelsFragment = document.createDocumentFragment();
    const testsSections = new Map();
    const renderFunctionTests =
        typeof window.renderFunctionTests === "function" ? window.renderFunctionTests : null;

    categories.forEach((category, index) => {
        const key = category.key;
        const label = category.label || key;
        if (!key) {
            return;
        }

        // Build tab button.
        const tabButton = document.createElement("button");
        tabButton.type = "button";
        tabButton.id = `tab-${key}`;
        tabButton.dataset.tab = key;
        tabButton.setAttribute("role", "tab");
        tabButton.setAttribute("aria-controls", `panel-${key}`);
        tabButton.setAttribute("aria-selected", String(index === 0));
        tabButton.tabIndex = index === 0 ? 0 : -1;

        if (category.icon) {
            const iconSpan = document.createElement("span");
            iconSpan.className = "nav-icon";
            iconSpan.setAttribute("aria-hidden", "true");
            iconSpan.textContent = category.icon;
            tabButton.appendChild(iconSpan);
        }

        const labelSpan = document.createElement("span");
        labelSpan.className = "nav-label";
        labelSpan.textContent = label;
        tabButton.appendChild(labelSpan);

        navFragment.appendChild(tabButton);

        // Build corresponding tab panel.
        const panel = document.createElement("article");
        panel.className = "tab-panel";
        panel.id = `panel-${key}`;
        panel.dataset.tabPanel = key;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tabButton.id);
        if (index !== 0) {
            panel.hidden = true;
        }

        const overview = document.createElement("section");
        overview.className = "category-overview";
        panel.appendChild(overview);

        const heading = document.createElement("h3");
        heading.textContent = category.heading || label;
        overview.appendChild(heading);

        const descriptions = Array.isArray(category.description)
            ? category.description
            : [category.description];
        descriptions
            .filter(Boolean)
            .forEach((paragraph) => {
                const p = document.createElement("p");
                p.textContent = paragraph;
                overview.appendChild(p);
            });

        if (Array.isArray(category.tasks) && category.tasks.length) {
            const list = document.createElement("ul");
            category.tasks
                .filter(Boolean)
                .forEach((task) => {
                    const item = document.createElement("li");
                    item.textContent = task;
                    list.appendChild(item);
                });
            overview.appendChild(list);
        }

        const rawNotes = Array.isArray(category.notes)
            ? category.notes
            : category.notes
            ? [category.notes]
            : [];

        const notes = rawNotes
            .map((note) => {
                if (!note) {
                    return null;
                }
                if (typeof note === "string") {
                    return { text: note };
                }
                if (typeof note === "object") {
                    const entry = {
                        text: typeof note.text === "string" ? note.text : "",
                        code: typeof note.code === "string" ? note.code : "",
                        language: typeof note.language === "string" ? note.language.trim() : ""
                    };
                    if (entry.text || entry.code) {
                        return entry;
                    }
                }
                return null;
            })
            .filter(Boolean);

        if (notes.length) {
            const notesSection = document.createElement("section");
            notesSection.className = "category-notes";

            const notesHeading = document.createElement("h4");
            notesHeading.className = "category-notes__heading";
            notesHeading.textContent = "Notes";
            notesSection.appendChild(notesHeading);

            const notesList = document.createElement("ul");
            notesList.className = "category-notes__list";
            notes.forEach((note) => {
                const item = document.createElement("li");
                item.className = "category-notes__item";

                if (note.text) {
                    const textParagraph = document.createElement("p");
                    textParagraph.className = "category-notes__text";
                    textParagraph.textContent = note.text;
                    item.appendChild(textParagraph);
                }

                if (note.code) {
                    const pre = document.createElement("pre");
                    pre.className = "category-notes__code";
                    const codeElement = document.createElement("code");
                    if (note.language) {
                        codeElement.dataset.language = note.language;
                    }
                    codeElement.textContent = note.code;
                    pre.appendChild(codeElement);
                    item.appendChild(pre);
                }

                notesList.appendChild(item);
            });
            notesSection.appendChild(notesList);

            panel.appendChild(notesSection);
        }

        const testsSection = renderFunctionTests ? renderFunctionTests(key) : null;
        if (testsSection) {
            if (testsHost) {
                testsSections.set(key, testsSection);
            } else {
                panel.appendChild(testsSection);
            }
        }

        panelsFragment.appendChild(panel);
    });

    tablist.textContent = "";
    tablist.appendChild(navFragment);

    panelsHost.textContent = "";
    panelsHost.appendChild(panelsFragment);

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs
        .map((tab) => document.getElementById(tab.getAttribute("aria-controls") || ""))
        .filter((panel) => panel);
    // Sections tagged with data-show-tab should only appear for the listed tabs.
    const conditionalSections = Array.from(document.querySelectorAll("[data-show-tab]"));

    const getTabByKey = (key) => tabs.find((tab) => tab.dataset.tab === key);

    const activateTab = (tab, { setFocus = true, updateHash = true } = {}) => {
        if (!tab) {
            return;
        }

        tabs.forEach((candidate) => {
            const isActive = candidate === tab;
            candidate.setAttribute("aria-selected", String(isActive));
            candidate.tabIndex = isActive ? 0 : -1;
            if (isActive && setFocus) {
                candidate.focus();
            }
        });

        panels.forEach((panel) => {
            const controls = tab.getAttribute("aria-controls");
            const shouldShow = panel.id === controls;
            panel.toggleAttribute("hidden", !shouldShow);
        });

        if (testsHost) {
            const testsKey = tab.dataset.tab;
            const testsPanel = testsKey ? testsSections.get(testsKey) : null;
            testsHost.textContent = "";
            if (testsPanel) {
                testsHost.appendChild(testsPanel);
                testsHost.hidden = false;
                if (testsContainerSection) {
                    testsContainerSection.hidden = false;
                }
            } else {
                testsHost.hidden = true;
                if (testsContainerSection) {
                    testsContainerSection.hidden = true;
                }
            }
        }

        conditionalSections.forEach((section) => {
            const allowedTabs = section.dataset.showTab
                .split(/\s+/)
                .map((value) => value.trim())
                .filter(Boolean);
            const shouldDisplay =
                allowedTabs.length === 0 || allowedTabs.includes(tab.dataset.tab || "");
            section.toggleAttribute("hidden", !shouldDisplay);
        });

        if (updateHash && tab.dataset.tab) {
            const newHash = `#${tab.dataset.tab}`;
            if (window.location.hash !== newHash) {
                history.replaceState(null, "", newHash);
            }
        }
    };

    const focusTabByOffset = (current, offset) => {
        const currentIndex = tabs.indexOf(current);
        const nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
    };

    tablist.addEventListener("click", (event) => {
        const tab = event.target.closest('[role="tab"]');
        if (!tab) {
            return;
        }
        activateTab(tab, { setFocus: false });
    });

    tablist.addEventListener("keydown", (event) => {
        const currentTab = document.activeElement;
        if (!tabs.includes(currentTab)) {
            return;
        }

        switch (event.key) {
            case "ArrowUp":
            case "ArrowLeft":
                event.preventDefault();
                focusTabByOffset(currentTab, -1);
                break;
            case "ArrowDown":
            case "ArrowRight":
                event.preventDefault();
                focusTabByOffset(currentTab, 1);
                break;
            case "Home":
                event.preventDefault();
                tabs[0].focus();
                break;
            case "End":
                event.preventDefault();
                tabs[tabs.length - 1].focus();
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                activateTab(currentTab, { setFocus: false });
                break;
            default:
                break;
        }
    });

    const initialKey = window.location.hash.replace("#", "");
    const initialTab = getTabByKey(initialKey) || tabs[0];
    activateTab(initialTab, { setFocus: false, updateHash: Boolean(initialKey) });
});
