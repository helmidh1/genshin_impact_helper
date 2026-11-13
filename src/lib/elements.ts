import type { ElementType, RollTier } from "@/types/genshin";

export interface ElementTheme {
  label: ElementType;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  ringClass: string;
  glowShadow: string;
}

export const ELEMENT_THEMES: Record<ElementType, ElementTheme> = {
  Pyro: {
    label: "Pyro",
    hex: "#FF5A36",
    bgClass: "bg-[#FF5A36]/12",
    borderClass: "border-[#FF5A36]/40",
    textClass: "text-[#FF5A36]",
    ringClass: "ring-[#FF5A36]/50",
    glowShadow: "shadow-[0_0_18px_rgba(255,90,54,0.18)]",
  },
  Hydro: {
    label: "Hydro",
    hex: "#00B4D8",
    bgClass: "bg-[#00B4D8]/12",
    borderClass: "border-[#00B4D8]/40",
    textClass: "text-[#4CD6FB]",
    ringClass: "ring-[#00B4D8]/50",
    glowShadow: "shadow-[0_0_18px_rgba(0,180,216,0.18)]",
  },
  Electro: {
    label: "Electro",
    hex: "#AF52DE",
    bgClass: "bg-[#AF52DE]/12",
    borderClass: "border-[#AF52DE]/40",
    textClass: "text-[#C77DFF]",
    ringClass: "ring-[#AF52DE]/50",
    glowShadow: "shadow-[0_0_18px_rgba(175,82,222,0.18)]",
  },
  Cryo: {
    label: "Cryo",
    hex: "#70D6FF",
    bgClass: "bg-[#70D6FF]/12",
    borderClass: "border-[#70D6FF]/40",
    textClass: "text-[#70D6FF]",
    ringClass: "ring-[#70D6FF]/50",
    glowShadow: "shadow-[0_0_18px_rgba(112,214,255,0.18)]",
  },
  Dendro: {
    label: "Dendro",
    hex: "#70E000",
    bgClass: "bg-[#70E000]/12",
    borderClass: "border-[#70E000]/40",
    textClass: "text-[#70E000]",
    ringClass: "ring-[#70E000]/50",
    glowShadow: "shadow-[0_0_18px_rgba(112,224,0,0.18)]",
  },
  Anemo: {
    label: "Anemo",
    hex: "#5CE1E6",
    bgClass: "bg-[#5CE1E6]/12",
    borderClass: "border-[#5CE1E6]/40",
    textClass: "text-[#5CE1E6]",
    ringClass: "ring-[#5CE1E6]/50",
    glowShadow: "shadow-[0_0_18px_rgba(92,225,230,0.18)]",
  },
  Geo: {
    label: "Geo",
    hex: "#F3C969",
    bgClass: "bg-[#F3C969]/12",
    borderClass: "border-[#F3C969]/40",
    textClass: "text-[#F3C969]",
    ringClass: "ring-[#F3C969]/50",
    glowShadow: "shadow-[0_0_18px_rgba(243,201,105,0.18)]",
  },
};

export function getRollTierBadgeClass(tier: RollTier): string {
  switch (tier) {
    case "God Roll":
      return "bg-[#F5D061]/18 text-[#F5D061] border-[#F5D061]/60";
    case "SS":
      return "bg-[#D4AF37]/15 text-[#F2CA50] border-[#D4AF37]/45";
    case "S":
      return "bg-[#00B4D8]/15 text-[#4CD6FB] border-[#00B4D8]/45";
    case "A":
      return "bg-[#AF52DE]/15 text-[#C77DFF] border-[#AF52DE]/45";
    case "Needs Upgrade":
      return "bg-[#FF5A36]/15 text-[#FF7A5C] border-[#FF5A36]/45";
  }
}

export function computeResonances(elements: ElementType[]): {
  name: string;
  effect: string;
  element?: ElementType;
}[] {
  const counts = elements.reduce<Record<string, number>>((acc, el) => {
    acc[el] = (acc[el] ?? 0) + 1;
    return acc;
  }, {});

  const resonances: { name: string; effect: string; element?: ElementType }[] = [];
  if ((counts.Pyro ?? 0) >= 2) {
    resonances.push({
      name: "Fervent Flames (2 Pyro)",
      effect: "Increases ATK by 25% and reduces Cryo duration by 40%.",
      element: "Pyro",
    });
  }
  if ((counts.Hydro ?? 0) >= 2) {
    resonances.push({
      name: "Soothing Water (2 Hydro)",
      effect: "Increases Max HP by 25% and reduces Pyro duration by 40%.",
      element: "Hydro",
    });
  }
  if ((counts.Cryo ?? 0) >= 2) {
    resonances.push({
      name: "Shattering Ice (2 Cryo)",
      effect: "Increases CRIT Rate against Cryo-affected enemies by 15%.",
      element: "Cryo",
    });
  }
  if ((counts.Electro ?? 0) >= 2) {
    resonances.push({
      name: "High Voltage (2 Electro)",
      effect: "Electro reactions generate 1 Electro Particle (5s CD).",
      element: "Electro",
    });
  }
  if ((counts.Dendro ?? 0) >= 2) {
    resonances.push({
      name: "Sprawling Greenery (2 Dendro)",
      effect: "Increases Elemental Mastery by 50 (+30/+20 on Dendro reactions).",
      element: "Dendro",
    });
  }
  if ((counts.Anemo ?? 0) >= 2) {
    resonances.push({
      name: "Impetuous Winds (2 Anemo)",
      effect: "Decreases Stamina consumption by 15%, +10% Movement SPD, -5% Skill CD.",
      element: "Anemo",
    });
  }
  if ((counts.Geo ?? 0) >= 2) {
    resonances.push({
      name: "Enduring Rock (2 Geo)",
      effect: "Increases Shield Strength by 15%, +15% DMG and -20% Geo RES while shielded.",
      element: "Geo",
    });
  }
  if (resonances.length === 0 && new Set(elements).size === 4) {
    resonances.push({
      name: "Protective Canopy (4 Unique)",
      effect: "All Elemental RES & Physical RES increased by 15%.",
    });
  }
  return resonances;
}
