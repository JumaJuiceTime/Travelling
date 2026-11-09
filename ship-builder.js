"use strict";

const SHIP_STORAGE_KEY = "wayfarer.ships.v1";
const SHIP_ELECTRONICS = [
  { tons: 0, cost: 0, maxJump: 0, techLevel: 0, sensorDm: -4 },
  { tons: 1, cost: 1, maxJump: 1, techLevel: 7, sensorDm: -2 },
  { tons: 2, cost: 3, maxJump: 2, techLevel: 9, sensorDm: 0 },
  { tons: 3, cost: 5, maxJump: 3, techLevel: 11, sensorDm: 1 },
  { tons: 5, cost: 10, maxJump: 4, techLevel: 12, sensorDm: 2 },
  { tons: 6, cost: 20, maxJump: 5, techLevel: 13, sensorDm: 2 },
  { tons: 8, cost: 40, maxJump: 6, techLevel: 14, sensorDm: 3 },
  { tons: 10, cost: 50, maxJump: 6, techLevel: 15, sensorDm: 2 },
  { tons: 12, cost: 100, maxJump: 6, techLevel: 15, sensorDm: 5 }
];
const SHIP_DRIVES = {
  small: {
    powerPlant: [null, 4.5, 7.8, 11.4, 15.0, 18.9, 23.1],
    maneuver: [1.5, 2.7, 4.5, 6.6, 9.0, 11.7, 14.7],
    jump: []
  },
  standard: {
    powerPlant: [null, 1.5, 2.6, 3.8, 5.0, 6.3, 7.7],
    maneuver: [0.5, 0.9, 1.5, 2.2, 3.0, 3.9, 4.9],
    jump: [null, 3.0, 4.5, 6.5, 9.0, 12.0, 15.5]
  }
};
const SHIP_TL_MODIFIERS = {
  powerPlant: [null, null, null, null, null, null, null, null, 1.9, 1.7, 1.6, 1.5, 1.0, 0.9, 0.8, 0.7, 0.6],
  maneuver: [null, null, null, null, null, null, null, null, 1.5, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6],
  jump: [null, null, null, null, null, null, null, null, null, 2.0, 1.4, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6]
};
const SHIP_JUMP_TECH_LEVEL = [0, 9, 11, 12, 13, 14, 15];
const SHIP_ARMOR = {
  titanium: { name: "Titanium Steel", techLevel: 7, lightTons: 0.125, lightCost: 0.125, heavyTons: 0.25, heavyCost: 0.25 },
  composite: { name: "Composite Alloy", techLevel: 8, lightTons: 0.1, lightCost: 0.2, heavyTons: 0.2, heavyCost: 0.4 },
  crystaliron: { name: "Crystaliron", techLevel: 10, lightTons: 0.065, lightCost: 0.25, heavyTons: 0.125, heavyCost: 0.5 },
  superdense: { name: "Superdense", techLevel: 12, lightTons: 0.05, lightCost: 0.3, heavyTons: 0.1, heavyCost: 0.6 },
  bonded: { name: "Bonded Superdense", techLevel: 14, lightTons: 0.04, lightCost: 0.4, heavyTons: 0.085, heavyCost: 0.6 },
  collapsed: { name: "Collapsed Superdense", techLevel: 16, lightTons: 0.035, lightCost: 0.5, heavyTons: 0.07, heavyCost: 1.0 }
};
const SHIP_CONTROL_OPTIONS = {
  cockpit1: { label: "1-person cockpit", tons: 1.5 },
  cockpit2: { label: "2-person cockpit", tons: 3 },
  cabin1: { label: "1-person control cabin", tons: 3 },
  cabin2: { label: "2-person control cabin", tons: 6 }
};
let savedShips = [];
let shipStorageError = null;
const shipGrid = document.querySelector("#saved-ship-grid");
const commonShipGrid = document.querySelector("#common-ship-grid");
const shipDialog = document.querySelector("#ship-dialog");
const shipForm = document.querySelector("#ship-form");
const shipNotice = document.querySelector("#ship-notice");

