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

    const escapeHtml = (value = "") =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const tokenizeJavaScript = (code = "") => {
        const tokens = [];
        const keywords = new Set([
            "const",
            "let",
            "var",
            "function",
            "return",
            "if",
            "else",
            "for",
            "while",
            "switch",
            "case",
            "break",
            "continue",
            "new",
            "class",
            "extends",
            "super",
            "import",
            "from",
            "export",
            "default",
            "try",
            "catch",
            "finally",
            "throw"
        ]);
        const literals = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

        const isIdentifierStart = (char) => /[A-Za-z_$]/.test(char);
        const isIdentifierPart = (char) => /[A-Za-z0-9_$]/.test(char);
        const isDigit = (char) => /[0-9]/.test(char);

        let index = 0;
        const length = code.length;

        const pushToken = (type, value) => {
            tokens.push({ type, value });
        };

        while (index < length) {
            const char = code[index];

            if (char === "\r") {
                index += 1;
                continue;
            }

            if (/\s/.test(char)) {
                let start = index;
                index += 1;
                while (index < length && /\s/.test(code[index]) && code[index] !== "\r") {
                    index += 1;
                }
                pushToken("plain", code.slice(start, index));
                continue;
            }

            if (char === "'" || char === '"' || char === "`") {
                const quote = char;
                let value = quote;
                index += 1;
                let isClosed = false;
                while (index < length) {
                    const current = code[index];
                    value += current;
                    index += 1;
                    if (current === "\\" && index < length) {
                        value += code[index];
                        index += 1;
                        continue;
                    }
                    if (current === quote) {
                        isClosed = true;
                        break;
                    }
                }
                if (!isClosed && index === length) {
                    // Unterminated string; capture the rest.
                    value += code.slice(index);
                    index = length;
                }
                pushToken("string", value);
                continue;
            }

            if (char === "/" && index + 1 < length) {
                const next = code[index + 1];
                if (next === "/") {
                    let start = index;
                    index += 2;
                    while (index < length && code[index] !== "\n") {
                        index += 1;
                    }
                    pushToken("comment", code.slice(start, index));
                    continue;
                }
                if (next === "*") {
                    let start = index;
                    index += 2;
                    while (index + 1 < length && !(code[index] === "*" && code[index + 1] === "/")) {
                        index += 1;
                    }
                    if (index + 1 < length) {
                        index += 2;
                    } else {
                        index = length;
                    }
                    pushToken("comment", code.slice(start, index));
                    continue;
                }
            }

            if (isDigit(char) || (char === "." && isDigit(code[index + 1] || ""))) {
                let start = index;
                index += 1;
                while (index < length && /[0-9._eE]/.test(code[index])) {
                    index += 1;
                }
                pushToken("number", code.slice(start, index));
                continue;
            }

            if (isIdentifierStart(char)) {
                let start = index;
                index += 1;
                while (index < length && isIdentifierPart(code[index])) {
                    index += 1;
                }
                const identifier = code.slice(start, index);
                if (keywords.has(identifier)) {
                    pushToken("keyword", identifier);
                } else if (literals.has(identifier)) {
                    pushToken("literal", identifier);
                } else {
                    pushToken("identifier", identifier);
                }
                continue;
            }

            // Handle symbols/operators.
            pushToken("operator", char);
            index += 1;
        }

        return tokens;
    };

    const highlightCode = (code, language) => {
        if (!code) {
            return "";
        }
        if (!language) {
            return escapeHtml(code);
        }

        const normalized = language.toLowerCase();
        if (normalized === "js" || normalized === "javascript") {
            const tokens = tokenizeJavaScript(code);
            return tokens
                .map((token) => {
                    const escaped = escapeHtml(token.value);
                    switch (token.type) {
                        case "keyword":
                            return `<span class="token token-keyword">${escaped}</span>`;
                        case "string":
                            return `<span class="token token-string">${escaped}</span>`;
                        case "number":
                            return `<span class="token token-number">${escaped}</span>`;
                        case "literal":
                            return `<span class="token token-literal">${escaped}</span>`;
                        case "comment":
                            return `<span class="token token-comment">${escaped}</span>`;
                        case "operator":
                            return `<span class="token token-operator">${escaped}</span>`;
                        default:
                            return escaped;
                    }
                })
                .join("");
        }

        return escapeHtml(code);
    };

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
                        html: typeof note.html === "string" ? note.html : "",
                        code: typeof note.code === "string" ? note.code : "",
                        language: typeof note.language === "string" ? note.language.trim() : ""
                    };
                    if (entry.text || entry.html || entry.code) {
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

                if (note.html || note.text) {
                    const textParagraph = document.createElement("p");
                    textParagraph.className = "category-notes__text";
                    if (note.html) {
                        textParagraph.innerHTML = note.html;
                    } else {
                        textParagraph.textContent = note.text;
                    }
                    item.appendChild(textParagraph);
                }

                if (note.code) {
                    const pre = document.createElement("pre");
                    pre.className = "category-notes__code";
                    const codeElement = document.createElement("code");
                    if (note.language) {
                        codeElement.dataset.language = note.language;
                    }
                    const highlighted = highlightCode(note.code, note.language);
                    codeElement.innerHTML = highlighted;
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
