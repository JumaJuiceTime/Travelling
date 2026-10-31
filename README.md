# Wayfarer

Wayfarer is a responsive, local-first character desk for a Cepheus Deluxe campaign. Open `index.html` in a modern browser to run it; it has no build step or external runtime dependencies.

## Current milestone

- Create, edit, search, and remove character records.
- Record characteristics, career history, skills, and personal notes.
- Persist records in the browser's local storage and export them as JSON.
- Ship management and Game Master tools are reserved for later milestones.

This initial slice is a character-record manager, not yet an automated Cepheus Deluxe lifepath rules engine. It intentionally keeps entered game data on the device and does not include rules text from the sourcebook.

## Data

Character records are stored in browser local storage under `wayfarer.characters.v1`. Use **Export data** to save a JSON copy for backup or transfer. Clearing the browser's site data will remove the local copy.