function loadSavedShips() {
  const saved = window.localStorage.getItem(SHIP_STORAGE_KEY);
  if (saved === null) return [];
  const parsed = JSON.parse(saved);
  const isValidDesign = (design) => design
    && typeof design.name === "string"
    && Number.isInteger(design.techLevel)
    && Number.isFinite(design.tonnage)
    && ["standard", "streamlined", "distributed"].includes(design.configuration)
    && ["none", "light", "heavy"].includes(design.armor)
    && Object.hasOwn(SHIP_ARMOR, design.armorMaterial)
    && Number.isInteger(design.maneuver)
    && Number.isInteger(design.jump)
    && Number.isInteger(design.powerPlant)
    && Number.isInteger(design.electronics)
    && typeof design.advancedElectronics === "boolean"
    && Object.hasOwn(SHIP_CONTROL_OPTIONS, design.controls)
    && Number.isInteger(design.crew)
    && Number.isInteger(design.staterooms)
    && Number.isInteger(design.lowBerths)
    && Number.isInteger(design.couches)
    && Number.isFinite(design.extraTonnage)
    && Number.isFinite(design.extraCost)
    && typeof design.stealth === "boolean"
    && typeof design.massProduced === "boolean"
    && typeof design.notes === "string";
  const valid = Array.isArray(parsed) && parsed.every((ship) => ship
    && typeof ship.id === "string"
    && typeof ship.name === "string"
    && isValidDesign(ship.design)
    && (ship.characterId === null || typeof ship.characterId === "string")
    && typeof ship.updatedAt === "string");
  if (!valid) throw new Error("Saved ship data has an unexpected format. It was left unchanged.");
  return parsed;
}

try {
  savedShips = loadSavedShips();
} catch (error) {
  shipStorageError = error;
}

function shipFormValue(id) {
  return document.querySelector(`#${id}`).value;
}

function readShipDesign() {
  return {
    name: shipFormValue("ship-name").trim(),
    techLevel: Number(shipFormValue("ship-tech-level")),
    tonnage: Number(shipFormValue("ship-tonnage")),
    configuration: shipFormValue("ship-configuration"),
    armor: shipFormValue("ship-armor"),
    armorMaterial: shipFormValue("ship-armor-material"),
    maneuver: Number(shipFormValue("ship-maneuver")),
    jump: Number(shipFormValue("ship-jump")),
    powerPlant: Number(shipFormValue("ship-power-plant")),
    electronics: Number(shipFormValue("ship-electronics")),
    advancedElectronics: document.querySelector("#ship-electronics-advanced").checked,
    controls: shipFormValue("ship-controls"),
    crew: Number(shipFormValue("ship-crew")),
    staterooms: Number(shipFormValue("ship-staterooms")),
    lowBerths: Number(shipFormValue("ship-low-berths")),
    couches: Number(shipFormValue("ship-couches")),
    extraTonnage: Number(shipFormValue("ship-extra-tonnage")),
    extraCost: Number(shipFormValue("ship-extra-cost")),
    stealth: document.querySelector("#ship-stealth").checked,
    massProduced: document.querySelector("#ship-mass-produced").checked,
    notes: shipFormValue("ship-notes").trim()
  };
}

