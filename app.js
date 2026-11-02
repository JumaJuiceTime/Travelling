"use strict";

const STORAGE_KEY = "wayfarer.characters.v1";
const ITEM_STORAGE_KEY = "wayfarer.items.v1";
const BUILT_IN_ITEM_IDS = new Set(BUILT_IN_ITEMS.map((item) => item.id));
const ATTRIBUTE_KEYS = ["str", "dex", "end", "int", "edu", "soc"];
const ATTRIBUTE_LABELS = ["STR", "DEX", "END", "INT", "EDU", "SOC"];
const MILITARY_CAREERS = new Set(["army", "marine", "navy"]);
const TRAIT_NAMES = [
  "Acrobat", "Animal Affinity", "Awareness", "Born Athlete", "Combat Medic", "Explosive Expert",
  "Ghost", "Hacker", "Hunter", "Juice", "Legal Eagle", "Machine Whisperer", "Master Tracker",
  "Merchant", "Palmgreaser", "Parkour", "Proper Etiquette", "Rescue Specialist", "Runner",
  "Scientist", "Sleight of Hand", "Smuggler", "Surgeon", "Thief", "Throwing Arm", "Tradecraft",
  "Crack Shot", "Defeat Armor", "Gunslinger", "Rapid Reaction", "Signature Weapon", "Sniper",
  "Spray N' Pray", "Armor Breaker", "Backstab", "Blind Fighting", "Grappler", "Legendary Charge",
  "High Energy Physics", "Weapon Handling", "Knows the Terrain", "Rally", "Inspirational",
  "Commander", "Berserker", "Shake It Off", "Close Quarters Combatant", "Combat Readiness",
  "Danger Sense", "Favored Enemy", "Hardy", "Hard to Kill", "Low Profile", "Vigilant", "Ace",
  "Easy Rider", "Jump Intuition", "Mr. Fix-It", "Mask Engine", "Miracle Worker", "Point Defender",
  "Sensor Ace", "Signature Vehicle", "Starship", "Stunt Driver", "Artistic", "Attractive",
  "Codebreaker", "Contacts", "Cyborg Compatibility", "Diplomat", "Eidetic Memory", "Empath",
  "Evasion", "Explorer's Society", "Fast Healing", "Immunity", "Intimidating", "Iron Liver",
  "Languages", "Latent Psion", "Packrat", "Radiation Resistant", "Scavenger King", "Strong-Willed",
  "Will to Live", "Lucky", "Navigator", "Protector", "Spot Weakness", "Trash Talk"
];
const EVENT_CHECK_SKILLS = [...new Set([
  ...Object.values(CAREER_DATA).flatMap((career) => [...career.service, ...career.specialist, ...career.advanced]),
  ...ATTRIBUTE_KEYS.map((key) => key.toUpperCase())
])].sort((a, b) => b.length - a.length);
const EVENT_CHECK_PATTERN = new RegExp(
  `\\b(${EVENT_CHECK_SKILLS.join("|")})\\s+(\\d+)\\+`,
  "gi"
);
const careerGenerationSection = document.querySelector("#career-generation-section");
const characterSheetRecord = document.querySelector("#character-sheet-record");
const characterSheetRecordContent = document.querySelector("#character-sheet-record-content");
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
const careerSkillRows = document.querySelector("#career-skill-rows");
const itemsView = document.querySelector("#items-view");
const charactersView = document.querySelector("#characters-view");
const itemGrid = document.querySelector("#item-grid");
const itemSearchInput = document.querySelector("#item-search");
const itemCategoryFilter = document.querySelector("#item-category-filter");
const itemDialog = document.querySelector("#item-dialog");
const itemForm = document.querySelector("#item-form");
const itemNotice = document.querySelector("#item-notice");
const customCharacteristicsInput = document.querySelector("#custom-characteristics");
const ironManRuleInput = document.querySelector("#iron-man-rule");
const inventoryItemSelect = document.querySelector("#inventory-item-select");
const inventoryItemQuantity = document.querySelector("#inventory-item-quantity");
const inventoryList = document.querySelector("#inventory-list");
const encumbranceSummary = document.querySelector("#encumbrance-summary");
let characters = [];
let items = [];
let currentInventory = [];
let careerTrackingEnabled = true;
let trackedCareerName = "";
let careerMusteredOut = false;
let editingCharacterId = "";
let storageError = null;
let itemStorageError = null;

try {
  characters = loadCharacters();
} catch (error) {
  storageError = error;
}

function getCyberneticPoints(inventory) {
  return inventory.reduce((total, entry) => {
    if (entry.category !== "Cybernetics") return total;
    const item = getInventoryItem(entry.itemId);
    return total + (entry.cyberPoints ?? (item ? getCyberPointCost(item) : 0)) * entry.quantity;
  }, 0);
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
    && (item.cyberGrade === undefined || ["A", "B", "C", "R"].includes(item.cyberGrade))
    && (item.cyberPoints === undefined || (Number.isInteger(item.cyberPoints) && item.cyberPoints >= 0 && item.cyberPoints <= 12))
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
    && (entry.cyberPoints === undefined || (Number.isInteger(entry.cyberPoints) && entry.cyberPoints >= 0 && entry.cyberPoints <= 12))
    && (entry.protection === undefined || typeof entry.protection === "string")
    && (entry.skill === undefined || typeof entry.skill === "string");
}

function getCareerChangeCount(careerSkills = []) {
  let changes = 0;
  let previousCareer = "";
  careerSkills.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const career = entry.career || "";
    if (!career) return;
    if (previousCareer && career.toLocaleLowerCase() !== previousCareer.toLocaleLowerCase()) changes += 1;
    previousCareer = career;
  });
  return changes;
}

function getCareerRankAtTerm(careerSkills, index, fallbackCareer) {
  let careerName = "";
  let termsInCareer = 0;
  let rankBase = 0;
  let rank = 0;
  for (let termIndex = 0; termIndex <= index; termIndex += 1) {
    const nextCareer = careerSkills[termIndex]?.career || fallbackCareer;
    if (nextCareer.toLocaleLowerCase() !== careerName.toLocaleLowerCase()) {
      rankBase = MILITARY_CAREERS.has(careerName.toLocaleLowerCase())
        && MILITARY_CAREERS.has(nextCareer.toLocaleLowerCase())
        ? rank
        : 0;
      careerName = nextCareer;
      termsInCareer = 1;
    } else {
      termsInCareer += 1;
    }
    rank = rankBase + Math.floor(termsInCareer / 2);
  }
  return Math.min(6, rank);
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
    && isText(entry.outcome)
    && (entry.effect === undefined || isText(entry.effect))
    && (entry.career === undefined || isText(entry.career))
    && (entry.injury === undefined || typeof entry.injury === "boolean")
    && (entry.injuryRoll === undefined || isValidRoll(entry.injuryRoll, 2, 12))
    && (entry.injuryDetailRoll === undefined || isValidRoll(entry.injuryDetailRoll, 1, 6))
    && (entry.checks === undefined || (Array.isArray(entry.checks) && entry.checks.every((check) => check
      && isText(check.skill)
      && isValidRoll(check.roll, 2, 12)
      && Number.isInteger(check.dm)
      && check.dm >= -20
      && check.dm <= 20)));
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
    && generation.events.every((entry) => isRollEntry(entry) && (entry.career === undefined || isText(entry.career)))
    && Array.isArray(generation.aging)
    && generation.aging.length === agingCount
    && generation.aging.every((entry) => entry
      && Number.isInteger(entry.term)
      && entry.term >= 4
      && entry.term <= 7
      && isValidRoll(entry.roll, 2, 12)
      && isRollEntry(entry))
    && Array.isArray(generation.benefits)
    && generation.benefits.length === Math.max(1, 1 + generation.terms + generation.bonusBenefits - getCareerChangeCount(Array.isArray(generation.careerSkills) ? generation.careerSkills : []))
    && generation.benefits.every((entry) => entry
      && ["cash", "material", "rank"].includes(entry.table)
      && isValidRoll(entry.roll, 1, 6)
      && isText(entry.outcome)
      && (entry.dm === undefined || (Number.isInteger(entry.dm) && entry.dm >= -5 && entry.dm <= 5)))
    && Array.isArray(generation.traits)
    && generation.traits.length <= Math.ceil(generation.terms / 2)
    && generation.traits.every(isText)
    && (generation.trackedCareer === undefined || isText(generation.trackedCareer))
    && (generation.musteredOut === undefined || typeof generation.musteredOut === "boolean")
    && (generation.ironMan === undefined || typeof generation.ironMan === "boolean")
    && (generation.careerSkills === undefined
      || (Array.isArray(generation.careerSkills)
        && generation.careerSkills.length === generation.terms
        && generation.careerSkills.every((entry, index) => entry
          && entry.term === index + 1
          && (entry.career === undefined || isText(entry.career))
          && isText(entry.service)
          && Array.isArray(entry.picks)
          && entry.picks.every(isText))));
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
    <button class="card-main" type="button" data-edit="${escapeHtml(character.id)}" aria-label="Open character sheet for ${escapeHtml(character.name)}">
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
        <small>${entry.category === "Cybernetics" ? `${entry.cyberPoints || 0} Cybernetic Point${entry.cyberPoints === 1 ? "" : "s"}` : `${unitLoad} item${unitLoad === 1 ? "" : "s"} each`}${entry.skill ? ` · ${escapeHtml(entry.skill)}` : ""}${item && item.protection ? ` · Protection ${escapeHtml(String(item.protection))}` : ""}</small>
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
  const cyberneticPoints = getCyberneticPoints(currentInventory);
  encumbranceSummary.className = `encumbrance-summary ${summary.statusClass}`;
  encumbranceSummary.innerHTML = `<strong>${summary.used} / ${summary.lightLimit} major items · ${summary.label}</strong>
    <span>STR DM ${getCharacteristicDm(Number(form.elements.namedItem("str").value || 0)) >= 0 ? "+" : ""}${getCharacteristicDm(Number(form.elements.namedItem("str").value || 0))}. Light load: up to 7 + STR DM. Heavy load: above light load to three times that limit; apply DM-2 to physical task throws and allow at most one move action per combat round.</span>
    <strong class="${cyberneticPoints > 6 ? "cybernetic-over-limit" : ""}">Cybernetic implants: ${cyberneticPoints} / 6 CP${cyberneticPoints > 6 ? " · Cyber-dissociation: DM-2 to social skill throws (no penalty when intimidating)" : ""}</strong>`;
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
      cyberPoints: getCyberPointCost(item),
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
  const error = document.querySelector("#characteristic-error");
  error.textContent = message;
  error.hidden = message === "";
  inputs.forEach((input) => input.setCustomValidity(message));
  return customCharacteristicsInput.checked || isStandardArray;
}

