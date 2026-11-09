"use strict";

const COMMON_SHIP_DESIGNS = [
  {
    id: "dropship-50", name: "50-ton Dropship", techLevel: 11, tonnage: 50, hull: "streamlined",
    armor: "light Crystaliron", maneuver: 4, jump: 0, powerPlant: 4, electronics: "Model/2, DM+0",
    armament: "Double turret: sandcaster and pulse laser",
    fittings: "42 acceleration couches, 0.5 tons cargo, airlock",
    crew: "2 — pilot and gunner in a 2-person cockpit", cost: 47.8, weeks: 26
  },
  {
    id: "fighter-10", name: "10-ton Fighter", techLevel: 13, tonnage: 10, hull: "streamlined",
    armor: "None", maneuver: 6, jump: 0, powerPlant: 6, electronics: "Model/1, DM-2",
    armament: "Triple turret: Large Laser Gun", fittings: "0.1 tons cargo",
    crew: "Pilot in a 1-person cockpit", cost: 15.0, weeks: 26
  },
  {
    id: "gig-10", name: "10-ton Gig", techLevel: 10, tonnage: 10, hull: "streamlined",
    armor: "None", maneuver: 2, jump: 0, powerPlant: 2, electronics: "Baseline, DM-4",
    armament: "None", fittings: "6.7 tons cargo",
    crew: "Pilot in a 1-person cockpit", cost: 5.1, weeks: 26
  },
  {
    id: "launch-20", name: "20-ton Launch", techLevel: 9, tonnage: 20, hull: "streamlined",
    armor: "None", maneuver: 1, jump: 0, powerPlant: 1, electronics: "Baseline, DM-4",
    armament: "None", fittings: "14.8 tons cargo; other fittings usually added as required",
    crew: "Pilot in a 1-person cabin", cost: 7.1, weeks: 26
  },
  {
    id: "pinnace-40", name: "40-ton Pinnace", techLevel: 12, tonnage: 40, hull: "streamlined",
    armor: "None", maneuver: 5, jump: 0, powerPlant: 5, electronics: "Model/1, DM-2",
    armament: "One hardpoint reserved for weapons systems", fittings: "23.8 tons cargo, airlock",
    crew: "Pilot in a 1-person cabin", cost: 32.6, weeks: 26
  },
  {
    id: "cutter-50", name: "50-ton Cutter", techLevel: 12, tonnage: 50, hull: "streamlined",
    armor: "None", maneuver: 4, jump: 0, powerPlant: 4, electronics: "Model/1, DM-2",
    armament: "One hardpoint reserved for weapons systems",
    fittings: "1 × 30-ton cutter module, airlock; modules available for cargo, commuter, fuel, laboratory, low berth, luxury, or vehicle transport",
    crew: "Pilot in a 1-person cabin", cost: 33.3, weeks: 26
  },
  {
    id: "ships-boat-30", name: "30-ton Ship's Boat", techLevel: 9, tonnage: 30, hull: "streamlined",
    armor: "None", maneuver: 6, jump: 0, powerPlant: 6, electronics: "Model/1, DM-2",
    armament: "One hardpoint reserved for weapons systems", fittings: "10.0 tons cargo",
    crew: "Pilot in a 1-person cockpit", cost: 43.4, weeks: 26
  },
  {
    id: "shuttle-95", name: "95-ton Shuttle", techLevel: 9, tonnage: 95, hull: "streamlined",
    armor: "None", maneuver: 3, jump: 0, powerPlant: 3, electronics: "Baseline, DM-4",
    armament: "None", fittings: "61.4 tons cargo; some cargo may be traded for acceleration couches or a 30-ton module",
    crew: "Pilot in a 2-person control cabin", cost: 69.8, weeks: 26
  },
  {
    id: "sdb-200", name: "200-ton System Defense Boat", techLevel: 12, tonnage: 200, hull: "streamlined",
    armor: "Heavy Crystaliron", maneuver: 6, jump: 0, powerPlant: 6, electronics: "Model/4, DM+2",
    armament: "2 × triple turrets: large plasma gun and pulse lasers",
    fittings: "Stealth; 17 staterooms; repair drones; 2 × 10-ton fighters; ship's boat; 17 escape pods; armory for 10 marines",
    crew: "17: CO, 3 pilots, 3 sensors, engineer, 2 gunners, medic, 4 marines, 2 flight crew",
    cost: 141.2, weeks: 52
  },
  {
    id: "assault-800", name: "800-ton Assault Ship", techLevel: 12, tonnage: 800, hull: "standard",
    armor: "Heavy Crystaliron", maneuver: 3, jump: 3, powerPlant: 3, electronics: "Model/3, DM+1",
    armament: "8 × triple turrets: 3 pulse lasers, 2 particle beams, 2 missile racks, 1 sandcaster",
    fittings: "240 tons jump fuel; dropship; 61 escape pods; armory for 50 marines; fuel scoops and 60t/day processor; 31 staterooms; 16 emergency low berths; 72-missile magazine; 64.5 tons cargo",
    crew: "61: CO, 3 sensors, 3 pilots, 3 engineers, medic, 8 gunners, 42 marines; double occupancy except captain",
    cost: 395.5, weeks: 78
  },
  {
    id: "corsair-300", name: "300-ton Corsair", techLevel: 12, tonnage: 300, hull: "streamlined",
    armor: "Light Crystaliron", maneuver: 4, jump: 3, powerPlant: 4, electronics: "Model/3, DM+1",
    armament: "3 × triple turrets: 1 missile, 2 pulse lasers",
    fittings: "90 tons jump fuel; 20 escape pods; armory for 10 marines; 30t/day processor; 10 staterooms; 10 cryoberths; 12-missile magazine; 5 emergency low berths; 54 tons cargo",
    crew: "19: CO, pilot, sensor operator, medic, 2 engineers, 3 gunners, 10 ship's troops; double occupancy except captain",
    cost: 157.9, weeks: 52
  },
  {
    id: "cruiser-1000", name: "1000-ton Cruiser", techLevel: 13, tonnage: 1000, hull: "standard",
    armor: "Massive Superdense", maneuver: 4, jump: 4, powerPlant: 4, electronics: "Model/4, DM+2",
    armament: "Meson bay; 5 × triple turrets: 2 large fusion, 3 pulse lasers",
    fittings: "400 tons jump fuel; ship's boat; 40 escape pods; armory for 20 marines; fuel scoops and 40t/day processor; 40 staterooms; 16 emergency low berths; 16 tons cargo",
    crew: "39: CO, 3 sensors, 3 pilots, 5 engineers, medic, 7 gunners, 16 marines, 2 flight crew",
    cost: 708.5, weeks: 78
  },
  {
    id: "explorer-400", name: "400-ton Explorer", techLevel: 12, tonnage: 400, hull: "streamlined",
    armor: "None", maneuver: 3, jump: 3, powerPlant: 3, electronics: "Model/3, DM+1",
    armament: "None; 4 hardpoints reserved for weapon systems",
    fittings: "120 tons jump fuel; 6 escape pods; laboratory; 20 probe drones; 10 tons mining drones; aircar; 40t/day processor; 6 staterooms; 10 low berths; 44.1 tons cargo",
    crew: "6: CO/pilot, sensor operator, 2 engineers, medic, science officer", cost: 173.0, weeks: 52
  },
  {
    id: "freighter-600", name: "600-ton Freighter", techLevel: 11, tonnage: 600, hull: "distributed",
    armor: "None", maneuver: 1, jump: 2, powerPlant: 2, electronics: "Model/1Adv, DM-2",
    armament: "None; 4 hardpoints reserved for weapon systems",
    fittings: "120 tons jump fuel; gig; 4 escape pods; 4 staterooms; 374.3 tons cargo",
    crew: "4: pilot, sensor operator, 2 engineers", cost: 196.4, weeks: 78
  },
  {
    id: "frigate-400", name: "400-ton Frigate", techLevel: 12, tonnage: 400, hull: "standard",
    armor: "Light Superdense", maneuver: 4, jump: 3, powerPlant: 4, electronics: "Model/3, DM+1",
    armament: "4 × triple turrets: 2 large particle beams, 1 pulse laser, 1 sandcaster",
    fittings: "120 tons jump fuel; ship's boat; 26 escape pods; armory for 10 marines; fuel scoops and 120t/day processor; 13 staterooms; 10 emergency low berths; repair drones; 48-canister magazine; 17 tons cargo",
    crew: "24: CO, 3 pilots, 3 sensors, medic, 2 engineers, 4 gunners, 8 marines, 2 flight crew",
    cost: 234.0, weeks: 52
  },
  {
    id: "prospector-100", name: "100-ton Prospector", techLevel: 11, tonnage: 100, hull: "standard",
    armor: "None", maneuver: 2, jump: 2, powerPlant: 2, electronics: "Model/2, DM+0",
    armament: "Single turret: beam laser",
    fittings: "20 tons jump fuel; gig; 2 escape pods; 10 tons mining equipment; 5 probe drones; fuel scoops and 10t/day processor; 2 staterooms; 22 tons cargo",
    crew: "2: pilot/sensors and gunner/engineer", cost: 42.5, weeks: 52
  },
  {
    id: "research-200", name: "200-ton Research Vessel", techLevel: 12, tonnage: 200, hull: "standard",
    armor: "None", maneuver: 2, jump: 2, powerPlant: 2, electronics: "Model/2, DM+0",
    armament: "2 tons reserved for weapon systems",
    fittings: "40 tons jump fuel; gig; 12 escape pods; 8 laboratories; 12 staterooms; 12 low berths; 23.8 tons cargo",
    crew: "12: pilot, sensor operator, engineer, medic, 8 scientists", cost: 98.9, weeks: 52
  },
  {
    id: "subsidized-merchant-400", name: "400-ton Subsidized Merchant", techLevel: 11, tonnage: 400, hull: "streamlined",
    armor: "None", maneuver: 1, jump: 2, powerPlant: 2, electronics: "Model/1Adv, DM-2",
    armament: "None; 2 hardpoints reserved for weapon systems",
    fittings: "80 tons jump fuel; 16 escape pods; 16 staterooms; 10 low berths; 186.8 tons cargo",
    crew: "6: pilot, sensor operator, 2 engineers, medic, steward", cost: 146.7, weeks: 52
  },
  {
    id: "trader-200", name: "200-ton Trader", techLevel: 11, tonnage: 200, hull: "standard",
    armor: "None", maneuver: 1, jump: 2, powerPlant: 2, electronics: "Model/1Adv, DM-2",
    armament: "2 hardpoints reserved for weapon systems",
    fittings: "40 tons jump fuel; 10 escape pods; 10 staterooms; 20 low berths; 10t/day fuel processor; 69.4 tons cargo",
    crew: "5: pilot, sensor operator, engineer, medic, steward", cost: 74.8, weeks: 52
  },
  {
    id: "yacht-100", name: "100-ton Yacht", techLevel: 11, tonnage: 100, hull: "streamlined",
    armor: "None", maneuver: 2, jump: 2, powerPlant: 2, electronics: "Model/2, DM+0",
    armament: "One hardpoint reserved for weapon systems",
    fittings: "20 tons jump fuel; 10 escape pods; fuel scoops; 10 staterooms (2 joined as a suite); 4 emergency low berths; 10t/day processor; 8 tons cargo",
    crew: "5: pilot, sensor operator, engineer, medic, steward", cost: 43.8, weeks: 52
  },
  {
    id: "scout-100", name: "100-ton Scout Ship", techLevel: 11, tonnage: 100, hull: "streamlined",
    armor: "None", maneuver: 2, jump: 2, powerPlant: 2, electronics: "Model/2, DM+0",
    armament: "Double turret; weapons purchased separately",
    fittings: "20 tons jump fuel; 4 escape pods; 20 probe drones; aircar; fuel scoops; 10t/day processor; 4 staterooms; 4 emergency low berths; 24 tons cargo",
    crew: "1 pilot; optional sensor operator, engineer, and gunner", cost: 42.6, weeks: 52
  }
];