function calculateShipDesign(design) {
  const errors = [];
  const { tonnage, techLevel, maneuver, jump, powerPlant, electronics } = design;
  if (!Number.isFinite(tonnage) || tonnage < 10 || tonnage > 10000) errors.push("Hull tonnage must be between 10 and 10,000 tons.");
  if (!Number.isInteger(techLevel) || techLevel < 9 || techLevel > 16) errors.push("Tech level must be between 9 and 16.");
  if (!Number.isInteger(maneuver) || maneuver < 0 || maneuver > 6) errors.push("Maneuver rating must be between 0 and 6.");
  if (!Number.isInteger(jump) || jump < 0 || jump > 6) errors.push("Jump rating must be between 0 and 6.");
  if (!Number.isInteger(powerPlant) || powerPlant < 1 || powerPlant > 6) errors.push("Power plant rating must be between 1 and 6.");
  if (!Number.isInteger(electronics) || electronics < 0 || electronics > 8) errors.push("Electronics model must be Baseline or Model/1 through Model/8.");
  if (tonnage < 100 && jump > 0) errors.push("Small craft under 100 tons cannot mount jump drives.");
  if (jump > 0 && jump < 7 && techLevel < SHIP_JUMP_TECH_LEVEL[jump]) errors.push(`Jump ${jump} requires TL${SHIP_JUMP_TECH_LEVEL[jump]} or higher.`);
  if (maneuver > 0 && techLevel < 9) errors.push("Maneuver drives require TL9 or higher.");
  if (powerPlant < Math.max(maneuver, jump)) errors.push("Power plant rating must equal or exceed the maneuver and jump drive ratings.");
  if (!Number.isFinite(design.crew) || design.crew < 0 || !Number.isInteger(design.crew)) errors.push("Crew must be a non-negative whole number.");
  ["staterooms", "lowBerths", "couches"].forEach((key) => {
    if (!Number.isInteger(design[key]) || design[key] < 0) errors.push(`${key === "lowBerths" ? "Low berths" : key === "staterooms" ? "Staterooms" : "Acceleration couches"} must be a non-negative whole number.`);
  });
  if (!Number.isFinite(design.extraTonnage) || design.extraTonnage < 0) errors.push("Other fitting tonnage must be zero or more.");
  if (!Number.isFinite(design.extraCost) || design.extraCost < 0) errors.push("Other fitting cost must be zero or more.");
  if (!["standard", "streamlined", "distributed"].includes(design.configuration)) errors.push("Choose a valid hull configuration.");
  if (!["none", "light", "heavy"].includes(design.armor) || !Object.hasOwn(SHIP_ARMOR, design.armorMaterial)) errors.push("Choose a valid armor configuration.");

  const isSmallCraft = tonnage < 100;
  const hullMultiplier = { standard: 1, streamlined: 1.1, distributed: 0.9 }[design.configuration] || 1;
  const hullCost = tonnage * 0.1 * hullMultiplier;
  const hullBaseCost = hullCost;
  const effectiveArmorSteps = (design.armor === "none" ? 0 : design.armor === "light" ? 1 : 2) + (tonnage >= 1000 ? 1 : 0);
  const effectiveArmor = ["None", "Light", "Heavy", "Massive"][effectiveArmorSteps];
  const armorSpec = SHIP_ARMOR[design.armorMaterial];
  let armorTonnage = 0;
  let armorCost = 0;
  if (design.armor !== "none") {
    if (armorSpec.techLevel > techLevel) errors.push(`${armorSpec.name} armor requires TL${armorSpec.techLevel}.`);
    const heavy = design.armor === "heavy" || (design.armor === "light" && tonnage >= 1000);
    armorTonnage = tonnage * (heavy ? armorSpec.heavyTons : armorSpec.lightTons);
    armorCost = hullBaseCost * (heavy ? armorSpec.heavyCost : armorSpec.lightCost);
  }

  const driveClass = tonnage < 100 ? SHIP_DRIVES.small : SHIP_DRIVES.standard;
  const drivePartTonnage = (kind, rating) => {
    if (rating === 0 && kind !== "maneuver") return 0;
    const percentage = driveClass[kind][rating];
    if (!Number.isFinite(percentage)) return 0;
    const modifier = SHIP_TL_MODIFIERS[kind][techLevel];
    if (!Number.isFinite(modifier)) {
      errors.push(`${kind === "powerPlant" ? "Power plant" : kind === "maneuver" ? "Maneuver drive" : "Jump drive"} performance is not available at TL${techLevel}.`);
      return 0;
    }
    return tonnage * percentage / 100 * modifier;
  };
  const maneuverTonnage = drivePartTonnage("maneuver", maneuver);
  const powerPlantTonnage = drivePartTonnage("powerPlant", powerPlant);
  const jumpTonnage = jump ? drivePartTonnage("jump", jump) : 0;
  const driveTonnage = maneuverTonnage + powerPlantTonnage + jumpTonnage;
  const driveCost = driveTonnage * 2.5;

  const fuelTonnage = jump ? tonnage * 0.1 * jump : 0;
  const bridgeTonnage = isSmallCraft ? 0 : Math.max(tonnage * 0.02, jump ? 10 : 5);
  const bridgeCost = isSmallCraft ? 0 : tonnage * 0.005;
  const controls = SHIP_CONTROL_OPTIONS[design.controls] || SHIP_CONTROL_OPTIONS.cockpit1;
  const controlsTonnage = isSmallCraft ? controls.tons : 0;
  const controlsCost = isSmallCraft ? tonnage / 20 * 0.1 : 0;
  const electronicsSpec = SHIP_ELECTRONICS[electronics] || SHIP_ELECTRONICS[0];
  const electronicsTonnage = electronicsSpec.tons;
  const electronicsCost = electronicsSpec.cost * (design.advancedElectronics ? 1.5 : 1);
  const maxJump = Math.min(6, electronicsSpec.maxJump + (design.advancedElectronics && electronicsSpec.maxJump ? 1 : 0));
  if (!isSmallCraft && jump > 0 && electronicsSpec.maxJump === 0) errors.push("Starships need at least Model/1 electronics for jump calculations.");
  if (jump > maxJump) errors.push(`${electronicsSpec.maxJump ? `Model/${design.electronics}${design.advancedElectronics ? " advanced" : ""}` : "Baseline"} electronics support a maximum Jump ${maxJump}.`);
  if (electronicsSpec.techLevel > techLevel) errors.push(`Model/${design.electronics} electronics require TL${electronicsSpec.techLevel}.`);

  const stateroomTonnage = design.staterooms * 4;
  const stateroomCost = design.staterooms * 0.5;
  const lowBerthTonnage = design.lowBerths * 0.5;
  const lowBerthCost = design.lowBerths * 0.05;
  const couchTonnage = design.couches * 0.5;
  const couchCost = design.couches * 0.025;
  const stealthCost = design.stealth ? tonnage * 0.1 : 0;
  const componentTonnage = armorTonnage + driveTonnage + fuelTonnage + bridgeTonnage
    + controlsTonnage + electronicsTonnage + stateroomTonnage + lowBerthTonnage
    + couchTonnage + design.extraTonnage;
  const usedTonnage = componentTonnage;
  const cargoTonnage = tonnage - usedTonnage;
  if (cargoTonnage < -0.0001) errors.push(`Components use ${usedTonnage.toFixed(1)} tons, exceeding the ${tonnage}-ton hull.`);

  const constructionWeeks = tonnage < 100 ? 26
    : tonnage <= 500 ? 52
      : tonnage <= 1000 ? 78
        : tonnage <= 2000 ? 120
          : tonnage <= 3000 ? 150
            : tonnage <= 4000 ? 180
              : tonnage <= 5000 ? 210 : 300;
  const beforeDiscount = hullCost + armorCost + driveCost + bridgeCost + controlsCost
    + electronicsCost + stateroomCost + lowBerthCost + couchCost + stealthCost + design.extraCost;
  const totalCost = beforeDiscount * (design.massProduced ? 0.9 : 1);
  return {
    errors,
    isSmallCraft,
    shipType: isSmallCraft ? "Small craft" : jump ? "Starship" : "System ship",
    effectiveArmor,
    hullCost,
    armorTonnage,
    armorCost,
    maneuverTonnage,
    jumpTonnage,
    powerPlantTonnage,
    driveCost,
    fuelTonnage,
    bridgeTonnage,
    bridgeCost,
    controlsTonnage,
    controlsCost,
    electronicsTonnage,
    electronicsCost,
    electronicsCostBonus: design.advancedElectronics ? electronicsCost - electronicsSpec.cost : 0,
    maxJump,
    sensorDm: electronicsSpec.sensorDm,
    stateroomTonnage,
    stateroomCost,
    lowBerthTonnage,
    lowBerthCost,
    couchTonnage,
    couchCost,
    extraTonnage: design.extraTonnage,
    extraCost: design.extraCost,
    stealthCost,
    usedTonnage,
    cargoTonnage: Math.max(0, cargoTonnage),
    hardpoints: Math.max(1, Math.floor(tonnage / 100)),
    constructionWeeks,
    beforeDiscount,
    totalCost
  };
}