function renderItemCard(item) {
  const isBuiltIn = BUILT_IN_ITEM_IDS.has(item.id);
  const cyberPoints = getCyberPointCost(item);
  const details = [
    item.techLevel === "" ? "" : `TL ${escapeHtml(item.techLevel)}`,
    item.cost === "" ? "" : `Cr ${Number(item.cost).toLocaleString()}`,
    `${item.encumbrance ?? 1} item${item.encumbrance === 1 ? "" : "s"}`,
    item.cyberGrade ? `Grade ${escapeHtml(item.cyberGrade)} · ${cyberPoints} CP` : "",
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

function getCyberPointCost(item) {
  if (Number.isInteger(item.cyberPoints)) return item.cyberPoints;
  return ({ A: 0, B: 1, C: 2, R: 3 })[item.cyberGrade] || 0;
}

function openItemEditor(item = null) {
  itemForm.reset();
  document.querySelector("#item-id").value = "";
  document.querySelector("#item-dialog-title").textContent = "Add item";
  document.querySelector("#item-cyber-grade-field").hidden = true;
  document.querySelector("#item-cyber-points-field").hidden = true;
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
    document.querySelector("#item-cyber-grade").value = item.cyberGrade || "";
    document.querySelector("#item-cyber-points").value = item.cyberPoints ?? "";
    document.querySelector("#item-worn-encumbrance").value = item.wornEncumbrance === undefined ? "" : String(item.wornEncumbrance);
    document.querySelector("#item-description").value = item.description;
  }
  updateCyberneticItemFields();
  itemDialog.showModal();
  document.querySelector("#item-name").focus();
}

function readItemForm() {
  const formData = new FormData(itemForm);
  const cost = formData.get("cost");
  const techLevel = formData.get("techLevel");
  const wornEncumbrance = formData.get("wornEncumbrance");
  const category = String(formData.get("category"));
  const cyberGrade = String(formData.get("cyberGrade") || "");
  const cyberPoints = formData.get("cyberPoints");
  return {
    id: String(formData.get("id") || crypto.randomUUID()),
    name: String(formData.get("name")).trim(),
    category,
    techLevel: techLevel === null ? "" : String(techLevel),
    cost: cost === null ? "" : String(cost),
    reference: String(formData.get("reference")).trim(),
    encumbrance: Number(formData.get("encumbrance") || 0),
    wornEncumbrance: wornEncumbrance === null || wornEncumbrance === "" ? undefined : Number(wornEncumbrance),
    protection: String(formData.get("protection")).trim(),
    skill: String(formData.get("skill")).trim(),
    cyberGrade: category === "Cybernetics" && cyberGrade ? cyberGrade : undefined,
    cyberPoints: category !== "Cybernetics" || cyberPoints === "" ? undefined : Number(cyberPoints),
    description: String(formData.get("description")).trim(),
    updatedAt: new Date().toISOString()
  };
}

function updateCyberneticItemFields() {
  const isCybernetic = document.querySelector("#item-category").value === "Cybernetics";
  document.querySelector("#item-cyber-grade-field").hidden = !isCybernetic;
  document.querySelector("#item-cyber-points-field").hidden = !isCybernetic;
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

function getCareerDefinition(careerName) {
  const careerKey = Object.keys(CAREER_DATA).find((name) => name.toLocaleLowerCase() === careerName.trim().toLocaleLowerCase());
  return careerKey ? CAREER_DATA[careerKey] : null;
}

function getCareerEventEffect(careerName, roll) {
  const career = getCareerDefinition(careerName);
  return career?.eventDetails?.[roll] || (career?.eventNames?.[roll]
    ? `${career.eventNames[roll]}. See the ${careerName} career rules for this event's effects.`
    : "");
}

function getCareerEventChecks(effect) {
  const checks = [];
  const checkExpression = /\b(?:roll|throw)\s+((?:(?!\b(?:roll|throw)\b)[^.;])+?)(?=\.|;|\b(?:roll|throw)\b|$)/gi;
  const getOutcome = (text, isSuccess) => {
    const direct = isSuccess
      ? text.match(/\b(?:if you\s+)?(?:succeed(?:s|ed)?|success)\b\s*(?:,|:)?\s*([^.;]+)/i)
        || text.match(/\bsuccess\s+(?:also\s+)?([^.;]+)/i)
      : text.match(/\b(?:if you\s+)?(?:fail(?:s|ed)?|failure)\b\s*(?:,|:)?\s*([^.;]+)/i);
    if (direct) return direct[1].replace(/^[,:\s]+/, "").trim();
    if (isSuccess) {
      const implied = text.match(/\bsuccessful(?:ly)?\s+[^.;]*?\b(grants?|gains?|earns?|receives?|increases?)\s+([^.;]+)/i);
      if (implied) return `${implied[1]} ${implied[2]}`.trim();
    }
    return "";
  };
  for (const match of effect.matchAll(checkExpression)) {
    const candidates = [...match[1].matchAll(EVENT_CHECK_PATTERN)];
    const options = candidates.map((candidate) => ({
      skill: candidate[1],
      target: Number(candidate[2])
    }));
    if (!options.length) continue;

    const afterCheck = match[1].slice(candidates.at(-1).index + candidates.at(-1)[0].length).trim();
    let successOutcome = getOutcome(afterCheck, true);
    if (!successOutcome && /^to\b/i.test(afterCheck)) {
      successOutcome = afterCheck.replace(/^to\s+/i, "").replace(/,\s*(?:or|and)\b.*$/i, "").trim();
    }
    successOutcome ||= getOutcome(effect, true);
    let failureOutcome = getOutcome(afterCheck, false) || getOutcome(effect, false);
    if (failureOutcome) failureOutcome = failureOutcome.replace(/^in either case\s+/i, "");
    if (/to avoid injury/i.test(afterCheck)) {
      failureOutcome ||= "roll on the Injury table";
      successOutcome ||= "avoid Injury";
    }
    checks.push({
      options,
      successOutcome: successOutcome ? successOutcome.replace(/^[,:\s]+/, "") : "Event effect as described above.",
      failureOutcome: failureOutcome ? failureOutcome.replace(/^[,:\s]+/, "") : "No separate failure effect is specified."
    });
  }
  return checks;
}

function getEventCheckResult(check, selectedSkill, roll, dm) {
  if (!roll) return "Enter the 2D6 total or roll 2D6; add the applicable DM.";
  if (!isValidManualRoll(roll, 2, 12)) return "Enter a valid 2D6 total from 2 to 12.";
  const option = check.options.find((candidate) => candidate.skill === selectedSkill) || check.options[0];
  const total = Number(roll) + Number(dm || 0);
  const success = total >= option.target;
  const outcome = (success ? check.successOutcome : check.failureOutcome)
    .replace(/the skill (?:you )?rolled/gi, option.skill)
    .replace(/the skill you tested/gi, option.skill);
  return `${success ? "Success" : "Failure"} · ${roll}${Number(dm) ? ` ${Number(dm) > 0 ? "+" : ""}${Number(dm)}` : ""} = ${total} vs ${option.target}+ · ${outcome}`;
}

function isValidManualRoll(value, minimum, maximum) {
  return /^\d+$/.test(String(value)) && Number(value) >= minimum && Number(value) <= maximum;
}

function getInjuryTableEffect(effect) {
  if (effect <= -6) return { text: "Nearly killed: reduce one physical characteristic by 1D and the other two by 2 (or one by 4); roll 1D6 for the injury.", needsDetailRoll: true };
  if (effect <= -2) return { text: "Severely injured: reduce one physical characteristic by 1D; roll 1D6 for the injury.", needsDetailRoll: true };
  if (effect <= 0) return { text: "Lasting injury: roll 1D6 for the injury.", needsDetailRoll: true };
  if (effect <= 5) return { text: "Mild lasting injury: roll 1D6 for the injury.", needsDetailRoll: true };
  return { text: "Light injury; no permanent effects.", needsDetailRoll: false };
}

function getInjuryDetail(throwEffect, roll) {
  if (throwEffect <= -6) return [
    "Loses a leg", "Loses a leg", "Loses an arm", "Loses an arm", "Loses an eye", "Loses both eyes"
  ][roll - 1];
  if (throwEffect <= -2) return [
    "Loses a leg", "Loses an arm", "Loses both eyes", "Otherwise unharmed", "Otherwise unharmed", "Otherwise unharmed"
  ][roll - 1];
  if (throwEffect <= 0) return [
    "Loses a hand", "Loses a hand", "Loses one eye", "Loses one eye", "Loses an arm", "Reduces one physical characteristic by 2"
  ][roll - 1];
  return [
    "Badly scarred", "Badly scarred", "Loses 1D fingers", "Loses 1D fingers", "Loses most teeth", "Reduces one physical characteristic by 1"
  ][roll - 1];
}

function getInjuryCareerDm(careerName) {
  const normalizedCareer = careerName.toLocaleLowerCase();
  if (normalizedCareer === "pirate" || normalizedCareer === "scout") return -2;
  if (MILITARY_CAREERS.has(normalizedCareer)) return -1;
  return 0;
}

function getCareerAwards(generation, careerName) {
  const awards = {};
  const addSkill = (skill) => {
    if (!skill) return;
    awards[skill.toLocaleLowerCase()] = {
      name: skill,
      level: (awards[skill.toLocaleLowerCase()]?.level || 0) + 1
    };
  };
  const careerSkills = generation.careerSkills || [];
  careerSkills.forEach((entry, index) => {
    const entryCareer = entry.career || careerName;
    const career = getCareerDefinition(entryCareer);
    if (entry.term === 1) addSkill(entry.service);
    entry.picks.forEach(addSkill);
    if (career) {
      const attainedRank = getCareerRankAtTerm(careerSkills, index, careerName);
      const previousRank = index ? getCareerRankAtTerm(careerSkills, index - 1, careerName) : 0;
      if (attainedRank > previousRank) (career.rankSkills[attainedRank] || []).forEach(addSkill);
    }
  });
  if (careerSkills.length) {
    const finalCareerName = careerSkills.at(-1).career || careerName;
    const finalCareer = getCareerDefinition(finalCareerName);
    const finalRank = getCareerRankAtTerm(careerSkills, careerSkills.length - 1, careerName);
    const rankPurchases = (generation.benefits || []).filter((entry) => entry.table === "rank").length;
    for (let rank = finalRank + 1; rank <= Math.min(6, finalRank + rankPurchases); rank += 1) {
      (finalCareer?.rankSkills[rank] || []).forEach(addSkill);
    }
  }
  return awards;
}

function getFirstTermSkillViolations(generation) {
  const firstTerm = generation.careerSkills?.[0];
  if (!firstTerm) return [];
  const counts = new Map();
  const add = (skill) => {
    if (!skill) return;
    const key = skill.toLocaleLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  add(generation.homeworldSkill);
  add(firstTerm.service);
  firstTerm.picks.forEach(add);
  return [...counts.entries()].filter(([, level]) => level > 2).map(([skill]) => skill);
}

function getSkillLines(skillText) {
  return skillText.split(/\r?\n/).map((line) => {
    const match = line.trim().match(/^(.*?)(?:\s+(\d+))?$/);
    if (!match || !match[1]) return null;
    return { name: match[1].trim(), level: match[2] ? Number(match[2]) : 1 };
  }).filter(Boolean);
}

function mergeAwardedSkills(skillLines, awards) {
  const totals = new Map();
  skillLines.forEach(({ name, level }) => {
    const key = name.toLocaleLowerCase();
    const current = totals.get(key);
    totals.set(key, { name, level: (current?.level || 0) + level });
  });
  Object.values(awards).forEach(({ name, level }) => {
    const key = name.toLocaleLowerCase();
    const current = totals.get(key);
    totals.set(key, { name, level: (current?.level || 0) + level });
  });
  return [...totals.values()].map(({ name, level }) => `${name} ${level}`).sort((a, b) => a.localeCompare(b));
}

function getManualSkillLines(character) {
  const manual = new Map();
  (character.skills || []).forEach((line) => {
    const parsed = getSkillLines(line)[0];
    if (!parsed) return;
    const key = parsed.name.toLocaleLowerCase();
    const current = manual.get(key);
    manual.set(key, { name: parsed.name, level: (current?.level || 0) + parsed.level });
  });
  const awards = getCareerAwards(character.generation || { terms: 0 }, character.generation?.trackedCareer || character.career);
  if (character.generation?.homeworldSkill) {
    awards[character.generation.homeworldSkill.toLocaleLowerCase()] = {
      name: character.generation.homeworldSkill,
      level: (awards[character.generation.homeworldSkill.toLocaleLowerCase()]?.level || 0) + 1
    };
  }
  Object.values(awards).forEach(({ name, level }) => {
    const key = name.toLocaleLowerCase();
    const current = manual.get(key);
    if (!current) return;
    const remaining = current.level - level;
    if (remaining > 0) current.level = remaining;
    else manual.delete(key);
  });
  return [...manual.values()].map(({ name, level }) => `${name} ${level}`).join("\n");
}

function updateDerivedCharacteristics() {
  const end = Number(form.elements.namedItem("end").value || 0);
  const careerAwards = getCareerAwards(readGeneration(), trackedCareerName || document.querySelector("#character-career").value.trim());
  const skillTotals = new Map();
  getSkillLines(document.querySelector("#character-skills").value).forEach(({ name, level }) => {
    const key = name.toLocaleLowerCase();
    skillTotals.set(key, (skillTotals.get(key) || 0) + level);
  });
  Object.entries(careerAwards).forEach(([key, { level }]) => {
    skillTotals.set(key, (skillTotals.get(key) || 0) + level);
  });
  if (homeworldSkillInput.value) {
    const key = homeworldSkillInput.value.toLocaleLowerCase();
    skillTotals.set(key, (skillTotals.get(key) || 0) + 1);
  }
  const athletics = skillTotals.get("athletics") || 0;
  const stamina = end + athletics;
  document.querySelector("#derived-stamina").textContent = String(stamina);
  document.querySelector("#derived-lifeblood").textContent = String(stamina * 2);
  const totalRanks = [...skillTotals.values()].reduce((total, level) => total + level, 0);
  const skillLimit = Number(form.elements.namedItem("int").value || 0) + Number(form.elements.namedItem("edu").value || 0);
  const skillRankDisplay = document.querySelector("#derived-skill-ranks");
  skillRankDisplay.textContent = `${totalRanks} / ${skillLimit}`;
  skillRankDisplay.classList.toggle("over-limit", totalRanks > skillLimit);
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
    trackedCareer: careerTrackingEnabled ? trackedCareerName : undefined,
    careerSkills: careerTrackingEnabled
      ? Array.from(careerSkillRows.querySelectorAll("[data-career-term]"), (row) => ({
        term: Number(row.dataset.careerTerm),
        career: row.dataset.careerName || "",
        service: row.querySelector("[data-career-service]")?.value || "",
        picks: Array.from(row.querySelectorAll("[data-career-pick]"), (select) => select.value).filter(Boolean)
      }))
      : undefined,
    events: Array.from(termEventRows.querySelectorAll("[data-event-roll]"), (input) => {
      const eventIndex = input.dataset.eventRoll;
      const injuryRoll = termEventRows.querySelector(`[data-event-injury-roll="${eventIndex}"]`)?.value || "";
      return {
        roll: input.value,
        career: input.dataset.eventCareer || "",
        outcome: document.querySelector(`#event-outcome-${eventIndex}`).value.trim(),
        effect: document.querySelector(`#event-outcome-${eventIndex}`).dataset.eventEffect || "",
        injury: Boolean(injuryRoll) || input.closest("[data-event-card]")?.dataset.injuryRecorded === "true",
        injuryRoll,
        injuryDetailRoll: termEventRows.querySelector(`[data-injury-detail-roll="${eventIndex}"]`)?.value || "",
        checks: Array.from(termEventRows.querySelectorAll(`[data-check-event="${eventIndex}"]`), (checkRow) => ({
          skill: checkRow.querySelector("[data-event-check-skill]")?.value || "",
          roll: checkRow.querySelector("[data-event-check-roll]")?.value || "",
          dm: Number(checkRow.querySelector("[data-event-check-dm]")?.value || 0)
        }))
      };
    }),
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
      outcome: document.querySelector(`#benefit-outcome-${select.dataset.benefitTable}`).value.trim(),
      dm: Number(document.querySelector(`[data-benefit-dm="${select.dataset.benefitTable}"]`).value || 0)
    })),
    traits: Array.from(traitRows.querySelectorAll("[data-trait]"), (input) => input.value.trim()).filter(Boolean),
    musteredOut: careerMusteredOut,
    ironMan: ironManRuleInput.checked
  };
}

