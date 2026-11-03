# Wayfarer

Wayfarer is a responsive, local-first character desk for a Cepheus Deluxe campaign. Open `index.html` in a modern browser to run it; it has no build step or external runtime dependencies.

## Current milestone

- Create, edit, search, and remove character records.
- Start characters with the standard characteristic array and a homeworld skill; custom characteristic scores require an explicit opt-in.
- Optionally enable the Iron Man rule to treat injuries during character creation as fatal.
- Select career skills by term from career-specific service, specialist, and advanced-education lists; rank skills are added automatically.
- Track skill ranks from homeworld and career awards, event checks, and later play. Proficient and remaining skills are shown in collapsible groups, including level-0 training.
- Set up skill checks from a skill with a chosen characteristic, unskilled penalty, Jack of All Trades adjustment, situational DM, and optional applicable-trait Advantage.
- Progress through careers one term at a time, with options to continue, switch careers, or muster out. A term's skill choices lock once its event is rolled; career changes reduce mustering-out benefit rolls.
- Calculate starting age, Stamina, Lifeblood, and the INT + EDU skill-rank limit.
- Roll career events when ready, choose one option when the event offers alternative skill checks, resolve its throw with optional DMs, and see success/failure outcomes. Injury events provide the END Injury-table throw and any required 1D6 follow-up; traits are selectable from the supplied list.
- Open saved characters as play sheets: careers, history, characteristics, traits, and generation outcomes are preserved, while identity, skills, carried items, and notes remain editable during play.
- Show each trait's prerequisite and effect when selected, with the same details available as a hover tooltip.
- Roll mustering-out cash and material benefits with career-specific results and event DMs; aging effects and rank purchases can still be resolved manually.
- Roll 1D6/2D6 in the app or enter physical-dice results.
- Browse built-in personal armor, exploration equipment, and pharmaceuticals, and add custom searchable catalog entries.
- Browse cybernetic implants by grade, add them to a character, and track Cybernetic Points; exceeding 6 CP flags cyber-dissociation and its social throw penalty.
- Track a character's carried items against light/heavy-load limits derived from Strength DM; worn backpacks and gear, and powered armor capacity, apply their listed encumbrance rules.
- Persist records in the browser's local storage and export them as JSON.
- Ship management and Game Master tools are reserved for later milestones. Robot creation is planned under GM tools, with operator-controlled Drones distinguished from autonomous Smart Drones.

Career-event results and effects are shown for supplied career tables; supported checks are calculated and explicit skill awards are tracked automatically, while other choices and effects remain player-resolved. The built-in catalog includes supplied armor, exploration equipment, pharmaceuticals, and cybernetics; add other equipment through the item editor. Cybernetic effects are described in the catalog but are not automatically applied to character characteristics or skill throws. Aging characteristic changes can be recorded in the character fields.

## Data

Character records, inventory, and generation notes are stored in browser local storage under `wayfarer.characters.v1`; custom item records use `wayfarer.items.v1`. Built-in items are bundled with the app. Use **Export data** to save characters and the full item catalog as a JSON copy for backup or transfer. Clearing the browser's site data will remove the local records.