function shipNumber(value, digits = 1) {
  return Number(value.toFixed(digits)).toLocaleString(undefined, { maximumFractionDigits: digits });
}

function renderShipCalculation() {
  const design = readShipDesign();
  const result = calculateShipDesign(design);
  const electronicsLabel = design.electronics === 0 ? "Baseline" : `Model/${design.electronics}${design.advancedElectronics ? " advanced" : ""}`;
  const error = document.querySelector("#ship-form-error");
  const output = document.querySelector("#ship-calculation");
  error.textContent = result.errors.join(" ");
  error.hidden = result.errors.length === 0;
  const breakdown = [
    ["Hull", design.tonnage, result.hullCost],
    ["Armor", result.armorTonnage, result.armorCost],
    ["Drives and power plant", result.maneuverTonnage + result.jumpTonnage + result.powerPlantTonnage, result.driveCost],
    ["Jump fuel", result.fuelTonnage, 0],
    ["Bridge", result.bridgeTonnage, result.bridgeCost],
    [result.isSmallCraft ? SHIP_CONTROL_OPTIONS[design.controls].label : "Small-craft controls", result.controlsTonnage, result.controlsCost],
    ["Electronics", result.electronicsTonnage, result.electronicsCost],
    ["Staterooms", result.stateroomTonnage, result.stateroomCost],
    ["Low berths", result.lowBerthTonnage, result.lowBerthCost],
    ["Acceleration couches", result.couchTonnage, result.couchCost],
    ["Other fittings", result.extraTonnage, result.extraCost],
    ...(design.stealth ? [["Stealth", 0, result.stealthCost]] : [])
  ];
  output.innerHTML = `<div class="ship-summary-top">
      <strong>${escapeShipHtml(result.shipType)} · ${shipNumber(design.tonnage, 0)} tons</strong>
      <span>${result.effectiveArmor === "None" ? "Unarmored" : `${escapeShipHtml(result.effectiveArmor)} armor`}${design.jump ? ` · Jump ${design.jump}` : ""}${design.maneuver ? ` · ${design.maneuver} G` : ""}</span>
    </div>
    <div class="ship-summary-stats">
      <span>Cargo <strong>${shipNumber(result.cargoTonnage)} tons</strong></span>
      <span>Jump fuel <strong>${shipNumber(result.fuelTonnage)} tons</strong></span>
      <span>Hardpoints <strong>${result.hardpoints}</strong></span>
      <span>Construction <strong>${result.constructionWeeks} weeks</strong></span>
      <span>Electronics <strong>${escapeShipHtml(electronicsLabel)}</strong></span>
      <span>Sensor DM <strong>${result.sensorDm >= 0 ? "+" : ""}${result.sensorDm}</strong></span>
      <span>Max computer Jump <strong>${result.maxJump ? `Jump ${result.maxJump}` : "None"}</strong></span>
      ${design.advancedElectronics ? `<span>Advanced electronics <strong>+MCr ${shipNumber(result.electronicsCostBonus, 2)}</strong></span>` : ""}
      <span>Estimated cost <strong>MCr ${shipNumber(result.totalCost, 2)}</strong></span>
    </div>
    ${design.advancedElectronics
      ? `<p class="ship-advanced-effect">Advanced electronics add MCr ${shipNumber(result.electronicsCostBonus, 2)}${result.maxJump > SHIP_ELECTRONICS[design.electronics].maxJump
        ? ` and increase the computer's maximum Jump rating from ${SHIP_ELECTRONICS[design.electronics].maxJump} to ${result.maxJump}`
        : `; the computer's maximum Jump rating remains ${result.maxJump} (already at the Jump 6 limit)`}. Your selected drive is Jump ${design.jump || "none"}.</p>`
      : ""}
    <details class="ship-cost-details">
      <summary>Component tonnage and cost breakdown</summary>
      <ul>${breakdown.map(([label, tons, cost]) => `<li><span>${escapeShipHtml(label)}</span><span>${shipNumber(tons)} t · MCr ${shipNumber(cost, 2)}</span></li>`).join("")}</ul>
      ${design.massProduced ? `<small>Includes 10% mass-production discount (MCr ${shipNumber(result.beforeDiscount - result.totalCost, 2)}).</small>` : ""}
    </details>`;
  return { design, result };
}

function escapeShipHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

function setShipForm(design = {}) {
  shipForm.reset();
  document.querySelector("#ship-id").value = "";
  document.querySelector("#ship-dialog-title").textContent = "Design a ship";
  const defaults = {
    name: "", techLevel: 12, tonnage: 200, configuration: "standard", armor: "none",
    armorMaterial: "titanium", maneuver: 0, jump: 0, powerPlant: 1, electronics: 0,
    advancedElectronics: false, controls: "cockpit1", crew: 1, staterooms: 0,
    lowBerths: 0, couches: 0, extraTonnage: 0, extraCost: 0, stealth: false,
    massProduced: false, notes: ""
  };
  const values = { ...defaults, ...design };
  document.querySelector("#ship-name").value = values.name;
  document.querySelector("#ship-tech-level").value = values.techLevel;
  document.querySelector("#ship-tonnage").value = values.tonnage;
  document.querySelector("#ship-configuration").value = values.configuration;
  document.querySelector("#ship-armor").value = values.armor;
  document.querySelector("#ship-armor-material").value = values.armorMaterial;
  document.querySelector("#ship-maneuver").value = values.maneuver;
  document.querySelector("#ship-jump").value = values.jump;
  document.querySelector("#ship-power-plant").value = values.powerPlant;
  document.querySelector("#ship-electronics").value = values.electronics;
  document.querySelector("#ship-electronics-advanced").checked = values.advancedElectronics;
  document.querySelector("#ship-controls").value = values.controls;
  document.querySelector("#ship-crew").value = values.crew;
  document.querySelector("#ship-staterooms").value = values.staterooms;
  document.querySelector("#ship-low-berths").value = values.lowBerths;
  document.querySelector("#ship-couches").value = values.couches;
  document.querySelector("#ship-extra-tonnage").value = values.extraTonnage;
  document.querySelector("#ship-extra-cost").value = values.extraCost;
  document.querySelector("#ship-stealth").checked = values.stealth;
  document.querySelector("#ship-mass-produced").checked = values.massProduced;
  document.querySelector("#ship-notes").value = values.notes;
  updateShipFormVisibility();
  updateShipSelectHelp();
  renderShipCalculation();
}

