"use strict";

const CAREER_DATA = {
  Agent: {
    service: ["Investigation", "Admin", "Computer", "Streetwise", "Carousing", "Stealth"],
    specialist: ["Deception", "Gun Combat", "Grav Vehicle", "Athletics", "Driving", "Recon"],
    advanced: ["Admin", "Computer", "Liaison", "Science", "Medicine", "Leadership"],
    rankSkills: { 3: ["Admin"] },
    eventNames: { 2: "Injury", 3: "Cybernetics", 4: "Dangerous Mission", 5: "Specialist Training", 6: "Labor Dispute", 7: "Life Event", 8: "Undercover", 9: "Trusted Informant", 10: "Kidnapping Rescue", 11: "Mentor", 12: "Conspiracy" }
  },
  Army: {
    service: ["Gun Combat", "Recon", "Heavy Weapons", "Melee Combat", "Driving", "Athletics"],
    specialist: ["Repair", "Tactics", "Stealth", "Demolitions", "Survival", "Grav Vehicles"],
    advanced: ["Computer", "Admin", "Medicine", "Jack of All Trades", "Leadership", "Gunnery"],
    rankSkills: { 1: ["Leadership"], 3: ["Tactics"] },
    rankAttributes: { 6: "SOC +1" },
    eventNames: { 2: "Injury", 3: "Cybernetics", 4: "Hostile World", 5: "Street Fighting", 6: "Budget Cuts", 7: "Life Event", 8: "Police Action", 9: "Garrison", 10: "Bug Hunt", 11: "Electronic Warfare", 12: "Advancement" }
  },
  Belter: {
    service: ["Repair", "Demolitions", "Piloting", "Computers", "Zero-G", "Athletics"],
    specialist: ["Jack of All Trades", "Carousing", "Engineering", "Streetwise", "Gunnery", "Melee Combat"],
    advanced: ["Admin", "Medicine", "Grav Vehicles", "Liaison", "Science", "Leadership"],
    rankSkills: { 4: ["Admin"] },
    rankAttributes: { 5: "EDU +1" },
    eventNames: { 2: "Injury", 3: "Specialist Training", 4: "Explosion", 5: "Protection Racket", 6: "Bureaucracy", 7: "Life Event", 8: "Drone Operations", 9: "Strike", 10: "Investment", 11: "Cyberterrorism", 12: "Advancement" }
  },
  Colonist: {
    service: ["Survival", "Repair", "Jack of All Trades", "Animals", "Driving", "Carousing"],
    specialist: ["Liaison", "Melee Combat", "Grav Vehicles", "Gun Combat", "Leadership", "Recon"],
    advanced: ["Science", "Medicine", "Computer", "Admin", "Aircraft", "Watercraft"],
    rankSkills: { 2: ["Admin"], 4: ["Liaison"] },
    eventNames: { 2: "Injury", 3: "Friends in High Places", 4: "Xenomorphs", 5: "Crime", 6: "Growth", 7: "Life Event", 8: "Hard Work", 9: "Colonial Strife", 10: "Industrial Accident", 11: "Underground Politics", 12: "Advancement" }
  },
  Elite: {
    service: ["Admin", "Liaison", "Carousing", "Computer", "Grav Vehicles", "Deception"],
    specialist: ["Leadership", "Melee Combat", "Athletics", "Steward", "Watercraft", "Streetwise"],
    advanced: ["Medicine", "Sciences", "Aircraft", "Animals", "Piloting", "Computer"],
    rankSkills: { 4: ["Admin"] },
    eventNames: { 2: "Injury", 3: "Celebrity Status", 4: "Cybernetics", 5: "Inheritance", 6: "Conspiracy", 7: "Life Event", 8: "Corporate Infighting", 9: "Acclaimed Leadership", 10: "Interstellar Tour", 11: "Alliance", 12: "Advancement" }
  },
  Marine: {
    service: ["Gun Combat", "Heavy Weapons", "Athletics", "Gunnery", "Melee Combat", "Zero-G"],
    specialist: ["Carousing", "Repair", "Demolitions", "Recon", "Tactics", "Stealth"],
    advanced: ["Survival", "Admin", "Computer", "Piloting", "Medicine", "Engineering"],
    rankSkills: { 1: ["Leadership"], 3: ["Tactics"] },
    eventNames: { 2: "Injury", 3: "Special Forces", 4: "Advanced Training", 5: "Cybernetics", 6: "Counterterrorism", 7: "Life Event", 8: "Bug Hunt", 9: "Labor Dispute", 10: "Boarding Action", 11: "Political Ally", 12: "Advancement" }
  },
  Merchant: {
    service: ["Steward", "Repair", "Liaison", "Carousing", "Admin", "Zero-G"],
    specialist: ["Gun Combat", "Melee Combat", "Piloting", "Gunnery", "Streetwise", "Stealth"],
    advanced: ["Medicine", "Science", "Survival", "Grav Vehicles", "Engineering", "Computers"],
    rankSkills: { 1: ["Leadership"], 4: ["Pilot"] },
    eventNames: { 2: "Injury", 3: "Cybernetics", 4: "Smuggler", 5: "Risky Business", 6: "Good Deal", 7: "Life Event", 8: "Legal Trouble", 9: "Advanced Training", 10: "Pirate Raid", 11: "Xenomorphs", 12: "Advancement" }
  },
  Navy: {
    service: ["Zero-G", "Repair", "Computers", "Gunnery", "Gun Combat", "Athletics"],
    specialist: ["Piloting", "Carousing", "Melee Combat", "Leadership", "Engineering", "Survival"],
    advanced: ["Science", "Admin", "Medicine", "Tactics", "Jack of All Trades", "Liaison"],
    rankSkills: { 1: ["Leadership"], 3: ["Tactics"] },
    rankAttributes: { 6: "SOC +1" },
    eventNames: { 2: "Injury", 3: "Gambling Ring", 4: "Cybernetics", 5: "Ship Destroyed", 6: "Advanced Training", 7: "Life Event", 8: "Naval Battle", 9: "Mutiny", 10: "Xenomorphs", 11: "Electronic Warfare", 12: "Advancement" }
  },
  Pirate: {
    service: ["Streetwise", "Repair", "Gun Combat", "Melee Combat", "Zero-G", "Recon"],
    specialist: ["Deception", "Carousing", "Piloting", "Tactics", "Demolitions", "Gunnery"],
    advanced: ["Liaison", "Engineering", "Jack of All Trades", "Computer", "Medicine", "Admin"],
    rankSkills: { 2: ["Pilot"], 5: ["Leadership"] },
    eventNames: { 2: "Injury", 3: "Gambling Ring", 4: "Smuggling", 5: "Cybernetics", 6: "Colonial Raid", 7: "Life Event", 8: "Prize Catch", 9: "Naval Battle", 10: "Yarrr!", 11: "Stranded", 12: "Advancement" }
  },
  Rogue: {
    service: ["Streetwise", "Recon", "Gun Combat", "Deception", "Stealth", "Carousing"],
    specialist: ["Melee Combat", "Liaison", "Athletics", "Admin", "Repair"],
    advanced: ["Survival", "Jack of All Trades", "Engineering", "Medicine", "Tactics", "Computers"],
    rankSkills: { 2: ["Gun Combat"] },
    eventNames: { 2: "Injury", 3: "Rat!", 4: "Cybernetics", 5: "Hacker", 6: "Caught", 7: "Life Event", 8: "Heist", 9: "Gang War", 10: "Gambling Ring", 11: "Mentor", 12: "Advancement" }
  },
  Scholar: {
    service: ["Admin", "Computer", "Medicine", "Liaison", "Investigation", "Science"],
    specialist: ["Survival", "Repair", "Carousing", "Engineering", "Jack of All Trades", "Medicine"],
    advanced: ["Piloting", "Zero-G", "Animals", "Recon", "Athletics", "Leadership"],
    rankSkills: { 3: ["Liaison"] },
    eventNames: { 2: "Injury", 3: "Cybernetics", 4: "Breakthrough", 5: "Field Work", 6: "Immoral Research", 7: "Life Event", 8: "Confidential Project", 9: "Plagiarism", 10: "Talent Grab", 11: "Mentor", 12: "Advancement" }
  },
  Scout: {
    service: ["Piloting", "Repair", "Computer", "Gun Combat", "Zero-G", "Survival"],
    specialist: ["Gunnery", "Athletics", "Recon", "Science", "Investigation", "Stealth"],
    advanced: ["Admin", "Grav Vehicles", "Medicine", "Tactics", "Engineering", "Jack of All Trades"],
    rankSkills: { 3: ["Science"] },
    eventNames: { 2: "Injury", 3: "Ambushed", 4: "Cybernetics", 5: "Survey Duty", 6: "Exemplary Service", 7: "Deep Space Travel", 8: "Life Event", 9: "Rescue Mission", 10: "Xenomorphs", 11: "Courier Duty", 12: "Bonanza" }
  }
};
