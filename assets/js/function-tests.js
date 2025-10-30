/**
 * Registry and renderer for function test cards that appear under category tabs.
 * Each test links a runnable function with its UI copy so the same source powers
 * both the executed logic and the displayed snippet.
 */
(function () {
    const statusClassMap = {
        success: "test-output--success",
        info: "test-output--info",
        error: "test-output--error"
    };

    const testsByCategory = new Map();
    const metadataByCategory = new Map();

    const normaliseDescription = (description) => {
        if (!description) {
            return [];
        }
        return (Array.isArray(description) ? description : [description]).filter(Boolean);
    };

    const escapeHTML = (value) =>
        String(value).replace(/[&<>"']/g, (match) => {
            switch (match) {
                case "&":
                    return "&amp;";
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case '"':
                    return "&quot;";
                case "'":
                    return "&#39;";
                default:
                    return match;
            }
        });

    const applyStatusClass = (element, status) => {
        element.classList.remove(...Object.values(statusClassMap));
        if (status && statusClassMap[status]) {
            element.classList.add(statusClassMap[status]);
        }
    };

    const createOutputBlock = (label, emptyMessage) => {
        const wrapper = document.createElement("div");
        wrapper.className = "test-output test-output--info";
        wrapper.setAttribute("role", "status");
        wrapper.setAttribute("aria-live", "polite");

        const title = document.createElement("span");
        title.className = "test-output__label";
        title.textContent = label || "Result";
        wrapper.appendChild(title);

        const value = document.createElement("span");
        value.className = "test-output__value";
        value.textContent = emptyMessage || "Awaiting input…";
        wrapper.appendChild(value);

        return { wrapper, value };
    };

    const createCodeToggle = (code, toggleId) => {
        if (!code) {
            return null;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "test-code__toggle";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", toggleId);
        button.textContent = "Show code";

        const container = document.createElement("div");
        container.className = "test-code";
        container.id = toggleId;
        container.hidden = true;

        const pre = document.createElement("pre");
        pre.innerHTML = `<code>${escapeHTML(code)}</code>`;
        pre.setAttribute("aria-hidden", "true");
        container.appendChild(pre);

        button.addEventListener("click", () => {
            const willReveal = container.hidden;
            container.hidden = !willReveal;
            button.setAttribute("aria-expanded", String(willReveal));
            button.textContent = willReveal ? "Hide code" : "Show code";
        });

        return { button, container };
    };

    const buildForm = (test, onSubmit) => {
        const form = document.createElement("form");
        form.className = "test-form";

        const inputId = `${test.id}-input`;
        const label = document.createElement("label");
        label.setAttribute("for", inputId);
        label.textContent = test.inputLabel || "Input";

        const input = document.createElement("input");
        input.type = "text";
        input.id = inputId;
        input.name = "function-test-input";
        input.placeholder = test.inputPlaceholder || "";
        input.autocomplete = "off";

        const actions = document.createElement("div");
        actions.className = "test-actions";

        const runButton = document.createElement("button");
        runButton.type = "submit";
        runButton.className = "test-run";
        runButton.textContent = test.buttonLabel || "Run";

        actions.appendChild(runButton);

        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(actions);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            onSubmit(input.value ?? "");
        });

        return { form, input };
    };

    const evaluateResult = (result, fallbackMessage) => {
        if (result && typeof result === "object" && ("display" in result || "status" in result)) {
            return {
                status: result.status || "success",
                display: result.display !== undefined ? String(result.display) : "",
                announce: result.announce
            };
        }

        if (result === undefined || result === null || result === "") {
            return {
                status: "info",
                display: fallbackMessage || ""
            };
        }

        return {
            status: "success",
            display: String(result)
        };
    };

    const buildFunctionTestCard = (test) => {
        const card = document.createElement("details");
        card.className = "test-card";
        card.dataset.testId = test.id;

        if (test.defaultOpen) {
            card.open = true;
        }

        const summary = document.createElement("summary");
        summary.className = "test-card__summary";
        summary.textContent = test.title || test.id;
        card.appendChild(summary);

        const body = document.createElement("div");
        body.className = "test-card__body";
        card.appendChild(body);

        const descriptions = normaliseDescription(test.description);
        if (descriptions.length) {
            descriptions.forEach((text, index) => {
                const paragraph = document.createElement("p");
                paragraph.className = "test-description";
                const prefix = document.createElement("strong");
                prefix.textContent = index === 0 ? "Description:" : "Notes:";
                paragraph.appendChild(prefix);
                paragraph.appendChild(document.createTextNode(` ${text}`));
                body.appendChild(paragraph);
            });
        }

        const { wrapper: output, value: outputValue } = createOutputBlock(
            test.outputLabel,
            test.emptyMessage
        );

        const handleSubmit = (inputValue) => {
            try {
                const result = test.run(inputValue);
                const evaluated = evaluateResult(result, test.emptyMessage);
                applyStatusClass(output, evaluated.status);
                outputValue.textContent =
                    evaluated.display || test.emptyMessage || "Awaiting input…";

                if (evaluated.announce) {
                    output.setAttribute("aria-label", evaluated.announce);
                } else {
                    output.removeAttribute("aria-label");
                }
            } catch (error) {
                applyStatusClass(output, "error");
                outputValue.textContent = "Execution failed. Check the implementation.";
                output.setAttribute(
                    "aria-label",
                    "Execution failed. Review the browser console for details."
                );
                console.error(`Function test "${test.id}" failed:`, error);
            }
        };

        const { form } = buildForm(test, handleSubmit);
        body.appendChild(form);
        body.appendChild(output);

        const codeId = `${test.id}-code`;
        const toggle = createCodeToggle(test.code, codeId);
        if (toggle) {
            body.appendChild(toggle.button);
            body.appendChild(toggle.container);
        }

        return card;
    };

    const createFilterControls = (state, onChange) => {
        const controls = document.createElement("div");
        controls.className = "function-tests__controls";

        const filter = document.createElement("input");
        filter.type = "search";
        filter.className = "function-tests__filter";
        filter.placeholder = "Filter tasks by title or description…";
        filter.addEventListener("input", () => {
            state.query = filter.value.trim().toLowerCase();
            state.page = 1;
            onChange();
        });

        const status = document.createElement("span");
        status.className = "function-tests__status";

        controls.appendChild(filter);
        controls.appendChild(status);

        return { controls, status };
    };

    const createPaginationControls = (state, onChange) => {
        const pagination = document.createElement("div");
        pagination.className = "function-tests__pagination";

        const prev = document.createElement("button");
        prev.type = "button";
        prev.className = "function-tests__page-button";
        prev.textContent = "Previous";
        prev.addEventListener("click", () => {
            if (state.page > 1) {
                state.page -= 1;
                onChange();
            }
        });

        const next = document.createElement("button");
        next.type = "button";
        next.className = "function-tests__page-button";
        next.textContent = "Next";
        next.addEventListener("click", () => {
            if (state.page < state.totalPages) {
                state.page += 1;
                onChange();
            }
        });

        const summary = document.createElement("span");
        summary.className = "function-tests__page-summary";

        pagination.appendChild(prev);
        pagination.appendChild(summary);
        pagination.appendChild(next);

        return { pagination, prev, next, summary };
    };

    const renderFunctionTestsSection = (categoryKey) => {
        const tests = getFunctionTests(categoryKey);
        if (!tests.length) {
            return null;
        }

        const meta = getFunctionTestMeta(categoryKey);

        const section = document.createElement("section");
        section.className = "function-tests";

        if (meta.title) {
            const heading = document.createElement("h4");
            heading.className = "function-tests__heading";
            heading.textContent = meta.title;
            section.appendChild(heading);
        }

        if (meta.intro) {
            const intro = document.createElement("p");
            intro.className = "function-tests__intro";
            intro.textContent = meta.intro;
            section.appendChild(intro);
        }

        const list = document.createElement("div");
        list.className = "function-tests__list";
        const determineColumns = () => {
            const width = list.clientWidth || section.clientWidth || window.innerWidth;
            if (width >= 1140) {
                return 3;
            }
            if (width >= 760) {
                return 2;
            }
            return 1;
        };

        const rowsPerPage = 9;

        const state = {
            query: "",
            page: 1,
            columns: determineColumns(),
            pageSize: 0,
            totalPages: 1,
            filtered: tests
        };

        const { controls, status } = createFilterControls(state, () => {
            update();
        });
        section.appendChild(controls);
        section.appendChild(list);

        const { pagination, prev, next, summary } = createPaginationControls(state, () => {
            update();
        });
        section.appendChild(pagination);

        const emptyState = document.createElement("p");
        emptyState.className = "function-tests__empty";
        emptyState.textContent = "No tasks match the current filter.";
        emptyState.hidden = true;
        section.appendChild(emptyState);

        const applyFilter = () => {
            if (!state.query) {
                state.filtered = tests;
                return;
            }
            state.filtered = tests.filter((test) => {
                const haystack = [test.title, normaliseDescription(test.description).join(" ")]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(state.query);
            });
        };

        const update = () => {
            applyFilter();

            const totalItems = state.filtered.length;
            state.columns = determineColumns();

            const basePageSize = Math.max(1, state.columns * rowsPerPage);
            const effectivePageSize = totalItems > 0 && totalItems <= basePageSize ? totalItems : basePageSize;

            state.pageSize = effectivePageSize;
            state.totalPages = totalItems > 0 ? Math.max(1, Math.ceil(totalItems / state.pageSize)) : 1;
            state.page = Math.min(state.page, state.totalPages);

            const hasResults = totalItems > 0;
            emptyState.hidden = hasResults;
            list.innerHTML = "";

            if (hasResults) {
                const start = (state.page - 1) * state.pageSize;
                const pageItems = state.filtered.slice(start, start + state.pageSize);
                pageItems.forEach((test) => {
                    const card = buildFunctionTestCard(test);
                    list.appendChild(card);
                });
            }

            prev.disabled = state.page <= 1;
            next.disabled = state.page >= state.totalPages || !hasResults;
            pagination.hidden = state.totalPages <= 1;

            status.textContent = `${state.filtered.length} task${
                state.filtered.length === 1 ? "" : "s"
            }`;
            summary.textContent = `Page ${state.page} of ${state.totalPages}`;
        };

        update();

        const handleResize = () => {
            const nextColumns = determineColumns();
            if (nextColumns !== state.columns) {
                state.columns = nextColumns;
                update();
            }
        };

        window.addEventListener("resize", handleResize);

        return section;
    };

    const createDefaultRunner = (config) => {
        const fn = config.fn;
        if (typeof fn !== "function") {
            return null;
        }

        return (rawInput) => {
            let value = rawInput;
            if (typeof config.prepareInput === "function") {
                value = config.prepareInput(rawInput);
            }

            if (value === undefined || value === null) {
                value = "";
            }

            if (config.requireInput !== false) {
                const comparable = typeof value === "string" ? value : String(value);
                if (!comparable.length) {
                    return {
                        status: "info",
                        display: config.emptyMessage || "Awaiting input…",
                        announce:
                            config.emptyAnnounce || "Enter a value to evaluate the function."
                    };
                }
            }

            const output = fn(value);
            if (typeof config.postprocess === "function") {
                return config.postprocess(output, value);
            }
            return output;
        };
    };

    const registerFunctionTest = (categoryKey, testConfig) => {
        if (!categoryKey || !testConfig) {
            console.warn("registerFunctionTest requires a category key and configuration.");
            return;
        }

        let run = testConfig.run;
        if (typeof run !== "function") {
            run = createDefaultRunner(testConfig);
        }

        if (typeof run !== "function") {
            console.warn(
                "registerFunctionTest needs either a run function or a fn to wrap into one.",
                testConfig
            );
            return;
        }

        const existing = testsByCategory.get(categoryKey) || [];
        const id = testConfig.id || `${categoryKey}-test-${existing.length + 1}`;
        const code =
            typeof testConfig.code === "string"
                ? testConfig.code
                : typeof testConfig.fn === "function"
                ? testConfig.fn.toString().trim()
                : run.toString().trim();

        const stored = {
            ...testConfig,
            id,
            code,
            run
        };

        existing.push(stored);
        testsByCategory.set(categoryKey, existing);
    };

    const configureFunctionTests = (categoryKey, meta = {}) => {
        if (!categoryKey) {
            return;
        }
        metadataByCategory.set(categoryKey, {
            title: meta.title,
            intro: meta.intro
        });
    };

    const getFunctionTests = (categoryKey) => testsByCategory.get(categoryKey) || [];

    const getFunctionTestMeta = (categoryKey) => metadataByCategory.get(categoryKey) || {};

    window.registerFunctionTest = registerFunctionTest;
    window.configureFunctionTests = configureFunctionTests;
    window.renderFunctionTests = renderFunctionTestsSection;
})();