function updateShipFormVisibility() {
  const isSmallCraft = Number(shipFormValue("ship-tonnage")) < 100;
  document.querySelectorAll(".ship-small-craft-field").forEach((field) => {
    field.hidden = !isSmallCraft;
  });
}

function updateShipSelectHelp() {
  [
    ["ship-configuration", "ship-configuration-help"],
    ["ship-armor", "ship-armor-help"],
    ["ship-armor-material", "ship-armor-material-help"],
    ["ship-maneuver", "ship-maneuver-help"],
    ["ship-jump", "ship-jump-help"],
    ["ship-power-plant", "ship-power-plant-help"],
    ["ship-electronics", "ship-electronics-help"],
    ["ship-controls", "ship-controls-help"]
  ].forEach(([selectId, helpId]) => {
    const select = document.querySelector(`#${selectId}`);
    const selectedOption = select.selectedOptions[0];
    select.title = selectedOption.title;
    document.querySelector(`#${helpId}`).textContent = selectedOption.title;
  });
  const advancedInput = document.querySelector("#ship-electronics-advanced");
  const advancedHelp = document.querySelector("#ship-advanced-electronics-help");
  const electronics = SHIP_ELECTRONICS[Number(shipFormValue("ship-electronics"))];
  advancedInput.disabled = electronics.maxJump === 0;
  if (advancedInput.disabled) advancedInput.checked = false;
  advancedHelp.textContent = advancedInput.disabled
    ? "Choose a Model computer to enable advanced electronics."
    : `Adds 50% to the Model/${shipFormValue("ship-electronics")} cost${electronics.maxJump < 6
      ? ` and raises its maximum supported Jump rating from ${electronics.maxJump} to ${electronics.maxJump + 1}`
      : " without raising its maximum Jump rating, which is already 6"}. The live stats show the added cost and maximum rating.`;
}

function openShipEditor(ship = null) {
  if (shipStorageError) {
    showShipNotice(`Saved ship designs are unavailable: ${shipStorageError.message}`, true, true);
    return;
  }
  setShipForm(ship ? { ...ship.design, name: ship.name } : {});
  if (ship?.id) {
    document.querySelector("#ship-id").value = ship.id;
    document.querySelector("#ship-dialog-title").textContent = "Edit ship design";
  }
  shipDialog.showModal();
  document.querySelector("#ship-name").focus();
}

function designFromCommonShip(commonShip) {
  const armorMatch = commonShip.armor.match(/^(Light|Heavy|Massive)\s+(.+)$/i);
  const armor = armorMatch
    ? (armorMatch[1].toLowerCase() === "massive" ? "heavy" : armorMatch[1].toLowerCase())
    : "none";
  const armorMaterial = armorMatch ? Object.keys(SHIP_ARMOR).find((key) => SHIP_ARMOR[key].name.toLowerCase() === armorMatch[2].toLowerCase()) : "titanium";
  const modelMatch = commonShip.electronics.match(/Model\/(\d+)/i);
  const staterooms = Number(commonShip.fittings.match(/(\d+)\s+staterooms?/i)?.[1] || 0);
  const lowBerths = Number(commonShip.fittings.match(/(\d+)\s+(?:emergency\s+)?low berths?/i)?.[1] || 0);
  const couches = Number(commonShip.fittings.match(/(\d+)\s+acceleration couches/i)?.[1] || 0);
  const crewMatch = commonShip.crew.match(/^(\d+)/);
  const details = [
    `Common design from Cepheus Deluxe.`,
    `Published price: MCr ${commonShip.cost.toFixed(1)} (includes the 10% mass-production discount).`,
    `Published construction time: ${commonShip.weeks} weeks.`,
    `Published armament: ${commonShip.armament}.`,
    `Published fittings: ${commonShip.fittings}.`,
    `Published crew: ${commonShip.crew}.`
  ].join("\n");
  const design = {
    name: commonShip.name,
    techLevel: commonShip.techLevel,
    tonnage: commonShip.tonnage,
    configuration: commonShip.hull,
    armor,
    armorMaterial: armorMaterial || "titanium",
    maneuver: commonShip.maneuver,
    jump: commonShip.jump,
    powerPlant: commonShip.powerPlant,
    electronics: modelMatch ? Number(modelMatch[1]) : 0,
    advancedElectronics: /adv/i.test(commonShip.electronics),
    controls: /2-person cockpit/i.test(commonShip.crew) ? "cockpit2"
      : /2-person control cabin/i.test(commonShip.crew) ? "cabin2"
        : /1-person cabin/i.test(commonShip.crew) ? "cabin1" : "cockpit1",
    crew: Number(crewMatch?.[1] || 1),
    staterooms,
    lowBerths,
    couches,
    extraTonnage: 0,
    extraCost: 0,
    stealth: /stealth/i.test(commonShip.fittings),
    massProduced: true,
    notes: details
  };
  const cargoMatch = commonShip.fittings.match(/(\d+(?:\.\d+)?)\s+tons?(?:\s+of)?\s+cargo\b/i);
  if (commonShip.id === "cutter-50") {
    design.extraTonnage = 31;
  } else if (cargoMatch) {
    const targetCargo = Number(cargoMatch[1]);
    design.extraTonnage = Math.max(0, design.tonnage - targetCargo - calculateShipDesign(design).usedTonnage);
  }
  const modeledCost = calculateShipDesign(design).beforeDiscount;
  design.extraCost = Math.max(0, commonShip.cost / 0.9 - modeledCost);
  return design;
}

