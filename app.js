"use strict";

const STORAGE_KEY = "wayfarer.characters.v1";
const ITEM_STORAGE_KEY = "wayfarer.items.v1";
const BUILT_IN_ITEM_IDS = new Set(BUILT_IN_ITEMS.map((item) => item.id));
const ATTRIBUTE_KEYS = ["str", "dex", "end", "int", "edu", "soc"];
const ATTRIBUTE_LABELS = ["STR", "DEX", "END", "INT", "EDU", "SOC"];
const HOMEWORLD_SKILLS = {
  "High-tech core world": ["Computer", "Grav Vehicles", "Streetwise"],
  "Water world": ["Watercraft", "Repair", "Athletics"],
  "Capital world": ["Carousing", "Grav Vehicle", "Liaison"],
  "Frontier colony": ["Driving", "Watercraft", "Survival"],
  "Inhospitable outpost": ["Repair", "Science", "Zero-G"],
  "Primitive backwater": ["Animals", "Recon", "Survival"]
};

const grid = document.querySelector("#character-grid");
const emptyState = document.querySelector("#empty-state");
const noResults = document.querySelector("#no-results");
const dialog = document.querySelector("#character-dialog");
const form = document.querySelector("#character-form");
const notice = document.querySelector("#app-notice");
const searchInput = document.querySelector("#character-search");
const exportButton = document.querySelector("#export-button");
const homeworldTypeInput = document.querySelector("#homeworld-type");
const homeworldSkillInput = document.querySelector("#homeworld-skill");
const careerTermsInput = document.querySelector("#career-terms");
const bonusBenefitsInput = document.querySelector("#bonus-benefits");
const agingTechDmInput = document.querySelector("#aging-tech-dm");
const termEventRows = document.querySelector("#term-event-rows");
const agingRows = document.querySelector("#aging-rows");
const benefitRows = document.querySelector("#benefit-rows");
const traitRows = document.querySelector("#trait-rows");
const itemsView = document.querySelector("#items-view");
const charactersView = document.querySelector("#characters-view");
const itemGrid = document.querySelector("#item-grid");
const itemSearchInput = document.querySelector("#item-search");
const itemCategoryFilter = document.querySelector("#item-category-filter");
const itemDialog = document.querySelector("#item-dialog");
const itemForm = document.querySelector("#item-form");
const itemNotice = document.querySelector("#item-notice");
const customCharacteristicsInput = document.querySelector("#custom-characteristics");
const inventoryItemSelect = document.querySelector("#inventory-item-select");
const inventoryItemQuantity = document.querySelector("#inventory-item-quantity");
const inventoryList = document.querySelector("#inventory-list");
const encumbranceSummary = document.querySelector("#encumbrance-summary");
let characters = [];
let items = [];
let currentInventory = [];
let storageError = null;
let itemStorageError = null;

try {
  characters = loadCharacters();
} catch (error) {
  storageError = error;
}

try {
  items = loadItems();
} catch (error) {
  itemStorageError = error;
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
    && (character.inventory === undefined || (Array.isArray(character.inventory) && character.inventory.every(isValidInventoryEntry)))
    && character.attributes
    && (character.generation === undefined || isValidGeneration(character.generation))
    && ATTRIBUTE_KEYS.every((key) => typeof character.attributes[key] === "string");

  if (!Array.isArray(parsed) || !parsed.every(isValidCharacter)) {
    throw new Error("Saved character data has an unexpected format. It was left unchanged.");
  }
  return parsed;
}

function loadItems() {
  const saved = window.localStorage.getItem(ITEM_STORAGE_KEY);
  if (saved === null) return [];

  const parsed = JSON.parse(saved);
  const isOptionalInteger = (value, minimum, maximum = Number.MAX_SAFE_INTEGER) => value === ""
    || (/^\d+$/.test(value) && Number(value) >= minimum && Number(value) <= maximum);
  const isValidItem = (item) => item
    && typeof item.id === "string"
    && typeof item.name === "string"
    && ["Equipment", "Armor", "Cybernetics", "Pharmaceuticals", "Robots", "Vehicles", "Weapons", "Other"].includes(item.category)
    && typeof item.techLevel === "string"
    && isOptionalInteger(item.techLevel, 0, 33)
    && typeof item.cost === "string"
    && isOptionalInteger(item.cost, 0)
    && typeof item.description === "string"
    && (item.reference === undefined || typeof item.reference === "string")
    && (item.encumbrance === undefined || (Number.isFinite(item.encumbrance) && item.encumbrance >= 0))
    && (item.wornEncumbrance === undefined || (Number.isFinite(item.wornEncumbrance) && item.wornEncumbrance >= 0))
    && (item.capacityMultiplier === undefined || (Number.isFinite(item.capacityMultiplier) && item.capacityMultiplier >= 1))
    && (item.protection === undefined || typeof item.protection === "string")
    && (item.skill === undefined || typeof item.skill === "string");

  if (!Array.isArray(parsed) || !parsed.every(isValidItem)) {
    throw new Error("Saved item data has an unexpected format. It was left unchanged.");
  }
  return parsed;
}