function getTraitDescription(traitName) {
  const details = TRAIT_DETAILS[traitName];
  if (!details) return traitName ? "No description is available for this saved trait." : "Choose a trait to see its prerequisite and effect.";
  return `Prerequisite: ${details.prerequisite} Effect: ${details.effect}`;
}

function updateTraitDescriptions() {
  traitRows.querySelectorAll("[data-trait]").forEach((select) => {
    const description = traitRows.querySelector(`#${select.dataset.traitDescription}`);
    const details = TRAIT_DETAILS[select.value];
    const text = getTraitDescription(select.value);
    description.textContent = text;
    select.title = details ? text : "";
  });
}

function renderSheetRecordGroup(title, entries) {
  if (!entries.length) return "";
  return `<section class="sheet-record-group">
    <h3>${escapeHtml(title)}</h3>
    <ul>${entries.map((entry) => `<li>${entry}</li>`).join("")}</ul>
  </section>`;
}

function renderCharacterSheetRecord(character) {
  const generation = character.generation || {};
  const careerTerms = generation.careerSkills || [];
  const careerPath = careerTerms.reduce((terms, entry) => {
    const career = entry.career || generation.trackedCareer || character.career || "Unspecified career";
    const last = terms.at(-1);
    if (last?.career === career) last.count += 1;
    else terms.push({ career, count: 1 });
    return terms;
  }, []);
  const careerEntries = careerPath.map(({ career, count }) => (
    `${escapeHtml(career)}${count > 1 ? ` · ${count} terms` : ""}`
  ));
  const originEntries = [
    generation.homeworldType ? `Homeworld type: ${escapeHtml(generation.homeworldType)}` : "",
    generation.homeworldSkill ? `Homeworld skill: ${escapeHtml(generation.homeworldSkill)} 1` : ""
  ].filter(Boolean);
  const traitEntries = (generation.traits || []).map((trait) => {
    const details = TRAIT_DETAILS[trait];
    const description = details
      ? `<small>Prerequisite: ${escapeHtml(details.prerequisite)} Effect: ${escapeHtml(details.effect)}</small>`
      : "<small>No description is available for this saved trait.</small>";
    return `<strong>${escapeHtml(trait)}</strong>${description}`;
  });
  const eventEntries = (generation.events || []).flatMap((entry, index) => {
    const records = [];
    if (entry.outcome) {
      const roll = entry.roll ? ` · Roll ${escapeHtml(entry.roll)}` : "";
      const effect = entry.effect ? ` ${escapeHtml(entry.effect)}` : "";
      records.push(`<strong>Term ${index + 1}${roll}:</strong> ${escapeHtml(entry.outcome)}${effect}`);
    }
    const effect = entry.effect || getCareerEventEffect(entry.career || character.career, Number(entry.roll));
    const checks = getCareerEventChecks(effect);
    (entry.checks || []).forEach((check, checkIndex) => {
      if (!check.roll || !checks[checkIndex]) return;
      const result = getEventCheckResult(checks[checkIndex], check.skill, check.roll, check.dm);
      records.push(`<strong>Term ${index + 1} throw:</strong> ${escapeHtml(result)}`);
    });
    if (isValidManualRoll(entry.injuryRoll, 2, 12)) {
      const endDm = getCharacteristicDm(Number(character.attributes.end || 0));
      const careerDm = getInjuryCareerDm(entry.career || character.career);
      const total = Number(entry.injuryRoll) + endDm + careerDm;
      const injury = getInjuryTableEffect(total - 6);
      const detail = isValidManualRoll(entry.injuryDetailRoll, 1, 6)
        ? ` ${getInjuryDetail(total - 6, Number(entry.injuryDetailRoll))}.`
        : "";
      records.push(`<strong>Term ${index + 1} Injury:</strong> ${escapeHtml(injury.text)}${escapeHtml(detail)}`);
    }
    return records;
  });
  const agingEntries = (generation.aging || []).filter((entry) => entry.outcome).map((entry) => (
    `<strong>After term ${escapeHtml(entry.term)}:</strong> ${escapeHtml(entry.outcome)}`
  ));
  const benefitEntries = (generation.benefits || []).filter((entry) => entry.outcome).map((entry) => (
    `<strong>${escapeHtml(entry.table)}${entry.roll ? ` · Roll ${escapeHtml(entry.roll)}` : ""}:</strong> ${escapeHtml(entry.outcome)}`
  ));
  const groups = [
    renderSheetRecordGroup("Career path", careerEntries),
    renderSheetRecordGroup("Homeworld", originEntries),
    renderSheetRecordGroup("Traits", traitEntries),
    renderSheetRecordGroup("Career events", eventEntries),
    renderSheetRecordGroup("Aging", agingEntries),
    renderSheetRecordGroup("Mustering-out benefits", benefitEntries)
  ].filter(Boolean);
  characterSheetRecordContent.innerHTML = groups.length
    ? groups.join("")
    : '<p class="section-helper">No character-generation outcomes were saved for this character.</p>';
}