function showShipNotice(message, isError = false, persistent = false) {
  shipNotice.textContent = message;
  shipNotice.classList.toggle("error", isError);
  shipNotice.hidden = false;
  window.clearTimeout(shipNotice.noticeTimeoutId);
  if (!persistent) {
    shipNotice.noticeTimeoutId = window.setTimeout(() => {
      shipNotice.hidden = true;
    }, 4500);
  }
}

function renderSavedShips() {
  document.querySelector("#ship-count").textContent = String(savedShips.length);
  document.querySelector("#nav-ship-count").textContent = String(savedShips.length);
  document.querySelector("#ship-empty-state").hidden = savedShips.length > 0;
  shipGrid.hidden = savedShips.length === 0;
  shipGrid.innerHTML = savedShips.map((ship) => {
    const result = calculateShipDesign(ship.design);
    const isInvalid = result.errors.length > 0;
    return `<article class="character-card ship-card">
      <div class="item-card-content">
        <div class="card-top">
          <span class="avatar ship-avatar" aria-hidden="true">⌁</span>
          <span class="item-title-group">
            <span class="card-label">${escapeShipHtml(result.shipType.toUpperCase())} · ${ship.design.techLevel ? `TL${ship.design.techLevel}` : "DESIGN"}</span>
            <strong class="character-name">${escapeShipHtml(ship.name)}</strong>
          </span>
        </div>
        <div class="item-meta"><span>${shipNumber(ship.design.tonnage, 0)} tons</span><span>${isInvalid ? "Needs revision" : `MCr ${shipNumber(result.totalCost, 2)}`}</span><span>${result.constructionWeeks} weeks</span></div>
        ${ship.design.notes ? `<p class="item-description">${escapeShipHtml(ship.design.notes)}</p>` : ""}
      </div>
      <div class="card-actions">
        <button class="text-button ship-edit-button" type="button" data-edit-ship="${escapeShipHtml(ship.id)}">Edit</button>
        <button class="text-button" type="button" data-delete-ship="${escapeShipHtml(ship.id)}">Remove ship</button>
      </div>
    </article>`;
  }).join("");
}

function renderCommonShips() {
  const query = document.querySelector("#common-ship-search").value.trim().toLocaleLowerCase();
  const filtered = COMMON_SHIP_DESIGNS.filter((ship) => [
    ship.name, ship.hull, ship.armor, ship.armament, ship.fittings, ship.crew
  ].join(" ").toLocaleLowerCase().includes(query));
  commonShipGrid.hidden = filtered.length === 0;
  document.querySelector("#common-ship-no-results").hidden = filtered.length > 0;
  commonShipGrid.innerHTML = filtered.map((ship) => `<article class="character-card ship-card common-ship-card">
    <div class="item-card-content">
      <div class="card-top">
        <span class="avatar ship-avatar" aria-hidden="true">⌁</span>
        <span class="item-title-group">
          <span class="card-label">COMMON DESIGN · TL${ship.techLevel}</span>
          <strong class="character-name">${escapeShipHtml(ship.name)}</strong>
        </span>
      </div>
      <div class="item-meta"><span>${ship.tonnage.toLocaleString()} tons</span><span>${escapeShipHtml(ship.hull)} hull</span><span>${ship.weeks} weeks</span><span>MCr ${ship.cost.toFixed(1)}</span></div>
      <p class="ship-common-line"><strong>Drives</strong> ${ship.maneuver} G${ship.jump ? ` · Jump ${ship.jump}` : ""} · P${ship.powerPlant} · ${escapeShipHtml(ship.electronics)}</p>
      <p class="ship-common-line"><strong>Armor</strong> ${escapeShipHtml(ship.armor)} · <strong>Armament</strong> ${escapeShipHtml(ship.armament)}</p>
      <p class="item-description">${escapeShipHtml(ship.fittings)}</p>
      <p class="item-reference">Crew: ${escapeShipHtml(ship.crew)}</p>
    </div>
    <div class="card-actions"><span class="item-built-in-note">Published price includes 10% mass-production discount</span>
      <button class="text-button" type="button" data-use-common-ship="${escapeShipHtml(ship.id)}">Use as a starting design</button>
    </div>
  </article>`).join("");
}

