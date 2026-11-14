"use client";

import { useMemo, useState } from "react";
import {
  BrainCircuit,
  Heart,
  Search,
  Shield,
  Sparkles,
  Swords,
  X,
} from "lucide-react";
import { CharacterAvatar, ElementBadge } from "@/components/ElementBadge";
import { EquipmentRecommendationsPanel } from "@/components/EquipmentRecommendationsPanel";
import { ELEMENT_THEMES, getRollTierBadgeClass } from "@/lib/elements";
import {
  detectCharacterRarity,
  detectWeaponType,
  getEquipmentGuide,
  getWeaponsForArtifactSet,
} from "@/lib/equipment-data";
import type { ShowcaseCharacter } from "@/types/genshin";

type ElementFilter = "All" | ShowcaseCharacter["element"];
type WeaponTypeFilter = "All" | "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";
type RarityFilter = "All" | 5 | 4;
type SortOption = "cv" | "level" | "constellation" | "name";

const ELEMENT_FILTERS: ElementFilter[] = [
  "All",
  "Pyro",
  "Hydro",
  "Electro",
  "Cryo",
  "Dendro",
  "Anemo",
  "Geo",
];

const WEAPON_TYPE_FILTERS: { label: string; value: WeaponTypeFilter }[] = [
  { label: "All Weapons", value: "All" },
  { label: "Sword", value: "Sword" },
  { label: "Claymore", value: "Claymore" },
  { label: "Polearm", value: "Polearm" },
  { label: "Bow", value: "Bow" },
  { label: "Catalyst", value: "Catalyst" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Highest CV", value: "cv" },
  { label: "Level (High → Low)", value: "level" },
  { label: "Constellation (C6 → C0)", value: "constellation" },
  { label: "Name (A → Z)", value: "name" },
];

interface ShowcaseTabProps {
  characters: ShowcaseCharacter[];
  selectedAvatarId: number;
  onSelectAvatar: (avatarId: number) => void;
  onCoachCharacter?: (char: ShowcaseCharacter) => void;
}

export function ShowcaseTab({
  characters,
  selectedAvatarId,
  onSelectAvatar,
  onCoachCharacter,
}: ShowcaseTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<ElementFilter>("All");
  const [weaponTypeFilter, setWeaponTypeFilter] = useState<WeaponTypeFilter>("All");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("cv");
  const [viewMode, setViewMode] = useState<"artifacts" | "equipment">("artifacts");

  // Keep responsive local selection state synchronized with parent selectedAvatarId prop
  const [prevPropId, setPrevPropId] = useState<number>(selectedAvatarId);
  const [activeAvatarId, setActiveAvatarId] = useState<number>(selectedAvatarId);

  if (selectedAvatarId !== prevPropId) {
    setPrevPropId(selectedAvatarId);
    setActiveAvatarId(selectedAvatarId);
  }

  const handleSelectCharacter = (avatarId: number) => {
    setActiveAvatarId(avatarId);
    onSelectAvatar(avatarId);
  };

  const selected =
    characters.find(
      (c) =>
        Number(c.avatarId) === Number(activeAvatarId) ||
        String(c.avatarId) === String(activeAvatarId)
    ) ??
    characters.find(
      (c) =>
        Number(c.avatarId) === Number(selectedAvatarId) ||
        String(c.avatarId) === String(selectedAvatarId)
    ) ??
    characters[0];

  const quickGuide = useMemo(
    () => (selected ? getEquipmentGuide(selected) : null),
    [selected]
  );
  const quickArchetype = quickGuide?.archetypes[0];
  const quickEquippedSetName = selected?.artifactSets[0]?.name;

  const quickArtifactSet = useMemo(() => {
    if (!quickArchetype) return undefined;
    return (
      quickArchetype.bestArtifactSets.find(
        (s) =>
          quickEquippedSetName &&
          (s.name.toLowerCase().includes(quickEquippedSetName.toLowerCase()) ||
            quickEquippedSetName.toLowerCase().includes(s.name.toLowerCase()))
      ) ?? quickArchetype.bestArtifactSets[0]
    );
  }, [quickArchetype, quickEquippedSetName]);

  const quickWeapons = useMemo(() => {
    if (!quickArchetype) return [];
    return getWeaponsForArtifactSet(quickArchetype, quickArtifactSet?.name);
  }, [quickArchetype, quickArtifactSet]);

  const quickBisWeapon =
    quickWeapons.find((w) => w.tier === "BiS (Signature)") ??
    quickWeapons[0] ??
    quickArchetype?.bestWeapons[0];
  const quickF2pWeapon =
    quickWeapons.find((w) => w.tier === "Best 4★ / F2P") ??
    quickArchetype?.bestWeapons.find((w) => w.tier === "Best 4★ / F2P");

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    elementFilter !== "All" ||
    weaponTypeFilter !== "All" ||
    rarityFilter !== "All" ||
    sortBy !== "cv";

  const handleResetFilters = () => {
    setSearchQuery("");
    setElementFilter("All");
    setWeaponTypeFilter("All");
    setRarityFilter("All");
    setSortBy("cv");
  };

  const filteredCharacters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = characters.filter((char) => {
      // 1. Search criteria: strictly Character Name
      if (q && !char.name.toLowerCase().includes(q)) {
        return false;
      }
      // 2. Element filter
      if (elementFilter !== "All" && char.element !== elementFilter) {
        return false;
      }
      // 3. Weapon type filter
      if (weaponTypeFilter !== "All") {
        const weaponType = detectWeaponType(char);
        if (weaponType !== weaponTypeFilter) {
          return false;
        }
      }
      // 4. Rarity filter
      if (rarityFilter !== "All") {
        const rarity = detectCharacterRarity(char);
        if (rarity !== rarityFilter) {
          return false;
        }
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "cv") {
        return b.totalCv !== a.totalCv ? b.totalCv - a.totalCv : b.level - a.level;
      }
      if (sortBy === "level") {
        return b.level !== a.level ? b.level - a.level : b.totalCv - a.totalCv;
      }
      if (sortBy === "constellation") {
        return b.constellation !== a.constellation
          ? b.constellation - a.constellation
          : b.totalCv - a.totalCv;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [
    characters,
    searchQuery,
    elementFilter,
    weaponTypeFilter,
    rarityFilter,
    sortBy,
  ]);

  if (!selected) {
    return (
      <div className="glass-panel rounded-xl p-10 text-center text-sm text-[#d0c5af]">
        No character builds available for this profile yet. Connect HoYoLAB or
        click Sync Data to import your account roster.
      </div>
    );
  }

  const theme = ELEMENT_THEMES[selected.element];
  const statRows = [
    { label: "Max HP", value: selected.stats.maxHp.toLocaleString("en-US") },
    {
      label: "ATK",
      value: selected.stats.baseAtk
        ? `${selected.stats.atk.toLocaleString("en-US")} (Base ${selected.stats.baseAtk.toLocaleString("en-US")})`
        : selected.stats.atk.toLocaleString("en-US"),
    },
    { label: "DEF", value: selected.stats.def.toLocaleString("en-US") },
    { label: "Elemental Mastery", value: `${selected.stats.em} EM` },
    { label: "CRIT Rate", value: `${selected.stats.critRate.toFixed(1)}%` },
    { label: "CRIT DMG", value: `${selected.stats.critDmg.toFixed(1)}%` },
    { label: "Energy Recharge", value: `${selected.stats.er.toFixed(1)}%` },
    ...(selected.stats.elementalDmgLabel &&
    selected.stats.elementalDmgBonus !== undefined
      ? [
          {
            label: selected.stats.elementalDmgLabel,
            value: `${selected.stats.elementalDmgBonus.toFixed(1)}%`,
          },
        ]
      : []),
    ...(selected.stats.physicalDmgBonus && selected.stats.physicalDmgBonus > 0
      ? [
          {
            label: "Physical DMG Bonus",
            value: `${selected.stats.physicalDmgBonus.toFixed(1)}%`,
          },
        ]
      : []),
    ...(selected.stats.healingBonus && selected.stats.healingBonus > 0
      ? [
          {
            label: "Healing Bonus",
            value: `${selected.stats.healingBonus.toFixed(1)}%`,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Horizontal Character Selector Strip with Filter Bar — Sticky & Floating on Scroll */}
      <div className="sticky top-14 z-30 glass-panel rounded-xl p-3 space-y-2.5 bg-[#131a2a]/95 backdrop-blur-xl border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
        <div className="flex flex-col gap-2">
          {/* Top Controls Row: Search Input + Weapon Type Select + Rarity Toggle + Sort By Select + Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input strictly for character names */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#99907c] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search characters by name..."
                className="w-full bg-[#0a0e18]/80 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#dfe2f1] placeholder:text-[#99907c]/70 focus:outline-none focus:border-[#d4af37]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#99907c] hover:text-[#dfe2f1] cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Weapon Type Filter */}
            <div className="flex items-center">
              <select
                value={weaponTypeFilter}
                onChange={(e) => setWeaponTypeFilter(e.target.value as WeaponTypeFilter)}
                className="bg-[#0a0e18]/80 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#dfe2f1] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                title="Filter by weapon type"
              >
                {WEAPON_TYPE_FILTERS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div className="flex items-center gap-1 bg-[#0a0e18]/70 p-0.5 rounded-lg border border-white/10">
              {(["All", 5, 4] as const).map((r) => {
                const active = rarityFilter === r;
                return (
                  <button
                    key={String(r)}
                    type="button"
                    onClick={() => setRarityFilter(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      active
                        ? "bg-[#262a35] border border-[#d4af37]/50 text-[#f2ca50] font-bold"
                        : "text-[#99907c] hover:text-[#dfe2f1]"
                    }`}
                  >
                    {r === "All" ? "All Stars" : `${r}★`}
                  </button>
                );
              })}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#0a0e18]/80 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#dfe2f1] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                title="Sort characters"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#1c1f2a] border border-[#d4af37]/40 hover:border-[#d4af37] text-[#f2ca50] cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Bottom Controls Row: Element Filter Pills & Match Counter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-1">
              {ELEMENT_FILTERS.map((el) => {
                const active = elementFilter === el;
                return (
                  <button
                    key={el}
                    type="button"
                    onClick={() => setElementFilter(el)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                      active
                        ? "bg-[#262a35] border-[#d4af37]/50 text-[#f2ca50] font-semibold"
                        : "bg-[#0a0e18]/60 border-white/10 text-[#99907c] hover:text-[#dfe2f1]"
                    }`}
                  >
                    {el}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-[#99907c] tabular-nums">
              Showing <strong className="text-[#dfe2f1]">{filteredCharacters.length}</strong> of {characters.length} characters
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {filteredCharacters.length === 0 ? (
            <div className="w-full py-4 text-center text-xs text-[#99907c] space-y-1.5">
              <div>No characters match your current search and filter criteria.</div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-mono text-[#f2ca50] underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            filteredCharacters.map((char) => {
              const active = Number(char.avatarId) === Number(selected.avatarId);
              const cTheme = ELEMENT_THEMES[char.element];
              return (
                <button
                  key={char.avatarId}
                  type="button"
                  onClick={() => handleSelectCharacter(char.avatarId)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border shrink-0 transition-all cursor-pointer ${
                    active
                      ? "bg-[#262a35] border-[#d4af37] shadow-[0_0_14px_rgba(212,175,55,0.22)]"
                      : "bg-[#0a0e18]/70 border-white/10 hover:border-white/25"
                  }`}
                >
                  <CharacterAvatar
                    name={char.name}
                    element={char.element}
                    iconUrl={char.iconUrl}
                    size="sm"
                  />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#dfe2f1]">
                        {char.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${cTheme.textClass}`}
                      >
                        C{char.constellation}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#99907c] tabular-nums">
                      Lv.{char.level} • {detectWeaponType(char)} • {char.totalCv.toFixed(0)} CV
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* View Switcher: Equipped Loadout vs Equipment Recommendations */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("artifacts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-2 ${
              viewMode === "artifacts"
                ? "bg-[#262a35] border-[#d4af37] text-[#f2ca50] font-bold shadow-[0_0_12px_rgba(212,175,55,0.22)]"
                : "bg-[#0a0e18]/60 border-white/10 text-[#99907c] hover:text-[#dfe2f1]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Equipped Loadout &amp; Artifact Rolls
          </button>
          <button
            type="button"
            onClick={() => setViewMode("equipment")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-2 ${
              viewMode === "equipment"
                ? "bg-[#262a35] border-[#d4af37] text-[#f2ca50] font-bold shadow-[0_0_12px_rgba(212,175,55,0.22)]"
                : "bg-[#0a0e18]/60 border-white/10 text-[#99907c] hover:text-[#dfe2f1]"
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-[#f2ca50]" />
            Equipment Recommendations (Game8 &amp; Icy-Veins)
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#99907c]">
          Showing build data for{" "}
          <span className="text-[#dfe2f1] font-semibold">{selected.name}</span>
        </div>
      </div>

      {viewMode === "equipment" ? (
        <EquipmentRecommendationsPanel
          key={`equip-rec-${selected.avatarId}`}
          character={selected}
          onOpenCoachTab={
            onCoachCharacter ? () => onCoachCharacter(selected) : undefined
          }
        />
      ) : (
        /* 12-Col Analytical Build Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 5 COLS: Hero Card + Stats + Weapon */}
        <div className="lg:col-span-5 space-y-5">
          <section className="glass-panel-gold rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c]">
              <span>
                SHOWCASE // {selected.element.toUpperCase()} UNIT
              </span>
              <span className="flex items-center gap-1 text-[#d0c5af]">
                <Heart className="w-3.5 h-3.5 text-[#ff5a36]" /> Friendship Lv.{" "}
                {selected.friendship}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <CharacterAvatar
                  name={selected.name}
                  element={selected.element}
                  iconUrl={selected.iconUrl}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#dfe2f1]">
                      {selected.name}
                    </h2>
                    <ElementBadge element={selected.element} compact />
                  </div>
                  <div className="text-xs font-mono text-[#d0c5af] mt-1 tabular-nums">
                    {selected.title ? `${selected.title} • ` : ""}Lv.{" "}
                    {selected.level}/{selected.maxLevel} •{" "}
                    <span className="text-[#f2ca50] font-bold">
                      C{selected.constellation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Talents */}
              <div className="flex items-center gap-1.5 font-mono text-center">
                {[
                  { label: "NA", val: selected.talents.normal },
                  { label: "Skill", val: selected.talents.skill },
                  { label: "Burst", val: selected.talents.burst },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="px-2 py-1 rounded bg-[#0a0e18] border border-white/10 min-w-[44px]"
                  >
                    <div className="text-xs font-bold text-[#f2ca50] tabular-nums">
                      Lv.{t.val}
                    </div>
                    <div className="text-[9px] text-[#99907c] uppercase">
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crit Value Banner */}
            <div className="p-3 rounded-lg bg-[#0a0e18]/85 border border-[#d4af37]/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                  Artifact Crit Value
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#f2ca50] tabular-nums">
                  {selected.totalCv.toFixed(1)} CV
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/50 text-[11px] font-mono font-bold text-[#f2ca50] uppercase">
                  {selected.buildTier}
                </span>
                <div className="text-[11px] font-mono text-[#4cd6fb] mt-1">
                  Ratio {selected.stats.critRate.toFixed(1)} :{" "}
                  {selected.stats.critDmg.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Tabular Combat Stats */}
            <div className="divide-y divide-white/6 border border-white/8 rounded-lg overflow-hidden">
              {statRows.map((row, idx) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-3.5 py-2 text-xs ${
                    idx % 2 === 1 ? "bg-white/[0.02]" : "bg-[#0a0e18]/40"
                  }`}
                >
                  <span className="text-[#d0c5af]">{row.label}</span>
                  <span className="font-mono font-semibold text-[#dfe2f1] tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Equipped Weapon */}
          <section className="glass-panel rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c]">
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-[#f2ca50]" /> EQUIPPED WEAPON
              </span>
              <span className="text-[#f2ca50]">
                {selected.weapon.rarity}★ • R{selected.weapon.refinement}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1]">
                  {selected.weapon.name}
                </h3>
                <div className="text-xs font-mono text-[#99907c] mt-0.5 tabular-nums">
                  Lv. {selected.weapon.level}/90
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs font-mono font-bold text-[#f2ca50]">
                R{selected.weapon.refinement}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0a0e18]/80 border border-white/8">
                <div className="text-[10px] text-[#99907c] uppercase">
                  Base ATK
                </div>
                <div className="text-base font-bold text-[#dfe2f1] tabular-nums mt-0.5">
                  {selected.weapon.baseAtk}
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#0a0e18]/80 border border-white/8">
                <div className="text-[10px] text-[#99907c] uppercase">
                  {selected.weapon.subStatLabel}
                </div>
                <div className="text-base font-bold text-[#f2ca50] tabular-nums mt-0.5">
                  {selected.weapon.subStatValue}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#d0c5af] leading-relaxed bg-[#0a0e18]/50 p-2.5 rounded border border-white/6">
              {selected.weapon.passiveSummary}
            </p>

            {/* Quick Recommended Equipment Meta Preview */}
            <div className="pt-2 border-t border-white/8 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 font-bold text-[#f2ca50]">
                  <Sparkles className="w-3.5 h-3.5 text-[#f2ca50]" />
                  Recommended Setup ({selected.name})
                </span>
                <span className="text-[10px] text-[#99907c]">Game8 &amp; Icy-Veins</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0a0e18]/80 border border-white/8 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="text-[#99907c] shrink-0">BiS 5★:</span>
                  <span className="font-bold text-[#dfe2f1] truncate text-right flex items-center gap-1">
                    <Swords className="w-3 h-3 text-[#f2ca50] shrink-0" />
                    <span className="truncate">
                      {quickBisWeapon?.name ?? "Signature Weapon"} ({quickBisWeapon?.rarity ?? 5}★)
                    </span>
                  </span>
                </div>
                {quickF2pWeapon && (
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <span className="text-[#99907c] shrink-0">Best 4★ / F2P:</span>
                    <span className="font-semibold text-emerald-300 truncate text-right">
                      {quickF2pWeapon.name}
                    </span>
                  </div>
                )}
                {quickArtifactSet && (
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <span className="text-[#99907c] shrink-0">Top 4pc Set:</span>
                    <span className="font-semibold text-[#4cd6fb] truncate text-right">
                      {quickArtifactSet.name}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewMode("equipment")}
                className="w-full py-2 px-3 rounded bg-[#262a35] hover:bg-[#323746] border border-[#d4af37]/50 hover:border-[#d4af37] text-xs font-mono font-bold text-[#f2ca50] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(212,175,55,0.18)]"
              >
                <Swords className="w-3.5 h-3.5 text-[#f2ca50]" />
                Inspect Full Equipment Guide &amp; Ask Coach
              </button>
              <div className="text-[10px] font-mono text-center text-[#99907c]">
                Compare weapons, artifact stats &amp; ask Gemini coach
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT 7 COLS: Set Synergy + 5 Artifacts + Critique */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Set Synergy */}
          <section className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{
                  borderColor: `${theme.hex}66`,
                  backgroundColor: `${theme.hex}18`,
                }}
              >
                <Shield className="w-5 h-5" style={{ color: theme.hex }} />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                  Active Artifact Set Synergy
                </div>
                <div className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-[#dfe2f1]">
                  {selected.artifactSets
                    .map((s) => `${s.name} (${s.count}pc)`)
                    .join(" • ") || "No Set Bonus"}
                </div>
              </div>
            </div>
            {selected.artifactSets[0]?.bonusSummary && (
              <p className="text-xs text-[#d0c5af] sm:max-w-sm">
                {selected.artifactSets[0].bonusSummary}
              </p>
            )}
          </section>

          {/* 5-Slot Artifact Breakdown */}
          {selected.artifacts.length === 0 ? (
            <div className="glass-panel rounded-xl p-6 space-y-2 text-sm text-[#d0c5af]">
              <div className="font-[family-name:var(--font-space-grotesk)] font-bold text-[#dfe2f1]">
                Summary Build Mode
              </div>
              <p className="text-xs leading-relaxed">
                Individual 5-slot artifact substat rolls are populated for{" "}
                <span className="text-[#f2ca50] font-semibold">Arlecchino</span>{" "}
                in the demo profile and for{" "}
                <span className="text-[#f2ca50] font-semibold">
                  all synced characters
                </span>{" "}
                when you sync via HoYoLAB Battle Chronicle.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selected.artifacts.map((piece) => (
                <div
                  key={`${piece.slot}-${piece.name}`}
                  className={`glass-panel rounded-xl p-4 space-y-3 ${
                    piece.tier === "Needs Upgrade"
                      ? "border-[#ff5a36]/45"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                        {piece.slot} • {piece.setName} (+{piece.level})
                      </div>
                      <div className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1]">
                        {piece.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded bg-[#0a0e18] border border-white/10 font-mono text-xs text-[#dfe2f1] tabular-nums">
                        <span className="text-[#99907c] mr-1.5">Main:</span>
                        <span className="font-bold text-[#f2ca50]">
                          {piece.mainStatLabel} {piece.mainStatValue}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded border text-[11px] font-mono font-bold tabular-nums ${getRollTierBadgeClass(
                          piece.tier
                        )}`}
                      >
                        {piece.tier} • {piece.critValue.toFixed(1)} CV
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {piece.substats.map((sub, i) => (
                      <div
                        key={`${sub.label}-${i}`}
                        className={`p-2 rounded bg-[#0a0e18]/80 border font-mono ${
                          sub.wasted
                            ? "border-white/5 opacity-70"
                            : "border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] text-[#99907c]">
                          <span className="truncate">{sub.label}</span>
                          <span className="flex gap-0.5 shrink-0">
                            {Array.from({ length: Math.min(5, sub.rolls) }).map(
                              (_, pipIdx) => (
                                <span
                                  key={pipIdx}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    sub.wasted
                                      ? "bg-[#99907c]/50"
                                      : "bg-[#f2ca50]"
                                  }`}
                                />
                              )
                            )}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#dfe2f1] mt-1 tabular-nums">
                          +{sub.value}{" "}
                          <span className="text-[10px] font-normal text-[#99907c]">
                            ({sub.rolls}r)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Build Critique & Optimizer */}
          <section className="glass-panel-gold rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#f2ca50] uppercase">
                <BrainCircuit className="w-4 h-4" />
                Build Critique &amp; Optimization Target
              </div>
              <p className="text-xs text-[#dfe2f1] leading-relaxed">
                {selected.critique?.bottleneck ??
                  `${selected.name} is currently built at ${selected.stats.critRate.toFixed(1)}% CR / ${selected.stats.critDmg.toFixed(1)}% CD and ${selected.stats.er.toFixed(1)}% ER.`}
              </p>
              <p className="text-xs text-[#4cd6fb] leading-relaxed">
                {selected.critique?.recommendation ??
                  "Send this character into the Combat & Rotation Coach to verify ER breakpoints and team synergy."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("equipment")}
                className="px-3.5 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#0a0e18] hover:bg-[#262a35] border border-[#d4af37]/50 hover:border-[#d4af37] text-[#f2ca50] cursor-pointer transition-colors"
              >
                <Swords className="w-4 h-4" />
                Equipment Recommendations
              </button>
              {onCoachCharacter && (
                <button
                  type="button"
                  onClick={() => onCoachCharacter(selected)}
                  className="gold-tactical-btn px-4 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Coach With {selected.name}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
      )}
    </div>
  );
}