function isValidInventoryEntry(entry) {
  return entry
    && typeof entry.itemId === "string"
    && typeof entry.name === "string"
    && Number.isInteger(entry.quantity)
    && entry.quantity >= 1
    && Number.isFinite(entry.encumbrance)
    && entry.encumbrance >= 0
    && (entry.wornEncumbrance === null || Number.isFinite(entry.wornEncumbrance))
    && Number.isFinite(entry.capacityMultiplier)
    && entry.capacityMultiplier >= 1
    && typeof entry.worn === "boolean"
    && (entry.category === undefined || typeof entry.category === "string")
    && (entry.protection === undefined || typeof entry.protection === "string")
    && (entry.skill === undefined || typeof entry.skill === "string");
}

function allItems() {
  return [...BUILT_IN_ITEMS, ...items];
}

function isValidGeneration(generation) {
  const isText = (value) => typeof value === "string";
  const isValidRoll = (value, minimum, maximum) => isText(value)
    && (value === "" || (/^\d+$/.test(value) && Number(value) >= minimum && Number(value) <= maximum));
  const isRollEntry = (entry) => entry
    && isValidRoll(entry.roll, 2, 12)
    && isText(entry.outcome);
  const agingCount = generation && Math.max(0, generation.terms - 3);
  return generation
    && Number.isInteger(generation.terms)
    && generation.terms >= 0
    && generation.terms <= 7
    && Number.isInteger(generation.bonusBenefits)
    && generation.bonusBenefits >= 0
    && generation.bonusBenefits <= 20
    && Number.isInteger(generation.agingTechDm)
    && generation.agingTechDm >= 0
    && generation.agingTechDm <= 3
    && isText(generation.homeworldType)
    && isText(generation.homeworldSkill)
    && (generation.homeworldType === ""
      ? generation.homeworldSkill === ""
      : Object.hasOwn(HOMEWORLD_SKILLS, generation.homeworldType)
        && (generation.homeworldSkill === "" || HOMEWORLD_SKILLS[generation.homeworldType].includes(generation.homeworldSkill)))
    && Array.isArray(generation.events)
    && generation.events.length === generation.terms
    && generation.events.every(isRollEntry)
    && Array.isArray(generation.aging)
    && generation.aging.length === agingCount
    && generation.aging.every((entry) => entry
      && Number.isInteger(entry.term)
      && entry.term >= 4
      && entry.term <= 7
      && isValidRoll(entry.roll, 2, 12)
      && isRollEntry(entry))
    && Array.isArray(generation.benefits)
    && generation.benefits.length === 1 + generation.terms + generation.bonusBenefits
    && generation.benefits.every((entry) => entry
      && ["cash", "material", "rank"].includes(entry.table)
      && isValidRoll(entry.roll, 1, 6)
      && isText(entry.outcome))
    && Array.isArray(generation.traits)
    && generation.traits.length <= Math.ceil(generation.terms / 2)
    && generation.traits.every(isText);
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

function showNotice(message, isError = false, persistent = false, target = notice) {
  target.textContent = message;
  target.classList.toggle("error", isError);
  target.hidden = false;
  window.clearTimeout(target.noticeTimeoutId);
  if (!persistent) {
    target.noticeTimeoutId = window.setTimeout(() => {
      target.hidden = true;
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
  exportButton.disabled = characters.length === 0 && allItems().length === 0;
  document.querySelector("#nav-item-count").textContent = String(allItems().length);
  document.querySelector("#catalog-count").textContent = String(allItems().length);
  emptyState.hidden = characters.length > 0 || query.length > 0;
  noResults.hidden = characters.length === 0 || filtered.length > 0;
  grid.hidden = filtered.length === 0;
  grid.innerHTML = filtered.map(renderCard).join("");
  renderItems();
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
  const load = getEncumbrance(character);
  const armor = (character.inventory || []).filter((entry) => entry.worn && getInventoryItem(entry.itemId)?.category === "Armor");
  const armorSummary = armor.map((entry) => {
    const item = getInventoryItem(entry.itemId);
    return item && item.protection ? `${item.name} · Protection ${item.protection}` : "";
  }).filter(Boolean);

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
    ${armorSummary.length ? `<div class="character-load">Worn armor: ${armorSummary.map(escapeHtml).join(", ")}</div>` : ""}
    <div class="character-load ${load.statusClass}">${load.used} / ${load.lightLimit} items · ${escapeHtml(load.label)}</div>
    <div class="card-actions"><button class="text-button" type="button" data-delete="${escapeHtml(character.id)}" aria-label="Delete ${escapeHtml(character.name)}">Remove character</button></div>
  </article>`;
}

function getCharacteristicDm(score) {
  if (!Number.isFinite(score)) return 0;
  if (score <= 2) return -2;
  if (score <= 5) return -1;
  return Math.floor((score - 6) / 3);
}

function effectiveItemEncumbrance(entry) {
  return entry.worn && entry.wornEncumbrance !== null
    ? entry.wornEncumbrance
    : entry.encumbrance;
}

function getEncumbrance(character) {
  const strength = Number(character.attributes.str || 0);
  const lightLimit = Math.max(1, 7 + getCharacteristicDm(strength));
  const inventory = character.inventory || [];
  const used = inventory.reduce((total, entry) => total + effectiveItemEncumbrance(entry) * entry.quantity, 0);
  const capacityMultiplier = inventory.reduce((multiplier, entry) => (
    entry.worn ? Math.max(multiplier, entry.capacityMultiplier) : multiplier
  ), 1);
  const heavyLimit = lightLimit * 3 * capacityMultiplier;
  if (used <= lightLimit * capacityMultiplier) {
    return { used, lightLimit: lightLimit * capacityMultiplier, heavyLimit, label: "Light load", statusClass: "load-light" };
  }
  if (used <= heavyLimit) {
    return { used, lightLimit: lightLimit * capacityMultiplier, heavyLimit, label: "Heavy load · DM-2 physical tasks, one move action", statusClass: "load-heavy" };
  }
  return { used, lightLimit: lightLimit * capacityMultiplier, heavyLimit, label: "Over capacity", statusClass: "load-over" };
}

function getInventoryItem(itemId) {
  return allItems().find((item) => item.id === itemId);
}

function renderInventory() {
  const availableItems = allItems().slice().sort((left, right) => left.name.localeCompare(right.name));
  const previousSelection = inventoryItemSelect.value;
  inventoryItemSelect.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = availableItems.length ? "Select an item" : "No catalog items";
  inventoryItemSelect.append(placeholder);
  availableItems.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name}${item.category === "Armor" && item.protection ? ` · Protection ${item.protection}` : ""}`;
    inventoryItemSelect.append(option);
  });
  inventoryItemSelect.value = availableItems.some((item) => item.id === previousSelection) ? previousSelection : "";
  document.querySelector("#add-inventory-item-button").disabled = availableItems.length === 0;

  inventoryList.innerHTML = currentInventory.map((entry, index) => {
    const item = getInventoryItem(entry.itemId);
    const name = item ? item.name : entry.name;
    const unitLoad = effectiveItemEncumbrance(entry);
    const canWear = entry.wornEncumbrance !== null;
    return `<article class="inventory-row">
      <div class="inventory-item-name">
        <strong>${escapeHtml(name)}</strong>
        <small>${unitLoad} item${unitLoad === 1 ? "" : "s"} each${entry.skill ? ` · ${escapeHtml(entry.skill)}` : ""}${item && item.protection ? ` · Protection ${escapeHtml(String(item.protection))}` : ""}</small>
      </div>
      <label class="inventory-quantity-control">
        <span class="visually-hidden">Quantity of ${escapeHtml(name)}</span>
        <input type="number" min="1" max="999" value="${entry.quantity}" data-inventory-quantity="${index}">
      </label>
      ${canWear
        ? `<label class="inventory-worn-control"><input type="checkbox" data-inventory-worn="${index}" ${entry.worn ? "checked" : ""}><span>Worn</span></label>`
        : ""}
      <button class="text-button" type="button" data-remove-inventory="${index}" aria-label="Remove ${escapeHtml(name)}">Remove</button>
    </article>`;
  }).join("");

  const summary = getEncumbrance({
    attributes: Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, form.elements.namedItem(key).value])),
    inventory: currentInventory
  });
  encumbranceSummary.className = `encumbrance-summary ${summary.statusClass}`;
  encumbranceSummary.innerHTML = `<strong>${summary.used} / ${summary.lightLimit} major items · ${summary.label}</strong>
    <span>STR DM ${getCharacteristicDm(Number(form.elements.namedItem("str").value || 0)) >= 0 ? "+" : ""}${getCharacteristicDm(Number(form.elements.namedItem("str").value || 0))}. Light load: up to 7 + STR DM. Heavy load: above light load to three times that limit; apply DM-2 to physical task throws and allow at most one move action per combat round.</span>`;
}

