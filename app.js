"use strict";

const STORAGE_KEY = "wayfarer.characters.v1";
const ATTRIBUTE_KEYS = ["str", "dex", "end", "int", "edu", "soc"];
const ATTRIBUTE_LABELS = ["STR", "DEX", "END", "INT", "EDU", "SOC"];

const grid = document.querySelector("#character-grid");
const emptyState = document.querySelector("#empty-state");
const noResults = document.querySelector("#no-results");
const dialog = document.querySelector("#character-dialog");
const form = document.querySelector("#character-form");
const notice = document.querySelector("#app-notice");
const searchInput = document.querySelector("#character-search");
const exportButton = document.querySelector("#export-button");
let characters = [];
let storageError = null;

try {
  characters = loadCharacters();
} catch (error) {
  storageError = error;
}

function loadCharacters() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === null) return [];

  const parsed = JSON.parse(saved);
  const isValidCharacter = (character) => character
    && typeof character.id === "string"
    && typeof character.name === "string"
    && typeof character.species === "string"
    && typeof character.age === "string"
    && typeof character.homeworld === "string"
    && typeof character.career === "string"
    && typeof character.history === "string"
    && typeof character.notes === "string"
    && Array.isArray(character.skills)
    && character.skills.every((skill) => typeof skill === "string")
    && character.attributes
    && ATTRIBUTE_KEYS.every((key) => typeof character.attributes[key] === "string");

  if (!Array.isArray(parsed) || !parsed.every(isValidCharacter)) {
    throw new Error("Saved character data has an unexpected format. It was left unchanged.");
  }
  return parsed;
}

function saveCharacters() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

function showNotice(message, isError = false, persistent = false) {
  notice.textContent = message;
  notice.classList.toggle("error", isError);
  notice.hidden = false;
  window.clearTimeout(showNotice.timeoutId);
  if (!persistent) {
    showNotice.timeoutId = window.setTimeout(() => {
      notice.hidden = true;
    }, 4500);
  }
}

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = characters.filter((character) => {
    const searchable = [
      character.name,
      character.species,
      character.homeworld,
      character.career
    ].join(" ").toLocaleLowerCase();
    return searchable.includes(query);
  });

  document.querySelector("#crew-total").textContent = String(characters.length);
  document.querySelector("#nav-character-count").textContent = String(characters.length);
  document.querySelector("#career-total").textContent = String(
    characters.filter((character) => character.career.trim() || character.history.trim()).length
  );
  exportButton.disabled = characters.length === 0;
  emptyState.hidden = characters.length > 0 || query.length > 0;
  noResults.hidden = characters.length === 0 || filtered.length > 0;
  grid.hidden = filtered.length === 0;
  grid.innerHTML = filtered.map(renderCard).join("");
}

function renderCard(character) {
  const attributeHtml = ATTRIBUTE_KEYS.map((key, index) => {
    const value = character.attributes[key] === "" ? "—" : escapeHtml(character.attributes[key]);
    return `<div class="card-attribute"><span>${ATTRIBUTE_LABELS[index]}</span><strong>${value}</strong></div>`;
  }).join("");
  const details = [
    character.species,
    character.age === "" ? "" : `Age ${escapeHtml(character.age)}`,
    character.homeworld
  ].filter(Boolean);
  const career = character.career || "Career not set";
  const skillCount = character.skills.filter(Boolean).length;

  return `<article class="character-card">
    <button class="card-main" type="button" data-edit="${escapeHtml(character.id)}" aria-label="Edit ${escapeHtml(character.name)}">
      <div class="card-top">
        <span class="avatar" aria-hidden="true">${escapeHtml(getInitials(character.name))}</span>
        <span>
          <span class="card-label">CREW MEMBER</span>
          <span class="character-name">${escapeHtml(character.name)}</span>
        </span>
        <span class="card-edit-icon" aria-hidden="true">↗</span>
      </div>
      <span class="card-meta">${details.length
        ? details.map((detail) => `<span class="meta-item"><span class="meta-symbol" aria-hidden="true">·</span>${escapeHtml(detail)}</span>`).join("")
        : `<span class="meta-item">No profile details yet</span>`}</span>
    </button>
    <div class="card-attributes">${attributeHtml}</div>
    <div class="card-bottom"><span class="career-pill">${escapeHtml(career)}</span><span class="skill-count">${skillCount} skill${skillCount === 1 ? "" : "s"}</span></div>
    <div class="card-actions"><button class="text-button" type="button" data-delete="${escapeHtml(character.id)}" aria-label="Delete ${escapeHtml(character.name)}">Remove character</button></div>
  </article>`;
}

