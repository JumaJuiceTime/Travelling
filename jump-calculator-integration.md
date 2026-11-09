# Jump Calculator: Integration Notes

Source: Rules/Ships/Starship Operations.md (Interstellar Travel, Jump Procedure, Fuel, Electronics and Computers).

## Scope of this branch

A first pass of the Jump calculator for the Ships screen. It covers:

- Fuel needed for a jump (10% of hull volume per parsec).
- Jump range limit from the drive rating and computer model.
- Jump plot (Piloting/EDU 6+, or 10+ when rushed, with -1 per parsec).
- Engage drive (Engineering/EDU 8+), whose effect carries into the jump throw.
- Jump throw (2D with DMs). A result of 0 or less, or a bad plot, is a misjump.

Not included yet: the misjump distance roll (1D x 1D parsecs), saving ship data in the browser, and blocking jumps that exceed the allowed range.

## Recommendations

1. Add the two new scripts (jump-rules.js and jump-view.js) and load them after app.js, in that order. jump-view.js calls rollTwoD6() from app.js.
2. Enable the existing Ships navigation button and remove its "LATER" tag.
3. Replace showView in app.js with the version below, so Characters, Items, and Ships switch correctly.
4. Add the Ships section to index.html directly after the Items section.
5. Append the CSS block to styles.css.
6. Before merging, open the Ships screen in a browser and check each step: plot, engage, jump, and the misjump message.
7. Consider blocking the jump result when parsecs exceed the allowed range. Currently only a warning is shown.
8. Consider saving the ship's hull volume, drive rating, and computer in browser storage under a key such as wayfarer.ship.v1, following the existing item and character storage pattern.
9. README: add a line under "Current milestone" such as "Plan jumps with a step-by-step calculator for fuel, jump plots, drive engagement, and misjumps." Also remove "Ship management" from the planned-later list only if you want to show the ships area as active.

## jump-rules.js (new file)

```javascript
const COMPUTER_MAX_JUMP = {
  none: 0,
  "Model/1": 1,
  "Model/2": 2,
  "Model/3": 3,
  "Model/4": 4,
  "Model/5": 5,
  "Model/6": 6,
  "Model/7": 6,
};

const JUMP_FUEL_PER_PARSEC_RATIO = 0.1;
const JUMP_PLOT_TARGET = 6;
const JUMP_PLOT_RUSH_TARGET = 10;
const JUMP_ENGAGE_TARGET = 8;
const JUMP_THROW_FAILURE_THRESHOLD = 0;
const JUMP_PLOT_OUT_OF_DATE_DM = -1;
const JUMP_DRIVE_DAMAGED_DM = -2;
const JUMP_UNREFINED_FUEL_DM = -2;
const JUMP_NEAR_WELL_DM = -8;

function getMaxJumpRating(driveRating, computerModel) {
  return Math.min(driveRating, COMPUTER_MAX_JUMP[computerModel] ?? 0);
}

function getRequiredFuelTons(hullVolumeTons, parsecs) {
  return hullVolumeTons * JUMP_FUEL_PER_PARSEC_RATIO * parsecs;
}

function getPlotResult({ roll, pilotingSkill, eduDm, parsecs, rushed }) {
  const target = rushed ? JUMP_PLOT_RUSH_TARGET : JUMP_PLOT_TARGET;
  const total = roll + pilotingSkill + eduDm - parsecs;
  return { total, target, effect: total - target, success: total >= target };
}

function getEngageResult({ roll, engineeringSkill, eduDm }) {
  const total = roll + engineeringSkill + eduDm;
  return { total, target: JUMP_ENGAGE_TARGET, effect: total - JUMP_ENGAGE_TARGET, success: total >= JUMP_ENGAGE_TARGET };
}

function getJumpResult({ roll, engageEffect, plotDaysOld, driveDamaged, unrefinedFuel, nearWell, plotValid }) {
  if (!plotValid) {
    return { total: null, misjump: true, reason: "bad jump plot" };
  }
  const dm = engageEffect
    + plotDaysOld * JUMP_PLOT_OUT_OF_DATE_DM
    + (driveDamaged ? JUMP_DRIVE_DAMAGED_DM : 0)
    + (unrefinedFuel ? JUMP_UNREFINED_FUEL_DM : 0)
    + (nearWell ? JUMP_NEAR_WELL_DM : 0);
  const total = roll + dm;
  return { total, dm, misjump: total <= JUMP_THROW_FAILURE_THRESHOLD, reason: total <= JUMP_THROW_FAILURE_THRESHOLD ? "throw failed" : null };
}
```

## jump-view.js (new file)

