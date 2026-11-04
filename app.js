"use strict";

const STORAGE_KEY = "wayfarer.characters.v1";
const ITEM_STORAGE_KEY = "wayfarer.items.v1";
const BUILT_IN_ITEM_IDS = new Set(BUILT_IN_ITEMS.map((item) => item.id));
const ATTRIBUTE_KEYS = ["str", "dex", "end", "int", "edu", "soc"];
const ATTRIBUTE_LABELS = ["STR", "DEX", "END", "INT", "EDU", "SOC"];
const MILITARY_CAREERS = new Set(["army", "marine", "navy"]);
const LIFE_EVENT_DETAILS = {
  2: "Sickness or Injury: roll on the Injury table.",
  3: "Birth or Death: someone close to the character dies or is born.",
  4: "Good Fortune: gain DM+1 on one Cash Benefit roll.",
  5: "Ending of Relationship: change a Contact into an Enemy; if you have no Contact, gain an Enemy.",
  6: "Improved Relationship: change an Enemy into a Contact; if you have no Enemy, gain a Contact.",
  7: "New Relationship: become involved in a romantic relationship.",
  8: "Travel: gain Steward 1 or Carousing 1.",
  9: "Study: gain +1 EDU.",
  10: "Crime: lose one Benefit roll and roll Admin 8+; failure means spending the next Term in Prison.",
  11: "Cybersurgery: gain commonplace cybernetics worth Cr 5,000.",
  12: "Unusual Event: roll 1D6 on the Unusual Event table."
};
const UNUSUAL_EVENT_DETAILS = {
  1: "Missing Time: lose 3D days that you cannot remember.",
  2: "Psionics: gain basic Psionic training.",
  3: "Trait: gain a free Trait.",
  4: "Underworld Contacts: gain a senior criminal Contact.",
  5: "Contact with Government or Corporations: gain a senior government or corporate VIP as a Contact.",
  6: "Alien Artifact: find an alien artifact; its nature is up to the Referee."
};
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
const rollTermLengthInput = document.querySelector("#roll-term-length");
const termEventRows = document.querySelector("#term-event-rows");
const careerSkillRows = termEventRows;
const agingRows = document.querySelector("#aging-rows");
const benefitRows = document.querySelector("#benefit-rows");
const traitRows = document.querySelector("#trait-rows");
const proficientSkillList = document.querySelector("#proficient-skill-list");
const remainingSkillList = document.querySelector("#remaining-skill-list");
const skillCheckPanel = document.querySelector("#skill-check-panel");
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
let currentSkillLevels = new Map();
let generationSkillAdjustments = new Map();
let activeSkillCheck = null;
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
    && (entry.lifeRoll === undefined || isValidRoll(entry.lifeRoll, 2, 12))
    && (entry.lifeDetailRoll === undefined || isValidRoll(entry.lifeDetailRoll, 1, 6))
    && (entry.lifeSkillAward === undefined || isText(entry.lifeSkillAward))
    && (entry.lifeTraitAward === undefined || isText(entry.lifeTraitAward))
    && (entry.termYears === undefined || isValidRoll(entry.termYears, 1, 6))
    && (entry.lifeChecks === undefined || (Array.isArray(entry.lifeChecks) && entry.lifeChecks.every((check) => check
      && isText(check.skill)
      && isValidRoll(check.roll, 2, 12)
      && Number.isInteger(check.dm)
      && check.dm >= -20
      && check.dm <= 20)))
    && (entry.skillAwards === undefined || (Array.isArray(entry.skillAwards) && entry.skillAwards.every(isText)))
    && (entry.skillAwardCheckIndex === undefined || entry.skillAwardCheckIndex === null
      || (Number.isInteger(entry.skillAwardCheckIndex) && entry.skillAwardCheckIndex >= 0))
    && (entry.skillAwardRequiresSuccess === undefined || typeof entry.skillAwardRequiresSuccess === "boolean")
    && (!entry.skillAwardRequiresSuccess
      || (Number.isInteger(entry.skillAwardCheckIndex) && Array.isArray(entry.checks) && entry.checks[entry.skillAwardCheckIndex] !== undefined))
    && (entry.skillChoicesLocked === undefined || typeof entry.skillChoicesLocked === "boolean")
    && (entry.checks === undefined || (Array.isArray(entry.checks) && entry.checks.every((check) => check
      && isText(check.skill)
      && (check.kind === undefined || ["skill", "characteristic"].includes(check.kind))
      && (check.skillLevel === undefined || (Number.isInteger(check.skillLevel) && check.skillLevel >= 0 && check.skillLevel <= 5))
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
    && (generation.rollTermLength === undefined || typeof generation.rollTermLength === "boolean")
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
    && (generation.skillAdjustments === undefined || (Array.isArray(generation.skillAdjustments)
      && generation.skillAdjustments.every((entry) => entry
        && isText(entry.skill)
        && Number.isInteger(entry.delta)
        && entry.delta >= -5
        && entry.delta <= 5)))
    && (generation.careerSkills === undefined
      || (Array.isArray(generation.careerSkills)
        && generation.careerSkills.length === generation.terms
        && generation.careerSkills.every((entry, index) => entry
          && entry.term === index + 1
          && (entry.career === undefined || isText(entry.career))
          && isText(entry.service)
          && Array.isArray(entry.picks)
          && entry.picks.every(isText)
          && (entry.characteristicIncrease === undefined
            || entry.characteristicIncrease === ""
            || ATTRIBUTE_KEYS.includes(entry.characteristicIncrease)))));
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function setCharacterFormError(message = "") {
  const error = document.querySelector("#character-form-error");
  error.textContent = message;
  error.hidden = message === "";
  if (message) error.scrollIntoView({ block: "center", behavior: "smooth" });
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

function updateCareerDescription() {
  const careerName = document.querySelector("#character-career").value.trim();
  const career = getCareerDefinition(careerName);
  const description = career?.description || (careerName
    ? "No description is available for this career."
    : "Choose a career to see what the role involves.");
  const descriptionElement = document.querySelector("#career-description");
  descriptionElement.textContent = description;
  document.querySelector("#character-career").title = career?.description || "";
}

function getCharacteristicScore(key, throughTerm = Number.POSITIVE_INFINITY) {
  const baseScore = Number(form.elements.namedItem(key).value || 0);
  if (editingCharacterId) return baseScore;
  const generation = readGeneration();
  const careerIncreases = generation.careerSkills?.slice(0, throughTerm)
    .filter((entry) => entry.characteristicIncrease === key).length || 0;
  const lifeEventIncreases = key === "edu"
    ? generation.events?.slice(0, throughTerm).filter((entry) => Number(entry.lifeRoll) === 9).length || 0
    : 0;
  return baseScore + careerIncreases + lifeEventIncreases;
}

function getCareerEventEffect(careerName, roll) {
  const career = getCareerDefinition(careerName);
  return career?.eventDetails?.[roll] || (career?.eventNames?.[roll]
    ? `${career.eventNames[roll]}. See the ${careerName} career rules for this event's effects.`
    : "");
}

function getLifeEventEffect(roll, detailRoll) {
  const effect = LIFE_EVENT_DETAILS[Number(roll)] || "";
  if (Number(roll) !== 12 || !detailRoll) return effect;
  return `${effect} ${UNUSUAL_EVENT_DETAILS[Number(detailRoll)] || ""}`.trim();
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
    const options = candidates.map((candidate) => {
      const isCharacteristic = ATTRIBUTE_KEYS.some((key) => key.toUpperCase() === candidate[1].toUpperCase());
      return {
        skill: isCharacteristic ? candidate[1].toUpperCase() : canonicalSkillName(candidate[1]),
        target: Number(candidate[2]),
        kind: isCharacteristic ? "characteristic" : "skill",
        sourceStart: match.index + match[0].indexOf(match[1]) + candidate.index,
        sourceEnd: match.index + match[0].indexOf(match[1]) + candidate.index + candidate[0].length
      };
    });
    options.forEach((option, optionIndex) => {
      if (optionIndex >= candidates.length - 1) return;
      const afterOption = match[1].slice(candidates[optionIndex].index + candidates[optionIndex][0].length, candidates[optionIndex + 1].index);
      const directedOutcome = afterOption.match(/^\s*to\s+([^,.;]+?)(?=\s*,?\s+or\b|$)/i);
      if (directedOutcome) option.successOutcome = directedOutcome[1].trim();
    });
    if (!options.length) continue;

    const afterCheck = match[1].slice(candidates.at(-1).index + candidates.at(-1)[0].length).trim();
    let successOutcome = getOutcome(afterCheck, true);
    if (!successOutcome && /^to\b/i.test(afterCheck)) {
      successOutcome = afterCheck.replace(/^to\s+/i, "").replace(/\s*,?\s+or\b[\s\S]*$/i, "").trim();
    }
    successOutcome ||= getOutcome(effect, true);
    let failureOutcome = getOutcome(afterCheck, false) || getOutcome(effect, false);
    if (failureOutcome) failureOutcome = failureOutcome.replace(/^in either case\s+/i, "");
    const eitherWayMatch = effect.match(/\beither way\s*(?:,|:)?\s*([^.;]+)/i);
    const inEitherCaseMatch = effect.match(/\bin either case\s*(?:,|:)?\s*([^.;]+)/i);
    const inEitherCaseIsFailure = inEitherCaseMatch
      && /\bfailure\s*$/i.test(effect.slice(0, inEitherCaseMatch.index));
    const commonMatch = eitherWayMatch || (inEitherCaseIsFailure ? null : inEitherCaseMatch);
    if (/to avoid injury/i.test(afterCheck)) {
      failureOutcome ||= "roll on the Injury table";
      successOutcome ||= "avoid Injury";
    }
    checks.push({
      options,
      successOutcome: successOutcome ? successOutcome.replace(/^[,:\s]+/, "") : "Event effect as described above.",
      failureOutcome: failureOutcome ? failureOutcome.replace(/^[,:\s]+/, "") : "No separate failure effect is specified.",
      commonOutcome: commonMatch?.[1]?.trim() || ""
    });
  }
  const groupedChecks = [];
  checks.forEach((check) => {
    const previous = groupedChecks.at(-1);
    const lastOption = previous?.options.at(-1);
    const firstOption = check.options[0];
    const connector = previous && effect.slice(lastOption.sourceEnd, firstOption.sourceStart);
    if (previous && /\bor\b/i.test(connector) && !/[.;]/.test(connector)) {
      previous.options.at(-1).successOutcome ||= previous.successOutcome;
      previous.options.at(-1).failureOutcome ||= previous.failureOutcome;
      check.options[0].successOutcome ||= check.successOutcome;
      check.options[0].failureOutcome ||= check.failureOutcome;
      previous.options.push(...check.options);
      previous.successOutcome ||= check.successOutcome;
      previous.failureOutcome ||= check.failureOutcome;
      previous.commonOutcome ||= check.commonOutcome;
    } else {
      groupedChecks.push(check);
    }
  });
  groupedChecks.forEach((check) => {
    check.options.forEach((option) => {
      delete option.sourceStart;
      delete option.sourceEnd;
    });
  });
  return groupedChecks;
}

function getEventCheckResult(check, selectedSkill, roll, dm, modifiers = {}) {
  if (!roll) return "Enter the 2D6 total or roll 2D6; add the applicable DM.";
  if (!isValidManualRoll(roll, 2, 12)) return "Enter a valid 2D6 total from 2 to 12.";
  const option = check.options.find((candidate) => candidate.skill === selectedSkill) || check.options[0];
  const kind = modifiers.kind || option.kind;
  const skillLevel = Math.max(0, Number(modifiers.skillLevel || 0));
  const characteristicDm = kind === "characteristic"
    ? getCharacteristicDm(getCharacteristicScore(option.skill.toLocaleLowerCase(), modifiers.throughTerm))
    : 0;
  const skillDm = kind === "skill" ? skillLevel : 0;
  const total = Number(roll) + Number(dm || 0) + characteristicDm + skillDm;
  const success = total >= option.target;
  const outcome = (success ? option.successOutcome || check.successOutcome : option.failureOutcome || check.failureOutcome)
    .replace(/the skill (?:you )?rolled/gi, option.skill)
    .replace(/the skill you tested/gi, option.skill);
  const commonOutcome = (check.commonOutcome || "")
    .replace(/the skill (?:you )?rolled/gi, option.skill)
    .replace(/the skill you tested/gi, option.skill);
  const modifiersText = [
    characteristicDm ? `${characteristicDm > 0 ? "+" : ""}${characteristicDm} ${option.skill} DM` : "",
    skillDm ? `+${skillDm} ${option.skill} skill` : ""
  ].filter(Boolean).join(" ");
  return `${success ? "Success" : "Failure"} · ${roll}${Number(dm) ? ` ${Number(dm) > 0 ? "+" : ""}${Number(dm)}` : ""}${modifiersText ? ` ${modifiersText}` : ""} = ${total} vs ${option.target}+ · ${outcome}${commonOutcome ? ` · Either way, ${commonOutcome}` : ""}`;
}

function getSelectedEventCheckSkill(row) {
  const selectedRadio = row.querySelector("[data-event-check-skill]:checked");
  if (selectedRadio) return selectedRadio.value;
  return row.querySelector("select[data-event-check-skill]")?.value || row.dataset.checkSkill || "";
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
  return getGenerationSkillRanks(generation, careerName);
}

function canonicalSkillName(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "";
  const alias = SKILL_ALIASES[trimmed.toLocaleLowerCase()];
  if (alias) return alias;
  return SKILL_NAMES.find((skill) => skill.toLocaleLowerCase() === trimmed.toLocaleLowerCase()) || trimmed;
}

function getNamedSkillAwards(text) {
  if (!/(?:gain|increase|improve|grant|award)/i.test(text)) return [];
  const knownSkills = [...new Set([
    ...SKILL_NAMES,
    ...Object.values(CAREER_DATA).flatMap((career) => [...career.service, ...career.specialist, ...career.advanced])
  ])];
  return [...new Set(knownSkills
    .filter((skill) => new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i").test(text))
    .map(canonicalSkillName))];
}

function addSkillRanks(skillRanks, skill, amount = 1) {
  const name = canonicalSkillName(skill);
  if (!name || !Number.isFinite(amount)) return;
  const key = name.toLocaleLowerCase();
  const current = skillRanks.get(key);
  skillRanks.set(key, { name: current?.name || name, level: Math.max(0, (current?.level || 0) + amount) });
}

function getGenerationSkillRanks(generation, careerName, throughTerm = Number.POSITIVE_INFINITY) {
  const ranks = new Map();
  const add = (skill, amount = 1) => addSkillRanks(ranks, skill, amount);
  add(generation.homeworldSkill);
  const careerSkills = generation.careerSkills || [];
  let previousCareer = "";
  careerSkills.forEach((entry, index) => {
    if (index >= throughTerm) return;
    const termCareer = entry.career || careerName;
    const startsCareer = !previousCareer || termCareer.toLocaleLowerCase() !== previousCareer.toLocaleLowerCase();
    if (entry.term === 1) {
      const firstCareer = getCareerDefinition(termCareer);
      firstCareer?.service.forEach((skill) => add(skill, 0));
      add(entry.service);
    } else if (startsCareer) {
      const newCareer = getCareerDefinition(termCareer);
      newCareer?.service.forEach((skill) => add(skill, 0));
    }
    entry.picks.forEach((skill) => add(skill));
    const career = getCareerDefinition(termCareer);
    if (career) {
      const attainedRank = getCareerRankAtTerm(careerSkills, index, careerName);
      const previousRank = index ? getCareerRankAtTerm(careerSkills, index - 1, careerName) : 0;
      if (attainedRank > previousRank) (career.rankSkills[attainedRank] || []).forEach((skill) => add(skill));
    }
    const event = generation.events?.[index];
    const eventEffect = event?.effect || getCareerEventEffect(event?.career || termCareer, Number(event?.roll));
    if (event?.skillAwards?.length) {
      const awardCheckIndex = event.skillAwardCheckIndex;
      const awardCheck = Number.isInteger(awardCheckIndex) ? event.checks?.[awardCheckIndex] : null;
      const parsedAwardCheck = Number.isInteger(awardCheckIndex)
        ? getCareerEventChecks(eventEffect)[awardCheckIndex]
        : null;
      const awardCheckResult = awardCheck && parsedAwardCheck
        ? getEventCheckResult(parsedAwardCheck, awardCheck.skill, awardCheck.roll, awardCheck.dm, {
          skillLevel: ranks.get(canonicalSkillName(awardCheck.skill).toLocaleLowerCase())?.level || 0,
          kind: awardCheck.kind,
          throughTerm: index + 1
        })
        : "";
      if (!event.skillAwardRequiresSuccess || awardCheckResult.startsWith("Success")) {
        event.skillAwards.forEach((skill) => add(skill));
      }
    }
    (event?.checks || []).forEach((check, checkIndex) => {
      if (!check.roll) return;
      const parsedCheck = getCareerEventChecks(eventEffect)[checkIndex];
      if (!parsedCheck) return;
      const result = getEventCheckResult(parsedCheck, check.skill, check.roll, check.dm, {
        skillLevel: ranks.get(canonicalSkillName(check.skill).toLocaleLowerCase())?.level || 0,
        kind: check.kind,
        throughTerm: index + 1
      });
      const outcomeAwardsRolledSkill = (outcome) => /(?:gain|increase|improve)\w*[^.;]{0,50}\bskill\b[^.;]{0,30}\b(?:rolled|tested)\b/i.test(outcome);
      const success = result.startsWith("Success");
      const outcome = success ? parsedCheck.successOutcome : parsedCheck.failureOutcome;
      const appliesEitherWay = /\beither way\b[^.;]{0,120}/i.test(eventEffect) && outcomeAwardsRolledSkill(eventEffect);
      if ((success && outcomeAwardsRolledSkill(outcome)) || (!success && appliesEitherWay && outcomeAwardsRolledSkill(eventEffect))) {
        add(check.skill);
      }
      if (success) {
        const namedAwards = getNamedSkillAwards(outcome);
        if (namedAwards.length === 1) add(namedAwards[0]);
      }
    });
    if (!(event?.checks || []).length) {
      const namedAwards = getNamedSkillAwards(eventEffect);
      if (namedAwards.length === 1) add(namedAwards[0]);
    }
    if (Number(event?.lifeRoll) === 8 && event.lifeSkillAward) add(event.lifeSkillAward);
    previousCareer = termCareer;
  });
  if (careerSkills.length && careerSkills.length <= throughTerm) {
    const finalCareerName = careerSkills.at(-1).career || careerName;
    const finalCareer = getCareerDefinition(finalCareerName);
    const finalRank = getCareerRankAtTerm(careerSkills, careerSkills.length - 1, careerName);
    const rankPurchases = (generation.benefits || []).filter((entry) => entry.table === "rank").length;
    for (let rank = finalRank + 1; rank <= Math.min(6, finalRank + rankPurchases); rank += 1) {
      (finalCareer?.rankSkills[rank] || []).forEach((skill) => add(skill));
    }
  }
  (generation.skillAdjustments || []).forEach((entry) => add(entry.skill, entry.delta));
  return ranks;
}

function getSkillRankBeforeEventCheck(generation, eventIndex, checkIndex, skillName) {
  const event = generation.events?.[eventIndex];
  if (!event) return 0;
  const eventWithoutCheck = {
    ...event,
    checks: (event.checks || []).map((check, index) => index === checkIndex ? { ...check, roll: "" } : check)
  };
  if (event.skillAwardCheckIndex === checkIndex) {
    eventWithoutCheck.skillAwards = [];
    eventWithoutCheck.skillAwardCheckIndex = null;
    eventWithoutCheck.skillAwardRequiresSuccess = false;
  }
  const beforeCheck = {
    ...generation,
    events: generation.events.map((entry, index) => index === eventIndex ? eventWithoutCheck : entry)
  };
  const ranks = getGenerationSkillRanks(beforeCheck, generation.trackedCareer || trackedCareerName);
  return ranks.get(canonicalSkillName(skillName).toLocaleLowerCase())?.level || 0;
}

function getFirstTermSkillViolations(generation) {
  const firstTerm = generation.careerSkills?.[0];
  if (!firstTerm) return [];
  return [...getGenerationSkillRanks(generation, generation.trackedCareer || firstTerm.career, 1).entries()]
    .filter(([, skill]) => skill.level > 2)
    .map(([skill]) => skill);
}

function getSavedSkillRanks(character) {
  const ranks = new Map();
  (character.skills || []).forEach((line) => {
    const match = String(line).trim().match(/^(.*?)(?:\s+(\d+))?$/);
    if (!match || !match[1]) return;
    const name = canonicalSkillName(match[1]);
    const level = Math.min(5, Math.max(0, Number(match[2] || 1)));
    const key = name.toLocaleLowerCase();
    const current = ranks.get(key);
    ranks.set(key, { name: current?.name || name, level: (current?.level || 0) + level });
  });
  return ranks;
}

function serializeSkillRanks(ranks) {
  return [...ranks.values()]
    .map((skill) => `${skill.name} ${skill.level}`)
    .sort((a, b) => a.localeCompare(b));
}

function getCurrentSkillRanks() {
  if (editingCharacterId) return currentSkillLevels;
  return getGenerationSkillRanks(readGeneration(), trackedCareerName || document.querySelector("#character-career").value.trim());
}

function updateDerivedCharacteristics() {
  const end = getCharacteristicScore("end");
  const skillRanks = getCurrentSkillRanks();
  const athletics = skillRanks.get("athletics")?.level || 0;
  const stamina = end + athletics;
  document.querySelector("#derived-stamina").textContent = String(stamina);
  document.querySelector("#derived-lifeblood").textContent = String(stamina * 2);
  const totalRanks = [...skillRanks.values()].reduce((total, skill) => total + skill.level, 0);
  const skillLimit = getCharacteristicScore("int") + getCharacteristicScore("edu");
  const skillRankDisplay = document.querySelector("#derived-skill-ranks");
  skillRankDisplay.textContent = `${totalRanks} / ${skillLimit}`;
  skillRankDisplay.classList.toggle("over-limit", totalRanks > skillLimit);
  const skillCapStatus = document.querySelector("#skill-cap-status");
  const overLimit = totalRanks > skillLimit;
  skillCapStatus.textContent = editingCharacterId
    ? `${totalRanks} / ${skillLimit} skill ranks · ${overLimit ? "reduce ranks to meet the character limit" : "within INT + EDU limit"}`
    : careerMusteredOut
      ? `${totalRanks} / ${skillLimit} skill ranks · ${overLimit ? "reduce ranks to meet the mustering-out limit" : "within INT + EDU limit"}`
      : `${totalRanks} skill ranks earned so far · final INT + EDU limit is applied at mustering out.`;
  skillCapStatus.classList.toggle("over-limit", overLimit && (editingCharacterId || careerMusteredOut));
}

function getAllSkillNames(skillRanks = getCurrentSkillRanks()) {
  const names = new Map(SKILL_NAMES.map((skill) => [skill.toLocaleLowerCase(), skill]));
  Object.values(CAREER_DATA).forEach((career) => {
    [...career.service, ...career.specialist, ...career.advanced].forEach((skill) => {
      const name = canonicalSkillName(skill);
      names.set(name.toLocaleLowerCase(), name);
    });
  });
  skillRanks.forEach((skill) => names.set(skill.name.toLocaleLowerCase(), skill.name));
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

function getSkillTraitAdvantages(skill) {
  const generation = editingCharacterId
    ? characters.find((character) => character.id === editingCharacterId)?.generation || {}
    : readGeneration();
  const traits = [...(generation.traits || []), ...(generation.events || []).map((entry) => entry.lifeTraitAward).filter(Boolean)];
  const available = SKILL_ADVANTAGE_TRAITS[canonicalSkillName(skill)] || [];
  return available.filter((trait) => traits.includes(trait));
}

function renderSkillRow(skill, canAdjust, proficiency) {
  const key = skill.name.toLocaleLowerCase();
  const level = skill.level;
  const advantages = getSkillTraitAdvantages(skill.name);
  const skillLabel = level === 0 ? `${skill.name} · Level 0` : `${skill.name} · Level ${level}`;
  const adjustmentControls = canAdjust
    ? `<div class="skill-adjustments">
        <button type="button" class="skill-rank-button" data-skill-adjust="${escapeHtml(key)}" data-adjustment="-1" aria-label="Reduce ${escapeHtml(skill.name)} by one level" ${level <= 0 ? "disabled" : ""}>−</button>
        <button type="button" class="skill-rank-button" data-skill-adjust="${escapeHtml(key)}" data-adjustment="1" aria-label="Increase ${escapeHtml(skill.name)} by one level" ${level >= (key === "jack of all trades" ? 3 : 5) ? "disabled" : ""}>+</button>
      </div>`
    : "";
  const sourceBadge = !editingCharacterId && skill.source ? `<small class="skill-source">${escapeHtml(skill.source)}</small>` : "";
  return `<article class="skill-row ${proficiency ? "skill-row-proficient" : "skill-row-untrained"}" data-skill-key="${escapeHtml(key)}">
    <button type="button" class="skill-roll-button" data-open-skill-check="${escapeHtml(key)}" aria-label="Set up a skill check for ${escapeHtml(skill.name)}">
      <span class="skill-row-name">${escapeHtml(skillLabel)}</span>
      <small>${level > 0 ? "Click to set up a check" : level === 0 ? "Trained; no unskilled penalty" : "Untrained"}</small>
    </button>
    ${sourceBadge}
    ${advantages.length ? `<small class="skill-trait-hint">Trait advantage: ${advantages.map(escapeHtml).join(", ")} (apply when relevant)</small>` : ""}
    ${adjustmentControls}
  </article>`;
}

function renderSkillSections() {
  const ranks = getCurrentSkillRanks();
  const skills = getAllSkillNames(ranks).map((name) => {
    const skill = ranks.get(name.toLocaleLowerCase());
    return skill
      ? { ...skill, source: skill.level > 0 ? "Tracked" : "Level 0" }
      : { name, level: -1, source: "" };
  });
  const proficient = skills.filter((skill) => skill.level > 0);
  const remaining = skills.filter((skill) => skill.level <= 0);
  const canAdjust = Boolean(editingCharacterId || careerMusteredOut);
  proficientSkillList.innerHTML = proficient.length
    ? proficient.map((skill) => renderSkillRow(skill, canAdjust, true)).join("")
    : '<p class="section-helper skill-empty-state">No proficient skills yet. Career and homeworld selections appear here automatically.</p>';
  remainingSkillList.innerHTML = remaining.map((skill) => renderSkillRow(skill, canAdjust, false)).join("");
  document.querySelector("#proficient-skill-count").textContent = String(proficient.length);
  document.querySelector("#remaining-skill-count").textContent = String(remaining.length);
  updateDerivedCharacteristics();
}

function updateSkillAdjustment(skillName, adjustment) {
  const name = canonicalSkillName(skillName);
  const key = name.toLocaleLowerCase();
  const current = getCurrentSkillRanks().get(key)?.level ?? 0;
  const maxLevel = key === "jack of all trades" ? 3 : 5;
  const next = Math.min(maxLevel, Math.max(0, current + adjustment));
  if (next === current) return;

  if (editingCharacterId) {
    currentSkillLevels = new Map(currentSkillLevels);
    currentSkillLevels.set(key, { name, level: next });
  } else {
    const generation = readGeneration();
    const baseRanks = getGenerationSkillRanks({ ...generation, skillAdjustments: [] }, trackedCareerName);
    const baseLevel = baseRanks.get(key)?.level || 0;
    const totalRanks = [...getCurrentSkillRanks().values()].reduce((total, skill) => total + skill.level, 0);
    const skillLimit = getCharacteristicScore("int") + getCharacteristicScore("edu");
    if (adjustment > 0 && careerMusteredOut && totalRanks >= skillLimit) {
      showNotice("This character has reached the INT + EDU skill-rank limit for character creation.", true);
      return;
    }
    generationSkillAdjustments.set(key, { skill: name, delta: next - baseLevel });
  }
  renderSkillSections();
  updateSkillCheckModifiers();
}

function openSkillCheck(skillKey) {
  const ranks = getCurrentSkillRanks();
  const key = canonicalSkillName(skillKey).toLocaleLowerCase();
  const skill = ranks.get(key);
  const skillName = skill?.name || getAllSkillNames(ranks).find((name) => name.toLocaleLowerCase() === key) || canonicalSkillName(skillKey);
  if (!skillName) return;
  activeSkillCheck = { name: skillName, level: skill?.level ?? -1 };
  const isUntrained = activeSkillCheck.level < 0;
  const traits = getSkillTraitAdvantages(skillName);
  skillCheckPanel.hidden = false;
  skillCheckPanel.innerHTML = `<div class="skill-check-heading">
      <div><p class="eyebrow">SKILL CHECK</p><h3>${escapeHtml(skillName)}${isUntrained ? " · Untrained" : ` · Level ${activeSkillCheck.level}`}</h3></div>
      <button type="button" class="icon-button" data-close-skill-check aria-label="Close skill check">×</button>
    </div>
    <div class="skill-check-controls">
      <label class="field"><span>Task characteristic</span>
        <select data-skill-check-characteristic>
          ${ATTRIBUTE_KEYS.map((key) => `<option value="${key}" ${key === "int" ? "selected" : ""}>${key.toUpperCase()} (${escapeHtml(form.elements.namedItem(key).value)})</option>`).join("")}
        </select>
      </label>
      <label class="field"><span>Target</span><input data-skill-check-target type="number" min="2" max="30" value="8"></label>
      <label class="field"><span>Other DM</span><input data-skill-check-dm type="number" min="-20" max="20" value="0"></label>
      ${traits.length ? `<label class="skill-advantage-toggle"><input data-skill-check-advantage type="checkbox"><span>Apply relevant trait Advantage: ${traits.map(escapeHtml).join(", ")}</span></label>` : ""}
    </div>
    <p class="skill-check-modifiers" data-skill-check-modifiers></p>
    <button type="button" class="button button-primary" data-roll-skill-check>Roll skill check</button>
    <p class="skill-check-result" data-skill-check-result aria-live="polite"></p>`;
  updateSkillCheckModifiers();
}

function updateSkillCheckModifiers() {
  if (!activeSkillCheck || skillCheckPanel.hidden) return;
  const ranks = getCurrentSkillRanks();
  const skill = ranks.get(activeSkillCheck.name.toLocaleLowerCase());
  const level = skill?.level ?? -1;
  const characteristic = skillCheckPanel.querySelector("[data-skill-check-characteristic]").value;
  const characteristicScore = getCharacteristicScore(characteristic);
  const characteristicDm = getCharacteristicDm(characteristicScore);
  const jackOfAllTrades = ranks.get("jack of all trades")?.level || 0;
  const unskilledDm = level < 0 && activeSkillCheck.name !== "Athletics" ? -Math.max(0, 3 - jackOfAllTrades) : 0;
  const result = level > 0 ? level + characteristicDm : characteristicDm + unskilledDm;
  const resultText = `${characteristic.toUpperCase()} DM ${characteristicDm >= 0 ? "+" : ""}${characteristicDm}`
    + `${level > 0 ? ` · ${activeSkillCheck.name} ${level}` : level === 0 ? " · Level 0 (no skill DM)" : ` · Unskilled DM ${unskilledDm}${jackOfAllTrades ? ` (Jack of All Trades ${jackOfAllTrades})` : ""}`}`
    + ` · Total modifier ${result + Number(skillCheckPanel.querySelector("[data-skill-check-dm]").value || 0) >= 0 ? "+" : ""}${result + Number(skillCheckPanel.querySelector("[data-skill-check-dm]").value || 0)}`;
  skillCheckPanel.querySelector("[data-skill-check-modifiers]").textContent = resultText;
}

function rollSkillCheck() {
  if (!activeSkillCheck) return;
  const ranks = getCurrentSkillRanks();
  const skill = ranks.get(activeSkillCheck.name.toLocaleLowerCase());
  const level = skill?.level ?? -1;
  const characteristic = skillCheckPanel.querySelector("[data-skill-check-characteristic]").value;
  const score = getCharacteristicScore(characteristic);
  const characteristicDm = getCharacteristicDm(score);
  const jackOfAllTrades = ranks.get("jack of all trades")?.level || 0;
  const unskilledDm = level < 0 && activeSkillCheck.name !== "Athletics" ? -Math.max(0, 3 - jackOfAllTrades) : 0;
  const extraDm = Number(skillCheckPanel.querySelector("[data-skill-check-dm]").value || 0);
  const target = Number(skillCheckPanel.querySelector("[data-skill-check-target]").value || 8);
  if (!Number.isInteger(extraDm) || extraDm < -20 || extraDm > 20 || !Number.isInteger(target) || target < 2 || target > 30) {
    skillCheckPanel.querySelector("[data-skill-check-result]").textContent = "Enter an integer target from 2 to 30 and an integer situational DM from −20 to +20.";
    return;
  }
  const hasAdvantage = Boolean(skillCheckPanel.querySelector("[data-skill-check-advantage]")?.checked);
  const dice = Array.from({ length: hasAdvantage ? 3 : 2 }, () => Math.floor(Math.random() * 6) + 1);
  const usedDice = hasAdvantage ? dice.sort((a, b) => b - a).slice(0, 2) : dice;
  const diceTotal = usedDice.reduce((sum, die) => sum + die, 0);
  const skillDm = level > 0 ? level : 0;
  const totalDm = characteristicDm + skillDm + unskilledDm + extraDm;
  const total = diceTotal + totalDm;
  const natural = usedDice.length === 2 ? usedDice.reduce((sum, die) => sum + die, 0) : diceTotal;
  const success = natural === 12 || (natural !== 2 && total >= target);
  const result = skillCheckPanel.querySelector("[data-skill-check-result]");
  const signedDm = totalDm >= 0 ? `+ ${totalDm}` : `− ${Math.abs(totalDm)}`;
  result.textContent = `${success ? "Success" : "Failure"} · ${usedDice.join(" + ")}${hasAdvantage ? ` (Advantage; rolled ${dice.join(", ")})` : ""} = ${diceTotal} ${signedDm} = ${total} vs ${target}+`;
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
    rollTermLength: rollTermLengthInput.checked,
    trackedCareer: careerTrackingEnabled ? trackedCareerName : undefined,
    careerSkills: careerTrackingEnabled
      ? Array.from(careerSkillRows.querySelectorAll("[data-career-term]"), (row) => ({
        term: Number(row.dataset.careerTerm),
        career: row.dataset.careerName || "",
        service: row.querySelector("[data-career-service]")?.value || "",
        picks: Array.from(row.querySelectorAll("[data-career-pick]"), (select) => select.value).filter(Boolean),
        characteristicIncrease: row.querySelector("[data-career-characteristic]")?.value || ""
      }))
      : undefined,
    events: Array.from(termEventRows.querySelectorAll("[data-event-roll]"), (input) => {
      const eventIndex = input.dataset.eventRoll;
      const injuryRoll = termEventRows.querySelector(`[data-event-injury-roll="${eventIndex}"]`)?.value || "";
      const skillAwardSelect = termEventRows.querySelector(`[data-event-skill-award="${eventIndex}"]`);
      return {
        roll: input.value,
        career: input.dataset.eventCareer || "",
        outcome: document.querySelector(`#event-outcome-${eventIndex}`).value.trim(),
        effect: document.querySelector(`#event-outcome-${eventIndex}`).dataset.eventEffect || "",
        injury: Boolean(injuryRoll) || input.closest("[data-event-card]")?.dataset.injuryRecorded === "true",
        injuryRoll,
        injuryDetailRoll: termEventRows.querySelector(`[data-injury-detail-roll="${eventIndex}"]`)?.value || "",
        lifeRoll: termEventRows.querySelector(`[data-life-event-roll="${eventIndex}"]`)?.value || "",
        lifeDetailRoll: termEventRows.querySelector(`[data-life-event-detail-roll="${eventIndex}"]`)?.value || "",
        lifeSkillAward: termEventRows.querySelector(`[data-life-skill-award="${eventIndex}"]`)?.value || "",
        lifeTraitAward: termEventRows.querySelector(`[data-life-trait-award="${eventIndex}"]`)?.value || "",
        termYears: termEventRows.querySelector(`[data-term-years="${eventIndex}"]`)?.value || "",
        skillAwards: skillAwardSelect?.value ? [skillAwardSelect.value] : [],
        skillAwardCheckIndex: skillAwardSelect?.dataset.awardCheckIndex === "" || !skillAwardSelect
          ? null
          : Number(skillAwardSelect.dataset.awardCheckIndex),
        skillAwardRequiresSuccess: Boolean(skillAwardSelect && skillAwardSelect.dataset.awardCheckIndex !== ""),
        skillChoicesLocked: Boolean(input.closest("[data-event-card]")?.dataset.skillChoicesLocked === "true"
          || isValidManualRoll(input.value, 2, 12)),
        checks: Array.from(termEventRows.querySelectorAll(`[data-check-event="${eventIndex}"][data-check-source="career"]`), (checkRow) => ({
          skill: getSelectedEventCheckSkill(checkRow) || checkRow.dataset.checkSkill || "",
          kind: checkRow.querySelector("[data-event-check-skill]:checked")?.dataset.kind || checkRow.dataset.checkKind || "skill",
          roll: checkRow.querySelector("[data-event-check-roll]")?.value || "",
          dm: Number(checkRow.querySelector("[data-event-check-dm]")?.value || 0)
        })),
        lifeChecks: Array.from(termEventRows.querySelectorAll(`[data-check-event="${eventIndex}"][data-check-source="life"]`), (checkRow) => ({
          skill: getSelectedEventCheckSkill(checkRow) || checkRow.dataset.checkSkill || "",
          kind: checkRow.querySelector("[data-event-check-skill]:checked")?.dataset.kind || checkRow.dataset.checkKind || "skill",
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
    skillAdjustments: [...generationSkillAdjustments.values()],
    musteredOut: careerMusteredOut,
    ironMan: ironManRuleInput.checked
  };
}

function getTraitDescription(traitName) {
  const details = getTraitDetails(traitName);
  if (!details) return traitName ? "No description is available for this saved trait." : "Choose a trait to see its prerequisite and effect.";
  return `Prerequisite: ${details.prerequisite} Effect: ${details.effect}`;
}

function getTraitDetails(traitName) {
  const normalizedName = String(traitName || "").replace(/[’‘]/g, "'");
  return TRAIT_DETAILS[normalizedName];
}

function updateTraitDescriptions() {
  traitRows.querySelectorAll("[data-trait]").forEach((select) => {
    const description = traitRows.querySelector(`#${select.dataset.traitDescription}`);
    const details = getTraitDetails(select.value);
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
  const savedTraits = [...(generation.traits || []), ...(generation.events || []).map((entry) => entry.lifeTraitAward).filter(Boolean)];
  const traitEntries = [...new Set(savedTraits)].map((trait) => {
    const details = getTraitDetails(trait);
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
    const savedRanks = getSavedSkillRanks(character);
    (entry.checks || []).forEach((check, checkIndex) => {
      if (!check.roll || !checks[checkIndex]) return;
      const option = checks[checkIndex].options.find((candidate) => candidate.skill === check.skill) || checks[checkIndex].options[0];
      const result = getEventCheckResult(checks[checkIndex], check.skill, check.roll, check.dm, {
        kind: check.kind || option.kind,
        skillLevel: check.skillLevel ?? (option.kind === "skill" ? savedRanks.get(canonicalSkillName(check.skill).toLocaleLowerCase())?.level || 0 : 0)
      });
      records.push(`<strong>Term ${index + 1} throw:</strong> ${escapeHtml(result)}`);
    });
    const lifeEffect = getLifeEventEffect(entry.lifeRoll, entry.lifeDetailRoll);
    if (isValidManualRoll(entry.lifeRoll, 2, 12)) {
      records.push(`<strong>Term ${index + 1} Life Event · Roll ${escapeHtml(entry.lifeRoll)}:</strong> ${escapeHtml(lifeEffect)}`);
      const lifeChecks = getCareerEventChecks(lifeEffect);
      (entry.lifeChecks || []).forEach((check, checkIndex) => {
        if (!check.roll || !lifeChecks[checkIndex]) return;
        const option = lifeChecks[checkIndex].options.find((candidate) => candidate.skill === check.skill) || lifeChecks[checkIndex].options[0];
        const result = getEventCheckResult(lifeChecks[checkIndex], check.skill, check.roll, check.dm, {
          kind: check.kind || option.kind,
          skillLevel: option.kind === "skill" ? savedRanks.get(canonicalSkillName(check.skill).toLocaleLowerCase())?.level || 0 : 0
        });
        records.push(`<strong>Term ${index + 1} Life Event throw:</strong> ${escapeHtml(result)}`);
      });
    }
    if (isValidManualRoll(entry.termYears, 1, 6)) {
      records.push(`<strong>Term ${index + 1} length:</strong> ${escapeHtml(entry.termYears)} years`);
    }
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
  const requireCareerChoices = careerTrackingEnabled;
  let previousCareer = "";
  let termsInCareer = 0;
  return Array.from({ length: generation.terms }, (_, index) => {
    const term = index + 1;
    const entry = generation.careerSkills?.[index] || { service: "", picks: [] };
    const eventEntry = generation.events?.[index];
    const locked = Boolean(eventEntry?.skillChoicesLocked || isValidManualRoll(eventEntry?.roll, 2, 12));
    const educationIncreases = generation.careerSkills?.slice(0, index + 1)
      .filter((termEntry) => termEntry.characteristicIncrease === "edu").length || 0;
    const canUseAdvanced = Number(form.elements.namedItem("edu").value || 0) + educationIncreases >= 8;
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
    const skillLevelCount = term <= 3 ? 2 : 1;
    const characteristicIncrease = entry.characteristicIncrease || "";
    const pickCount = skillLevelCount - (characteristicIncrease ? 1 : 0);
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
      ? `<label class="field"><span>${term === 1 ? "Choose one Service skill · level 1" : "New-career Service skill · level 0"}</span>
          <select data-career-service aria-label="Term ${term} service skill" ${requireCareerChoices ? "required" : ""} ${locked ? "disabled" : ""}>${skillOptions(entry.service, true)}</select>
        </label>`
      : "";
    const pickRows = Array.from({ length: pickCount }, (_, pickIndex) => `
      <label class="field"><span>Skill level ${pickIndex + 1} of ${skillLevelCount}</span>
        <select data-career-pick aria-label="Term ${term} skill choice ${pickIndex + 1}" ${requireCareerChoices ? "required" : ""} ${locked ? "disabled" : ""}>
          ${skillOptions(allowedPicks[pickIndex] || "")}
        </select>
      </label>`).join("");
    const characteristicOptions = `<option value="">Keep all skill levels</option>${ATTRIBUTE_KEYS.map((key) => (
      `<option value="${key}" ${characteristicIncrease === key ? "selected" : ""}>${key.toUpperCase()} +1</option>`
    )).join("")}`;
    const characteristicChoice = `<label class="field field-wide"><span>Optional: spend one skill level to improve a characteristic</span>
      <select data-career-characteristic aria-label="Term ${term} characteristic increase" ${locked ? "disabled" : ""}>${characteristicOptions}</select>
      <small class="field-helper">Choose one characteristic for +1 instead of one skill level this term.</small>
    </label>`;
    const skillCap = term === 1 ? "Skill levels cannot exceed level 2 during the first term." : "";
    const rankInfo = rankIncrease ? [
      rankSkills ? `Rank ${rank} bonus: ${escapeHtml(rankSkills)} 1.` : "",
      rankAttribute ? `Rank ${rank} characteristic benefit: ${escapeHtml(rankAttribute)}.` : ""
    ].filter(Boolean).join(" ") : "";
    return `<article class="generation-row career-skill-row" data-career-term="${term}" data-career-name="${escapeHtml(termCareerName)}" data-skill-choices-locked="${locked}">
      <div class="generation-row-heading"><strong>Term ${term} · ${escapeHtml(termCareerName)} skill choices</strong></div>
      <div class="form-grid career-skill-grid">${serviceRow}${pickRows}${characteristicChoice}</div>
      <p class="section-helper">${term === 1 ? "All other Service skills start at level 0. " : ""}${locked ? "Skill choices locked because this term's event has been rolled. " : ""}${skillCap} ${rankInfo}</p>
    </article>`;
  });
}

function renderCareerEventChecks(eventIndex, effect, savedChecks = [], source = "career") {
  const checks = getCareerEventChecks(effect);
  return checks.map((check, checkIndex) => {
    const saved = savedChecks[checkIndex] || {};
    const selectedSkill = check.options.some((option) => option.skill === saved.skill)
      ? saved.skill
      : check.options[0].skill;
    const option = check.options.find((candidate) => candidate.skill === selectedSkill);
    const choice = check.options.length > 1
      ? `<fieldset class="event-check-choice">
          <legend>Choose one check</legend>
          ${check.options.map((candidate) => (
            `<label class="event-check-option"><input type="radio" name="event-check-${eventIndex}-${checkIndex}" data-event-check-skill value="${escapeHtml(candidate.skill)}" data-kind="${candidate.kind}" ${candidate.skill === selectedSkill ? "checked" : ""}><span>${escapeHtml(candidate.skill)} ${candidate.target}+</span></label>`
          )).join("")}
        </fieldset>`
      : `<strong class="event-check-name">${escapeHtml(option.skill)} ${option.target}+</strong>`;
    return `<div class="event-check-row" data-check-event="${eventIndex}" data-check-source="${source}" data-check-index="${checkIndex}" data-check-skill="${escapeHtml(option.skill)}" data-check-kind="${option.kind}">
      ${choice}
      <label class="visually-hidden" for="${source}-event-check-roll-${eventIndex}-${checkIndex}">2D6 result for ${escapeHtml(option.skill)} check</label>
      <input id="${source}-event-check-roll-${eventIndex}-${checkIndex}" data-event-check-roll type="number" min="2" max="12" value="${escapeHtml(saved.roll || "")}" inputmode="numeric" placeholder="2D6" ${isValidManualRoll(saved.roll, 2, 12) ? "data-roll-locked=\"true\" disabled" : ""}>
      <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="${source}-event-check-roll-${eventIndex}-${checkIndex}" ${isValidManualRoll(saved.roll, 2, 12) ? "disabled" : ""}>Roll 2D6</button>
      <label class="event-check-dm"><span>DM</span>
        <input data-event-check-dm type="number" min="-20" max="20" value="${escapeHtml(saved.dm ?? 0)}" inputmode="numeric">
      </label>
      <p class="event-check-result" data-event-check-result aria-live="polite"></p>
    </div>`;
  }).join("");
}

function renderEventSkillAward(eventIndex, effect, savedAwards = [], checkCount = 0, careerName = "") {
  const outcomes = getCareerEventChecks(effect).map((check) => check.successOutcome);
  const awardText = outcomes.length ? outcomes.join(" ") : effect;
  const namedChoices = getNamedSkillAwards(awardText);
  const categoryMatch = awardText.match(/\b(?:one|a)\s+(?:(\w+)\s+)?(service|specialist|advanced education)\s+skills?\b/i);
  const categoryCareer = getCareerDefinition(categoryMatch?.[1] || careerName);
  const category = categoryMatch?.[2].toLocaleLowerCase();
  const categoryChoices = category === "service" ? categoryCareer?.service
    : category === "specialist" ? categoryCareer?.specialist
      : category === "advanced education" ? categoryCareer?.advanced
        : null;
  const hasGenericAward = /(?:any|one|a)\s+(?:one\s+)?skill[^.;]{0,50}(?:level|increase)|free skill level|skill level/i.test(awardText);
  const requiresSelection = Boolean(categoryMatch) || (hasGenericAward && !namedChoices.length) || namedChoices.length > 1;
  if (!requiresSelection) return "";
  const selectedSkill = savedAwards[0] || "";
  const awardCheckIndex = checkCount ? 0 : "";
  const options = categoryChoices?.length ? categoryChoices
    : namedChoices.length ? [...new Set(namedChoices)] : SKILL_NAMES;
  return `<label class="field event-skill-award">
    <span>${checkCount ? "Skill to gain on a successful check" : "Skill to gain from this event"}</span>
    <select data-event-skill-award="${eventIndex}" data-award-check-index="${awardCheckIndex}" required>
      <option value="">Choose a skill</option>
      ${options.map((skill) => `<option value="${escapeHtml(skill)}" ${selectedSkill === skill ? "selected" : ""}>${escapeHtml(skill)}</option>`).join("")}
    </select>
  </label>`;
}

function renderGenerationRows(generation = readGeneration()) {
  const { terms, bonusBenefits, agingTechDm } = generation;
  const skillRows = renderCareerSkillRows(generation);
  termEventRows.innerHTML = Array.from({ length: terms }, (_, index) => {
    const entry = generation.events[index] || { roll: "", outcome: "", checks: [] };
    const number = index + 1;
    const termCareer = entry.career || generation.careerSkills?.[index]?.career || document.querySelector("#character-career").value.trim();
    const eventEffect = entry.roll ? getCareerEventEffect(termCareer, Number(entry.roll)) : "";
    const eventName = getCareerDefinition(termCareer)?.eventNames?.[Number(entry.roll)] || "";
    const lifeEvent = eventName === "Life Event";
    const lifeEffect = lifeEvent && entry.lifeRoll ? getLifeEventEffect(entry.lifeRoll, entry.lifeDetailRoll) : "";
    const eventChecks = eventEffect ? renderCareerEventChecks(index, eventEffect, entry.checks) : "";
    const eventSkillAward = eventEffect
      ? renderEventSkillAward(index, eventEffect, entry.skillAwards || [], getCareerEventChecks(eventEffect).length, termCareer)
      : "";
    const lifeChecks = lifeEffect ? renderCareerEventChecks(index, lifeEffect, entry.lifeChecks || [], "life") : "";
    const lifeSkillOptions = Number(entry.lifeRoll) === 8
      ? `<label class="field"><span>Skill gained from Travel</span>
          <select data-life-skill-award="${index}" required>
            <option value="">Choose Steward or Carousing</option>
            <option value="Steward" ${entry.lifeSkillAward === "Steward" ? "selected" : ""}>Steward 1</option>
            <option value="Carousing" ${entry.lifeSkillAward === "Carousing" ? "selected" : ""}>Carousing 1</option>
          </select>
        </label>`
      : "";
    const lifeTraitOptions = Number(entry.lifeRoll) === 12 && Number(entry.lifeDetailRoll) === 3
      ? `<label class="field"><span>Trait gained from the Unusual Event</span>
          <select data-life-trait-award="${index}" required>
            <option value="">Choose a trait</option>
            ${TRAIT_NAMES.map((trait) => `<option value="${escapeHtml(trait)}" ${entry.lifeTraitAward === trait ? "selected" : ""}>${escapeHtml(trait)}</option>`).join("")}
          </select>
          <small class="trait-description">${escapeHtml(getTraitDescription(entry.lifeTraitAward || ""))}</small>
        </label>`
      : "";
    const lifeRollLocked = isValidManualRoll(entry.lifeRoll, 2, 12);
    const lifeDetailLocked = isValidManualRoll(entry.lifeDetailRoll, 1, 6);
    const termYearsLocked = isValidManualRoll(entry.termYears, 1, 6);
    const injuryRoll = entry.injuryRoll || "";
    const injuryDetailRoll = entry.injuryDetailRoll || "";
    const eventLocked = isValidManualRoll(entry.roll, 2, 12);
    return `<section class="term-generation-group">${skillRows[index]}
      <article class="generation-row" data-event-card="${index}" data-injury-recorded="${entry.injury ? "true" : "false"}" data-skill-choices-locked="${entry.skillChoicesLocked || eventLocked ? "true" : "false"}">
      <div class="generation-row-heading"><strong>Term ${number} ${termCareer ? `${escapeHtml(termCareer)} ` : ""}event · 2D6</strong>
        <div class="dice-entry">
          <label class="visually-hidden" for="event-roll-${index}">Term ${number} event roll</label>
          <input id="event-roll-${index}" data-event-roll="${index}" data-event-career="${escapeHtml(termCareer)}" type="number" min="2" max="12" value="${escapeHtml(entry.roll)}" inputmode="numeric" ${eventLocked ? "data-roll-locked=\"true\" disabled" : ""}>
          <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="event-roll-${index}" ${eventLocked ? "disabled" : ""}>Roll 2D6</button>
        </div>
      </div>
      ${eventLocked ? '<p class="section-helper">Event result locked.</p>' : ""}
      <p class="aging-preview" id="event-result-${index}" aria-live="polite"></p>
      <label class="field"><span>Event checks, choices, and effects</span>
        <textarea id="event-outcome-${index}" data-event-outcome="${index}" data-event-effect="${escapeHtml(entry.effect || eventEffect)}" rows="3" maxlength="1200" placeholder="Roll to display the event result and effects">${escapeHtml(entry.outcome)}</textarea>
      </label>
      <div class="event-checks" data-event-checks="${index}" data-effect="${escapeHtml(eventEffect)}">${eventChecks}</div>
      <div class="event-skill-award-container" data-event-skill-award-container="${index}" data-effect="${escapeHtml(eventEffect)}">${eventSkillAward}</div>
      ${lifeEvent ? `<section class="life-event-box" data-life-event="${index}" data-effect="${escapeHtml(lifeEffect)}">
        <div class="generation-row-heading"><strong>Life Event · 2D6</strong>
          <div class="dice-entry">
            <label class="visually-hidden" for="life-event-roll-${index}">Term ${number} life event roll</label>
            <input id="life-event-roll-${index}" data-life-event-roll="${index}" type="number" min="2" max="12" value="${escapeHtml(entry.lifeRoll || "")}" inputmode="numeric" placeholder="2D6" ${lifeRollLocked ? "data-roll-locked=\"true\" disabled" : ""}>
            <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="life-event-roll-${index}" ${lifeRollLocked ? "disabled" : ""}>Roll 2D6</button>
          </div>
        </div>
        <p class="life-event-result" data-life-event-result="${index}" aria-live="polite">${escapeHtml(lifeEffect)}</p>
        <div class="event-checks" data-life-event-checks="${index}" data-effect="${escapeHtml(lifeEffect)}">${lifeChecks}</div>
        ${lifeSkillOptions}
        ${Number(entry.lifeRoll) === 12 ? `<div class="life-event-detail-controls">
          <label class="field"><span>Unusual Event · 1D6</span>
            <div class="event-injury-controls">
              <input id="life-event-detail-roll-${index}" data-life-event-detail-roll="${index}" type="number" min="1" max="6" value="${escapeHtml(entry.lifeDetailRoll || "")}" inputmode="numeric" placeholder="1D6" ${lifeDetailLocked ? "data-roll-locked=\"true\" disabled" : ""}>
              <button class="button button-quiet dice-button" type="button" data-roll-sides="1" data-roll-target="life-event-detail-roll-${index}" ${lifeDetailLocked ? "disabled" : ""}>Roll 1D6</button>
            </div>
          </label>
        </div>` : `<div class="life-event-detail-controls" data-life-event-detail-placeholder></div>`}
        ${lifeTraitOptions}
      </section>` : ""}
      <section class="event-injury-roll" data-event-injury-roll-row="${index}" ${/injury/i.test(eventEffect) ? "" : "hidden"}>
        <strong>Injury table · END 6+</strong>
        <p class="section-helper">Roll 2D6 or enter your result. The app applies END and career DMs and shows the injury-table outcome.</p>
        <div class="event-injury-controls">
          <label class="visually-hidden" for="injury-roll-${index}">Injury END throw 2D6 result</label>
          <input id="injury-roll-${index}" data-event-injury-roll="${index}" type="number" min="2" max="12" value="${escapeHtml(injuryRoll)}" inputmode="numeric" placeholder="2D6" ${isValidManualRoll(injuryRoll, 2, 12) ? "data-roll-locked=\"true\" disabled" : ""}>
          <button class="button button-quiet dice-button" type="button" data-roll-sides="2" data-roll-target="injury-roll-${index}" ${isValidManualRoll(injuryRoll, 2, 12) ? "disabled" : ""}>Roll 2D6</button>
        </div>
        <p class="injury-roll-result" data-injury-roll-result="${index}" aria-live="polite"></p>
        <div class="event-injury-detail" data-injury-detail-row="${index}" hidden>
          <label class="field"><span>Injury detail · 1D6</span>
            <div class="event-injury-controls">
              <input id="injury-detail-roll-${index}" data-injury-detail-roll="${index}" type="number" min="1" max="6" value="${escapeHtml(injuryDetailRoll)}" inputmode="numeric" placeholder="1D6" ${isValidManualRoll(injuryDetailRoll, 1, 6) ? "data-roll-locked=\"true\" disabled" : ""}>
              <button class="button button-quiet dice-button" type="button" data-roll-sides="1" data-roll-target="injury-detail-roll-${index}" id="injury-detail-button-${index}" ${isValidManualRoll(injuryDetailRoll, 1, 6) ? "disabled" : ""}>Roll 1D6</button>
            </div>
          </label>
          <p class="injury-roll-result" data-injury-detail-result="${index}" aria-live="polite"></p>
        </div>
      </section>
      ${generation.rollTermLength ? `<div class="term-length-controls">
        <label class="field"><span>Term ${number} length · 1D6 years</span>
          <div class="event-injury-controls">
            <input id="term-years-${index}" data-term-years="${index}" type="number" min="1" max="6" value="${escapeHtml(entry.termYears || "")}" inputmode="numeric" placeholder="1D6" ${termYearsLocked ? "data-roll-locked=\"true\" disabled" : ""}>
            <button class="button button-quiet dice-button" type="button" data-roll-sides="1" data-roll-target="term-years-${index}" ${termYearsLocked ? "disabled" : ""}>Roll 1D6</button>
          </div>
        </label>
        <p class="section-helper">Age after this term: ${18 + generation.events.slice(0, index).reduce((sum, termEvent) => sum + (Number(termEvent.termYears) || 4), 0) + (Number(entry.termYears) || 0)}.</p>
      </div>` : ""}
      </article>
    </section>`;
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
  renderSkillSections();
  updateDerivedCharacteristics();
}

function lockTermSkillChoices(eventInput) {
  const eventCard = eventInput.closest("[data-event-card]");
  if (!eventCard || !isValidManualRoll(eventInput.value, 2, 12)) return true;
  if (!getCareerDefinition(eventInput.dataset.eventCareer || "")) {
    eventInput.value = "";
    setCareerProgressError("Choose a listed career before rolling its event.");
    document.querySelector("#character-career").focus();
    return false;
  }
  const eventIndex = Number(eventInput.dataset.eventRoll);
  const skillRow = careerSkillRows.querySelector(`[data-career-term="${eventIndex + 1}"]`);
  const missingChoice = careerTrackingEnabled
    ? Array.from(skillRow?.querySelectorAll("select[required]") || []).find((select) => !select.value)
    : null;
  if (missingChoice) {
    eventInput.value = "";
    setCareerProgressError("Choose this term's career skills before rolling its event; those choices lock once the event is rolled.");
    missingChoice.focus();
    return false;
  }
  eventCard.dataset.skillChoicesLocked = "true";
  eventInput.dataset.rollLocked = "true";
  eventInput.disabled = true;
  const eventRollButton = termEventRows.querySelector(`[data-roll-target="${eventInput.id}"]`);
  if (eventRollButton) eventRollButton.disabled = true;
  if (skillRow) {
    skillRow.dataset.skillChoicesLocked = "true";
    skillRow.querySelectorAll("select").forEach((select) => {
      select.disabled = true;
    });
    const helper = skillRow.querySelector(".section-helper");
    if (helper && !helper.textContent.includes("Skill choices locked")) {
      helper.textContent = `Skill choices locked because this term's event has been rolled. ${helper.textContent}`.trim();
    }
  }
  return true;
}

function lockEventRollResult(input, minimum, maximum) {
  if (!isValidManualRoll(input.value, minimum, maximum)) return;
  input.dataset.rollLocked = "true";
  input.disabled = true;
  const rollButton = termEventRows.querySelector(`[data-roll-target="${input.id}"]`);
  if (rollButton) rollButton.disabled = true;
}

function updateEventPreviews(replaceEffects = false) {
  termEventRows.querySelectorAll("[data-event-roll]").forEach((input) => {
    const preview = document.querySelector(`#event-result-${input.dataset.eventRoll}`);
    const outcome = document.querySelector(`#event-outcome-${input.dataset.eventRoll}`);
    const injuryRow = termEventRows.querySelector(`[data-event-injury-roll-row="${input.dataset.eventRoll}"]`);
    const checkRows = termEventRows.querySelector(`[data-event-checks="${input.dataset.eventRoll}"]`);
    const skillAwardContainer = termEventRows.querySelector(`[data-event-skill-award-container="${input.dataset.eventRoll}"]`);
    if (!preview) return;
    if (!input.value) {
      preview.textContent = "";
      if (outcome && replaceEffects) outcome.value = "";
      if (injuryRow) injuryRow.hidden = true;
      if (checkRows) {
        checkRows.innerHTML = "";
        checkRows.dataset.effect = "";
      }
      if (skillAwardContainer) {
        skillAwardContainer.innerHTML = "";
        skillAwardContainer.dataset.effect = "";
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
      const currentChecks = Array.from(checkRows.querySelectorAll('[data-check-event][data-check-source="career"]'), (row) => ({
        skill: getSelectedEventCheckSkill(row) || row.querySelector("[data-event-check-roll]")?.dataset.skill || "",
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
    if (skillAwardContainer && skillAwardContainer.dataset.effect !== effect) {
      const selectedAwards = Array.from(skillAwardContainer.querySelectorAll("[data-event-skill-award]"), (select) => select.value).filter(Boolean);
      skillAwardContainer.innerHTML = renderEventSkillAward(
        input.dataset.eventRoll,
        effect,
        selectedAwards,
        getCareerEventChecks(effect).length,
        input.dataset.eventCareer
      );
      skillAwardContainer.dataset.effect = effect;
    }
    if (injuryRow) {
      const eventChecks = getCareerEventChecks(effect);
      const eventIndex = input.dataset.eventRoll;
      const lifeRoll = termEventRows.querySelector(`[data-life-event-roll="${eventIndex}"]`)?.value;
      const requiresInjury = result === "Injury" || /^Injury:/i.test(effect) || Number(lifeRoll) === 2
        || eventChecks.some((check, checkIndex) => {
          const row = checkRows.querySelector(`[data-check-index="${checkIndex}"]`);
        const skill = row ? getSelectedEventCheckSkill(row) || row.querySelector("[data-event-check-roll]")?.dataset.skill : check.options[0].skill;
        const option = check.options.find((candidate) => candidate.skill === skill) || check.options[0];
        const roll = row?.querySelector("[data-event-check-roll]")?.value;
        const dm = Number(row?.querySelector("[data-event-check-dm]")?.value || 0);
        const skillLevel = option.kind === "skill"
          ? getSkillRankBeforeEventCheck(readGeneration(), Number(eventIndex), checkIndex, skill)
          : 0;
        return roll && getEventCheckResult(check, skill, roll, dm, {
          kind: option.kind,
          skillLevel,
          throughTerm: Number(eventIndex) + 1
        }).startsWith("Failure")
          && /injury/i.test(check.failureOutcome);
      });
      injuryRow.hidden = !requiresInjury;
      injuryRow.dataset.requiresInjury = String(requiresInjury);
      injuryRow.dataset.result = result || "";
      injuryRow.dataset.eventIndex = eventIndex;
    }
  });
  updateCareerEventCheckPreviews();
  updateEventSkillAwardRequirements();
  updateInjuryRollPreviews();
  updateIronManDeathState();
}

function updateEventSkillAwardRequirements() {
  termEventRows.querySelectorAll("[data-event-skill-award]").forEach((select) => {
    const checkIndex = select.dataset.awardCheckIndex;
    if (checkIndex === "") {
      select.required = true;
      return;
    }
    const result = termEventRows.querySelector(
      `[data-check-event="${select.dataset.eventSkillAward}"][data-check-source="career"][data-check-index="${checkIndex}"] [data-event-check-result]`
    );
    select.required = Boolean(result?.textContent.startsWith("Success"));
  });
}

function updateCareerEventCheckPreviews() {
  const generation = readGeneration();
  termEventRows.querySelectorAll("[data-check-event]").forEach((row) => {
    const eventIndex = Number(row.dataset.checkEvent);
    const checkIndex = Number(row.dataset.checkIndex);
    const eventRoll = termEventRows.querySelector(`[data-event-roll="${eventIndex}"]`);
    const lifeRoll = termEventRows.querySelector(`[data-life-event-roll="${eventIndex}"]`);
    const eventEffect = row.dataset.checkSource === "life" && lifeRoll?.value
      ? getLifeEventEffect(lifeRoll.value, termEventRows.querySelector(`[data-life-event-detail-roll="${eventIndex}"]`)?.value)
      : eventRoll?.value
      ? getCareerEventEffect(eventRoll.dataset.eventCareer, Number(eventRoll.value))
      : "";
    const check = getCareerEventChecks(eventEffect)[checkIndex];
    if (!check) return;
    const roll = row.querySelector("[data-event-check-roll]");
    const dm = row.querySelector("[data-event-check-dm]");
    const skill = getSelectedEventCheckSkill(row) || check.options[0].skill;
    const option = check.options.find((candidate) => candidate.skill === skill) || check.options[0];
    const skillLevel = option.kind !== "skill" ? 0
      : row.dataset.checkSource === "life"
        ? getGenerationSkillRanks(generation, eventRoll?.dataset.eventCareer || trackedCareerName, eventIndex + 1)
          .get(canonicalSkillName(skill).toLocaleLowerCase())?.level || 0
        : getSkillRankBeforeEventCheck(generation, eventIndex, checkIndex, skill);
    const result = row.querySelector("[data-event-check-result]");
    const skillLabel = row.querySelector('label[for^="event-check-roll-"]');
    if (skillLabel) skillLabel.textContent = `2D6 result for ${skill} check`;
    roll.setAttribute("aria-label", `2D6 result for ${skill} check`);
    result.textContent = getEventCheckResult(check, skill, roll.value, dm.value, {
      kind: option.kind,
      skillLevel,
      throughTerm: eventIndex + 1
    });
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
    const endDm = getCharacteristicDm(getCharacteristicScore("end", Number(eventIndex) + 1));
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
  termEventRows.querySelectorAll("[data-event-roll], [data-life-event-roll], [data-life-event-detail-roll], [data-term-years], [data-roll-sides], [data-event-check-roll], [data-event-check-skill], [data-event-check-dm], [data-event-injury-roll], [data-injury-detail-roll]").forEach((control) => {
    const targetInput = control.matches("[data-roll-sides]")
      ? document.querySelector(`#${control.dataset.rollTarget}`)
      : control;
    control.disabled = isDead || targetInput?.dataset.rollLocked === "true";
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
  const generation = readGeneration();
  const completedTerms = musteredOut ? nextTerms : previousTerms;
  const termYears = (term) => generation.rollTermLength
    ? Number(generation.events[term]?.termYears) || 4
    : 4;
  const previousAge = 18 + generation.events.slice(0, Math.max(0, completedTerms - 1))
    .reduce((total, _event, term) => total + termYears(term), 0);
  const nextAge = previousAge + (completedTerms ? termYears(completedTerms - 1) : 0);
  if (!ageInput.value || Number(ageInput.value) === previousAge || Number(ageInput.value) === nextAge) {
    ageInput.value = String(nextAge);
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
  const firstTermViolations = Number(careerTermsInput.value) === 1
    ? getFirstTermSkillViolations(readGeneration())
    : [];
  if (firstTermViolations.length) {
    setCareerProgressError(`Term 1 skills cannot exceed level 2: ${firstTermViolations.join(", ")}.`);
    return false;
  }
  const eventRoll = termEventRows.querySelector(`[data-event-roll="${Number(careerTermsInput.value) - 1}"]`);
  if (!eventRoll?.value) {
    setCareerProgressError("Roll this term's career event before continuing or mustering out.");
    eventRoll?.focus();
    return false;
  }
  const activeEventIndex = Number(careerTermsInput.value) - 1;
  const missingEventSelection = Array.from(termEventRows.querySelectorAll(
    `[data-event-skill-award="${activeEventIndex}"], [data-life-skill-award="${activeEventIndex}"], [data-life-trait-award="${activeEventIndex}"]`
  )).find((select) => select.required && !select.value);
  if (missingEventSelection) {
    setCareerProgressError("Choose the required skill or trait award for this event before continuing or mustering out.");
    missingEventSelection.focus();
    return false;
  }
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
  if (rollTermLengthInput.checked) {
    const termYears = termEventRows.querySelector(`[data-term-years="${activeEventIndex}"]`);
    if (!isValidManualRoll(termYears?.value, 1, 6)) {
      setCareerProgressError("Roll or enter this term's length before continuing or mustering out.");
      termYears?.focus();
      return false;
    }
  }
  const activeEvent = readGeneration().events[activeEventIndex];
  if (getCareerDefinition(activeEvent?.career || careerName)?.eventNames?.[Number(activeEvent?.roll)] === "Life Event") {
    if (!isValidManualRoll(activeEvent.lifeRoll, 2, 12)) {
      const lifeRoll = termEventRows.querySelector(`[data-life-event-roll="${activeEventIndex}"]`);
      setCareerProgressError("Roll or enter this term's Life Event before continuing or mustering out.");
      lifeRoll?.focus();
      return false;
    }
    if (Number(activeEvent.lifeRoll) === 8 && !activeEvent.lifeSkillAward) {
      const skillAward = termEventRows.querySelector(`[data-life-skill-award="${activeEventIndex}"]`);
      setCareerProgressError("Choose the skill gained from the Life Event before continuing or mustering out.");
      skillAward?.focus();
      return false;
    }
    if (Number(activeEvent.lifeRoll) === 10
      && !(activeEvent.lifeChecks || []).some((check) => isValidManualRoll(check.roll, 2, 12))) {
      const checkRoll = termEventRows.querySelector(`[data-life-event-checks="${activeEventIndex}"] [data-event-check-roll]`);
      setCareerProgressError("Resolve the Life Event's Admin check before continuing or mustering out.");
      checkRoll?.focus();
      return false;
    }
    if (Number(activeEvent.lifeRoll) === 12) {
      if (!isValidManualRoll(activeEvent.lifeDetailRoll, 1, 6)) {
        const detailRoll = termEventRows.querySelector(`[data-life-event-detail-roll="${activeEventIndex}"]`);
        setCareerProgressError("Roll or enter the Unusual Event detail before continuing or mustering out.");
        detailRoll?.focus();
        return false;
      }
      if (Number(activeEvent.lifeDetailRoll) === 3 && !activeEvent.lifeTraitAward) {
        const traitAward = termEventRows.querySelector(`[data-life-trait-award="${activeEventIndex}"]`);
        setCareerProgressError("Choose the Trait gained from the Unusual Event before continuing or mustering out.");
        traitAward?.focus();
        return false;
      }
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
  document.querySelector("#skills-title").textContent = isSheet
    ? "Skills are tracked on this sheet. Adjust ranks as they change during play, then click a skill to make a check."
    : "Career and homeworld skills are tracked automatically. Select a skill to set up a check using its rank, a task characteristic, and any applicable trait.";
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
  setCharacterFormError();
  document.querySelector("#character-age-helper").textContent = "Normally 18 + 4 years per career term.";
  editingCharacterId = "";
  currentSkillLevels = new Map();
  generationSkillAdjustments = new Map();
  activeSkillCheck = null;
  skillCheckPanel.hidden = true;
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
  updateCareerDescription();
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
    rollTermLength: false,
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
    document.querySelector("#character-notes").value = character.notes;
    currentSkillLevels = getSavedSkillRanks(character);
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
    rollTermLengthInput.checked = generation.rollTermLength === true;
    document.querySelector("#character-age-helper").textContent = rollTermLengthInput.checked
      ? "Optional rule: roll 1D6 years for each term instead of using four years."
      : "Normally 18 + 4 years per career term.";
    generationSkillAdjustments = new Map((generation.skillAdjustments || []).map((entry) => [
      canonicalSkillName(entry.skill).toLocaleLowerCase(),
      { skill: canonicalSkillName(entry.skill), delta: entry.delta }
    ]));
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
    : Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, String(getCharacteristicScore(key))]));
  const generation = existingCharacter?.generation || readGeneration();
  if (!existingCharacter) {
    generation.events.forEach((entry, eventIndex) => {
      entry.checks.forEach((check, checkIndex) => {
        const eventEffect = entry.effect || getCareerEventEffect(entry.career || generation.trackedCareer, Number(entry.roll));
        const option = getCareerEventChecks(eventEffect)[checkIndex]?.options.find((candidate) => candidate.skill === check.skill);
        check.skillLevel = option?.kind === "skill"
          ? getSkillRankBeforeEventCheck(generation, eventIndex, checkIndex, check.skill)
          : 0;
      });
    });
  }
  const skills = existingCharacter
    ? serializeSkillRanks(currentSkillLevels)
    : serializeSkillRanks(getCareerAwards(generation, generation.trackedCareer || String(formData.get("career")).trim()));

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
  setCharacterFormError();
  if (!editingCharacterId) {
    const injuryOccurred = Array.from(termEventRows.querySelectorAll("[data-event-injury-roll]")).some((input) => isValidManualRoll(input.value, 2, 12))
      || Array.from(termEventRows.querySelectorAll("[data-event-card]")).some((card) => card.dataset.injuryRecorded === "true");
    if (ironManRuleInput.checked && injuryOccurred) {
      setCharacterFormError("This character died during creation under the Iron Man rule. Start a new character from the beginning.");
      return;
    }
    validateCharacteristics();
    const generation = readGeneration();
    const violations = getFirstTermSkillViolations(generation);
    if (violations.length) {
      setCharacterFormError(`Term 1 skills cannot exceed level 2: ${violations.join(", ")}.`);
      return;
    }
    const ranks = getGenerationSkillRanks(generation, generation.trackedCareer || trackedCareerName);
    const overRanked = [...ranks.values()].filter((skill) => skill.level > (skill.name === "Jack of All Trades" ? 3 : 5));
    if (overRanked.length) {
      setCharacterFormError(`Skill rank limits exceeded: ${overRanked.map((skill) => skill.name).join(", ")}.`);
      return;
    }
    if (careerMusteredOut) {
      const totalRanks = [...ranks.values()].reduce((total, skill) => total + skill.level, 0);
      const skillLimit = getCharacteristicScore("int") + getCharacteristicScore("edu");
      if (totalRanks > skillLimit) {
        setCharacterFormError(`Skill ranks total ${totalRanks}, above the INT + EDU limit of ${skillLimit}. Reduce ranks before saving.`);
        return;
      }
    }
  } else {
    const overRanked = [...currentSkillLevels.values()].filter((skill) => skill.level > (skill.name === "Jack of All Trades" ? 3 : 5));
    if (overRanked.length) {
      setCharacterFormError(`Skill rank limits exceeded: ${overRanked.map((skill) => skill.name).join(", ")}.`);
      return;
    }
  }
  if (!form.reportValidity()) {
    const invalidField = form.querySelector(":invalid");
    const label = invalidField?.labels?.[0]?.textContent.trim() || invalidField?.name || "A required field";
    setCharacterFormError(`${label}: ${invalidField?.validationMessage || "Please correct this field."}`);
    invalidField?.focus();
    return;
  }

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
    setCharacterFormError(`Character could not be saved: ${error.message}`);
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
  updateSkillCheckModifiers();
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
  if (!document.querySelector("#character-form-error").hidden) setCharacterFormError();
  if (event.target.matches("[data-trait]")) {
    updateTraitDescriptions();
    renderSkillSections();
  }
  if (event.target.matches("[data-event-skill-award], [data-life-skill-award]")) {
    renderSkillSections();
    updateDerivedCharacteristics();
  }
  if (event.target.matches("[data-life-trait-award]")) {
    event.target.parentElement.querySelector(".trait-description").textContent = getTraitDescription(event.target.value);
    renderSkillSections();
  }
  const benefitType = event.target.closest("[data-benefit-table]");
  if (benefitType) {
    updateBenefitControls(benefitType);
    updateBenefitResults();
    updateDerivedCharacteristics();
  }
});
form.addEventListener("input", (event) => {
  if (!document.querySelector("#character-form-error").hidden) setCharacterFormError();
  if (event.target.matches("[data-aging-roll]")) updateAgingPreviews();
  if (event.target.matches("[data-event-roll]")) {
    if (!lockTermSkillChoices(event.target)) {
      updateEventPreviews(true);
      return;
    }
    updateEventPreviews(true);
    if (isValidManualRoll(event.target.value, 2, 12)) renderGenerationRows(readGeneration());
  }
  if (event.target.matches("[data-life-event-roll], [data-life-event-detail-roll]")) {
    const range = event.target.matches("[data-life-event-roll]") ? [2, 12] : [1, 6];
    lockEventRollResult(event.target, ...range);
    if (isValidManualRoll(event.target.value, ...range)) renderGenerationRows(readGeneration());
  }
  if (event.target.matches("[data-term-years]")) {
    lockEventRollResult(event.target, 1, 6);
    if (isValidManualRoll(event.target.value, 1, 6)) renderGenerationRows(readGeneration());
  }
  if (event.target.matches("[data-event-check-roll], [data-event-check-dm], [data-event-injury-roll], [data-injury-detail-roll]")) {
    if (event.target.matches("[data-event-check-roll], [data-event-injury-roll]")) lockEventRollResult(event.target, 2, 12);
    if (event.target.matches("[data-injury-detail-roll]")) lockEventRollResult(event.target, 1, 6);
    updateCareerEventCheckPreviews();
    updateInjuryRollPreviews();
    updateEventPreviews();
    renderSkillSections();
  }
  if (event.target.matches("[data-event-roll]")) renderSkillSections();
  if (event.target.matches("[data-benefit-roll], [data-benefit-dm]")) updateBenefitResults();
});
homeworldTypeInput.addEventListener("change", () => updateHomeworldSkillOptions());
bonusBenefitsInput.addEventListener("input", () => renderGenerationRows(readGeneration()));
agingTechDmInput.addEventListener("change", updateAgingPreviews);
rollTermLengthInput.addEventListener("change", () => {
  document.querySelector("#character-age-helper").textContent = rollTermLengthInput.checked
    ? "Optional rule: roll 1D6 years for each term instead of using four years."
    : "Normally 18 + 4 years per career term.";
  renderGenerationRows(readGeneration());
});
document.querySelector("#character-career").addEventListener("input", updateCareerDescription);
document.querySelector("#character-career").addEventListener("change", () => {
  const careerInput = document.querySelector("#character-career");
  const nextCareer = careerInput.value.trim();
  const generation = readGeneration();
  const activeIndex = generation.terms - 1;
  const activeEvent = generation.events[activeIndex];
  if (isValidManualRoll(activeEvent?.roll, 2, 12)) {
    careerInput.value = generation.careerSkills?.[activeIndex]?.career
      || activeEvent.career
      || trackedCareerName;
    updateCareerDescription();
    setCareerProgressError("This term's event is locked. Continue or switch careers to begin another term.");
    return;
  }
  updateCareerDescription();
  trackedCareerName = nextCareer;
  setCareerProgressError();
  if (careerTrackingEnabled && generation.terms > 0) {
    generation.careerSkills[activeIndex] ||= {
      term: activeIndex + 1,
      career: nextCareer,
      service: "",
      picks: []
    };
    generation.careerSkills[activeIndex].career = nextCareer;
    generation.events[activeIndex] ||= { roll: "", career: nextCareer, outcome: "", checks: [] };
    generation.events[activeIndex].career = nextCareer;
    generation.trackedCareer = nextCareer;
  }
  renderGenerationRows(generation);
});
ironManRuleInput.addEventListener("change", updateIronManDeathState);
termEventRows.addEventListener("change", (event) => {
  if (event.target.matches("[data-career-service], [data-career-pick]")) {
    setCareerProgressError();
    careerTrackingEnabled = true;
    termEventRows.querySelectorAll("[data-career-service], [data-career-pick]").forEach((select) => {
      select.required = true;
    });
    updateDerivedCharacteristics();
    return;
  }
  if (event.target.matches("[data-career-characteristic]")) {
    careerTrackingEnabled = true;
    renderGenerationRows(readGeneration());
    return;
  }
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
homeworldSkillInput.addEventListener("change", renderSkillSections);
const skillManagementSection = document.querySelector(".skill-management-section");
skillManagementSection.addEventListener("click", (event) => {
  const skillButton = event.target.closest("[data-open-skill-check]");
  const adjustmentButton = event.target.closest("[data-skill-adjust]");
  if (skillButton) {
    openSkillCheck(skillButton.dataset.openSkillCheck);
    return;
  }
  if (adjustmentButton && !adjustmentButton.disabled) {
    updateSkillAdjustment(adjustmentButton.dataset.skillAdjust, Number(adjustmentButton.dataset.adjustment));
    updateCareerEventCheckPreviews();
  }
});
skillManagementSection.addEventListener("input", (event) => {
  if (event.target.matches("[data-skill-check-characteristic], [data-skill-check-dm], [data-skill-check-advantage]")) {
    updateSkillCheckModifiers();
  }
});
skillManagementSection.addEventListener("change", (event) => {
  if (event.target.matches("[data-skill-check-characteristic], [data-skill-check-dm], [data-skill-check-advantage]")) {
    updateSkillCheckModifiers();
  }
});
skillManagementSection.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-skill-check]")) {
    activeSkillCheck = null;
    skillCheckPanel.hidden = true;
    return;
  }
  if (event.target.closest("[data-roll-skill-check]")) rollSkillCheck();
});
document.querySelector("#roll-custom-unskilled-button").addEventListener("click", () => {
  const name = document.querySelector("#custom-unskilled-skill").value.trim();
  if (!name) {
    showNotice("Enter a skill or task name before setting up an unskilled check.", true);
    document.querySelector("#custom-unskilled-skill").focus();
    return;
  }
  openSkillCheck(name);
});
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
