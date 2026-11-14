import type {
  ArtifactPiece,
  ArtifactSlot,
  BuildEvaluationResult,
  CharacterEquipmentGuide,
  CharacterStats,
  EquipmentComparison,
  RawArtifactInput,
  RawSubstatInput,
  RollTier,
  ScalingArchetype,
  ShowcaseCharacter,
  SubstatRoll,
} from "@/types/genshin";
import { getWeaponsForArtifactSet } from "@/lib/equipment-data";

export type {
  BuildEvaluationResult,
  RawArtifactInput,
  RawSubstatInput,
  ScalingArchetype,
};

export function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

export function calculateCritValue(critRate: number, critDmg: number): number {
  return round1(critRate * 2 + critDmg);
}

export function getRollTier(cv: number): RollTier {
  if (cv >= 42) return "God Roll";
  if (cv >= 34) return "SS";
  if (cv >= 27) return "S";
  if (cv >= 20) return "A";
  return "Needs Upgrade";
}

export function getBuildTier(totalCv: number): string {
  if (totalCv >= 240) return "SSS Tier";
  if (totalCv >= 210) return "SS Tier";
  if (totalCv >= 180) return "S Tier";
  if (totalCv >= 140) return "A Tier";
  return "Developing";
}

const STAT_AVERAGE_ROLL_STEPS: Record<string, number> = {
  "CRIT Rate": 3.3,
  "CRIT DMG": 6.6,
  "ATK%": 5.0,
  "HP%": 5.0,
  "DEF%": 6.2,
  "Energy Recharge": 5.5,
  "Elemental Mastery": 20,
  HP: 254,
  ATK: 16.5,
  DEF: 19.7,
};

export function estimateRolls(label: string, numericValue: number): number {
  const step = STAT_AVERAGE_ROLL_STEPS[label] ?? 10;
  return Math.max(1, Math.min(6, Math.round(numericValue / step)));
}

const AFFIX_CODE_TO_PROP: Record<number, string> = {
  102: "FIGHT_PROP_HP",
  103: "FIGHT_PROP_HP_PERCENT",
  105: "FIGHT_PROP_ATTACK",
  106: "FIGHT_PROP_ATTACK_PERCENT",
  108: "FIGHT_PROP_DEFENSE",
  109: "FIGHT_PROP_DEFENSE_PERCENT",
  120: "FIGHT_PROP_CRITICAL",
  122: "FIGHT_PROP_CRITICAL_HURT",
  123: "FIGHT_PROP_CHARGE_EFFICIENCY",
  124: "FIGHT_PROP_ELEMENT_MASTERY",
};

export function countRollsFromAffixIds(
  appendPropIdList: unknown,
  affixesMeta?: Record<string, { propType?: string }>
): Map<string, number> {
  const counts = new Map<string, number>();
  if (!Array.isArray(appendPropIdList)) return counts;

  for (const rawId of appendPropIdList) {
    const idNum = Number(rawId);
    if (!Number.isFinite(idNum)) continue;
    const mapped =
      affixesMeta?.[String(idNum)]?.propType ??
      AFFIX_CODE_TO_PROP[Math.floor((idNum % 10000) / 10)];
    if (mapped) {
      counts.set(mapped, (counts.get(mapped) ?? 0) + 1);
    }
  }
  return counts;
}

export function tallyArtifactSets(
  setNames: string[]
): Array<{ name: string; count: number; bonusSummary: string }> {
  const setCounts: Record<string, number> = {};
  for (const name of setNames) {
    if (!name || name === "Unknown Set") continue;
    setCounts[name] = (setCounts[name] ?? 0) + 1;
  }

  return Object.entries(setCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([setName, count]) => ({
      name: setName,
      count,
      bonusSummary:
        count >= 4
          ? "4-Piece Set Bonus Active"
          : count >= 2
          ? "2-Piece Set Bonus Active"
          : "Off-Piece",
    }));
}

export function detectScalingArchetype(
  artifacts: Array<{ mainStatLabel: string; slot: ArtifactSlot }>,
  stats: CharacterStats
): ScalingArchetype {
  const healingBonus = stats.healingBonus ?? 0;
  const emMainCount = artifacts.filter((a) => a.mainStatLabel === "Elemental Mastery").length;
  if (emMainCount >= 2 || (stats.em >= 550 && stats.critRate < 40)) {
    return "em-driver";
  }

  const circletPiece = artifacts.find((a) => a.slot === "Circlet");
  const sandsPiece = artifacts.find((a) => a.slot === "Sands");

  if (
    healingBonus >= 15 ||
    (circletPiece?.mainStatLabel === "Healing Bonus" && stats.critRate < 45)
  ) {
    return "hp-support";
  }

  if (
    circletPiece?.mainStatLabel === "DEF%" ||
    (sandsPiece?.mainStatLabel === "DEF%" && stats.def >= 2000 && stats.critRate < 45)
  ) {
    return "def-scaler";
  }

  if (
    (circletPiece?.mainStatLabel === "HP%" || sandsPiece?.mainStatLabel === "HP%") &&
    stats.maxHp >= 40000 &&
    stats.critRate < 40
  ) {
    return "hp-support";
  }

  return "crit-dps";
}