function renderCareerSkillRows(generation) {
  const careerName = document.querySelector("#character-career").value.trim();
  const canUseAdvanced = Number(form.elements.namedItem("edu").value || 0) >= 8;
  const requireCareerChoices = careerTrackingEnabled;
  let previousCareer = "";
  let termsInCareer = 0;
  careerSkillRows.innerHTML = Array.from({ length: generation.terms }, (_, index) => {
    const term = index + 1;
    const entry = generation.careerSkills?.[index] || { service: "", picks: [] };
    const termCareerName = entry.career || careerName;
    const career = getCareerDefinition(termCareerName);
    if (termCareerName.toLocaleLowerCase() === previousCareer.toLocaleLowerCase()) termsInCareer += 1;
    else {
      previousCareer = termCareerName;
      termsInCareer = 1;
    }
    if (!career) {
      return `<article class="generation-row career-skill-row" data-career-term="${term}" data-career-name="${escapeHtml(termCareerName)}">
        <div class="generation-row-heading"><strong>Term ${term} skill choices</strong></div>
        <p class="section-helper">${termCareerName ? `Choose a listed career to use its skill tables.` : "Choose a career above to begin this term."}</p>
      </article>`;
    }
    const categories = [
      ["Service", career.service],
      ["Specialist", career.specialist],
      ["Advanced Education · EDU 8+", career.advanced]
    ];
    const skillOptions = (selected, serviceOnly = false) => {
      const optionGroups = serviceOnly ? categories.slice(0, 1) : categories;
      let selectedAssigned = false;
      return `<option value="">Choose a skill</option>${optionGroups.map(([label, skills]) => (
        `<optgroup label="${escapeHtml(label)}">${skills.map((skill) => {
          const isSelected = selected === skill && !selectedAssigned;
          if (isSelected) selectedAssigned = true;
          const isAdvanced = label.startsWith("Advanced");
          return `<option value="${escapeHtml(skill)}" ${isSelected ? "selected" : ""} ${isAdvanced && !canUseAdvanced ? "disabled" : ""}>${escapeHtml(skill)}</option>`;
        }).join("")}</optgroup>`
      )).join("")}`;
    };
    const pickCount = term <= 3 ? 2 : 1;
    const allowedPicks = entry.picks.map((skill) => (
      !canUseAdvanced && career.advanced.includes(skill)
        && !career.service.includes(skill) && !career.specialist.includes(skill)
        ? ""
        : skill
    ));
    const rank = getCareerRankAtTerm(generation.careerSkills || [], index, careerName);
    const previousRank = index ? getCareerRankAtTerm(generation.careerSkills || [], index - 1, careerName) : 0;
    const rankIncrease = rank > previousRank ? rank : 0;
    const rankSkills = (career.rankSkills[rankIncrease] || []).join(", ");
    const rankAttribute = career.rankAttributes?.[rankIncrease] || "";
    const startsNewCareer = termsInCareer === 1;
    const serviceRow = startsNewCareer
      ? `<label class="field"><span>${term === 1 ? "Term 1 service skill · level 1" : "New-career service skill · level 0"}</span>
          <select data-career-service aria-label="Term ${term} service skill" ${requireCareerChoices ? "required" : ""}>${skillOptions(entry.service, true)}</select>
        </label>`
      : "";
    const pickRows = Array.from({ length: pickCount }, (_, pickIndex) => `
      <label class="field"><span>Skill level ${pickIndex + 1} of ${pickCount}</span>
        <select data-career-pick aria-label="Term ${term} skill choice ${pickIndex + 1}" ${requireCareerChoices ? "required" : ""}>
          ${skillOptions(allowedPicks[pickIndex] || "")}
        </select>
      </label>`).join("");
    const skillCap = term === 1 ? "Skill levels cannot exceed level 2 during the first term." : "";
    const rankInfo = rankIncrease ? [
      rankSkills ? `Rank ${rank} bonus: ${escapeHtml(rankSkills)} 1.` : "",
      rankAttribute ? `Rank ${rank} characteristic benefit: ${escapeHtml(rankAttribute)}.` : ""
    ].filter(Boolean).join(" ") : "";
    return `<article class="generation-row career-skill-row" data-career-term="${term}" data-career-name="${escapeHtml(termCareerName)}">
      <div class="generation-row-heading"><strong>Term ${term} · ${escapeHtml(termCareerName)} skill choices</strong></div>
      <div class="form-grid career-skill-grid">${serviceRow}${pickRows}</div>
      <p class="section-helper">${skillCap} ${rankInfo}</p>
    </article>`;
  }).join("");
  updateDerivedCharacteristics();
}

