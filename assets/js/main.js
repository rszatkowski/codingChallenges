import { sections } from "./data/sections.js";
import { contentBySection } from "./content/index.js";
import { simulationBySection } from "./tests/index.js";

const navElement = document.querySelector("#section-nav");
const contentElement = document.querySelector("#section-content");

const practiceState = new Map();
let activeSectionId = sections[0]?.id ?? null;

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

function renderNavigation() {
  navElement.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const section of sections) {
    const button = createSectionButton(section);
    fragment.appendChild(button);
  }

  navElement.appendChild(fragment);
}

function renderNotes(notes = []) {
  if (!notes.length) {
    return null;
  }

  const fragment = document.createDocumentFragment();

  for (const note of notes) {
    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title;
    card.appendChild(title);

    const list = document.createElement("ul");
    for (const item of note.items) {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      list.appendChild(listItem);
    }

    card.appendChild(list);
    fragment.appendChild(card);
  }

  return fragment;
}

function renderExercise(exercise) {
  if (!exercise) {
    return null;
  }

  const wrapper = document.createElement("article");
  wrapper.className = "exercise-card";

  const heading = document.createElement("h3");
  heading.textContent = "Exercise";
  wrapper.appendChild(heading);

  const prompt = document.createElement("p");
  prompt.textContent = exercise.prompt;
  wrapper.appendChild(prompt);

  const code = document.createElement("pre");
  code.className = "code-snippet";
  code.textContent = exercise.starterCode.trim();
  wrapper.appendChild(code);

  return wrapper;
}

function renderPractice(sectionId) {
  const wrapper = document.createElement("article");
  wrapper.className = "practice-card";

  const heading = document.createElement("h3");
  heading.textContent = "Practice scratchpad";
  wrapper.appendChild(heading);

  const description = document.createElement("p");
  description.textContent =
    "Type anything you want to experiment with. Use the Run button to preview a simple simulation.";
  wrapper.appendChild(description);

  const textarea = document.createElement("textarea");
  const existingState = practiceState.get(sectionId);
  textarea.value = existingState?.input ?? "";
  wrapper.appendChild(textarea);

  const actions = document.createElement("div");
  actions.className = "practice-actions";

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.textContent = "Run";
  actions.appendChild(runButton);

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.textContent = "Reset";
  actions.appendChild(resetButton);

  wrapper.appendChild(actions);

  const output = document.createElement("div");
  output.className = "practice-output";
  output.textContent = existingState?.output ?? "";
  wrapper.appendChild(output);

  runButton.addEventListener("click", () => {
    const inputValue = textarea.value.trim();
    const simulator = simulationBySection[sectionId];
    const result = simulator ? simulator(inputValue) : "No simulation available yet.";

    practiceState.set(sectionId, {
      input: textarea.value,
      output: result,
    });

    output.textContent = result;
  });

  resetButton.addEventListener("click", () => {
    textarea.value = "";
    output.textContent = "";
    practiceState.set(sectionId, {
      input: "",
      output: "",
    });
  });

  return wrapper;
}

function renderSection(sectionId) {
  const section = sections.find((item) => item.id === sectionId);
  const content = contentBySection[sectionId];

  contentElement.innerHTML = "";

  if (!section || !content) {
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

  const description = document.createElement("p");
  description.textContent = section.description;
  header.appendChild(description);

  contentElement.appendChild(header);

  const notesFragment = renderNotes(content.notes);
  if (notesFragment) {
    const notesContainer = document.createElement("section");
    notesContainer.appendChild(notesFragment);
    contentElement.appendChild(notesContainer);
  }

  const exerciseCard = renderExercise(content.exercise);
  if (exerciseCard) {
    contentElement.appendChild(exerciseCard);
  }

  const practiceCard = renderPractice(sectionId);
  contentElement.appendChild(practiceCard);
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
