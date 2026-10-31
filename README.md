# Wayfarer

Wayfarer is a responsive, local-first character desk for a Cepheus Deluxe campaign. Open `index.html` in a modern browser to run it; it has no build step or external runtime dependencies.

## Current milestone

- Create, edit, search, and remove character records.
- Start characters with the standard characteristic array and a homeworld skill; custom characteristic scores require an explicit opt-in.
- Track career terms, event rolls, aging, mustering-out benefits, and traits.
- Roll 1D6/2D6 in the app or enter physical-dice results.
- Browse built-in personal armor and exploration equipment, and add custom searchable catalog entries.
- Track a character's carried items against light/heavy-load limits derived from Strength DM; worn backpacks and gear, and powered armor capacity, apply their listed encumbrance rules.
- Persist records in the browser's local storage and export them as JSON.
- Ship management and Game Master tools are reserved for later milestones.

Career-specific event and benefit results still need to be looked up in the source PDF; the app records those results but does not reproduce the sourcebook tables. The built-in catalog includes the supplied armor and exploration-equipment lists; add other equipment through the item editor. Skill gains, aging characteristic changes, and trait prerequisites can be recorded in the character fields.

## Data

Character records, inventory, and generation notes are stored in browser local storage under `wayfarer.characters.v1`; custom item records use `wayfarer.items.v1`. Built-in items are bundled with the app. Use **Export data** to save characters and the full item catalog as a JSON copy for backup or transfer. Clearing the browser's site data will remove the local records.
