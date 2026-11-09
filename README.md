# Wayfarer

Wayfarer is a responsive, local-first character desk for a Cepheus Deluxe campaign. Open `index.html` in a modern browser to run it; it has no build step or external runtime dependencies.

## Current milestone

- Create, edit, search, and remove character records.
- Start characters with the standard characteristic array and a homeworld skill; custom characteristic scores require an explicit opt-in.
- Optionally enable the Iron Man rule to treat injuries during character creation as fatal.
- Select career skills by term from career-specific service, specialist, and advanced-education lists; career descriptions appear when selected, and one skill level per term may instead raise a characteristic by 1. The first career's Service skills start at level 0, with one selected at level 1; no skill can exceed level 2 at the end of the first term. Rank skills are added automatically.
- Track skill ranks from homeworld and career awards, event checks, and later play. Proficient and remaining skills are shown in collapsible groups, including level-0 training.
- Set up skill checks from a skill with a chosen characteristic, unskilled penalty, Jack of All Trades adjustment, situational DM, and optional applicable-trait Advantage.
- Progress through careers one term at a time, with each term's skill choices shown alongside its event and options to continue, switch careers, or muster out. Event results lock once rolled or entered, and each required check result locks once rolled or entered; career changes reduce mustering-out benefit rolls.
- Calculate starting age, Stamina, Lifeblood, and the INT + EDU skill-rank limit; optionally roll 1D6 for each term's length to determine age.
- Roll career events when ready, choose one option when the event offers alternative skill checks, resolve its throw with optional DMs, and see success/failure outcomes. Life Events are resolved within their term, including required follow-up rolls and skill/trait choices. Injury events provide the END Injury-table throw and any required 1D6 follow-up; traits are selectable from the supplied list.
- Open saved characters as play sheets: careers, history, characteristics, traits, and generation outcomes are preserved, while identity, skills, carried items, and notes remain editable during play.
- Show each trait's prerequisite and effect when selected, with the same details available as a hover tooltip.
- Roll mustering-out cash and material benefits with career-specific results and event DMs; aging effects and rank purchases can still be resolved manually.
- Roll 1D6/2D6 in the app or enter physical-dice results.
- Browse built-in personal armor, exploration equipment, and pharmaceuticals, and add custom searchable catalog entries.
- Browse cybernetic implants by grade, add them to a character, and track Cybernetic Points; exceeding 6 CP flags cyber-dissociation and its social throw penalty.
- Track a character's carried items against light/heavy-load limits derived from Strength DM; worn backpacks and gear, and powered armor capacity, apply their listed encumbrance rules.
- Browse the common Cepheus Deluxe small craft, system ships, and starships; copy a design into the ship builder as a starting point.
- Design, calculate, edit, and save ships independently of characters. Ship options include hover descriptions and the live calculation panel stays visible while editing; the panel shows electronics cost and sensor/jump ratings, including advanced-electronics changes. The builder calculates hull and armor, drives, jump fuel, bridge, accommodations, remaining cargo, cost, hardpoints, and construction time; additional fittings can be entered by tonnage and cost. A nullable character link is reserved in each saved ship record for future crew assignment.
- Persist records in the browser's local storage and export them as JSON.
- Game Master tools remain planned for a later milestone. Robot creation is planned under GM tools, with operator-controlled Drones distinguished from autonomous Smart Drones.

Career-event results and effects are shown for supplied career tables; supported checks are calculated and explicit skill awards are tracked automatically, while other choices and effects remain player-resolved. The built-in catalog includes supplied armor, exploration equipment, pharmaceuticals, and cybernetics; add other equipment through the item editor. Cybernetic effects are described in the catalog but are not automatically applied to character characteristics or skill throws. Aging characteristic changes can be recorded in the character fields.

## Data

Character records, inventory, and generation notes are stored in browser local storage under `wayfarer.characters.v1`; custom item records use `wayfarer.items.v1`; saved ships use `wayfarer.ships.v1`. Built-in items and common ship designs are bundled with the app. Use **Export data** to save characters, the full item catalog, and saved ships as a JSON copy for backup or transfer. Clearing the browser's site data will remove the local records.
