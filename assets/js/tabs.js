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

    if (!tablist || !panelsHost) {
        console.warn("Tab containers missing from the DOM.");
        return;
    }

    const navFragment = document.createDocumentFragment();
    const panelsFragment = document.createDocumentFragment();

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

        const heading = document.createElement("h3");
        heading.textContent = category.heading || label;
        panel.appendChild(heading);

        const descriptions = Array.isArray(category.description)
            ? category.description
            : [category.description];
        descriptions
            .filter(Boolean)
            .forEach((paragraph) => {
                const p = document.createElement("p");
                p.textContent = paragraph;
                panel.appendChild(p);
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
            panel.appendChild(list);
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