function resetForm() {
  form.reset();
  document.querySelector("#character-id").value = "";
  document.querySelector("#dialog-title").textContent = "New character";
}

function openEditor(character = null) {
  resetForm();
  if (character) {
    document.querySelector("#dialog-title").textContent = "Edit character";
    document.querySelector("#character-id").value = character.id;
    document.querySelector("#character-name").value = character.name;
    document.querySelector("#character-species").value = character.species;
    document.querySelector("#character-age").value = character.age;
    document.querySelector("#character-homeworld").value = character.homeworld;
    document.querySelector("#character-career").value = character.career;
    document.querySelector("#character-history").value = character.history;
    document.querySelector("#character-skills").value = character.skills.join("\n");
    document.querySelector("#character-notes").value = character.notes;
    ATTRIBUTE_KEYS.forEach((key) => {
      form.elements.namedItem(key).value = character.attributes[key];
    });
  }
  dialog.showModal();
  document.querySelector("#character-name").focus();
}

function readForm() {
  const formData = new FormData(form);
  const age = formData.get("age");
  const attributes = Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, String(formData.get(key) || "")]));

  return {
    id: String(formData.get("id") || crypto.randomUUID()),
    name: String(formData.get("name")).trim(),
    species: String(formData.get("species")).trim(),
    age: age === null ? "" : String(age),
    homeworld: String(formData.get("homeworld")).trim(),
    career: String(formData.get("career")).trim(),
    attributes,
    history: String(formData.get("history")).trim(),
    skills: String(formData.get("skills")).split(/\r?\n/).map((skill) => skill.trim()).filter(Boolean),
    notes: String(formData.get("notes")).trim(),
    updatedAt: new Date().toISOString()
  };
}

function handleSave(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const character = readForm();
  const previous = characters.slice();
  const existingIndex = characters.findIndex((entry) => entry.id === character.id);
  if (existingIndex === -1) {
    characters = [character, ...characters];
  } else {
    characters[existingIndex] = character;
  }

  try {
    saveCharacters();
  } catch (error) {
    characters = previous;
    showNotice(`Character could not be saved: ${error.message}`, true);
    return;
  }

  dialog.close();
  render();
  showNotice(existingIndex === -1 ? "Character added to your roster." : "Character record updated.");
}

function handleDelete(id) {
  const character = characters.find((entry) => entry.id === id);
  if (!character || !window.confirm(`Remove ${character.name} from this roster?`)) return;

  const previous = characters;
  characters = characters.filter((entry) => entry.id !== id);
  try {
    saveCharacters();
  } catch (error) {
    characters = previous;
    showNotice(`Character could not be removed: ${error.message}`, true);
    return;
  }
  render();
  showNotice(`${character.name} was removed from your roster.`);
}

function exportData() {
  const exportFile = new Blob([JSON.stringify({ version: 1, characters }, null, 2)], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(exportFile);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "wayfarer-characters.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

document.querySelector("#new-character-button").addEventListener("click", () => openEditor());
document.querySelector("#empty-create-button").addEventListener("click", () => openEditor());
document.querySelector("#close-dialog-button").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-dialog-button").addEventListener("click", () => dialog.close());
document.querySelector("#export-button").addEventListener("click", exportData);
searchInput.addEventListener("input", render);
form.addEventListener("submit", handleSave);

grid.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    const character = characters.find((entry) => entry.id === editButton.dataset.edit);
    if (character) openEditor(character);
  } else if (deleteButton) {
    handleDelete(deleteButton.dataset.delete);
  }
});

if (storageError) {
  document.querySelector("#new-character-button").disabled = true;
  document.querySelector("#empty-create-button").disabled = true;
}

render();
if (storageError) {
  showNotice(`Saved data could not be loaded: ${storageError.message}`, true, true);
}
