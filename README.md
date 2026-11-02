# Wayfarer

Wayfarer is a responsive, local-first character desk for a Cepheus Deluxe campaign. Open `index.html` in a modern browser to run it; it has no build step or external runtime dependencies.

## Current milestone

- Create, edit, search, and remove character records.
- Start characters with the standard characteristic array and a homeworld skill; custom characteristic scores require an explicit opt-in.
- Select career skills by term from career-specific service, specialist, and advanced-education lists; rank skills are added automatically.
- Progress through careers one term at a time, with options to continue, switch careers, or muster out. A new term rolls its career event automatically, and career changes reduce mustering-out benefit rolls.
- Calculate starting age, Stamina, Lifeblood, and the INT + EDU skill-rank limit.
- Track career events, aging, mustering-out benefits, and traits; event and benefit results can still be resolved manually from the supplied career rules.
- Roll 1D6/2D6 in the app or enter physical-dice results.
- Browse built-in personal armor, exploration equipment, and pharmaceuticals, and add custom searchable catalog entries.
- Browse cybernetic implants by grade, add them to a character, and track Cybernetic Points; exceeding 6 CP flags cyber-dissociation and its social throw penalty.
- Track a character's carried items against light/heavy-load limits derived from Strength DM; worn backpacks and gear, and powered armor capacity, apply their listed encumbrance rules.
- Persist records in the browser's local storage and export them as JSON.
- Ship management and Game Master tools are reserved for later milestones. Robot creation is planned under GM tools, with operator-controlled Drones distinguished from autonomous Smart Drones.

Career-event results are rolled and named for supplied career tables, but checks, choices, and effects, benefit tables, characteristic increases, and the final skill-cap adjustment remain manual. The built-in catalog includes supplied armor, exploration equipment, pharmaceuticals, and cybernetics; add other equipment through the item editor. Cybernetic effects are described in the catalog but are not automatically applied to character characteristics or skill throws. Aging characteristic changes and trait prerequisites can be recorded in the character fields.

## Data

Character records, inventory, and generation notes are stored in browser local storage under `wayfarer.characters.v1`; custom item records use `wayfarer.items.v1`. Built-in items are bundled with the app. Use **Export data** to save characters and the full item catalog as a JSON copy for backup or transfer. Clearing the browser's site data will remove the local records.