function renderCareerEventChecks(eventIndex, effect, savedChecks = []) {
  const checks = getCareerEventChecks(effect);
  return checks.map((check, checkIndex) => {
    const saved = savedChecks[checkIndex] || {};
    const selectedSkill = check.options.some((option) => option.skill === saved.skill)
      ? saved.skill
      : check.options[0].skill;
    const option = check.options.find((candidate) => candidate.skill === selectedSkill);
    const choice = check.options.length > 1
      ? `<label class="field event-check-choice"><span>Choose check</span>
          <select data-event-check-skill>${check.options.map((candidate) => (
            `<option value="${escapeHtml(candidate.skill)}" ${candidate.skill === selectedSkill ? "selected" : ""}>${escapeHtml(candidate.skill)} ${candidate.target}+</option>`
          )).join("")}</select>
        </label>`
      : `<strong class="event-check-name">${escapeHtml(option.skill)} ${option.target}+</strong>`;
    return `<div class="event-check-row" data-check-event="${eventIndex}" data-check-index="${checkIndex}">
      ${choice}
      <label class="visually-hidden" for="event-check-roll-${eventIndex}-${checkIndex}">2D6 result for ${escapeHtml(option.skill)} check</label>
      <input id="event-check-roll-${eventIndex}-${checkIndex}" data-event-check-roll type="number" min="2" max="12" value="${escapeHtml(saved.roll || "")}" inputmode="numeric" placeholder="2D6">
      <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="event-check-roll-${eventIndex}-${checkIndex}">Roll 2D6</button>
      <label class="event-check-dm"><span>DM</span>
        <input data-event-check-dm type="number" min="-20" max="20" value="${escapeHtml(saved.dm ?? 0)}" inputmode="numeric">
      </label>
      <p class="event-check-result" data-event-check-result aria-live="polite"></p>
    </div>`;
  }).join("");
}

function renderGenerationRows(generation = readGeneration()) {
  const { terms, bonusBenefits, agingTechDm } = generation;
  renderCareerSkillRows(generation);
  termEventRows.innerHTML = Array.from({ length: terms }, (_, index) => {
    const entry = generation.events[index] || { roll: "", outcome: "", checks: [] };
    const number = index + 1;
    const termCareer = entry.career || generation.careerSkills?.[index]?.career || document.querySelector("#character-career").value.trim();
    const eventEffect = entry.roll ? getCareerEventEffect(termCareer, Number(entry.roll)) : "";
    const eventChecks = eventEffect ? renderCareerEventChecks(index, eventEffect, entry.checks) : "";
    const injuryRoll = entry.injuryRoll || "";
    const injuryDetailRoll = entry.injuryDetailRoll || "";
    return `<article class="generation-row" data-event-card="${index}" data-injury-recorded="${entry.injury ? "true" : "false"}">
      <div class="generation-row-heading"><strong>Term ${number} ${termCareer ? `${escapeHtml(termCareer)} ` : ""}event · 2D6</strong>
        <div class="dice-entry">
          <label class="visually-hidden" for="event-roll-${index}">Term ${number} event roll</label>
          <input id="event-roll-${index}" data-event-roll="${index}" data-event-career="${escapeHtml(termCareer)}" type="number" min="2" max="12" value="${escapeHtml(entry.roll)}" inputmode="numeric">
          <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="event-roll-${index}">Roll 2D6</button>
        </div>
      </div>
      <p class="aging-preview" id="event-result-${index}" aria-live="polite"></p>
      <label class="field"><span>Event checks, choices, and effects</span>
        <textarea id="event-outcome-${index}" data-event-outcome="${index}" data-event-effect="${escapeHtml(entry.effect || eventEffect)}" rows="3" maxlength="1200" placeholder="Roll to display the event result and effects">${escapeHtml(entry.outcome)}</textarea>
      </label>
      <div class="event-checks" data-event-checks="${index}" data-effect="${escapeHtml(eventEffect)}">${eventChecks}</div>
      <section class="event-injury-roll" data-event-injury-roll-row="${index}" ${/injury/i.test(eventEffect) ? "" : "hidden"}>
        <strong>Injury table · END 6+</strong>
        <p class="section-helper">Roll 2D6 or enter your result. The app applies END and career DMs and shows the injury-table outcome.</p>
        <div class="event-injury-controls">
          <label class="visually-hidden" for="injury-roll-${index}">Injury END throw 2D6 result</label>
          <input id="injury-roll-${index}" data-event-injury-roll="${index}" type="number" min="2" max="12" value="${escapeHtml(injuryRoll)}" inputmode="numeric" placeholder="2D6">
          <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="injury-roll-${index}">Roll 2D6</button>
        </div>
        <p class="injury-roll-result" data-injury-roll-result="${index}" aria-live="polite"></p>
        <div class="event-injury-detail" data-injury-detail-row="${index}" hidden>
          <label class="field"><span>Injury detail · 1D6</span>
            <div class="event-injury-controls">
              <input id="injury-detail-roll-${index}" data-injury-detail-roll="${index}" type="number" min="1" max="6" value="${escapeHtml(injuryDetailRoll)}" inputmode="numeric" placeholder="1D6">
              <button class="button button-quiet dice-button" type="button" data-roll-sides="1" data-roll-target="injury-detail-roll-${index}" id="injury-detail-button-${index}">Roll 1D6</button>
            </div>
          </label>
          <p class="injury-roll-result" data-injury-detail-result="${index}" aria-live="polite"></p>
        </div>
      </section>
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

  const benefitCount = Math.max(1, 1 + terms + bonusBenefits - getCareerChangeCount(generation.careerSkills));
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
            <input id="benefit-roll-${index}" data-benefit-roll="${index}" type="number" min="1" max="6" value="${escapeHtml(entry.roll)}" inputmode="numeric">
            <button class="button button-quiet dice-button" type="button" data-roll-sides="1" data-roll-target="benefit-roll-${index}">Roll 1D6</button>
          </div>
        </div>
        <label class="field benefit-modifier-field" id="benefit-modifier-field-${index}">
          <span>Benefit DM (event modifiers)</span>
          <input data-benefit-dm="${index}" type="number" min="-5" max="5" step="1" value="${escapeHtml(entry.dm ?? 0)}">
        </label>
        <label class="field"><span>Benefit result</span>
          <textarea id="benefit-outcome-${index}" data-benefit-outcome="${index}" rows="2" maxlength="400" readonly placeholder="Roll to see the result">${escapeHtml(entry.outcome)}</textarea>
        </label>
      </article>`;
    }).join("");
  benefitRows.querySelectorAll("[data-benefit-table]").forEach(updateBenefitControls);
  updateBenefitResults();

  const traitCount = Math.ceil(terms / 2);
  const currentTraits = generation.traits || [];
  const isMusteredOut = generation.musteredOut ?? terms > 0;
  benefitRows.hidden = !isMusteredOut;
  traitRows.hidden = !isMusteredOut;
  document.querySelector("#mustered-out-note").hidden = !isMusteredOut;
  document.querySelector("#career-progression-actions").hidden = isMusteredOut;
  document.querySelector("#career-switch-picker").hidden = true;
  document.querySelector("#career-progress-summary").textContent = isMusteredOut
    ? `${terms} career term${terms === 1 ? "" : "s"} completed · mustered out`
    : `Term ${terms} in progress · ${Math.max(0, terms - 1)} term${terms === 2 ? "" : "s"} completed`;
  document.querySelector("#continue-career-button").disabled = terms >= 7;
  document.querySelector("#switch-career-button").disabled = terms >= 7;
  traitRows.innerHTML = traitCount
    ? `<p class="generation-subheading">Traits · choose up to ${traitCount}</p>`
      + Array.from({ length: traitCount }, (_, index) => {
        const selectedTrait = currentTraits[index] || "";
        const legacyOption = selectedTrait && !TRAIT_NAMES.includes(selectedTrait)
          ? `<option value="${escapeHtml(selectedTrait)}" selected>${escapeHtml(selectedTrait)} (saved selection)</option>`
          : "";
        return `<label class="field trait-field"><span>Trait ${index + 1}</span>
          <select data-trait data-trait-description="trait-description-${index}" aria-describedby="trait-description-${index}">
            <option value="">Choose a trait</option>
            ${legacyOption}
            ${TRAIT_NAMES.map((trait) => `<option value="${escapeHtml(trait)}" ${selectedTrait === trait ? "selected" : ""}>${escapeHtml(trait)}</option>`).join("")}
          </select>
          <small class="trait-description" id="trait-description-${index}" data-trait-detail></small>
        </label>`;
      }).join("")
    : "";

  updateTraitDescriptions();
  updateAgingPreviews();
  updateEventPreviews();
}

