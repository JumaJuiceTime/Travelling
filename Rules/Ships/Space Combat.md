## Space Combat

### Space Combat Basics

Space combat in *Cepheus Deluxe* typically occurs at vast ranges of thousands or tens of thousands of kilometers, but range is abstracted within the system.

* **Round Structure:** Standard space combat rounds represent **6 minutes** of in-game time (accounting for weapon recharge cycles, long-range missile travel, and emergency repairs). Because range is handled abstractly, Referees can adjust the time scale to fit different scenarios (such as fast fighter dogfights or slow chases).

* **Actions per Round:** Every crew member may take **one action per round**.

* **Multi-Role Crew:** A character occupying multiple posts (such as a pilot acting as captain) must choose only **one position to act in** during a given round.

### Position

Instead of traditional initiative or tracking exact distance, space combat uses a **Position** score calculated each round.

#### Calculating Position

At the start of each round, each ship's pilot rolls:

$$
\text{Position} = 1\text{D} + \text{Piloting Skill} + \text{DEX DM} + \text{Maneuver Drive Thrust}
$$

*(Note: The Referee may specify INT or EDU DMs instead of DEX depending on circumstances.)*

#### Positional Advantages & Turns

* **Turn Order:** Ships with a higher Position rating may choose whether to act before or after opponents. All crew members on a vessel act together on their ship's turn.

* **Targeting Restrictions:** A ship can freely target any vessel with an **equal or lower Position**.

* **Attack Modifiers:** Attack throws are modified based on relative Position between attacker and target.

#### Position Attack DM Table

| Attacker Status | DM to Attack Throws | 
| ----- | ----- | 
| **Inferior Position with Main Guns or Fixed Mounts** | No attack possible | 
| **Inferior Position with Turrets** | DM-3 | 
| **Inferior Position with Main Guns / Fixed Mounts (after successful Attack Vector action)** | DM-3 | 
| **Same Position as Target** | DM-2 | 
| **1 or 2 Positions higher than Target** | DM-1 | 
| **3 or 4 Positions higher than Target** | DM 0 | 
| **5 or more Positions higher than Target** | DM+1 | 

#### Special Position Rules

* **Disabled Maneuver Drives:** Vessels with disabled Maneuver drives automatically lose Position.

* **Space Stations:** Space stations with a thrust of 0 roll Position normally, but do not receive a bonus from maneuver drives. Instead of Piloting, station commanders throw **1D + Tactics + INT DM** for Position.

* **Multiple Ships:** Record all Position results in descending order. Ships higher on the “Position ladder” hold Position advantage over any ship below them.

### Actions

Each character may act once in each combat round. There are five primary shipboard stations: **Captain, Pilot, Sensor Operator, Gunner, and Engineer**. Only one character may perform an action per station per round, with the exception of Gunners (one gunner per turret, bay, or main weapon). Other characters can assist station operations following standard skill collaboration rules.

### Captain Actions

The ship’s captain may engage in one of the following actions:

* **Lead Crew:** Throw **Leadership/INT 8+**. If successful, gain a pool of positive DM points equal to the Effect (minimum 1) to distribute toward individual crew throws as desired for the next round. *(Example: A total throw of 12 generates 4 points, usable as a single DM+4 or four DM+1 modifiers)*.

* **Outmaneuver:** Throw **Tactics/INT 10+**. On a success, apply a **DM+2** to the ship's next round Position throw.

### Pilot Actions

In addition to making the free Position throw at the start of each round, the pilot may take one of the following actions:

* **Attack Vector:** Throw **Piloting/DEX 8+** (unmodified by ship thrust rating).

  * If the Effect is 1 or greater, the pilot may distribute the Effect "points" as positive DMs to various ship weapons for the round.

  * Alternatively, if the ship lacks Position, this action allows firing fixed weapons or Main Guns at DM-3 to hit (no positive DMs can be distributed to fixed guns in this case).

* **Dock:** Docking is only permitted with friendly ships or enemy ships lacking a functional maneuver drive. Docking with an actively maneuvering enemy ship is impossible.

* **Disengage:** Make an opposed **Piloting/DEX** throw vs. the pursuer's Pilot, adding each ship’s thrust rating to their respective throws. Whichever ship holds Position gains Advantage on the throw for that round. The quarry escapes immediately upon winning. Against multiple pursuers, use the Pilot skill and thrust rating of the fastest pursuing ship against the lowest thrust rating of the quarry.

* **Evasive Maneuvers:** Throw **Piloting/DEX 12+**, modified by the ship’s available maneuver drive thrust rating. On a success, apply a negative DM equal to the Pilot’s skill (up to a maximum of **DM-3**) to all incoming attacks. Does not require Position, and lasts until the start of the ship’s next turn.

* **Plot Jump:** Plotting a jump requires the pilot's attention for $6 - (\text{Pilot Skill})$ **space combat rounds** and a successful **Piloting/EDU 6+** throw (modified by -1 DM per parsec of distance). Plotting in a single round increases the difficulty to **Piloting/EDU 10+**. Failure requires re-plotting.

* **Emergency Jump:** Throw **Piloting/INT 6+** to initiate an emergency jump under fire; if successful, the ship’s engineer must throw **Engineering/INT 8+** to power the jump. Applies an additional **DM-2** to the final Jump Throw (increasing misjump risk) and requires a pre-calculated or combat-plotted jump plot. Failures may be re-rolled on the following round.

### Sensor Operator Actions

The ship’s sensor operator may take one of the following actions during a combat round:

* **Spoof Missiles:** Use electronic warfare to defeat incoming missiles by throwing **Computer/INT 8+**, modified by the ship’s Sensor DM, to spoof an incoming missile due to impact that round or the next round. The operator must roll separately for each missile, and multiple missiles can be spoofed up to the operator's Computer skill level (with a minimum of 1 attempt).

