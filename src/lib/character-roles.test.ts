import { describe, expect, it } from "vitest";
import {
  getCharacterCombatRoles,
  getCharacterTypicalRoles,
  getRoleBadgeClass,
  inferActiveCombatRole,
  isRoleMatch,
} from "@/lib/character-roles";
import {
  getArchetypesForRole,
  getEquipmentGuide,
} from "@/lib/equipment-data";
import { createMockCharacter } from "@/lib/test-fixtures";

describe("character-roles domain module", () => {
  describe("getCharacterCombatRoles", () => {
    it("returns correct single role for dedicated on-field hypercarries", () => {
      expect(getCharacterCombatRoles("Neuvillette")).toEqual(["On-Field DPS"]);
      expect(getCharacterCombatRoles("Arlecchino")).toEqual(["On-Field DPS"]);
      expect(getCharacterCombatRoles("Hu Tao")).toEqual(["On-Field DPS"]);
      expect(getCharacterCombatRoles("Xiao")).toEqual(["On-Field DPS"]);
    });

    it("returns multi-role capabilities for versatile characters", () => {
      const raidenRoles = getCharacterCombatRoles("Raiden Shogun");
      expect(raidenRoles).toContain("On-Field DPS");
      expect(raidenRoles).toContain("Off-Field DPS");
      expect(raidenRoles).toContain("Off-Field Support");

      const bennettRoles = getCharacterCombatRoles("Bennett");
      expect(bennettRoles).toContain("Off-Field Support");
      expect(bennettRoles).toContain("Off-Field Healer");
      expect(bennettRoles).toContain("On-Field DPS");

      const furinaRoles = getCharacterCombatRoles("Furina");
      expect(furinaRoles).toContain("Off-Field DPS");
      expect(furinaRoles).toContain("Off-Field Support");
      expect(furinaRoles).toContain("Off-Field Healer");

      const kokomiRoles = getCharacterCombatRoles("Sangonomiya Kokomi");
      expect(kokomiRoles).toContain("Off-Field Healer");
      expect(kokomiRoles).toContain("Off-Field Support");
      expect(kokomiRoles).toContain("On-Field Healer");

      const kazuhaRoles = getCharacterCombatRoles("Kaedehara Kazuha");
      expect(kazuhaRoles).toContain("Off-Field Support");
      expect(kazuhaRoles).toContain("Off-Field DPS");

      const valeriyRoles = getCharacterCombatRoles("Valeriy");
      expect(valeriyRoles).toEqual(["Off-Field Support"]);
    });

    it("resolves roles by numerical avatar ID", () => {
      // 10000087 = Neuvillette
      expect(getCharacterCombatRoles("Unknown Name", 10000087)).toEqual(["On-Field DPS"]);
      // 10000032 = Bennett
      expect(getCharacterCombatRoles("Unknown Name", 10000032)).toContain("Off-Field Support");
      expect(getCharacterCombatRoles("Unknown Name", 10000032)).toContain("Off-Field Healer");
      // 10000109 = Valeriy
      expect(getCharacterCombatRoles("Unknown Name", 10000109)).toEqual(["Off-Field Support"]);
    });

    it("falls back to sensible roles for unknown characters", () => {
      const fallback = getCharacterCombatRoles("Mysterious Traveler");
      expect(fallback.length).toBeGreaterThan(0);
      expect(fallback).toContain("On-Field DPS");
    });
  });

  describe("getCharacterTypicalRoles", () => {
    it("returns canonical typical meta roles for characters", () => {
      expect(getCharacterTypicalRoles("Valeriy")).toEqual(["Off-Field Support"]);
      expect(getCharacterTypicalRoles("Bennett")).toEqual([
        "Off-Field Support",
        "Off-Field Healer",
        "On-Field DPS",
      ]);
      expect(getCharacterTypicalRoles("Unknown Name", 10000109)).toEqual(["Off-Field Support"]);
    });
  });

  describe("isRoleMatch", () => {
    it("handles All filter", () => {
      expect(isRoleMatch("On-Field DPS", "All")).toBe(true);
      expect(isRoleMatch("Off-Field Support", "All")).toBe(true);
    });

    it("matches exact role strings", () => {
      expect(isRoleMatch("On-Field DPS", "On-Field DPS")).toBe(true);
      expect(isRoleMatch("Off-Field DPS", "On-Field DPS")).toBe(false);
      expect(isRoleMatch("Off-Field Support", "Off-Field Support")).toBe(true);
      expect(isRoleMatch("Off-Field Support", "Off-Field Healer")).toBe(false);
    });

    it("matches broad legacy role filters", () => {
      expect(isRoleMatch("On-Field DPS", "DPS")).toBe(true);
      expect(isRoleMatch("Off-Field DPS", "DPS")).toBe(true);
      expect(isRoleMatch("Off-Field DPS", "Sub-DPS")).toBe(true);
      expect(isRoleMatch("On-Field DPS", "Sub-DPS")).toBe(false);
      expect(isRoleMatch("Off-Field Support", "Support")).toBe(true);
      expect(isRoleMatch("On-Field Support", "Support")).toBe(true);
      expect(isRoleMatch("Off-Field Healer", "Healer")).toBe(true);
      expect(isRoleMatch("On-Field Healer", "Healer")).toBe(true);
      expect(isRoleMatch("Off-Field Support", "Healer")).toBe(false);
    });
  });

  describe("inferActiveCombatRole", () => {
    it("identifies active Healer role when character has healing bonus or healing set", () => {
      const healerBennett = createMockCharacter("Bennett", "Pyro", {
        avatarId: 10000032,
        stats: {
          maxHp: 32000,
          atk: 1200,
          def: 700,
          em: 50,
          critRate: 15,
          critDmg: 70,
          er: 220,
          healingBonus: 35.9,
        },
        artifactSets: [{ name: "Maiden Beloved", count: 4 }],
      });

      expect(inferActiveCombatRole(healerBennett)).toBe("Off-Field Healer");
    });

    it("identifies active Support role when equipped with Noblesse and utility weapon", () => {
      const supportBennett = createMockCharacter("Bennett", "Pyro", {
        avatarId: 10000032,
        weapon: {
          name: "Favonius Sword",
          level: 90,
          refinement: 5,
          rarity: 4,
          baseAtk: 454,
          subStatLabel: "Energy Recharge",
          subStatValue: "61.3%",
          passiveSummary: "Generate energy on crit",
        },
        stats: {
          maxHp: 24000,
          atk: 1400,
          def: 750,
          em: 80,
          critRate: 45,
          critDmg: 90,
          er: 240,
        },
        artifactSets: [{ name: "Noblesse Oblige", count: 4 }],
      });

      expect(inferActiveCombatRole(supportBennett)).toBe("Off-Field Support");
    });

    it("identifies active Sub-DPS role for Furina with Golden Troupe", () => {
      const subDpsFurina = createMockCharacter("Furina", "Hydro", {
        avatarId: 10000089,
        stats: {
          maxHp: 38000,
          atk: 1100,
          def: 700,
          em: 60,
          critRate: 75,
          critDmg: 160,
          er: 170,
        },
        artifactSets: [{ name: "Golden Troupe", count: 4 }],
      });

      expect(inferActiveCombatRole(subDpsFurina)).toBe("Off-Field DPS");
    });

    it("identifies active DPS role for Raiden Shogun equipped with high CV Emblem build", () => {
      const carryRaiden = createMockCharacter("Raiden Shogun", "Electro", {
        avatarId: 10000052,
        weapon: {
          name: "Engulfing Lightning",
          level: 90,
          refinement: 1,
          rarity: 5,
          baseAtk: 608,
          subStatLabel: "Energy Recharge",
          subStatValue: "55.1%",
          passiveSummary: "ATK bonus based on ER",
        },
        stats: {
          maxHp: 19000,
          atk: 2100,
          def: 800,
          em: 40,
          critRate: 68,
          critDmg: 152,
          er: 270,
        },
        totalCv: 180,
        artifactSets: [{ name: "Emblem of Severed Fate", count: 4 }],
      });

      expect(inferActiveCombatRole(carryRaiden)).toBe("On-Field DPS");
    });

    it("identifies active Support role for EM Hyperbloom Raiden Shogun", () => {
      const emRaiden = createMockCharacter("Raiden Shogun", "Electro", {
        avatarId: 10000052,
        weapon: {
          name: "Dragon's Bane",
          level: 90,
          refinement: 5,
          rarity: 4,
          baseAtk: 454,
          subStatLabel: "Elemental Mastery",
          subStatValue: "221",
          passiveSummary: "Bane of Flame and Water",
        },
        stats: {
          maxHp: 18000,
          atk: 1200,
          def: 750,
          em: 960,
          critRate: 15,
          critDmg: 60,
          er: 120,
        },
        totalCv: 40,
        artifactSets: [{ name: "Gilded Dreams", count: 4 }],
      });

      expect(inferActiveCombatRole(emRaiden)).toBe("Off-Field Support");
    });

    it("falls back to primary canonical role for single-role characters", () => {
      const neuvillette = createMockCharacter("Neuvillette", "Hydro", {
        avatarId: 10000087,
      });

      expect(inferActiveCombatRole(neuvillette)).toBe("On-Field DPS");
    });
  });

  describe("getRoleBadgeClass", () => {
    it("returns distinct theme classes for each combat role", () => {
      expect(getRoleBadgeClass("On-Field DPS")).toContain("amber");
      expect(getRoleBadgeClass("Off-Field DPS")).toContain("sky");
      expect(getRoleBadgeClass("Off-Field Support")).toContain("indigo");
      expect(getRoleBadgeClass("On-Field Support")).toContain("violet");
      expect(getRoleBadgeClass("Off-Field Healer")).toContain("emerald");
      expect(getRoleBadgeClass("On-Field Healer")).toContain("teal");
      expect(getRoleBadgeClass("DPS")).toContain("amber");
      expect(getRoleBadgeClass("Sub-DPS")).toContain("sky");
      expect(getRoleBadgeClass("Support")).toContain("indigo");
      expect(getRoleBadgeClass("Healer")).toContain("emerald");
    });
  });

  describe("Role-based Equipment Recommendations", () => {
    it("provides role-specific archetypes for versatile characters like Raiden Shogun", () => {
      const char = createMockCharacter("Raiden Shogun", "Electro", { avatarId: 10000052 });
      const guide = getEquipmentGuide(char);

      const dpsArchetype = guide.archetypes.find((a) => isRoleMatch(a.role, "On-Field DPS"));
      const supportArchetype = guide.archetypes.find((a) => isRoleMatch(a.role, "Off-Field Support"));

      expect(dpsArchetype).toBeDefined();
      expect(supportArchetype).toBeDefined();
      expect(dpsArchetype?.bestArtifactSets[0].name).toBe("Emblem of Severed Fate");
      expect(supportArchetype?.bestWeapons.some((w) => w.name.includes("Dragon's Bane"))).toBe(true);
    });

    it("provides role-specific archetypes for Bennett", () => {
      const char = createMockCharacter("Bennett", "Pyro", { avatarId: 10000032 });
      const guide = getEquipmentGuide(char);

      const supportArchetype = guide.archetypes.find((a) => isRoleMatch(a.role, "Off-Field Support"));
      const healerArchetype = guide.archetypes.find((a) => isRoleMatch(a.role, "Off-Field Healer"));

      expect(supportArchetype).toBeDefined();
      expect(healerArchetype).toBeDefined();
      expect(supportArchetype?.bestArtifactSets[0].name).toBe("Noblesse Oblige");
      expect(healerArchetype?.bestArtifactSets.some((s) => s.name.includes("Maiden"))).toBe(true);
    });

    it("provides curated Game8 equipment recommendations for Valeriy", () => {
      const valeriy = createMockCharacter("Valeriy", "Electro", { avatarId: 10000109 });
      const guide = getEquipmentGuide(valeriy);

      expect(guide.characterName).toBe("Valeriy");
      expect(guide.archetypes.length).toBeGreaterThan(0);
      const archetype = guide.archetypes[0];
      expect(archetype.role).toBe("Off-Field Support");
      expect(archetype.name).toContain("Stellar Conduct");

      // Verify Best Weapon and Alternatives match Game8
      const weaponNames = archetype.bestWeapons.map((w) => w.name);
      expect(weaponNames).toContain("Summit Shaper");
      expect(weaponNames).toContain("Aquila Favonia");
      expect(weaponNames).toContain("Skyward Blade");
      expect(weaponNames).toContain("Calamity of Eshu");
      expect(weaponNames).toContain("Moonweaver's Dawn");
      expect(weaponNames).toContain("Finale of the Deep");

      // Verify Best Artifact and Alternate Artifact match Game8
      const setNames = archetype.bestArtifactSets.map((s) => s.name);
      expect(setNames).toContain("A Day Carved from Rising Winds");
      expect(setNames).toContain("Heart of the Furnace");

      // Verify Stats match Game8
      expect(archetype.mainStats.sands).toContain("ATK%");
      expect(archetype.mainStats.goblet).toContain("ATK%");
      expect(archetype.mainStats.circlet).toContain("ATK%");
      expect(archetype.benchmarks.keySubstats).toEqual(["ATK%", "ATK (Flat)", "Energy Recharge"]);
    });

    it("generates role-specific dynamic archetypes for unlisted characters", () => {
      const char = createMockCharacter("Custom Healer", "Hydro", {
        roles: ["Off-Field Healer", "Off-Field Support"],
      });
      const healerArchetypes = getArchetypesForRole(char, "Off-Field Healer");
      expect(healerArchetypes.length).toBeGreaterThan(0);
      expect(healerArchetypes[0].role).toBe("Off-Field Healer");
      expect(healerArchetypes[0].mainStats.circlet).toContain("Healing Bonus");
    });
  });
});