function updateEventPreviews(replaceEffects = false) {
  termEventRows.querySelectorAll("[data-event-roll]").forEach((input) => {
    const preview = document.querySelector(`#event-result-${input.dataset.eventRoll}`);
    const outcome = document.querySelector(`#event-outcome-${input.dataset.eventRoll}`);
    const injuryRow = termEventRows.querySelector(`[data-event-injury-roll-row="${input.dataset.eventRoll}"]`);
    const checkRows = termEventRows.querySelector(`[data-event-checks="${input.dataset.eventRoll}"]`);
    if (!preview) return;
    if (!input.value) {
      preview.textContent = "";
      if (outcome && replaceEffects) outcome.value = "";
      if (injuryRow) injuryRow.hidden = true;
      if (checkRows) {
        checkRows.innerHTML = "";
        checkRows.dataset.effect = "";
      }
      if (replaceEffects) {
        termEventRows.querySelector(`[data-event-injury-roll="${input.dataset.eventRoll}"]`).value = "";
        termEventRows.querySelector(`[data-injury-detail-roll="${input.dataset.eventRoll}"]`).value = "";
        input.closest("[data-event-card]").dataset.injuryRecorded = "false";
      }
      return;
    }
    const careerName = input.dataset.eventCareer || "";
    const career = getCareerDefinition(careerName);
    const eventNames = career?.eventNames || {};
    const result = eventNames[Number(input.value)];
    const effect = getCareerEventEffect(careerName, Number(input.value));
    preview.textContent = result
      ? `Career event: ${result}.`
      : `No career-table result is available for ${careerName || "this career"} at ${input.value}; verify the supplied rules.`;
    if (outcome && effect && (replaceEffects || !outcome.value.trim() || !outcome.value.includes(effect))) {
      const previousEffect = outcome.dataset.eventEffect || "";
      const notes = outcome.value.startsWith(previousEffect)
        ? outcome.value.slice(previousEffect.length).trim()
        : outcome.value.trim();
      outcome.value = `${effect}${notes ? `\n${notes}` : ""}`;
      outcome.dataset.eventEffect = effect;
    }
    if (checkRows && checkRows.dataset.effect !== effect) {
      const effectChanged = Boolean(checkRows.dataset.effect);
      const currentChecks = Array.from(checkRows.querySelectorAll("[data-check-event]"), (row) => ({
        skill: row.querySelector("[data-event-check-skill]")?.value || row.querySelector("[data-event-check-roll]")?.dataset.skill || "",
        roll: row.querySelector("[data-event-check-roll]")?.value || "",
        dm: Number(row.querySelector("[data-event-check-dm]")?.value || 0)
      }));
      if (effectChanged && replaceEffects) {
        termEventRows.querySelector(`[data-event-injury-roll="${input.dataset.eventRoll}"]`).value = "";
        termEventRows.querySelector(`[data-injury-detail-roll="${input.dataset.eventRoll}"]`).value = "";
        input.closest("[data-event-card]").dataset.injuryRecorded = "false";
      }
      checkRows.innerHTML = renderCareerEventChecks(input.dataset.eventRoll, effect, currentChecks);
      checkRows.dataset.effect = effect;
    }
    if (injuryRow) {
      const eventChecks = getCareerEventChecks(effect);
      const eventIndex = input.dataset.eventRoll;
      const requiresInjury = result === "Injury" || /^Injury:/i.test(effect)
        || eventChecks.some((check, checkIndex) => {
          const row = checkRows.querySelector(`[data-check-index="${checkIndex}"]`);
          const skill = row?.querySelector("[data-event-check-skill]")?.value || row?.querySelector("[data-event-check-roll]")?.dataset.skill || check.options[0].skill;
          const roll = row?.querySelector("[data-event-check-roll]")?.value;
          const dm = Number(row?.querySelector("[data-event-check-dm]")?.value || 0);
          return roll && getEventCheckResult(check, skill, roll, dm).startsWith("Failure")
            && /injury/i.test(check.failureOutcome);
        });
      injuryRow.hidden = !requiresInjury;
      injuryRow.dataset.requiresInjury = String(requiresInjury);
      injuryRow.dataset.result = result || "";
      injuryRow.dataset.eventIndex = eventIndex;
    }
  });
  updateCareerEventCheckPreviews();
  updateInjuryRollPreviews();
  updateIronManDeathState();
}

function updateCareerEventCheckPreviews() {
  termEventRows.querySelectorAll("[data-check-event]").forEach((row) => {
    const eventIndex = Number(row.dataset.checkEvent);
    const checkIndex = Number(row.dataset.checkIndex);
    const eventRoll = termEventRows.querySelector(`[data-event-roll="${eventIndex}"]`);
    const eventEffect = eventRoll?.value
      ? getCareerEventEffect(eventRoll.dataset.eventCareer, Number(eventRoll.value))
      : "";
    const check = getCareerEventChecks(eventEffect)[checkIndex];
    if (!check) return;
    const select = row.querySelector("[data-event-check-skill]");
    const roll = row.querySelector("[data-event-check-roll]");
    const dm = row.querySelector("[data-event-check-dm]");
    const skill = select?.value || check.options[0].skill;
    const result = row.querySelector("[data-event-check-result]");
    result.textContent = getEventCheckResult(check, skill, roll.value, dm.value);
  });
}

function updateInjuryRollPreviews() {
  termEventRows.querySelectorAll("[data-event-injury-roll-row]").forEach((row) => {
    const eventIndex = row.dataset.eventInjuryRollRow;
    const rollInput = row.querySelector("[data-event-injury-roll]");
    const detailInput = row.querySelector("[data-injury-detail-roll]");
    const result = row.querySelector("[data-injury-roll-result]");
    const detailRow = row.querySelector("[data-injury-detail-row]");
    const detailResult = row.querySelector("[data-injury-detail-result]");
    const eventRoll = termEventRows.querySelector(`[data-event-roll="${eventIndex}"]`);
    const careerName = eventRoll?.dataset.eventCareer || "";
    if (!rollInput.value) {
      result.textContent = "Throw END 6+ using 2D6 + END DM + career DM.";
      detailRow.hidden = true;
      detailResult.textContent = "";
      return;
    }
    if (!isValidManualRoll(rollInput.value, 2, 12)) {
      result.textContent = "Enter a valid 2D6 total from 2 to 12.";
      detailRow.hidden = true;
      detailResult.textContent = "";
      return;
    }
    const endDm = getCharacteristicDm(Number(form.elements.namedItem("end").value || 0));
    const careerDm = getInjuryCareerDm(careerName);
    const total = Number(rollInput.value) + endDm + careerDm;
    const throwEffect = total - 6;
    const injury = getInjuryTableEffect(throwEffect);
    result.textContent = `Adjusted throw ${total} (2D6 ${rollInput.value}${endDm ? ` ${endDm > 0 ? "+" : ""}${endDm} END DM` : ""}${careerDm ? ` ${careerDm} career DM` : ""}); Effect ${throwEffect >= 0 ? "+" : ""}${throwEffect}. ${injury.text}`;
    detailRow.hidden = !injury.needsDetailRoll;
    detailResult.textContent = detailInput.value && isValidManualRoll(detailInput.value, 1, 6)
      ? getInjuryDetail(throwEffect, Number(detailInput.value))
      : detailInput.value
        ? "Enter a valid 1D6 result from 1 to 6."
      : injury.needsDetailRoll ? "Roll or enter 1D6 for the injury detail." : "";
  });
}

function updateBenefitResults() {
  const careerName = document.querySelector("#character-career").value.trim();
  const career = getCareerDefinition(careerName);
  const generation = readGeneration();
  const earnedRank = generation.careerSkills?.length
    ? getCareerRankAtTerm(generation.careerSkills, generation.careerSkills.length - 1, careerName)
    : 0;
  let rankBenefitsBefore = 0;
  benefitRows.querySelectorAll("[data-benefit-table]").forEach((select) => {
    const index = select.dataset.benefitTable;
    const rollInput = benefitRows.querySelector(`[data-benefit-roll="${index}"]`);
    const dmInput = benefitRows.querySelector(`[data-benefit-dm="${index}"]`);
    const outcome = benefitRows.querySelector(`[data-benefit-outcome="${index}"]`);
    const dmField = document.querySelector(`#benefit-modifier-field-${index}`);
    const isRankBenefit = select.value === "rank";
    if (dmField) dmField.hidden = isRankBenefit;
    if (!outcome) return;
    if (isRankBenefit) {
      const newRank = earnedRank + rankBenefitsBefore + 1;
      rankBenefitsBefore += 1;
      if (newRank > 6) {
        outcome.value = "Rank is already at the career maximum (6).";
        return;
      }
      const rankSkill = career?.rankSkills[newRank]?.join(", ");
      outcome.value = `Promote to rank ${newRank}${rankSkill ? `; gain ${rankSkill} 1` : ""}.`;
      return;
    }
    if (!career || !rollInput.value) {
      outcome.value = "";
      return;
    }
    const baseRoll = Number(rollInput.value);
    if (!Number.isInteger(baseRoll) || baseRoll < 1 || baseRoll > 6) {
      outcome.value = "";
      return;
    }
    const dm = Number(dmInput.value || 0);
    const result = Math.min(6, Math.max(1, baseRoll + dm));
    const table = select.value === "cash" ? career.cashBenefits : career.materialBenefits;
    const benefit = table?.[result - 1];
    outcome.value = benefit
      ? `${select.value === "cash" ? `Cr ${Number(benefit).toLocaleString()}` : benefit} (result ${result}; ${careerName})`
      : `No ${select.value} result is available for ${careerName} at ${result}.`;
  });
}