export function evaluateBuildQuality(
  artifacts: ArtifactPiece[],
  stats: CharacterStats,
  roundedTotalCv: number
): {
  buildTier: string;
  critique?: { bottleneck: string; recommendation: string };
} {
  const archetype = detectScalingArchetype(
    artifacts.map((a) => ({ mainStatLabel: a.mainStatLabel, slot: a.slot })),
    stats
  );

  if (archetype === "em-driver") {
    const buildTier =
      stats.em >= 900 ? "Support SS" : stats.em >= 750 ? "Support S" : "Support A";
    const flowerOrPlume = artifacts.filter(
      (a) => a.slot === "Flower" || a.slot === "Plume"
    );
    const lowestEmPiece = [...flowerOrPlume].sort((a, b) => {
      const aEm =
        a.substats.find((s) => s.label === "Elemental Mastery")?.numericValue ?? 0;
      const bEm =
        b.substats.find((s) => s.label === "Elemental Mastery")?.numericValue ?? 0;
      return aEm - bEm;
    })[0];

    return {
      buildTier,
      critique: lowestEmPiece
        ? {
            bottleneck: `EM-scaling build (${stats.em} EM, ${stats.er.toFixed(0)}% ER). ${lowestEmPiece.slot} carries the lowest EM substat contribution.`,
            recommendation: `Prioritize EM + Energy Recharge rolls on Flower/Plume while maintaining ${stats.er.toFixed(0)}% ER and 4pc set uptime.`,
          }
        : undefined,
    };
  }

  if (archetype === "hp-support") {
    const healingBonus = stats.healingBonus ?? 0;
    const isHighHp = stats.maxHp >= 45000;
    return {
      buildTier: stats.er >= 180 || isHighHp ? "Support S" : "Support A",
      critique: {
        bottleneck: `HP/Healing Support build (${healingBonus > 0 ? `${healingBonus.toFixed(1)}% Healing Bonus, ` : ""}${stats.maxHp.toLocaleString("en-US")} HP, ${stats.er.toFixed(0)}% ER).`,
        recommendation:
          stats.er < 160
            ? `Focus on reaching 160%+ Energy Recharge before stacking additional defensive stats.`
            : `Energy threshold looks solid; maximize HP% rolls to reinforce shield health or healing volume.`,
      },
    };
  }

  if (archetype === "def-scaler") {
    return {
      buildTier: stats.def >= 2300 && roundedTotalCv >= 160 ? "SS Tier" : stats.def >= 2000 ? "S Tier" : "A Tier",
      critique: {
        bottleneck: `DEF-scaling build (${stats.def.toLocaleString("en-US")} DEF, ${roundedTotalCv.toFixed(1)} CV).`,
        recommendation:
          stats.def < 2000
            ? `Target 2,000+ DEF on main/substats while maintaining Geo/Burst uptime.`
            : `Strong DEF foundation. Focus substats on CRIT Rate and CRIT DMG.`,
      },
    };
  }

  const nonCircletPieces = artifacts.filter((a) => a.slot !== "Circlet");
  const weakest = [
    ...(nonCircletPieces.length > 0 ? nonCircletPieces : artifacts),
  ].sort((a, b) => a.critValue - b.critValue)[0];

  return {
    buildTier: getBuildTier(roundedTotalCv),
    critique: weakest
      ? {
          bottleneck: `${weakest.slot} (${weakest.mainStatLabel}) sits at ${weakest.critValue.toFixed(1)} CV, making it your highest-leverage upgrade slot.`,
          recommendation:
            weakest.critValue < 25
              ? `Target a 28+ CV replacement on your ${weakest.slot} while keeping ${stats.er.toFixed(0)}% ER balanced for smooth bursts.`
              : `Solid baseline across all slots. Fine-tune ${stats.critRate.toFixed(1)}% / ${stats.critDmg.toFixed(1)}% toward a 1:2 CRIT ratio.`,
        }
      : undefined,
  };
}