function addInventoryItem() {
  const item = getInventoryItem(inventoryItemSelect.value);
  const quantity = Number(inventoryItemQuantity.value);
  if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) return;

  const existing = currentInventory.find((entry) => entry.itemId === item.id && !entry.worn);
  if (existing) {
    existing.quantity = Math.min(999, existing.quantity + quantity);
  } else {
    currentInventory.push({
      itemId: item.id,
      name: item.name,
      quantity,
      encumbrance: item.encumbrance ?? 1,
      wornEncumbrance: item.wornEncumbrance ?? null,
      capacityMultiplier: item.capacityMultiplier ?? 1,
      category: item.category,
      protection: item.protection ? String(item.protection) : "",
      skill: item.skill || "",
      worn: false
    });
  }
  renderInventory();
}

function updateInventoryEntry(event) {
  const quantityInput = event.target.closest("[data-inventory-quantity]");
  const wornInput = event.target.closest("[data-inventory-worn]");
  if (quantityInput) {
    const entry = currentInventory[Number(quantityInput.dataset.inventoryQuantity)];
    const quantity = Number(quantityInput.value);
    if (entry && Number.isInteger(quantity) && quantity >= 1 && quantity <= 999) {
      entry.quantity = quantity;
    }
    renderInventory();
  } else if (wornInput) {
    const entry = currentInventory[Number(wornInput.dataset.inventoryWorn)];
    if (entry) {
      entry.worn = wornInput.checked;
      renderInventory();
    }
  }
}