function updateBenefitControls(select) {
  const row = select.closest(".benefit-row");
  const isRankBenefit = select.value === "rank";
  const rollInput = row.querySelector("[data-benefit-roll]");
  const rollButton = row.querySelector("[data-roll-sides]");
  const dmInput = row.querySelector("[data-benefit-dm]");
  if (isRankBenefit) rollInput.value = "";
  rollInput.disabled = isRankBenefit;
  rollButton.disabled = isRankBenefit;
  dmInput.disabled = isRankBenefit;
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

function rollTwoD6() {
  return Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
}

function updateIronManDeathState() {
  const isDead = ironManRuleInput.checked
    && (Array.from(termEventRows.querySelectorAll("[data-event-injury-roll]")).some((input) => isValidManualRoll(input.value, 2, 12))
      || Array.from(termEventRows.querySelectorAll("[data-event-card]")).some((card) => card.dataset.injuryRecorded === "true"));
  document.querySelector("#iron-man-death-alert").hidden = !isDead;
  termEventRows.querySelectorAll("[data-event-roll], [data-roll-sides], [data-event-check-roll], [data-event-check-skill], [data-event-check-dm], [data-event-injury-roll], [data-injury-detail-roll]").forEach((control) => {
    control.disabled = isDead;
  });
  document.querySelector("#career-progression-actions").querySelectorAll("button").forEach((button) => {
    button.disabled = isDead || (button.id !== "muster-out-button" && Number(careerTermsInput.value) >= 7);
  });
  document.querySelector("#career-switch-picker").querySelectorAll("button, select").forEach((control) => {
    control.disabled = isDead;
  });
  form.querySelector('button[type="submit"]').disabled = isDead;
}

function setCareerProgressError(message = "") {
  const error = document.querySelector("#career-progress-error");
  error.textContent = message;
  error.hidden = message === "";
}

function updateCareerAge(previousTerms, nextTerms, musteredOut = false) {
  const ageInput = document.querySelector("#character-age");
  const expectedPreviousAge = 18 + Math.max(0, previousTerms - (careerMusteredOut ? 0 : 1)) * 4;
  if (!ageInput.value || Number(ageInput.value) === expectedPreviousAge) {
    ageInput.value = String(18 + Math.max(0, nextTerms - (musteredOut ? 0 : 1)) * 4);
  }
}

function canCompleteCurrentTerm() {
  const careerName = document.querySelector("#character-career").value.trim();
  if (!getCareerDefinition(careerName)) {
    setCareerProgressError("Choose a listed career before continuing or mustering out.");
    document.querySelector("#character-career").focus();
    return false;
  }
  if (careerTrackingEnabled) {
    const currentTerm = careerSkillRows.querySelector(`[data-career-term="${careerTermsInput.value}"]`);
    const missingChoice = currentTerm && Array.from(currentTerm.querySelectorAll("select[required]")).some((select) => !select.value);
    if (missingChoice) {
      setCareerProgressError("Choose all required skill selections for this term before continuing.");
      currentTerm.querySelector("select:invalid")?.focus();
      return false;
    }
  }
  const eventRoll = termEventRows.querySelector(`[data-event-roll="${Number(careerTermsInput.value) - 1}"]`);
  if (!eventRoll?.value) {
    setCareerProgressError("Roll this term's career event before continuing or mustering out.");
    eventRoll?.focus();
    return false;
  }
  const activeEventIndex = Number(careerTermsInput.value) - 1;
  const emptyEventCheck = Array.from(termEventRows.querySelectorAll(`[data-check-event="${activeEventIndex}"] [data-event-check-roll]`))
    .find((input) => !isValidManualRoll(input.value, 2, 12));
  if (emptyEventCheck) {
    setCareerProgressError("Resolve this event's required throw before continuing or mustering out.");
    emptyEventCheck.focus();
    return false;
  }
  const injuryRow = termEventRows.querySelector(`[data-event-injury-roll-row="${activeEventIndex}"]`);
  if (injuryRow && !injuryRow.hidden) {
    const injuryRoll = injuryRow.querySelector("[data-event-injury-roll]");
    if (!isValidManualRoll(injuryRoll.value, 2, 12)) {
      setCareerProgressError("Roll or enter the Injury table throw before continuing or mustering out.");
      injuryRoll.focus();
      return false;
    }
    const detailRoll = injuryRow.querySelector("[data-injury-detail-roll]");
    if (!injuryRow.querySelector("[data-injury-detail-row]").hidden && !isValidManualRoll(detailRoll.value, 1, 6)) {
      setCareerProgressError("Roll or enter the Injury table's 1D6 detail before continuing or mustering out.");
      detailRoll.focus();
      return false;
    }
  }
  setCareerProgressError();
  return true;
}

function ensureCareerTracking(generation, careerName) {
  if (Array.isArray(generation.careerSkills)) return generation;
  generation.careerSkills = Array.from({ length: generation.terms }, (_, index) => ({
    term: index + 1,
    career: careerName,
    service: "",
    picks: []
  }));
  generation.events = generation.events.map((entry) => ({ ...entry, career: careerName }));
  careerTrackingEnabled = true;
  return generation;
}

function startNextCareerTerm(careerName) {
  if (!canCompleteCurrentTerm()) return;
  const generation = ensureCareerTracking(readGeneration(), document.querySelector("#character-career").value.trim());
  const previousTerms = generation.terms;
  if (previousTerms >= 7) {
    setCareerProgressError("Character generation supports up to seven career terms.");
    return;
  }

  generation.terms += 1;
  generation.careerSkills.push({ term: generation.terms, career: careerName, service: "", picks: [] });
  generation.events.push({ roll: "", career: careerName, outcome: "", injury: false });
  generation.musteredOut = false;
  careerMusteredOut = false;
  trackedCareerName = careerName;
  document.querySelector("#character-career").value = careerName;
  careerTermsInput.value = String(generation.terms);
  updateCareerAge(previousTerms, generation.terms);
  renderGenerationRows(generation);
  document.querySelector("#career-switch-picker").hidden = true;
  setCareerProgressError();
}

function setCharacterEditorMode(character) {
  const isSheet = Boolean(character);
  form.classList.toggle("character-sheet-mode", isSheet);
  document.querySelector("#dialog-title").textContent = isSheet ? "Character sheet" : "New character";
  document.querySelector("#character-editor-intro").textContent = isSheet
    ? "Update skills, carried items, and notes as the character plays. Career history and creation results are preserved."
    : "Capture the details you want at the table. You can update this record at any time.";
  document.querySelector("#save-character-button").textContent = isSheet ? "Save character sheet" : "Save character";
  careerGenerationSection.hidden = isSheet;
  characterSheetRecord.hidden = !isSheet;
  document.querySelector("#iron-man-toggle").hidden = isSheet;
  document.querySelector("#custom-characteristics-toggle").hidden = isSheet;
  document.querySelector("#standard-array-button").hidden = isSheet;
  document.querySelector("#homeworld-type-field").hidden = isSheet;
  document.querySelector("#homeworld-skill-field").hidden = isSheet;
  document.querySelector("#characteristic-helper").textContent = isSheet
    ? "Characteristics are preserved from character creation."
    : "Assign 5, 6, 7, 8, 9, and 10 exactly once—5 is lowest, 10 highest. Place them in Strength (STR), Dexterity (DEX), Endurance (END), Intelligence (INT), Education (EDU), and Social Standing (SOC).";
  document.querySelector("#skills-helper").textContent = isSheet
    ? "Update this list to reflect skills gained during play; career and homeworld awards are retained."
    : "Career and homeworld awards are added to these manually recorded skills when saved.";
  document.querySelector("#career-history-helper").textContent = isSheet
    ? "Career history captured during character creation is preserved."
    : "Record careers, terms, and notable turning points.";
  document.querySelector("#character-career").readOnly = isSheet;
  document.querySelector("#character-history").readOnly = isSheet;
  ATTRIBUTE_KEYS.forEach((key) => {
    form.elements.namedItem(key).readOnly = isSheet;
  });
  ironManRuleInput.disabled = isSheet;
  customCharacteristicsInput.disabled = isSheet;
  homeworldTypeInput.disabled = isSheet;
  homeworldSkillInput.disabled = isSheet;
  careerGenerationSection.querySelectorAll("input, select, textarea, button").forEach((control) => {
    control.disabled = isSheet;
  });
}

function resetForm() {
  form.reset();
  editingCharacterId = "";
  setCharacterEditorMode(null);
  document.querySelector("#character-id").value = "";
  currentInventory = [];
  careerTrackingEnabled = true;
  trackedCareerName = "";
  careerMusteredOut = false;
  ironManRuleInput.checked = false;
  careerTermsInput.value = "1";
  document.querySelector("#character-age").value = "18";
  document.querySelector("#character-career").value = "";
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
    terms: 1,
    bonusBenefits: 0,
    agingTechDm: 0,
    careerSkills: [{ term: 1, career: "", service: "", picks: [] }],
    events: [{ roll: "", career: "", outcome: "", injury: false }],
    aging: [],
    benefits: [{ table: "material", roll: "", outcome: "" }],
    traits: [],
    musteredOut: false
  });
}