const LABEL_TO_FIGHT_PROP: Record<string, string> = {
  HP: "FIGHT_PROP_HP",
  "HP%": "FIGHT_PROP_HP_PERCENT",
  ATK: "FIGHT_PROP_ATTACK",
  "ATK%": "FIGHT_PROP_ATTACK_PERCENT",
  DEF: "FIGHT_PROP_DEFENSE",
  "DEF%": "FIGHT_PROP_DEFENSE_PERCENT",
  "CRIT Rate": "FIGHT_PROP_CRITICAL",
  "CRIT DMG": "FIGHT_PROP_CRITICAL_HURT",
  "Energy Recharge": "FIGHT_PROP_CHARGE_EFFICIENCY",
  "Elemental Mastery": "FIGHT_PROP_ELEMENT_MASTERY",
};

export function evaluateArtifacts(
  rawArtifacts: RawArtifactInput[],
  characterStats: CharacterStats,
  affixesMeta?: Record<string, { propType?: string }>
): BuildEvaluationResult {
  let totalCv = 0;

  const artifacts: ArtifactPiece[] = rawArtifacts.map((raw) => {
    let cr = 0;
    let cd = 0;

    const rollCounts = raw.affixIds
      ? countRollsFromAffixIds(raw.affixIds, affixesMeta)
      : null;

    const substats: SubstatRoll[] = raw.substats.map((sub) => {
      if (sub.label === "CRIT Rate") cr = sub.value;
      if (sub.label === "CRIT DMG") cd = sub.value;

      const propKey =
        sub.propKey ??
        (sub.id !== undefined ? String(sub.id) : undefined) ??
        LABEL_TO_FIGHT_PROP[sub.label];

      const exactRolls =
        rollCounts && propKey ? rollCounts.get(propKey) : undefined;

      const rolls =
        exactRolls && exactRolls > 0
          ? exactRolls
          : (sub.rolls ?? estimateRolls(sub.label, sub.value));

      const wasted =
        sub.label === "HP" || sub.label === "DEF" || sub.label === "ATK";

      return {
        label: sub.label,
        value: sub.isPercent ? `${sub.value.toFixed(1)}%` : String(Math.round(sub.value)),
        numericValue: sub.value,
        rolls,
        wasted,
      };
    });

    const pieceCv = calculateCritValue(cr, cd);
    totalCv += pieceCv;

    return {
      slot: raw.slot,
      name: raw.name ?? `${raw.setName} ${raw.slot}`,
      setName: raw.setName,
      level: raw.level,
      rarity: raw.rarity,
      mainStatLabel: raw.mainStat.label,
      mainStatValue: raw.mainStat.isPercent
        ? `${raw.mainStat.value.toFixed(1)}%`
        : String(Math.round(raw.mainStat.value)),
      critValue: pieceCv,
      tier: getRollTier(pieceCv),
      iconUrl: raw.iconUrl,
      substats,
    };
  });

  const roundedTotalCv = round1(totalCv);
  const artifactSets = tallyArtifactSets(rawArtifacts.map((a) => a.setName));
  const { buildTier, critique } = evaluateBuildQuality(
    artifacts,
    characterStats,
    roundedTotalCv
  );

  return {
    totalCv: roundedTotalCv,
    buildTier,
    critique,
    artifactSets,
    artifacts,
  };
}