function removeInventoryItem(event) {
  const button = event.target.closest("[data-remove-inventory]");
  if (!button) return;
  currentInventory.splice(Number(button.dataset.removeInventory), 1);
  renderInventory();
}

function renderItems() {
  const query = itemSearchInput.value.trim().toLocaleLowerCase();
  const category = itemCategoryFilter.value;
  const catalog = allItems();
  const filtered = catalog.filter((item) => {
    const matchesQuery = [item.name, item.category, item.description, item.reference || ""].join(" ").toLocaleLowerCase().includes(query);
    return matchesQuery && (!category || item.category === category);
  });
  const itemEmptyState = document.querySelector("#item-empty-state");
  const itemNoResults = document.querySelector("#item-no-results");

  itemEmptyState.hidden = catalog.length > 0 || query.length > 0 || category !== "";
  itemNoResults.hidden = catalog.length === 0 || filtered.length > 0;
  itemGrid.hidden = filtered.length === 0;
  itemGrid.innerHTML = filtered.map(renderItemCard).join("");
}

function validateCharacteristics() {
  const inputs = ATTRIBUTE_KEYS.map((key) => form.elements.namedItem(key));
  const values = inputs.map((input) => input.value);
  const isStandardArray = values.every((value) => value !== "")
    && values.every((value) => Number.isInteger(Number(value)) && Number(value) >= 5 && Number(value) <= 10)
    && new Set(values).size === 6;
  const message = customCharacteristicsInput.checked || isStandardArray
    ? ""
    : "Assign each standard score (5, 6, 7, 8, 9, and 10) exactly once, or check Allow custom characteristics.";
  inputs.forEach((input) => input.setCustomValidity(message));
  return customCharacteristicsInput.checked || isStandardArray;
}

function renderItemCard(item) {
  const isBuiltIn = BUILT_IN_ITEM_IDS.has(item.id);
  const details = [
    item.techLevel === "" ? "" : `TL ${escapeHtml(item.techLevel)}`,
    item.cost === "" ? "" : `Cr ${Number(item.cost).toLocaleString()}`,
    `${item.encumbrance ?? 1} item${item.encumbrance === 1 ? "" : "s"}`,
    item.protection ? `Protection ${escapeHtml(String(item.protection))}` : "",
    item.skill ? escapeHtml(item.skill) : "",
    item.capacityMultiplier > 1 ? `Capacity ×${item.capacityMultiplier} when worn` : ""
  ].filter(Boolean);
  return `<article class="character-card item-card">
    <div class="item-card-content">
      <div class="card-top">
        <span class="avatar item-avatar" aria-hidden="true">▤</span>
        <span class="item-title-group">
          <span class="card-label">${escapeHtml(item.category.toLocaleUpperCase())}${isBuiltIn ? " · BUILT-IN" : ""}</span>
          <strong class="character-name">${escapeHtml(item.name)}</strong>
        </span>
      </div>
      <div class="item-meta">${details.length
        ? details.map((detail) => `<span>${detail}</span>`).join("")
        : "<span>No tech level or cost recorded</span>"}</div>
      ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ""}
      ${item.reference ? `<p class="item-reference">${escapeHtml(item.reference)}</p>` : ""}
      ${item.group ? `<p class="item-reference">${escapeHtml(item.group)}</p>` : ""}
    </div>
    ${isBuiltIn
      ? `<div class="card-actions"><span class="item-built-in-note">Catalog entry</span></div>`
      : `<div class="card-actions">
        <button class="text-button item-edit-button" type="button" data-edit-item="${escapeHtml(item.id)}">Edit</button>
        <button class="text-button" type="button" data-delete-item="${escapeHtml(item.id)}">Remove item</button>
      </div>`}
  </article>`;
}