* **Jam Sensors:** Provide electronic cover by rolling an opposed **Computer/EDU** check against one enemy vessel, modified by both ships' Computer DMs. On a success, the target of the jamming suffers a negative DM to any attack roll made against the jamming ship equal to the sensor operator's skill level. This action is cumulative with a pilot's Evasive Maneuvers action.

* **Scan:** Throw **Computer/EDU 8+** to detect vessels and other objects, modified by the ship's sensor DM and the target's stealth (if any).

* **Target Systems:** Throw **Computer/EDU 10+**, modified by the ship’s Sensor DM. If successful, a single designated gunner may target a specific system on the enemy ship with one attack; if that attack succeeds and deals damage, the gunner may choose which system was hit.

* **Sensor Lock:** Throw **Computer/INT 8+**, modified by the ship’s Sensor DM and a negative DM equal to the target ship’s Electronics DM (DM+0 and lower do not count). If successful, all attacks against the locked ship gain **DM+1**. The lock persists until the ship attempts to lock onto another target or the target breaks it.

* **Break Sensor Lock:** Throw **Computer/INT 10+**, modified by the ship’s Sensor DM and a negative DM equal to the attacking ship’s Electronics DM (DM+0 and lower do not count) to successfully sever an existing sensor lock.

### Gunner Actions

Each gunner may take one action per round. A gunner stationed in a turret can fire all weapons within that turret using different actions once per round (e.g., firing a beam laser, launching a missile, and running point defense with a pulse laser simultaneously).

* **Fire Energy Weapons:** Throw **Gunnery/DEX 8+** to hit a target with turret-mounted energy weapons (such as lasers, particle beams, meson guns, or fusion guns). For bays and main guns, the Chief Gunner makes a **Gunnery/INT 8+** throw to hit.

* **Launch Missiles or Torpedoes:**

  * Turrets launch one missile per rack; torpedo launchers fire one torpedo each; torpedo bays fire salvos of 12 torpedoes.

  * Throw **Gunnery/INT 8+** prior to launch to lock missiles onto the target (skipped if an active Sensor Lock exists). Failure prevents launch but keeps missiles ready for future rounds.

  * Missiles ignore Position modifiers but are vulnerable to point-defense and electronic spoofing, hitting at the end of the *next* round after launch. On impact, roll a flat **4+ to hit** (unmodified by skill, though affected by Evasive Maneuvers or Sandcaster screens). Smart missiles that miss may retry once on the following round before becoming unviable.

* **Point Defense:** Use any energy weapon (pulse lasers are most effective) to shoot down incoming missiles by throwing **Gunnery/DEX 10+** (with **DM+2** if using a pulse laser). Gunners may attempt to shoot down multiple missiles per round with a cumulative **DM-1** penalty for each subsequent attack after the first (e.g., -2 on the third shot). Multiple weapons in a turret roll separately without sharing penalties, but all weapons in a turret must target incoming missiles from the same enemy ship.

* **Launch Sand:** Throw **Gunnery/DEX 6+** to deploy sand canisters, creating a defensive screen that applies a **DM-1** to all weapons and sensor locks from a single ship for one round. Multiple canisters stack to a maximum of **DM-3** and last until the ship's next turn.

#### Turret Rules & Restrictions

* **Independent Attack Throws:** Each weapon in a double or triple turret has its own attack throw.

* **Energy Weapon Targets:** Energy weapons mounted in the same turret may only attack the same target, though a gunner may launch missiles at any desired target.

* **Fixed Mounts:** Fixed mounts cannot serve to attack unless the vessel has Position or has successfully executed an Attack Vector maneuver.

* **Firing Limits:** Each weapon within a given turret can only shoot once per combat round (except when used for point defense). A gunner may fire all or some of the weapons in the same turret in the same round (e.g., all three weapons in a triple turret can fire every turn).

* **Missile/Torpedo Concentration:** For simplicity, a missile rack, torpedo launcher, or torpedo bay must fire all of its ordnance against a single target each round.

### Optional Rules for Large Battles

#### Streamlined Turret Fire

To reduce the volume of dice rolls in ship combat for ships with **more than 3 turrets**, each double or triple turret should carry the same type of weapon.

* **Mechanic:** All weapons share a single attack throw, with a **DM+1** bonus for double turrets or **DM+2** for triple turrets.

* **Damage:** Damage is calculated for one weapon only, abstracting the other weapons' contributions as increased chances to hit. All weapons in such a turret must attack the same target.

* **Missiles:** All missiles in the same turret share a single locking throw but hit their target individually. *(It is recommended to use streamlined point defense alongside this rule).*

#### Streamlined Point Defense (Ships up to 999 tons)

To simplify large engagements with numerous missiles and lasers, defenders can choose how many energy weapons are dedicated to point defense at the start of each round rather than tracking individual shots. Sand canisters also apply a **DM-1** modifier similar to laser point defense.

| Weapons Dedicated | DM to Incoming Missiles | 
| ----- | ----- | 
| **1** | \-1 | 
| **2-4** | \-2 | 
| **5-7** | \-3 | 
| **8-9** | \-4 | 

#### Streamlined Point Defense (Ships of 1000+ tons)

For large capital ships (**1000–10000 tons**), resolve defensive fire by making a single **Gunnery/INT 8+** attack throw without modifiers. If successful, consult the table below based on the number of laser turrets/sand vs. inbound missiles to determine hits that penetrate defensive fire. A dash ("-") indicates no hits are possible.

* **Armor Interactions:** The table assumes unarmored 1000+ ton starships (rated at Light Armor). For Heavy Armor, treat the number of defensive lasers as two steps better (nuclear weapons ignore this adjustment). Non-nuclear missiles are ineffective against Heavy Armor, and nuclear missiles suffer the two-step laser penalty. Both conventional and nuclear missiles are completely ineffective against Massive Armor.

##### Missile vs. Laser Turret Hits Table