export function compareEquippedWithRecommendations(
  character: ShowcaseCharacter,
  guide: CharacterEquipmentGuide,
  activeArchetypeId?: string,
  selectedArtifactSetName?: string
): EquipmentComparison {
  const archetype =
    guide.archetypes.find((a) => a.id === activeArchetypeId) ??
    guide.archetypes[0];

  const targetSet = selectedArtifactSetName
    ? archetype.bestArtifactSets.find(
        (s) =>
          s.name.toLowerCase() === selectedArtifactSetName.toLowerCase() ||
          s.name.toLowerCase().includes(selectedArtifactSetName.toLowerCase())
      ) ?? archetype.bestArtifactSets[0]
    : archetype.bestArtifactSets[0];

  const weapons = getWeaponsForArtifactSet(archetype, targetSet?.name);
  const equippedWeaponName = character.weapon.name.toLowerCase().trim();
  const matchedWeapon = weapons.find(
    (w) =>
      equippedWeaponName.includes(w.name.toLowerCase().trim()) ||
      w.name.toLowerCase().trim().includes(equippedWeaponName)
  );

  let weaponStatus: EquipmentComparison["weaponStatus"] = "suboptimal";
  let weaponFeedback = `Current weapon (${character.weapon.name} R${character.weapon.refinement}) does not match primary recommendations for ${targetSet.name}. Consider ${weapons[0]?.name ?? "signature weapon"} or ${weapons.find((w) => w.tier === "Best 4★ / F2P")?.name ?? "a Favonius weapon"}.`;

  if (matchedWeapon) {
    if (matchedWeapon.tier === "BiS (Signature)") {
      weaponStatus = "bis_match";
      weaponFeedback = `Equipped signature weapon (${character.weapon.name} R${character.weapon.refinement}) perfectly matches the ${targetSet.name} setup!`;
    } else if (matchedWeapon.tier === "Top Alternative (5★)") {
      weaponStatus = "recommended_match";
      weaponFeedback = `Equipped weapon (${character.weapon.name}) is a top-tier 5★ alternative for ${targetSet.name}.`;
    } else {
      weaponStatus = "recommended_match";
      weaponFeedback = `Equipped weapon (${character.weapon.name}) is a recommended 4★ / F2P option for ${targetSet.name}.`;
    }
  } else if (character.weapon.rarity === 5) {
    weaponStatus = "alternative";
    weaponFeedback = `Equipped 5★ weapon (${character.weapon.name}) provides solid baseline stats, though ${weapons[0]?.name ?? "signature"} has higher synergy with ${targetSet.name}.`;
  }

  const equippedSetNames = character.artifactSets.map((s) => s.name.toLowerCase());
  const isTargetEquipped = equippedSetNames.some(
    (n) => n.includes(targetSet.name.toLowerCase()) || targetSet.name.toLowerCase().includes(n)
  );

  let artifactSetStatus: EquipmentComparison["artifactSetStatus"] = "mismatch";
  let artifactSetFeedback = `Currently running ${
    character.artifactSets.map((s) => `${s.count}pc ${s.name}`).join(" + ") || "mixed pieces"
  }. Active comparison target: 4pc ${targetSet.name}.`;

  if (isTargetEquipped) {
    const is4pc = character.artifactSets.some(
      (s) =>
        s.count >= 4 &&
        (s.name.toLowerCase().includes(targetSet.name.toLowerCase()) ||
          targetSet.name.toLowerCase().includes(s.name.toLowerCase()))
    );
    if (is4pc) {
      artifactSetStatus = "full_match";
      artifactSetFeedback = `Full 4pc set (${targetSet.name}) is active and matches recommendation!`;
    } else {
      artifactSetStatus = "partial_match";
      artifactSetFeedback = `Running 2pc ${targetSet.name}. Aim for full 4pc bonus or 2pc + 2pc synergy.`;
    }
  }

  const sandsPiece = character.artifacts.find((p) => p.slot === "Sands");
  const gobletPiece = character.artifacts.find((p) => p.slot === "Goblet");
  const circletPiece = character.artifacts.find((p) => p.slot === "Circlet");

  const checkMainStat = (
    pieceLabel: string | undefined,
    recommended: string[]
  ): "optimal" | "acceptable" | "suboptimal" | "unknown" => {
    if (!pieceLabel) return "unknown";
    const clean = pieceLabel.toLowerCase();
    const isFirst = clean.includes(recommended[0].toLowerCase());
    if (isFirst) return "optimal";
    const isOther = recommended.slice(1).some((r) => clean.includes(r.toLowerCase()));
    if (isOther) return "acceptable";
    return "suboptimal";
  };

  const mainStatsStatus = {
    sands: checkMainStat(sandsPiece?.mainStatLabel, archetype.mainStats.sands),
    goblet: checkMainStat(gobletPiece?.mainStatLabel, archetype.mainStats.goblet),
    circlet: checkMainStat(circletPiece?.mainStatLabel, archetype.mainStats.circlet),
  };

  const recErStr = archetype.benchmarks.recommendedEr;
  const numMatch = recErStr.match(/(\d+)/);
  const targetEr = numMatch ? parseInt(numMatch[1], 10) : 130;
  const currentEr = character.stats.er;

  let erStatus: EquipmentComparison["erStatus"] = "optimal";
  let erFeedback = `${currentEr.toFixed(1)}% ER meets or exceeds the ~${targetEr}% breakpoint.`;

  if (currentEr < targetEr - 15) {
    erStatus = "deficit";
    erFeedback = `${currentEr.toFixed(1)}% ER is below the recommended ~${targetEr}% benchmark. May suffer burst delays.`;
  } else if (currentEr < targetEr - 2) {
    erStatus = "close";
    erFeedback = `${currentEr.toFixed(1)}% ER is slightly below target (~${targetEr}%). Compensate with Favonius teammate.`;
  }

  return {
    weaponStatus,
    weaponFeedback,
    artifactSetStatus,
    artifactSetFeedback,
    mainStatsStatus,
    erStatus,
    erFeedback,
  };
}