function openItemEditor(item = null) {
  itemForm.reset();
  document.querySelector("#item-id").value = "";
  document.querySelector("#item-dialog-title").textContent = "Add item";
  if (item) {
    document.querySelector("#item-dialog-title").textContent = "Edit item";
    document.querySelector("#item-id").value = item.id;
    document.querySelector("#item-name").value = item.name;
    document.querySelector("#item-category").value = item.category;
    document.querySelector("#item-tech-level").value = item.techLevel;
    document.querySelector("#item-cost").value = item.cost;
    document.querySelector("#item-reference").value = item.reference || "";
    document.querySelector("#item-encumbrance").value = String(item.encumbrance ?? 1);
    document.querySelector("#item-protection").value = item.protection || "";
    document.querySelector("#item-skill").value = item.skill || "";
    document.querySelector("#item-worn-encumbrance").value = item.wornEncumbrance === undefined ? "" : String(item.wornEncumbrance);
    document.querySelector("#item-description").value = item.description;
  }
  itemDialog.showModal();
  document.querySelector("#item-name").focus();
}

function readItemForm() {
  const formData = new FormData(itemForm);
  const cost = formData.get("cost");
  const techLevel = formData.get("techLevel");
  const wornEncumbrance = formData.get("wornEncumbrance");
  return {
    id: String(formData.get("id") || crypto.randomUUID()),
    name: String(formData.get("name")).trim(),
    category: String(formData.get("category")),
    techLevel: techLevel === null ? "" : String(techLevel),
    cost: cost === null ? "" : String(cost),
    reference: String(formData.get("reference")).trim(),
    encumbrance: Number(formData.get("encumbrance") || 0),
    wornEncumbrance: wornEncumbrance === null || wornEncumbrance === "" ? undefined : Number(wornEncumbrance),
    protection: String(formData.get("protection")).trim(),
    skill: String(formData.get("skill")).trim(),
    description: String(formData.get("description")).trim(),
    updatedAt: new Date().toISOString()
  };
}

function saveItem(event) {
  event.preventDefault();
  if (!itemForm.reportValidity()) return;

  const item = readItemForm();
  const previous = items.slice();
  const existingIndex = items.findIndex((entry) => entry.id === item.id);
  if (existingIndex === -1) {
    items = [item, ...items];
  } else {
    items[existingIndex] = item;
  }

  try {
    window.localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    items = previous;
    showNotice(`Item could not be saved: ${error.message}`, true, false, itemNotice);
    return;
  }
  itemDialog.close();
  render();
  showNotice(existingIndex === -1 ? "Item added to your catalog." : "Item updated.", false, false, itemNotice);
}

function deleteItem(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Remove ${item.name} from this catalog?`)) return;

  const previous = items;
  items = items.filter((entry) => entry.id !== id);
  try {
    window.localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    items = previous;
    showNotice(`Item could not be removed: ${error.message}`, true, false, itemNotice);
    return;
  }
  render();
  showNotice(`${item.name} was removed from your catalog.`, false, false, itemNotice);
}

function showView(view) {
  const showingItems = view === "items";
  charactersView.hidden = showingItems;
  itemsView.hidden = !showingItems;
  document.querySelector("#characters-nav-button").classList.toggle("active", !showingItems);
  document.querySelector("#items-nav-button").classList.toggle("active", showingItems);
  document.querySelector("#characters-nav-button").toggleAttribute("aria-current", !showingItems);
  document.querySelector("#items-nav-button").toggleAttribute("aria-current", showingItems);
  document.querySelector("#page-section-label").textContent = showingItems ? "ITEMS" : "CHARACTERS";
}

function updateHomeworldSkillOptions(selectedSkill = "") {
  const skills = HOMEWORLD_SKILLS[homeworldTypeInput.value] || [];
  homeworldSkillInput.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = skills.length ? "Choose a skill" : "Choose a type first";
  homeworldSkillInput.append(placeholder);

  skills.forEach((skill) => {
    const option = document.createElement("option");
    option.value = skill;
    option.textContent = `${skill} 1`;
    homeworldSkillInput.append(option);
  });
  homeworldSkillInput.disabled = skills.length === 0;
  homeworldSkillInput.value = skills.includes(selectedSkill) ? selectedSkill : "";
}

function readGeneration() {
  const numericValue = (input, maximum) => {
    const value = Number(input.value || 0);
    return Number.isFinite(value) ? Math.min(maximum, Math.max(0, Math.floor(value))) : 0;
  };
  const terms = numericValue(careerTermsInput, 7);
  const bonusBenefits = numericValue(bonusBenefitsInput, 20);
  return {
    homeworldType: homeworldTypeInput.value,
    homeworldSkill: homeworldSkillInput.value,
    terms,
    bonusBenefits,
    agingTechDm: numericValue(agingTechDmInput, 3),
    events: Array.from(termEventRows.querySelectorAll("[data-event-roll]"), (input) => ({
      roll: input.value,
      outcome: document.querySelector(`#event-outcome-${input.dataset.eventRoll}`).value.trim()
    })),
    aging: Array.from(agingRows.querySelectorAll("[data-aging-roll]"), (input) => {
      const term = Number(input.dataset.agingRoll);
      return {
        term,
        roll: input.value,
        outcome: document.querySelector(`#aging-outcome-${term}`).value.trim()
      };
    }),
    benefits: Array.from(benefitRows.querySelectorAll("[data-benefit-table]"), (select) => ({
      table: select.value,
      roll: document.querySelector(`#benefit-roll-${select.dataset.benefitTable}`).value,
      outcome: document.querySelector(`#benefit-outcome-${select.dataset.benefitTable}`).value.trim()
    })),
    traits: Array.from(traitRows.querySelectorAll("[data-trait]"), (input) => input.value.trim()).filter(Boolean)
  };
}