function renderShipManager() {
  renderSavedShips();
  renderCommonShips();
  if (shipStorageError) showShipNotice(`Saved ship designs could not be loaded: ${shipStorageError.message}`, true, true);
}

function saveShip(event) {
  event.preventDefault();
  const { design, result } = renderShipCalculation();
  if (!shipForm.reportValidity()) return;
  if (result.errors.length) {
    document.querySelector("#ship-form-error").scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }
  if (!design.name) {
    document.querySelector("#ship-name").setCustomValidity("Enter a name for this ship.");
    document.querySelector("#ship-name").reportValidity();
    document.querySelector("#ship-name").setCustomValidity("");
    return;
  }
  const id = document.querySelector("#ship-id").value || crypto.randomUUID();
  const existingIndex = savedShips.findIndex((ship) => ship.id === id);
  const previous = savedShips;
  const ship = { id, name: design.name, design, characterId: null, updatedAt: new Date().toISOString() };
  savedShips = existingIndex < 0
    ? [ship, ...savedShips]
    : savedShips.map((entry) => entry.id === id ? ship : entry);
  try {
    window.localStorage.setItem(SHIP_STORAGE_KEY, JSON.stringify(savedShips));
  } catch (error) {
    savedShips = previous;
    showShipNotice(`Ship design could not be saved: ${error.message}`, true);
    return;
  }
  shipDialog.close();
  renderShipManager();
  window.dispatchEvent(new Event("wayfarer:ships-changed"));
  showShipNotice(existingIndex < 0 ? "Ship design saved." : "Ship design updated.");
}

function removeSavedShip(id) {
  const ship = savedShips.find((entry) => entry.id === id);
  if (!ship || !window.confirm(`Remove ${ship.name} from your saved ships?`)) return;
  const previous = savedShips;
  savedShips = savedShips.filter((entry) => entry.id !== id);
  try {
    window.localStorage.setItem(SHIP_STORAGE_KEY, JSON.stringify(savedShips));
  } catch (error) {
    savedShips = previous;
    showShipNotice(`Ship design could not be removed: ${error.message}`, true);
    return;
  }
  renderShipManager();
  window.dispatchEvent(new Event("wayfarer:ships-changed"));
  showShipNotice(`${ship.name} was removed from your saved ships.`);
}

function editSavedShip(id) {
  const ship = savedShips.find((entry) => entry.id === id);
  if (ship) openShipEditor(ship);
}

function useCommonShip(id) {
  const commonShip = COMMON_SHIP_DESIGNS.find((ship) => ship.id === id);
  if (commonShip) {
    const design = designFromCommonShip(commonShip);
    openShipEditor({ id: "", name: design.name, design });
  }
}

document.querySelector("#new-ship-button").addEventListener("click", () => openShipEditor());
document.querySelector("#empty-new-ship-button").addEventListener("click", () => openShipEditor());
document.querySelector("#close-ship-dialog-button").addEventListener("click", () => shipDialog.close());
document.querySelector("#cancel-ship-dialog-button").addEventListener("click", () => shipDialog.close());
shipForm.addEventListener("submit", saveShip);
shipForm.addEventListener("input", () => {
  document.querySelector("#ship-name").setCustomValidity("");
  updateShipFormVisibility();
  updateShipSelectHelp();
  renderShipCalculation();
});
shipForm.addEventListener("change", () => {
  updateShipFormVisibility();
  updateShipSelectHelp();
  renderShipCalculation();
});
document.querySelector("#common-ship-search").addEventListener("input", renderCommonShips);
shipGrid.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-ship]");
  const deleteButton = event.target.closest("[data-delete-ship]");
  if (editButton) editSavedShip(editButton.dataset.editShip);
  else if (deleteButton) removeSavedShip(deleteButton.dataset.deleteShip);
});
commonShipGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-use-common-ship]");
  if (button) useCommonShip(button.dataset.useCommonShip);
});

const ShipManager = {
  count: () => savedShips.length,
  getSaved: () => savedShips,
  render: renderShipManager
};

renderShipManager();