function openEditor(character = null) {
  resetForm();
  if (character) {
    editingCharacterId = character.id;
    document.querySelector("#character-id").value = character.id;
    document.querySelector("#character-name").value = character.name;
    document.querySelector("#character-species").value = character.species;
    document.querySelector("#character-age").value = character.age;
    document.querySelector("#character-homeworld").value = character.homeworld;
    document.querySelector("#character-career").value = character.career;
    document.querySelector("#character-history").value = character.history;
    document.querySelector("#character-skills").value = getManualSkillLines(character);
    document.querySelector("#character-notes").value = character.notes;
    currentInventory = (character.inventory || []).map((entry) => ({ ...entry }));
    ATTRIBUTE_KEYS.forEach((key) => {
      form.elements.namedItem(key).value = character.attributes[key];
    });
    customCharacteristicsInput.checked = character.generation?.customCharacteristics === true;
    ironManRuleInput.checked = character.generation?.ironMan === true;
    const generation = character.generation || {
      homeworldType: "",
      homeworldSkill: "",
      terms: 0,
      bonusBenefits: 0,
      agingTechDm: 0,
      careerSkills: [],
      events: [],
      aging: [],
      benefits: [{ table: "material", roll: "", outcome: "" }],
      traits: []
    };
    careerTrackingEnabled = Array.isArray(generation.careerSkills);
    trackedCareerName = generation.trackedCareer || character.career;
    careerMusteredOut = generation.musteredOut ?? generation.terms > 0;
    homeworldTypeInput.value = generation.homeworldType;
    updateHomeworldSkillOptions(generation.homeworldSkill);
    careerTermsInput.value = String(generation.terms);
    if (!character.age) document.querySelector("#character-age").value = String(18 + generation.terms * 4);
    bonusBenefitsInput.value = String(generation.bonusBenefits);
    agingTechDmInput.value = String(generation.agingTechDm);
    renderGenerationRows(generation);
    renderInventory();
    updateDerivedCharacteristics();
    renderCharacterSheetRecord(character);
  }
  setCharacterEditorMode(character);
  dialog.showModal();
  document.querySelector("#character-name").focus();
}

function readForm() {
  const formData = new FormData(form);
  const existingCharacter = editingCharacterId
    ? characters.find((character) => character.id === editingCharacterId)
    : null;
  const age = formData.get("age");
  const attributes = existingCharacter
    ? { ...existingCharacter.attributes }
    : Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, String(formData.get(key) || "")]));
  const generation = existingCharacter?.generation || readGeneration();
  const skillLines = getSkillLines(String(formData.get("skills")));
  const awards = getCareerAwards(generation, generation.trackedCareer || String(formData.get("career")).trim());
  const skills = mergeAwardedSkills(skillLines, awards);
  if (generation.homeworldSkill) {
    const homeworldAward = { [generation.homeworldSkill.toLocaleLowerCase()]: { name: generation.homeworldSkill, level: 1 } };
    const merged = mergeAwardedSkills(getSkillLines(skills.join("\n")), homeworldAward);
    skills.splice(0, skills.length, ...merged);
  }

  return {
    id: String(formData.get("id") || crypto.randomUUID()),
    name: String(formData.get("name")).trim(),
    species: String(formData.get("species")).trim(),
    age: age === null ? "" : String(age),
    homeworld: String(formData.get("homeworld")).trim(),
    career: existingCharacter ? existingCharacter.career : String(formData.get("career")).trim(),
    attributes,
    history: existingCharacter ? existingCharacter.history : String(formData.get("history")).trim(),
    skills,
    notes: String(formData.get("notes")).trim(),
    generation: existingCharacter
      ? existingCharacter.generation
      : { ...generation, customCharacteristics: customCharacteristicsInput.checked },
    inventory: currentInventory.map((entry) => ({ ...entry })),
    updatedAt: new Date().toISOString()
  };
}

function handleSave(event) {
  event.preventDefault();
  if (!editingCharacterId) {
    const injuryOccurred = Array.from(termEventRows.querySelectorAll("[data-event-injury-roll]")).some((input) => isValidManualRoll(input.value, 2, 12))
      || Array.from(termEventRows.querySelectorAll("[data-event-card]")).some((card) => card.dataset.injuryRecorded === "true");
    if (ironManRuleInput.checked && injuryOccurred) {
      showNotice("This character died during creation under the Iron Man rule. Start a new character from the beginning.", true);
      return;
    }
    validateCharacteristics();
    const generation = readGeneration();
    const violations = getFirstTermSkillViolations(generation);
    if (violations.length) {
      showNotice(`Term 1 skills cannot exceed level 2: ${violations.join(", ")}.`, true);
      return;
    }
  }
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
  validateCharacteristics();
});
ATTRIBUTE_KEYS.forEach((key) => form.elements.namedItem(key).addEventListener("input", () => {
  validateCharacteristics();
  renderInventory();
  if (key === "edu") renderGenerationRows(readGeneration());
  else updateDerivedCharacteristics();
}));
searchInput.addEventListener("input", render);
form.addEventListener("submit", handleSave);
document.querySelector("#characters-nav-button").addEventListener("click", () => showView("characters"));
document.querySelector("#items-nav-button").addEventListener("click", () => showView("items"));
document.querySelector("#add-inventory-item-button").addEventListener("click", addInventoryItem);
inventoryList.addEventListener("change", updateInventoryEntry);
inventoryList.addEventListener("click", removeInventoryItem);
careerSkillRows.addEventListener("change", (event) => {
  if (!event.target.matches("[data-career-service], [data-career-pick]")) return;
  setCareerProgressError();
  careerTrackingEnabled = true;
  careerSkillRows.querySelectorAll("select").forEach((select) => {
    select.required = true;
  });
  updateDerivedCharacteristics();
});
document.querySelector("#new-item-button").addEventListener("click", () => openItemEditor());
document.querySelector("#empty-add-item-button").addEventListener("click", () => openItemEditor());
document.querySelector("#close-item-dialog-button").addEventListener("click", () => itemDialog.close());
document.querySelector("#cancel-item-dialog-button").addEventListener("click", () => itemDialog.close());
itemForm.addEventListener("submit", saveItem);
document.querySelector("#item-category").addEventListener("change", updateCyberneticItemFields);
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
  if (event.target.matches("[data-trait]")) updateTraitDescriptions();
  const benefitType = event.target.closest("[data-benefit-table]");
  if (benefitType) {
    updateBenefitControls(benefitType);
    updateBenefitResults();
    updateDerivedCharacteristics();
  }
});
form.addEventListener("input", (event) => {
  if (event.target.matches("[data-aging-roll]")) updateAgingPreviews();
  if (event.target.matches("[data-event-roll]")) updateEventPreviews(true);
  if (event.target.matches("[data-event-check-roll], [data-event-check-dm], [data-event-injury-roll], [data-injury-detail-roll]")) {
    updateCareerEventCheckPreviews();
    updateInjuryRollPreviews();
    updateEventPreviews();
  }
  if (event.target.matches("[data-benefit-roll], [data-benefit-dm]")) updateBenefitResults();
});
homeworldTypeInput.addEventListener("change", () => updateHomeworldSkillOptions());
bonusBenefitsInput.addEventListener("input", () => renderGenerationRows(readGeneration()));
agingTechDmInput.addEventListener("change", updateAgingPreviews);
document.querySelector("#character-career").addEventListener("change", () => {
  const careerInput = document.querySelector("#character-career");
  const nextCareer = careerInput.value.trim();
  const generation = readGeneration();
  trackedCareerName = nextCareer;
  setCareerProgressError();
  if (careerTrackingEnabled && generation.terms > 0) {
    const activeIndex = generation.terms - 1;
    generation.careerSkills[activeIndex].career = nextCareer;
    generation.events[activeIndex].career = nextCareer;
    generation.trackedCareer = nextCareer;
  }
  renderGenerationRows(generation);
});
ironManRuleInput.addEventListener("change", updateIronManDeathState);
termEventRows.addEventListener("change", (event) => {
  if (event.target.matches("[data-event-check-skill]")) {
    updateCareerEventCheckPreviews();
    updateEventPreviews();
  }
});
document.querySelector("#continue-career-button").addEventListener("click", () => {
  startNextCareerTerm(document.querySelector("#character-career").value.trim());
});
document.querySelector("#muster-out-button").addEventListener("click", () => {
  if (!canCompleteCurrentTerm()) return;
  const generation = readGeneration();
  const terms = generation.terms;
  updateCareerAge(terms, terms, true);
  careerMusteredOut = true;
  generation.musteredOut = true;
  renderGenerationRows(generation);
});
document.querySelector("#switch-career-button").addEventListener("click", () => {
  document.querySelector("#career-switch-picker").hidden = false;
  document.querySelector("#next-career-select").focus();
});
document.querySelector("#confirm-career-switch-button").addEventListener("click", () => {
  const nextCareer = document.querySelector("#next-career-select").value;
  if (!nextCareer) {
    setCareerProgressError("Choose a career before starting the next term.");
    document.querySelector("#next-career-select").focus();
    return;
  }
  startNextCareerTerm(nextCareer);
});
document.querySelector("#cancel-career-switch-button").addEventListener("click", () => {
  document.querySelector("#career-switch-picker").hidden = true;
  setCareerProgressError();
});
document.querySelector("#character-skills").addEventListener("input", updateDerivedCharacteristics);
homeworldSkillInput.addEventListener("change", updateDerivedCharacteristics);
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