function renderGenerationRows(generation = readGeneration()) {
  const { terms, bonusBenefits, agingTechDm } = generation;
  termEventRows.innerHTML = Array.from({ length: terms }, (_, index) => {
    const entry = generation.events[index] || { roll: "", outcome: "" };
    const number = index + 1;
    return `<article class="generation-row">
      <div class="generation-row-heading"><strong>Term ${number} event · 2D6</strong>
        <div class="dice-entry">
          <label class="visually-hidden" for="event-roll-${index}">Term ${number} event roll</label>
          <input id="event-roll-${index}" data-event-roll="${index}" type="number" min="2" max="12" value="${escapeHtml(entry.roll)}" inputmode="numeric">
          <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="event-roll-${index}">Roll 2D6</button>
        </div>
      </div>
      <label class="field"><span>Event outcome / effect notes</span>
        <input id="event-outcome-${index}" maxlength="240" value="${escapeHtml(entry.outcome)}" placeholder="Look up the result in the career table">
      </label>
    </article>`;
  }).join("");

  agingRows.innerHTML = Array.from({ length: Math.max(0, terms - 3) }, (_, index) => {
    const term = index + 4;
    const entry = generation.aging.find((record) => record.term === term) || { roll: "", outcome: "" };
    return `<article class="generation-row aging-row">
      <div class="generation-row-heading"><strong>End of term ${term} aging · 2D6</strong>
        <div class="dice-entry">
          <label class="visually-hidden" for="aging-roll-${term}">Term ${term} aging roll</label>
          <input id="aging-roll-${term}" data-aging-roll="${term}" type="number" min="2" max="12" value="${escapeHtml(entry.roll)}" inputmode="numeric">
          <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="aging-roll-${term}">Roll 2D6</button>
        </div>
      </div>
      <p class="aging-preview" id="aging-preview-${term}" aria-live="polite"></p>
      <label class="field"><span>Characteristic changes / notes</span>
        <input id="aging-outcome-${term}" maxlength="240" value="${escapeHtml(entry.outcome)}" placeholder="Record the affected characteristics">
      </label>
    </article>`;
  }).join("");

  const benefitCount = 1 + terms + bonusBenefits;
  benefitRows.innerHTML = `<p class="generation-subheading">Mustering out · ${benefitCount} benefit roll${benefitCount === 1 ? "" : "s"}</p>`
    + Array.from({ length: benefitCount }, (_, index) => {
      const entry = generation.benefits[index] || { table: "material", roll: "", outcome: "" };
      return `<article class="generation-row benefit-row">
        <div class="generation-row-heading"><strong>Benefit ${index + 1}</strong>
          <div class="benefit-controls">
            <label class="visually-hidden" for="benefit-table-${index}">Benefit ${index + 1} type</label>
            <select id="benefit-table-${index}" data-benefit-table="${index}">
              <option value="material" ${entry.table === "material" ? "selected" : ""}>Material</option>
              <option value="cash" ${entry.table === "cash" ? "selected" : ""}>Cash</option>
              <option value="rank" ${entry.table === "rank" ? "selected" : ""}>Rank</option>
            </select>
            <label class="visually-hidden" for="benefit-roll-${index}">Benefit ${index + 1} 1D6 roll</label>
            <input id="benefit-roll-${index}" data-benefit-roll type="number" min="1" max="6" value="${escapeHtml(entry.roll)}" inputmode="numeric">
            <button class="button button-quiet dice-button" type="button" data-roll-sides="1" data-roll-target="benefit-roll-${index}">Roll 1D6</button>
          </div>
        </div>
        <label class="field"><span>Benefit received</span>
          <input id="benefit-outcome-${index}" maxlength="160" value="${escapeHtml(entry.outcome)}" placeholder="Look up the result in the career table">
        </label>
      </article>`;
    }).join("");
  benefitRows.querySelectorAll("[data-benefit-table]").forEach(updateBenefitControls);

  const traitCount = Math.ceil(terms / 2);
  const currentTraits = generation.traits || [];
  traitRows.innerHTML = traitCount
    ? `<p class="generation-subheading">Traits · choose up to ${traitCount}</p>`
      + Array.from({ length: traitCount }, (_, index) => `
        <label class="field trait-field"><span>Trait ${index + 1}</span>
          <input data-trait type="text" maxlength="80" value="${escapeHtml(currentTraits[index] || "")}" placeholder="Record a trait that meets its prerequisite">
        </label>`).join("")
    : "";

  updateAgingPreviews();
}