```javascript
const jumpForm = document.querySelector("#jump-form");

function readNumber(name) {
  return Number(jumpForm.elements[name].value) || 0;
}

function readFlag(name) {
  return jumpForm.elements[name].checked;
}

function renderJumpSummary() {
  const driveRating = readNumber("driveRating");
  const parsecs = readNumber("parsecs");
  const maxJump = getMaxJumpRating(driveRating, jumpForm.elements.computerModel.value);
  const fuel = getRequiredFuelTons(readNumber("hullVolume"), parsecs);
  const lines = [];

  if (parsecs < 1) {
    lines.push("Enter the number of parsecs to jump.");
  } else if (maxJump < 1) {
    lines.push("This ship cannot jump: its drive or computer does not allow it.");
  } else if (parsecs > maxJump) {
    lines.push(`This jump is ${parsecs} parsecs, but the ship can jump at most ${maxJump}.`);
  } else {
    lines.push(`Fuel needed: ${fuel.toFixed(1)} tons of liquid hydrogen. Jump time in jump space: 1 week.`);
  }
  jumpForm.querySelector("[data-jump-summary]").textContent = lines.join(" ");
}

function setStepOutcome(step, text, success) {
  const element = jumpForm.querySelector(`[data-jump-step="${step}"]`);
  element.textContent = text;
  element.dataset.outcome = success ? "success" : "failure";
}

function readStepRoll(step) {
  return Number(jumpForm.elements[`${step}Roll`].value);
}

function rollStep(step) {
  jumpForm.elements[`${step}Roll`].value = rollTwoD6();
}

function calculatePlot() {
  const roll = readStepRoll("plot");
  const result = getPlotResult({
    roll,
    pilotingSkill: readNumber("pilotingSkill"),
    eduDm: readNumber("eduDm"),
    parsecs: readNumber("parsecs"),
    rushed: readFlag("rushedPlot"),
  });
  setStepOutcome("plot", `${result.success ? "Plot ready" : "Plot failed; try again"}: total ${result.total} against ${result.target}+.`, result.success);
  return result;
}

function calculateEngage() {
  const result = getEngageResult({
    roll: readStepRoll("engage"),
    engineeringSkill: readNumber("engineeringSkill"),
    eduDm: readNumber("eduDm"),
  });
  jumpForm.dataset.engageEffect = String(result.effect);
  setStepOutcome("engage", `${result.success ? "Drive engaged" : "Drive failed to engage"}: total ${result.total} against ${result.target}+, effect ${result.effect}.`, result.success);
  return result;
}

function calculateJump() {
  const engageEffect = Number(jumpForm.dataset.engageEffect || 0);
  const plotValid = jumpForm.dataset.plotReady === "true";
  const result = getJumpResult({
    roll: readStepRoll("jump"),
    engageEffect,
    plotDaysOld: readNumber("plotDaysOld"),
    driveDamaged: readFlag("driveDamaged"),
    unrefinedFuel: readFlag("unrefinedFuel"),
    nearWell: readFlag("nearWell"),
    plotValid,
  });
  if (result.misjump) {
    setStepOutcome("jump", `Misjump (${result.reason}). The ship takes a critical hit and travels 1D x 1D parsecs in a random direction.`, false);
    return;
  }
  setStepOutcome("jump", `Jump successful: total ${result.total} with DM ${result.dm >= 0 ? "+" : ""}${result.dm}.`, true);
}

jumpForm.addEventListener("input", () => {
  renderJumpSummary();
});

function evaluateStep(step) {
  if (step === "plot") {
    jumpForm.dataset.plotReady = String(calculatePlot().success);
  } else if (step === "engage") {
    calculateEngage();
  } else if (step === "jump") {
    calculateJump();
  }
}

jumpForm.addEventListener("click", (event) => {
  const rollButton = event.target.closest("[data-roll-step]");
  if (rollButton) {
    rollStep(rollButton.dataset.rollStep);
    evaluateStep(rollButton.dataset.rollStep);
    return;
  }
  const checkButton = event.target.closest("[data-check-step]");
  if (checkButton) {
    evaluateStep(checkButton.dataset.checkStep);
  }
});

jumpForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

renderJumpSummary();
```

## index.html changes

Sidebar: replace the disabled Ships button with:

```html
<button class="nav-item" id="ships-nav-button" type="button">
  <span class="nav-icon" aria-hidden="true">⌁</span>
  <span>Ships</span>
</button>
```

Scripts: after the existing app.js script tag, add:

```html
<script src="jump-rules.js" defer></script>
<script src="jump-view.js" defer></script>
```

Main content: after the closing tag of items-view and before the page footer, add the ships section (copy the full form from the local index.html; the form has the ship and route fields, conditions checkboxes, and three steps, each with a Roll and a Check button, a result line with data-jump-step, and a summary line with data-jump-summary).

## app.js changes

Replace showView with:

```javascript
const VIEW_LABELS = { characters: "CHARACTERS", items: "ITEMS", ships: "SHIPS" };

function showView(view) {
  charactersView.hidden = view !== "characters";
  itemsView.hidden = view !== "items";
  document.querySelector("#ships-view").hidden = view !== "ships";
  Object.keys(VIEW_LABELS).forEach((name) => {
    const button = document.querySelector(`#${name}-nav-button`);
    button.classList.toggle("active", name === view);
    button.toggleAttribute("aria-current", name === view);
  });
  document.querySelector("#page-section-label").textContent = VIEW_LABELS[view];
}
```

Add a navigation listener next to the existing ones:

```javascript
document.querySelector("#ships-nav-button").addEventListener("click", () => showView("ships"));
```

## styles.css additions

```css
.ship-jump-form { display: grid; gap: 24px; }
.jump-fieldset { display: grid; gap: 16px; margin: 0; padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.jump-fieldset legend { padding: 0 8px; color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
.field-check { display: flex; align-items: center; gap: 10px; }
.field-check input { width: auto; min-height: 0; accent-color: var(--green-strong); }
.jump-summary, .jump-step-result { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
.jump-step { display: grid; gap: 8px; padding-top: 8px; }
.jump-step-controls { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 8px; }
.jump-step-result[data-outcome="success"] { color: var(--green); }
.jump-step-result[data-outcome="failure"] { color: var(--danger); }

@media (max-width: 720px) {
  .jump-fieldset { padding: 16px; }
}
```

## Verification checklist

- The page loads with no console errors.
- Characters and Items still open and close as before.
- Ships opens from the sidebar and the header label reads SHIPS.
- Hull 200 tons, Jump-2 drive, Model/2 computer, 2 parsecs shows 40.0 tons of fuel.
- A 3-parsec jump on a Jump-2 ship shows the "can jump at most 2" warning.
- Plot roll 8 with Piloting 0 and 1 parsec gives a total of 7, which is ready against 6+.
- A jump with no plot or a failed plot reports a misjump.
