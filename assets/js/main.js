import { sections } from "./data/sections.js";
import { pagesById } from "./pages/index.js";

const navElement = document.querySelector("#section-nav");
const contentElement = document.querySelector("#section-content");

// Store text area values per section so switching tabs does not wipe notes.
const workspaceState = new Map();
let activeSectionId = sections[0]?.id ?? null;

// Build a navigation button for the left sidebar.
function createSectionButton(section) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "section-link";
  button.textContent = section.title;
  button.dataset.sectionId = section.id;

  if (section.id === activeSectionId) {
    button.setAttribute("aria-current", "page");
  }

  button.addEventListener("click", () => {
    if (activeSectionId === section.id) {
      return;
    }

    activeSectionId = section.id;
    renderNavigation();
    renderSection(section.id);
  });

  return button;
}

// Refresh the navigation to highlight the active section.
function renderNavigation() {
  navElement.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const section of sections) {
    const button = createSectionButton(section);
    fragment.appendChild(button);
  }

  navElement.appendChild(fragment);
}

// Create the main workspace area with a single text field.
function renderWorkspace(sectionId, pageConfig) {
  const textareaId = `${sectionId}-workspace`;
  const storedValue = workspaceState.get(sectionId) ?? "";

  const card = document.createElement("section");
  card.className = "workspace-card";

  if (pageConfig.summary) {
    const summary = document.createElement("p");
    summary.className = "workspace-summary";
    summary.textContent = pageConfig.summary;
    card.appendChild(summary);
  }

  const label = document.createElement("label");
  label.setAttribute("for", textareaId);
  label.textContent = "Workspace";
  card.appendChild(label);

  const textarea = document.createElement("textarea");
  textarea.id = textareaId;
  textarea.placeholder = pageConfig.placeholder ?? "Start typing notes or snippets here.";
  textarea.value = storedValue;
  textarea.addEventListener("input", (event) => {
    workspaceState.set(sectionId, event.target.value);
  });
  card.appendChild(textarea);

  return card;
}

// Render the currently active section content.
function renderSection(sectionId) {
  const section = sections.find((item) => item.id === sectionId);
  const pageConfig = pagesById[sectionId];

  contentElement.innerHTML = "";

  if (!section || !pageConfig) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "Select a topic from the navigation to get started.";
    contentElement.appendChild(emptyMessage);
    return;
  }

  const header = document.createElement("header");
  header.className = "section-header";

  const title = document.createElement("h2");
  title.textContent = section.title;
  header.appendChild(title);

  contentElement.appendChild(header);

  const workspace = renderWorkspace(sectionId, pageConfig);
  contentElement.appendChild(workspace);
}

function init() {
  renderNavigation();

  if (activeSectionId) {
    renderSection(activeSectionId);
  } else {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Add sections in assets/js/data/sections.js to get started.";
    contentElement.appendChild(empty);
  }
}

init();