function updateBenefitControls(select) {
  const row = select.closest(".benefit-row");
  const isRankBenefit = select.value === "rank";
  const rollInput = row.querySelector("[data-benefit-roll]");
  const rollButton = row.querySelector("[data-roll-sides]");
  if (isRankBenefit) rollInput.value = "";
  rollInput.disabled = isRankBenefit;
  rollButton.disabled = isRankBenefit;
}

function updateAgingPreviews() {
  const terms = Math.min(7, Math.max(0, Number(careerTermsInput.value || 0)));
  const technologyDm = Number(agingTechDmInput.value || 0);
  for (let term = 4; term <= terms; term += 1) {
    const roll = document.querySelector(`#aging-roll-${term}`);
    const preview = document.querySelector(`#aging-preview-${term}`);
    if (!roll || !preview) continue;

    if (!roll.value) {
      preview.textContent = `Modifier: ${technologyDm - term} (term penalty ${-term}, technology DM +${technologyDm}).`;
      continue;
    }

    const total = Number(roll.value) - term + technologyDm;
    const effect = total <= -6 ? "three physical characteristics reduced by 2 and one mental characteristic by 1"
      : total === -5 ? "three physical characteristics reduced by 2"
        : total === -4 ? "two physical characteristics reduced by 2, one by 1"
          : total === -3 ? "one physical characteristic reduced by 2, two by 1"
            : total === -2 ? "three physical characteristics reduced by 1"
              : total === -1 ? "two physical characteristics reduced by 1"
                : total === 0 ? "one physical characteristic reduced by 1"
                  : "no aging reduction";
    preview.textContent = `Adjusted result ${total}: ${effect}. Choose affected characteristics and record changes below.`;
  }
}

function resetForm() {
  form.reset();
  document.querySelector("#character-id").value = "";
  document.querySelector("#dialog-title").textContent = "New character";
  currentInventory = [];
  [5, 6, 7, 8, 9, 10].forEach((value, index) => {
    form.elements.namedItem(ATTRIBUTE_KEYS[index]).value = String(value);
  });
  customCharacteristicsInput.checked = false;
  validateCharacteristics();
  updateHomeworldSkillOptions();
  renderInventory();
  renderGenerationRows({
    homeworldType: "",
    homeworldSkill: "",
    terms: 0,
    bonusBenefits: 0,
    agingTechDm: 0,
    events: [],
    aging: [],
    benefits: [{ table: "material", roll: "", outcome: "" }],
    traits: []
  });
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
    currentInventory = (character.inventory || []).map((entry) => ({ ...entry }));
    ATTRIBUTE_KEYS.forEach((key) => {
      form.elements.namedItem(key).value = character.attributes[key];
    });
    customCharacteristicsInput.checked = character.generation?.customCharacteristics === true;
    const generation = character.generation || {
      homeworldType: "",
      homeworldSkill: "",
      terms: 0,
      bonusBenefits: 0,
      agingTechDm: 0,
      events: [],
      aging: [],
      benefits: [{ table: "material", roll: "", outcome: "" }],
      traits: []
    };
    homeworldTypeInput.value = generation.homeworldType;
    updateHomeworldSkillOptions(generation.homeworldSkill);
    careerTermsInput.value = String(generation.terms);
    bonusBenefitsInput.value = String(generation.bonusBenefits);
    agingTechDmInput.value = String(generation.agingTechDm);
    renderGenerationRows(generation);
    renderInventory();
  }
  dialog.showModal();
  document.querySelector("#character-name").focus();
}

function readForm() {
  const formData = new FormData(form);
  const age = formData.get("age");
  const attributes = Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, String(formData.get(key) || "")]));
  const generation = readGeneration();
  const skills = String(formData.get("skills")).split(/\r?\n/).map((skill) => skill.trim()).filter(Boolean);
  if (generation.homeworldSkill) {
    const alreadyRecorded = skills.some((skill) => skill.replace(/\s+\d+$/, "").trim().toLocaleLowerCase()
      === generation.homeworldSkill.toLocaleLowerCase());
    if (!alreadyRecorded) skills.unshift(`${generation.homeworldSkill} 1`);
  }

  return {
    id: String(formData.get("id") || crypto.randomUUID()),
    name: String(formData.get("name")).trim(),
    species: String(formData.get("species")).trim(),
    age: age === null ? "" : String(age),
    homeworld: String(formData.get("homeworld")).trim(),
    career: String(formData.get("career")).trim(),
    attributes,
    history: String(formData.get("history")).trim(),
    skills,
    notes: String(formData.get("notes")).trim(),
    generation: { ...generation, customCharacteristics: customCharacteristicsInput.checked },
    inventory: currentInventory.map((entry) => ({ ...entry })),
    updatedAt: new Date().toISOString()
  };
}