| Number of Laser Turrets / Sand | 10–20 Missiles | 21–30 Missiles | 31–40 Missiles | 41–50 Missiles | 51–60 Missiles | 61–80 Missiles | 81+ Missiles | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| **10–20** | 1D | 2D | 3D | 1 Critical | 1D Criticals | Destroyed! | Destroyed! | 
| **21–30** | 1D | 2D | 2D | 3D | 1 Critical | Destroyed! | Destroyed! | 
| **31–40** | 1 | 1D | 1D | 2D | 3D | 1 Critical | 1D Criticals | 
| **41–50** | \- | 1 | 1 | 1D | 2D | 3D | 1 Critical | 
| **51–60** | \- | \- | 1 | 1 | 1D | 2D | 3D | 
| **61–80** | \- | \- | \- | 1 | 1 | 1D | 2D | 
| **81+** | \- | \- | \- | \- | 1 | 1 | 1D | 

### Engineer Actions

Any character with the Engineering skill can perform actions to maintain and repair the ship during combat. Multiple characters with this skill can perform damage control simultaneously, provided each works on a different system.

* **Damage Control:** Throw **Engineering/INT 8+** to repair a damaged system or jury-rig a single disabled system back into operation. A success temporarily repairs one hit on the system, though the damage will reappear in **1D hours**. *Note:* Destroyed systems cannot be repaired or jury-rigged during combat.

* **Assistance & Drones:** Characters without Engineering but with the Repair skill may assist an engineer using standard collaboration rules. Repair drones can automatically make one damage control check per combat round.

* **Overcharge Weapon:** The engineer can disable safeties on an energy weapon for extra damage by throwing **Engineering/EDU 8+**. On a success, this boosts a single energy turret’s Hits rating by **+1**, affecting all energy weapons mounted on that turret.

* **Redline Engines:** The ship’s chief engineer throws **Engineering/EDU 8+**. A successful check increases the ship’s thrust rating by **1** for the next round, which includes its Position throw.

### Starship Damage

When an attack successfully hits a target, cross-reference the weapon class against the target's armor category on the **Ship Penetration Matrix Table** to determine the damage level, then roll on the appropriate component damage table.

* **Hit Multipliers:** Each weapon's "hit" statistic indicates how many individual rolls to make on the damage table.

* **Radiation Damage:** Radiation damage must always be rolled separately on the Radiation Table.

* **Stunning Hits (Effect 6+):** If a gunner scores an attack with an Effect of **6+**, shift one column to the left when reading damage on the Penetration Matrix (e.g., treating Light Armor as Unarmored to upgrade Surface damage to Internal).

### Damage Tables

#### Ship Penetration Matrix Table

| Weapon / Armor | Unarmored | Light | Heavy | Massive | 
| ----- | ----- | ----- | ----- | ----- | 
| **Light** | Internal | Surface | Undamaged | Undamaged | 
| **Intermediate** | Critical | Internal | Surface | Undamaged | 
| **Heavy** | Destroyed | Critical | Internal | Surface | 
| **Main Gun** | Destroyed | Destroyed | Critical | Internal | 

#### Surface Hits Table

| 2D | Surface Components | 
| ----- | ----- | 
| **2–6** | No damage – attack bounces off | 
| **7–8** | Breach | 
| **9–10** | Weapon | 
| **11** | Electronics | 
| **12** | Internal Hit | 

#### Radiation Hits Table

| 2D | Radiation Damage | 
| ----- | ----- | 
| **2–5** | No damage – radiation absorbed by hull | 
| **6–7** | Sensors | 
| **8–9** | Electronics | 
| **10–11** | Crew | 
| **12** | Critical | 

*Note:* Unlike other types of hits, a ship’s armor modifies Radiation Hits. Apply **DM-1** for Light Armor, **DM-2** for Heavy Armor, **DM-4** for Massive Armor, and **DM+1** per additional radiation hit in the same round.

#### Internal Hits Table

| 2D | Starship Components | Small Craft Components | 
| ----- | ----- | ----- | 
| **2** | Breach | Sensors | 
| **3** | Power Plant | Power Plant | 
| **4** | Jump Drive | Hold | 
| **5** | Weapons | Maneuver Drive | 
| **6** | Maneuver Drive | Crew | 
| **7** | Breach | Maneuver Drive | 
| **8** | Hold | Armor | 
| **9** | Crew | Weapons | 
| **10** | Sensors | Breach | 
| **11** | Bridge | Cockpit | 
| **12** | Critical | Critical | 

#### Critical Hits Table

| 1D | Starship Critical Hit | Small Craft Critical Hit | 
| ----- | ----- | ----- | 
| **1** | Power Plant Destroyed | Maneuver Drive Destroyed | 
| **2** | Maneuver Drive Destroyed | Maneuver Drive Destroyed | 
| **3** | Jump Drive Destroyed | Power Plant Destroyed | 
| **4** | Critical Crew Hit | Critical Crew Hit | 
| **5** | Electronics Destroyed | Electronics Destroyed | 
| **6** | Ship Destroyed | Ship Destroyed | 

### Surface and Internal Hit Descriptions

The following is a description of ship system internal hits. Note that if a system is destroyed, any more damage on the same system has no further effect.

#### Breach

* The ship suffers a hull breach and is exposed to vacuum.

* Anyone not wearing a space suit or in a sealed compartment suffers exposure to vacuum per the Environmental Hazards chapter.

* Staterooms are considered sealed for the purposes of this damage.

* On large ships of above 1000 tons, each Breach depressurizes 1000 tons of the ship.

#### Bridge

The bridge is hit:

* **First Hit:** The crew suffers a Crew Hit, and the ship takes a **DM-2** on all future Position rolls.

* **Second Hit:** The bridge is disabled; Captain, Pilot, and Sensor Operator actions are impossible until the bridge is repaired, and Gunnery throws suffer **DM-2**. The crew suffers a Crew Hit.

* **Third Hit:** The bridge is irreparably destroyed; each bridge crew member suffers **4D damage**, reduced by personal armor.

#### Cockpit

The small craft’s cockpit or control cabin is hit:

* **First Hit:** The crew suffers a Crew Hit, and the craft takes a **DM-2** on all future Position rolls.

* **Second Hit:** The cockpit is disabled; all actions are impossible, and the crew suffers a Crew Hit.

* **Third Hit:** The cockpit is irreparably destroyed, and each bridge crew member suffers **4D damage**.

#### Crew

* **Crew Hit:** $1\text{D}$ crew members and passengers suffer **2D damage** each. If there are fewer people than the number rolled, one or more randomly determined individuals will receive multiple hits. Personal armor reduces this damage.

* **Critical Crew Hit:** All crew and passengers suffer **4D damage** each, which can be reduced by personal armor.

#### Electronics

The electronic systems are hit:

* **First Hit:** Electronics are scrambled; until repaired, the ship suffers a **DM-2** to all Computer, Piloting, and Gunnery rolls.

* **Subsequent Hits:** No effect.

#### Fuel

The jump fuel tank is hit:

* **First Hit:** $1\text{D} \times 5\%$ of fuel tank capacity is destroyed.

* **Second Hit:** $1\text{D} \times 10\%$ of fuel tank capacity is destroyed (in addition to the first hit's losses).

* **Third Hit:** Fuel tanks are destroyed; all jump fuel is lost.

#### Hold

The cargo hold is hit:

* **First Hit:** $1\text{D} \times 5\%$ of the cargo is destroyed.

* **Second Hit:** $1\text{D} \times 10\%$ of cargo is destroyed (in addition to the first hit's losses).

* **Third Hit:** The cargo hold and all its contents are destroyed.

#### Jump Drive

The ship’s jump drive is hit:

* **First Hit:** **DM-2** to any attempt to jump.

* **Second Hit:** Jump drive is disabled.

* **Third Hit:** Jump drive is irreparably destroyed.

#### Maneuver Drive

The maneuver drive is hit:

* **First Hit:** Halve the ship’s remaining thrust (round down).

* **Second Hit:** Maneuver drive is disabled; the ship is adrift and has a Position of 0.

* **Third Hit:** Maneuver drive is irreparably destroyed.

#### Power Plant

The power plant is hit:

* **First Hit:** Halve the ship’s thrust and jump rating (round down).

* **Second Hit:** Power plant is disabled; the ship functions on emergency power. Energy weapons fire is impossible, and while the ship can maneuver, it will always lose Position.

* **Third Hit:** Power plant is irreparably destroyed. Emergency power remains for $1\text{D}$ hours, after which life support systems fail (low berths remain unaffected due to an integral, long-term power supply).

#### Sensors

The ship’s antennae and other sensor equipment are hit:

* **First Hit:** Ship sensor DM reduced by **-1** (cumulative with electronics damage); the ship can no longer obtain Sensor Locks.

* **Second Hit:** Ship sensor DM reduced by **-2**; the ship cannot make or break Sensor Locks, and gunners suffer a **DM-2** to missile lock attempts.

* **Third Hit:** Sensors are disabled; gunnery missile lock attempts suffer a **DM-6**.

#### Weapons

Each hit disables one weapon in a given location:

##### Weapon Hit Table

| 2D | Location | 
| ----- | ----- | 
| **2–9** | Turret hit | 
| **10–11** | Bay hit | 
| **12** | Main gun hit | 

Randomly determine which turret, bay, or main gun is hit. If there are no bays or main guns, disable turret weapons instead.

Multiple hits on the same weapon (not just the turret) destroy the weapon. Additional hits on an already destroyed weapon are transferred to other randomly determined weapon systems.

### Repairing Damage

* **Jury-Rigged Repairs:** Systems repaired via the Damage Control action fail within **1D hours**, after which they require full repairs.

* **Full Repairs:** Throw **Engineering/EDU 8+** to fully repair a damaged system. This takes **1D hours** and requires **0.02 tons of spare parts** per ton of repaired system. Successful throws return the system to operational status, while failed throws can be repeated at the cost of additional spare parts.

* **Spare Parts:** Cost **Cr100,000 per ton** and can be stored in the ship's cargo bay.

* **Engineer Coordination:** Multiple engineers may work on repairs simultaneously (each on a different system) or collaborate on the same repair using standard collaboration rules.

* **Replacement:** Replacing a destroyed system requires a shipyard and costs $2\text{D} \times 10\%$ of the system’s original cost.

## Space Combat Example: A Little Bit of the Ol’ Piracy!

### The Cast

* **The Corsair:** *The Reaper*, commanded by Captain Matitya Tarkwa. All crew skills are DM+3 (including characteristic bonuses) for simplicity. The pilot is an Ace, granting the ship **Advantage on Position rolls**.

* **The Freighter:** *Star of Progress*, commanded by Captain Gwen Raleigh. All crew skills are DM+1 (including characteristic bonuses).

* **The Patrol Frigate:** *Watchful*, commanded by Lt. Cmdr. Yosef Khaleer. All crew skills are DM+3 (including characteristic bonuses).

### Ship Profiles

#### Corsair *The Reaper*

* **Tonnage:** 300

* **Armor:** Light Crystaliron

* **Hull:** Streamlined

* **Maneuver:** 4 G

* **Jump Rating:** 3

* **P-Plant:** Rating 4

* **Fuel:** 90 tons (1x Jump 3)

* **Electronics:** Model/3, DM+1

* **Armament:** 3x triple turrets: 1x missile rack, 2x pulse lasers

* **Fittings:** 20 escape pods, armory for 10 marines, fuel processor (30t/day), 10 staterooms, 10 cryoberths, 5 emergency low berths, 57 tons cargo space

* **Crew:** 19 total – captain, pilot, sensor operator, medic, 2x engineers, 3x gunners, 10 ship's troops. All crew at double occupancy except for the captain.

* **Cost:** MCr157.4

* **Construction Time:** 52 weeks

#### Freighter *Star of Progress*

* **Tonnage:** 600

* **Armor:** None

* **Hull:** Distributed

* **Maneuver:** 1 G

* **Jump Rating:** 2

* **P-Plant:** Rating 2

* **Fuel:** 120 tons (1x Jump 2)

* **Electronics:** Model/1bis, DM-2

* **Armament:** 2x single turrets: 1x pulse laser, 1x sandcaster

* **Fittings:** Gig, 4 escape pods, 4 staterooms, 388 tons cargo

* **Crew:** 4 total – pilot, sensor operator, 2x engineers.

* **Cost:** MCr163.7

* **Construction Time:** 78 weeks

#### Patrol Frigate *Watchful*

* **Tonnage:** 400

* **Armor:** Light Superdense

* **Hull:** Standard

* **Maneuver:** 4 G

* **Jump Rating:** 3

* **P-Plant:** Rating 4

* **Fuel:** 120 tons (1x Jump 3)

* **Electronics:** Model/3, DM+1

* **Armament:** 4x triple turrets: 2x large particle beams, 1x pulse lasers, 1x sandcasters

* **Fittings:** Ship's boat, 24 escape pods, armory for 10 marines, fuel scoops, fuel processor (120t/day), 12 staterooms, 10 emergency low berths, repair drones, magazine for 48 sand canisters, 19.5 tons cargo space

* **Crew:** 22 total – captain, 3 pilots, 3x sensor operators, medic, 2x engineers, 4x gunners, 8x marines. All crew at double occupancy except for the captain.

* **Cost:** MCr231.1

* **Construction Time:** 52 weeks

### Round 1: Combat Sequence

#### Position Phase

* **The Reaper:** Rolls $2\text{D}$ (with Advantage) + 3 (Crew skill) + 4 (Thrust) = $5 + 7 = \mathbf{12}$.

* **The Watchful:** Rolls $1\text{D}$ + 3 (Crew skill) + 4 (Thrust) = $5 + 7 = \mathbf{12}$.

* **Star of Progress:** Rolls $1\text{D}$ + 1 (Crew skill) + 1 (Thrust) = $5 + 2 = \mathbf{7}$.

Both the *Reaper* and the *Watchful* share the same Position (Effect 0) and can attack each other. Because the *Watchful* initiated the ambush, the Referee rules that it acts first.

#### The Watchful's Turn

* **Captain:** Attempts to *Lead Crew* with Leadership/INT 8+: rolls $4 + 3 = 7$ (Failure).

* **Pilot:** Performs an *Attack Vector* action to improve particle beam shots with Piloting/DEX 8+: rolls $5 + 3 = 8$ (Succeeds, but generates no bonus Effect).

* **Sensor Operator:** Attempts a *Sensor Lock* on the *Reaper* with Computer/INT 8+: rolls $4 + 3 \text{ (Crew)} + 1 \text{ (Sensor DM)} - 1 \text{ (Enemy Sensor DM)} = 7$ (Failure; no lock established).

* **Engineer:** Successfully *Redlines Engines* with Engineering/EDU 8+: rolls $6 + 3 = 9$ (Success). The *Watchful*'s thrust increases to **5G** for the next round's Position throw.

* **Gunners Open Fire:**

  * **Large Particle Beam 1:** Gunnery/DEX 8+ yields $12 + 3 - 2 \text{ (Position DM)} = 13$ (**Solid hit with Effect 5**).

  * **Large Particle Beam 2:** Yields $6 + 3 - 2 = 7$ (Miss).

  * **Pulse Laser Turret (Lasers 1–3):** Laser 1 misses (2), Laser 3 misses (4), but Laser 2 hits with $11 + 3 - 2 - 2 \text{ (Pulse)} = 10$ (**Hit**).

  * **Sandcaster Turret:** Casters 1 and 2 succeed (rolls of 10), while Caster 3 fails (roll of 5), deploying a partial sand screen.

**Damage to the *Reaper*:**
The large particle beam (an intermediate weapon) strikes the *Reaper*'s light armor, resulting in two Internal hits and a radiation check.

* **Internal Hit 1 (Roll 6 - M-Drive):** The *Reaper*'s maneuver drive is halved to **2G**.

* **Internal Hit 2 (Roll 8 - Hold):** **10% of the *Reaper*'s cargo** is destroyed.

* **Radiation Check (Roll 2):** Absorbed safely by the hull with no damage.
  *(Note: The *Reaper*'s incoming return fire lasers suffer a DM-2 penalty due to the *Watchful*'s partial sandcaster screen).*

#### The Reaper's Turn

* **Captain:** Successfully *Leads Crew* with Leadership/INT 8+: rolls $9 + 3 = 12$ (**Effect 4**), generating a pool of **4 positive DM points** to distribute to crew members.

* **Engineer:** Uses *Damage Control* to repair the damaged Maneuver Drive, aided by the Captain's DM+1 bonus: Engineering/INT 8+ rolls $6 + 3 + 1 = 10$ (**Success**). The Maneuver Drive is restored to **4G** (though the Referee notes this jury-rigged fix will fail in 1D hours).

* **Pilot:** Knowing the drive is fixed, the Captain withholds further support. The Pilot successfully executes *Evasive Maneuvers* with Piloting/DEX 12+: rolls $5 + 3 \text{ (Crew)} + 4 \text{ (Thrust)} = 12$ (**Success**). This imposes a **DM-2 penalty** on all incoming attacks against the *Reaper* until its next turn.

* **Sensor Operator:** Attempts a *Sensor Lock* on the *Watchful* backed by a Captain's DM+1 bonus: Computers/INT 8+ rolls $5 + 3 \text{ (Crew)} + 1 \text{ (Sensor DM)} - 1 \text{ (Enemy DM)} + 1 \text{ (Captain support)} = 9$ (**Success**). All attacks against the *Watchful* now gain a **DM+1** bonus.

* **Gunners:**

  * **Missile Triple Turret:** Because a *Sensor Lock* was successfully established on the *Watchful*, the missile racks fire automatically without requiring individual locking throws. These standard missiles are now inbound and will hit at the end of the next round, giving the *Watchful* a chance to deploy point defense or electronic spoofing.

### Round 1 Conclusion & Round 2 Initialization

#### The Reaper's Laser Fire Phase (Round 1 Conclusion)

* **Pulse Laser Turret 1:** Supported by the Captain (DM+1 each for the first two rolls).

  * **Pulse Laser 1:** Rolls $7 + 3 \text{ (Skill)} + 1 \text{ (Support)} - 2 \text{ (Position DM)} - 2 \text{ (Pulse)} + 1 \text{ (Sensor Lock)} - 2 \text{ (Sand)} = 6$ (Miss).

  * **Pulse Laser 2:** Rolls $2 + 3 + 1 - 2 - 2 + 1 - 2 = 1$ (Miss).

  * **Pulse Laser 3:** Rolls $10 + 3 - 2 - 2 + 1 - 2 = 8$ (**Hit!**).

* **Pulse Laser Turret 2:** Gunners fire with target lock DM+1.

  * **Pulse Laser 4:** Rolls $10 + 3 - 2 - 2 + 1 - 2 = 8$ (**Hit!**).

  * **Pulse Laser 5:** Rolls $10 + 3 - 2 - 2 + 1 - 2 = 8$ (**Hit!**).

  * **Pulse Laser 6:** Rolls $12 + 3 - 2 - 2 + 1 - 2 = 10$ (**Hit!**).

#### Damage to the *Watchful*

None of the 4 pulse laser hits scored an Effect of 6+. As light weapons against light armor, each deals 2 hits, resulting in **six rolls on the Surface Hits table** (a 2, three 7s, an 8, and two 9s), yielding one scratch, four breaches, and two weapon hits.

* **Weapon Hit 1 (Roll 8):** Randomly determined as a turret, and a roll of 4 disables one of the *Watchful*'s **main particle cannon guns**.

* **Weapon Hit 2:** Disables a single **Pulse Laser** in Turret 2.

#### Freighter Disengage Attempt

The *Star of Progress* lacks Position on the *Reaper* and attempts to disengage. In the opposed Pilot/DEX roll:

* **Star of Progress:** Rolls $4 + 1 \text{ (Skill)} + 1 \text{ (Thrust)} = 6$.

* **The Reaper:** Rolls $4 + 3 \text{ (Skill)} + 4 \text{ (Thrust)} = 11$.
  *The Reaper successfully blocks the Star of Progress from escaping*.

### Round 2: Combat Sequence

#### Position Phase

* **The Reaper:** Rolls $2\text{D}$ (Advantage) + 3 (Crew skill) + 4 (Thrust) = $5 + 7 = \mathbf{12}$.

* **The Watchful:** Rolls $1\text{D}$ + 3 (Crew skill) + 5 (Thrust modified from last round) = $1 + 7 = \mathbf{6}$.

* **Star of Progress:** Rolls $1\text{D}$ + 1 (Crew skill) + 1 (Thrust) = $1 + 2 = \mathbf{3}$.

The *Reaper* gains **6 points of Position** over the *Watchful*, granting a **DM+1** bonus to hit the frigate this round. Captain Tarkwa maneuvers into a perfect firing position.

#### The Reaper's Turn

* **Captain:** Successfully *Leads Crew* with Leadership/INT 8+: rolls $7 + 3 = 10$ (**Effect 2**), generating a pool of **2 positive DM points** for crew use.

* **Engineer:** Attempts to *Overcharge Weapon* on the first Pulse Laser triple turret: Engineering/EDU 8+ rolls $5 + 3 = 8$ (**Success**). All three lasers in the first Pulse Laser Turret gain a **DM+1** bonus to hit.

* **Pilot:** With the maneuver drive restored, Evasive Maneuvers end, and the Pilot executes an optimal *Attack Vector* with Piloting/DEX 8+: rolls $7 + 3 = 10$ (**Effect 2**), granting either one Pulse Laser a DM+2 or two Pulse Lasers a DM+1 to hit.

* **Sensor Operator:** Leveraging the active Sensor Lock, performs a *Target Systems* action targeting the *Watchful*'s weapons: Computers/EDU 10+ rolls $11 + 3 \text{ (Skill)} + 1 \text{ (Sensor DM)} = 15$ (**Success**). One Pulse Laser is now designated to target enemy weapon systems.

* **Gunners Open Fire:**

  * **Missile Triple Turret:** Utilizing the existing lock, the gunners fire another salvo of three missiles, which will hit at the end of the next turn.

  * **Pulse Laser Turret 1 (Targeting Weapons):**

    * *Pulse Laser 1:* Rolls $8 + 3 \text{ (Skill)} + 2 \text{ (Support)} + 1 \text{ (Position)} - 2 \text{ (Pulse)} + 1 \text{ (Lock)} - 2 \text{ (Sand)} + 2 \text{ (Attack Vector)} + 1 \text{ (Overcharge)} = \mathbf{14}$ (**Hit with Effect 6!**).

    * *Pulse Laser 2:* Rolls $3 + 3 + 1 - 2 + 1 - 2 + 1 = 5$ (Miss).

    * *Pulse Laser 3:* Rolls $9 + 3 + 1 - 2 + 1 - 2 + 1 = \mathbf{11}$ (**Hit!**).

  * **Pulse Laser Turret 2 (Standard Fire with Lock & Position DM):**

    * *Pulse Laser 4:* Rolls $5 + 3 + 1 - 2 + 1 - 2 = 6$ (Miss).

    * *Pulse Laser 5:* Rolls $3 + 11 \text{ (Skill)} + 1 - 2 + 1 - 2 = \mathbf{9}$ (**Hit!**).

    * *Pulse Laser 6:* Rolls $3 + 4 \text{ (Skill)} + 1 - 2 + 1 - 2 = 5$ (Miss).

#### Damage to the *Watchful*

* **Critical Weapon Hit:** Pulse Laser 1 hits with an Effect of 6+, shifting the penetration table from Surface to Internal damage. Automatically hitting weapon systems, the Referee rolls a 4 on the turret table, meaning the *Watchful*'s **remaining large particle cannon is destroyed**.

* **Surface Hits:** The other two successful pulse laser hits bounce off the *Watchful*'s armor without breaching the hull.

#### The Watchful's Turn

* **Captain:** Attempts to *Lead Crew* with Leadership/INT 8+: rolls $3 + 3 = 6$ (Failure; no bonuses generated).

* **Pilot:** Executes *Evasive Maneuvers* with Piloting/DEX 12+: rolls $6 + 3 \text{ (Skill)} + 4 \text{ (Thrust)} = 13$ (**Success**). This imposes a **DM-2 penalty** on incoming attacks against the *Watchful*.

* **Engineer:** Uses *Damage Control* to repair the pulse laser disabled in Round 1: Engineering/INT 8+ rolls $7 + 3 = 10$ (**Success**). The pulse laser is operational again (though prone to failing within 1D hours).

* **Sensor Operator:** Successfully *Spoofs Missiles* against the three incoming warheads:

  * *Missile 1:* Computer/INT 8+ rolls $7 + 3 = 10$ (**Success** - jammed).

  * *Missile 2:* Computer/INT 8+ rolls $5 + 3 = 8$ (**Success** - jammed).

  * One inbound missile remains targeting the ship.

* **Gunners Return Fire:** Operating under a bad Position penalty (DM-3).

  * **Large Particle Beam 1:** Destroyed.

  * **Large Particle Beam 2:** Gunnery/DEX 8+ rolls $11 + 3 - 3 = \mathbf{11}$ (**Solid hit!**).

  * **Pulse Laser Turret (Point Defense):** Dedicated entirely to shooting down the final incoming missile with a **DM+2** pulse bonus and cumulative -1 penalties.

    * *Laser 1:* Rolls $5 + 3 + 2 = 10$ (**Missile destroyed!**).

    * *Laser 2 & 3:* With all missiles eliminated, remaining lasers fire harmlessly into space.

  * **Sandcaster Turret:** Caster 1 succeeds (roll of 6), while Casters 2 and 3 fail, maintaining a partial defensive screen that applies a **DM-1** penalty to the *Reaper*'s lasers until the next turn.

### Round 3: Combat Sequence & Maneuvers

#### Prior Damage Resolution & Disengage Phase

* **The *Watchful*'s Counter-Attack:** The large particle beam scores two Internal hits and a radiation check against the *Reaper*'s light armor:

  * **Internal Hit 1 (Roll 6):** One Maneuver drive hit, halving the *Reaper*'s thrust to **2G**.

  * **Internal Hit 2 (Roll 5):** One weapon hit; a random roll disables one of the *Reaper*'s **missile racks**.

  * **Radiation Check:** Absorbed safely by the hull with no damage.

* **Star of Progress Disengage Attempt:** The freighter attempts to flee via an opposed Pilot/DEX roll:

  * *Star of Progress:* Rolls $3 + 1 \text{ (Skill)} + 1 \text{ (Thrust)} = 5$.

  * *The Reaper:* Rolls $10 + 3 \text{ (Skill)} + 2 \text{ (Thrust)} = 15$.

  * The *Reaper* successfully blocks the *Star of Progress* from escaping.

#### Position Phase

* **The Reaper:** Rolls $2\text{D}$ (Advantage) + 3 (Crew skill) + 2 (Thrust) = $5 + 5 = \mathbf{10}$.

* **The Watchful:** Rolls $1\text{D}$ + 3 (Crew skill) + 4 (Thrust) = $1 + 7 = \mathbf{6}$.

* **Star of Progress:** Rolls $1\text{D}$ + 1 (Crew skill) + 1 (Thrust) = $3 + 2 = \mathbf{5}$.

Despite its damaged drive, the *Reaper* maintains superior positioning four points higher than the *Watchful*, allowing it to attack at **DM+0**.

#### The Reaper's Turn

* **Captain:** Successfully *Leads Crew* with Leadership/INT 8+: rolls $12 + 3 = 15$ (**Effect 7**), generating a massive pool of **7 positive DM points** for crew use.

* **Engineer:** Overruling drive repairs at the Captain's behest, the engineer executes *Overcharge Weapon* on the first pulse laser turret with captain support: Engineering/EDU 8+ rolls $9 + 3 + 1 = 13$ (**Success**), granting all three turret guns a **DM+1** bonus.

* **Pilot:** Executes *Evasive Maneuvers* with Captain support and current thrust: Piloting/DEX 12+ rolls $5 + 3 \text{ (Skill)} + 2 \text{ (Support)} + 2 \text{ (Thrust)} = 12$ (**Success**). This imposes an additional **DM-2 penalty** on attacks targeting the *Reaper*.

* **Sensor Operator:** Maintains the sensor lock and successfully performs a *Target Systems* action aiming for the *Watchful*'s M-drive: Computers/EDU 10+ rolls $8 + 3 + 1 = 12$ (**Success**), designating one pulse laser to target enemy propulsion.

* **Gunners Open Fire:**

  * **Missile Triple Turret:** Fires a reduced salvo of **two missiles** due to the previously disabled rack; they will impact at the end of the next turn.

  * **Pulse Laser Turret 1 (Targeting M-Drive with Captain DM+4 support, Sensor Lock +1, Overcharge +1, Sand -1, Evasive -2):**

    * *Pulse Laser 1:* Rolls $7 + 3 \text{ (Skill)} + 4 \text{ (Support)} + 1 \text{ (Lock)} + 1 \text{ (Overcharge)} - 1 \text{ (Sand)} - 2 \text{ (Evasive)} - 2 \text{ (Pulse)} = \mathbf{11}$ (**Solid hit with Effect 3**).

    * *Pulse Laser 2:* Rolls $8 + 3 + 1 + 1 - 1 - 2 - 2 = \mathbf{8}$ (**Hit**).

    * *Pulse Laser 3:* Rolls $10 + 3 + 1 + 1 - 1 - 2 - 2 = \mathbf{10}$ (**Hit**).

  * **Pulse Laser Turret 2 (Standard fire with Lock, Sand, and Evasive penalties):**

    * *Pulse Laser 4:* Rolls $7 + 3 + 1 - 1 - 2 - 2 = 6$ (Miss).

    * *Pulse Laser 5:* Rolls $8 + 3 + 1 - 1 - 2 - 2 = 7$ (Miss).

    * *Pulse Laser 6:* Rolls $8 + 3 + 1 - 1 - 2 - 2 = 7$ (Miss).

#### Damage Assessment on the *Watchful*

* **M-Drive Target:** Because Pulse Laser 1 did not achieve an Effect 6+ hit against light armor, it fails to penetrate the heavy armor plating surrounding the *Watchful*'s Maneuver drive.

* **Surface Hits:** The other two successful hits generate 4 surface damage rolls (10, 9, 3, 3):

  * *Roll 1 (10):* Weapon hit. The Referee randomly determines the **Sandcaster turret** is struck, disabling one sandcaster.

  * *Roll 2 (9):* Weapon hit. The blast strikes the Sandcaster turret again, knocking out a **second sandcaster**.

#### The Watchful's Turn (Round 3 Conclusion)

Shaking off the shock of being outmaneuvered by pirates, the Captain acts:

* **Captain:** Successfully *Leads Crew* with Leadership/INT 8+: rolls $8 + 3 = 11$, generating a **DM+3 pool** to distribute to other stations.

* **Pilot:** Attempts *Evasive Maneuvers* with Piloting/DEX 12+: rolls $3 + 3 \text{ (Skill)} + 4 \text{ (Thrust)} = 10$ (Failure; provides no defensive penalty against incoming fire).

* **Engineer:** Uses *Damage Control* to restore a sandcaster: Engineering/INT 8+ rolls $9 + 3 = 12$ (**Success**), bringing one sandcaster back online for 1D hours.

* **Sensor Operator:** Attempts to *Spoof Missiles* against the two inbound warheads:

  * *Missile 1:* Computer/INT 8+ rolls $3 + 3 = 6$ (Failure; jammed).

  * *Missile 2:* Computer/INT 8+ rolls $6 + 3 = 9$ (**Success** - one missile jammed). One missile remains on course.

* **Gunners Return Fire:** Operating at a DM-3 Position penalty and DM-2 for the *Reaper*'s evasive actions.

  * **Large Particle Beam 1:** Destroyed!

  * **Large Particle Beam 2:** Gunnery/DEX 8+ rolls $8 + 3 - 3 \text{ (Position)} - 2 \text{ (Evasive)} = 6$ (Miss).

  * **Pulse Laser Turret (Point Defense):** Dedicated to shooting down incoming missiles with a **DM+2** pulse bonus and cumulative -1 penalties.

    * *Laser 1:* Gunnery/DEX 10+ rolls $3 + 3 + 2 = 8$ (Miss; two missiles remain).

    * *Laser 2:* Gunnery/DEX 10+ rolls $7 + 3 + 2 = 12$ (**One missile destroyed!**).

    * *Laser 3:* Gunnery/DEX 10+ rolls $5 + 3 + 2 - 1 = 9$ (Miss! One missile remains to attack).

  * **Sandcaster Turret:** Casters 1 and 2 succeed (rolls of 6 and 9), establishing a **DM-2 sand screen** against the *Reaper*'s lasers (Caster 3 is disabled).

*(Note: The Reaper’s lasers will have a DM-2 to hit the Watchful until the latter ship’s next turn.)*

#### Freighter Disengage Attempt

The *Star of Progress* acts and attempts to disengage, throwing opposed Pilot/DEX:

* *Star of Progress:* Rolls $5 + 1 \text{ (Skill)} + 1 \text{ (Thrust)} = 7$.

* *The Reaper:* Rolls $7 + 3 \text{ (Skill)} + 2 \text{ (Thrust)} = 12$.
  *There is still no escape for the Star of Progress!*

#### Missile Impact & Damage to the *Watchful*

Finally, the missile that got through the Watchful’s defenses attacks at 4+, with a new DM-2 sandcaster penalty: $6 - 2 = 4$, a **hit!**

The missile is a light weapon and does 1D hits, rolling a **6**! The rolls on the Surface damage table are: **9, 9, 3, 6, 8, and 11**.

* Two hits do no damage.

* Two hit **Weapons** (disabling a Pulse Laser and a Sandcaster).

* One causes a **Breach** (likely sucking crew out into space).

* One hits **Electronics**, penalizing all Computer, Piloting, and Gunnery throws on the Watchful by **DM-2**.

### Round 4: Position Phase & Escape

#### Position Rolls

* **The Reaper:** Rolls $2\text{D}$ (Advantage) + 3 (Crew skill) + 2 (Thrust) = $6 + 5 = \mathbf{11}$.

* **The Watchful:** Rolls $1\text{D}$ + 3 (Crew skill) + 4 (Thrust) = $3 + 7 = \mathbf{10}$.

* **Star of Progress:** Rolls $1\text{D}$ + 1 (Crew skill) + 1 (Thrust) = $1 + 2 = \mathbf{3}$.

#### The Reaper Disengages

Captain Tarkwa is concerned. Despite all the damage he has managed to inflict on the Watchful, he hasn’t crippled it, and it is recovering. He orders the Pilot to **disengage** and rolls to Lead Crew to support the effort:

* **Captain:** Leadership/INT 8+: rolls $9 + 3 = 12$, yielding an **Effect of 4** (+4 bonus to the pilot).

* **Pilot (Disengage):** Throwing opposed Pilot/DEX with Advantage for having Position:

  * **The Reaper:** Rolls $7 + 3 \text{ (Crew skill)} + 2 \text{ (Thrust)} + 4 \text{ (Captain’s support)} = \mathbf{16}$.

  * **The Watchful:** Rolls $7 + 3 \text{ (Crew skill)} + 4 \text{ (Thrust)} = \mathbf{14}$.

The *Reaper* successfully extricates itself from the trap and quickly plots a jump to a safer system. Captain Tarkwa will have his revenge!