function handleSave(event) {
  event.preventDefault();
  validateCharacteristics();
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
  const exportFile = new Blob([JSON.stringify({ version: 1, characters, items: allItems() }, null, 2)], { type: "application/json" });
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
document.querySelector("#standard-array-button").addEventListener("click", () => {
  [5, 6, 7, 8, 9, 10].forEach((value, index) => {
    form.elements.namedItem(ATTRIBUTE_KEYS[index]).value = String(value);
  });
  validateCharacteristics();
});
customCharacteristicsInput.addEventListener("change", () => {
  if (!customCharacteristicsInput.checked) {
    const values = ATTRIBUTE_KEYS.map((key) => Number(form.elements.namedItem(key).value));
    const isStandardArray = values.length === 6
      && values.every((value) => Number.isInteger(value) && value >= 5 && value <= 10)
      && new Set(values).size === 6;
    if (!isStandardArray) {
      [5, 6, 7, 8, 9, 10].forEach((value, index) => {
        form.elements.namedItem(ATTRIBUTE_KEYS[index]).value = String(value);
      });
    }
  }
  validateCharacteristics();
});
ATTRIBUTE_KEYS.forEach((key) => form.elements.namedItem(key).addEventListener("input", () => {
  validateCharacteristics();
  renderInventory();
}));
searchInput.addEventListener("input", render);
form.addEventListener("submit", handleSave);
document.querySelector("#characters-nav-button").addEventListener("click", () => showView("characters"));
document.querySelector("#items-nav-button").addEventListener("click", () => showView("items"));
document.querySelector("#add-inventory-item-button").addEventListener("click", addInventoryItem);
inventoryList.addEventListener("change", updateInventoryEntry);
inventoryList.addEventListener("click", removeInventoryItem);
document.querySelector("#new-item-button").addEventListener("click", () => openItemEditor());
document.querySelector("#empty-add-item-button").addEventListener("click", () => openItemEditor());
document.querySelector("#close-item-dialog-button").addEventListener("click", () => itemDialog.close());
document.querySelector("#cancel-item-dialog-button").addEventListener("click", () => itemDialog.close());
itemForm.addEventListener("submit", saveItem);
itemSearchInput.addEventListener("input", renderItems);
itemCategoryFilter.addEventListener("change", renderItems);
itemGrid.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-item]");
  const deleteButton = event.target.closest("[data-delete-item]");
  if (editButton) {
    const item = items.find((entry) => entry.id === editButton.dataset.editItem);
    if (item) openItemEditor(item);
  } else if (deleteButton) {
    deleteItem(deleteButton.dataset.deleteItem);
  }
});
form.addEventListener("change", (event) => {
  const benefitType = event.target.closest("[data-benefit-table]");
  if (benefitType) updateBenefitControls(benefitType);
});
form.addEventListener("input", (event) => {
  if (event.target.matches("[data-aging-roll]")) updateAgingPreviews();
});
homeworldTypeInput.addEventListener("change", () => updateHomeworldSkillOptions());
careerTermsInput.addEventListener("input", () => renderGenerationRows(readGeneration()));
bonusBenefitsInput.addEventListener("input", () => renderGenerationRows(readGeneration()));
agingTechDmInput.addEventListener("change", updateAgingPreviews);
form.addEventListener("click", (event) => {
  const rollButton = event.target.closest("[data-roll-sides]");
  if (!rollButton) return;

  const sides = Number(rollButton.dataset.rollSides);
  const target = document.querySelector(`#${rollButton.dataset.rollTarget}`);
  if (!target || !Number.isInteger(sides) || sides < 1) return;
  const dice = sides === 2 ? 2 : 1;
  const result = Array.from({ length: dice }, () => Math.floor(Math.random() * 6) + 1)
    .reduce((total, die) => total + die, 0);
  target.value = String(result);
  target.dispatchEvent(new Event("input", { bubbles: true }));
  updateAgingPreviews();
});

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
if (itemStorageError) {
  document.querySelector("#new-item-button").disabled = true;
  document.querySelector("#empty-add-item-button").disabled = true;
}

render();
if (storageError) {
  showNotice(`Saved data could not be loaded: ${storageError.message}`, true, true);
}
if (itemStorageError) {
  showNotice(`Saved item data could not be loaded: ${itemStorageError.message}`, true, true, itemNotice);
}
