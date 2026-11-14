"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  Bot,
  CheckCircle2,
  ExternalLink,
  Layers,
  Send,
  Shield,
  Sparkles,
  Swords,
  Target,
  Wand2,
} from "lucide-react";
import { compareEquippedWithRecommendations } from "@/lib/build-engine";
import {
  getEquipmentGuide,
  getMainStatsForArtifactSet,
  getWeaponsForArtifactSet,
} from "@/lib/equipment-data";
import {
  loadSavedEquipmentAdvice,
  loadSavedGeminiApiKey,
  saveEquipmentAdvice,
} from "@/lib/storage";
import type {
  EquipmentCoachQueryResponse,
  ShowcaseCharacter,
} from "@/types/genshin";

interface EquipmentRecommendationsPanelProps {
  character: ShowcaseCharacter;
  onOpenCoachTab?: () => void;
}

export function EquipmentRecommendationsPanel({
  character,
  onOpenCoachTab,
}: EquipmentRecommendationsPanelProps) {
  const guide = useMemo(() => getEquipmentGuide(character), [character]);

  // Track previous character avatarId to cleanly reset archetype and advice when character changes
  const [prevAvatarId, setPrevAvatarId] = useState<number>(character.avatarId);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(
    guide.archetypes[0]?.id ?? ""
  );

  const activeArchetype = useMemo(() => {
    return (
      guide.archetypes.find((a) => a.id === selectedArchetypeId) ??
      guide.archetypes[0]
    );
  }, [guide, selectedArchetypeId]);

  // Track the active recommended artifact set to dynamically update weapon synergies & stats
  const [selectedArtifactSetName, setSelectedArtifactSetName] = useState<string>(
    activeArchetype.bestArtifactSets[0]?.name ?? ""
  );

  const [questionInput, setQuestionInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [coachResponse, setCoachResponse] =
    useState<EquipmentCoachQueryResponse | null>(() =>
      loadSavedEquipmentAdvice(character.avatarId) ??
      loadSavedEquipmentAdvice(character.name)
    );
  const [coachError, setCoachError] = useState<string | null>(null);

  if (Number(character.avatarId) !== Number(prevAvatarId)) {
    setPrevAvatarId(character.avatarId);
    setSelectedArchetypeId(guide.archetypes[0]?.id ?? "");
    setSelectedArtifactSetName(guide.archetypes[0]?.bestArtifactSets[0]?.name ?? "");
    setQuestionInput("");
    setCoachError(null);
    setCoachResponse(
      loadSavedEquipmentAdvice(character.avatarId) ??
      loadSavedEquipmentAdvice(character.name)
    );
  }

  // Dynamically compute weapon rankings specifically tailored for the selected artifact set
  const displayedWeapons = useMemo(() => {
    return getWeaponsForArtifactSet(activeArchetype, selectedArtifactSetName);
  }, [activeArchetype, selectedArtifactSetName]);

  // Dynamically compute main stats tailored for the selected artifact set
  const displayedMainStats = useMemo(() => {
    return getMainStatsForArtifactSet(activeArchetype, selectedArtifactSetName);
  }, [activeArchetype, selectedArtifactSetName]);

  const comparison = useMemo(() => {
    return compareEquippedWithRecommendations(
      character,
      guide,
      activeArchetype.id,
      selectedArtifactSetName
    );
  }, [character, guide, activeArchetype, selectedArtifactSetName]);

  const handleAskCoach = async (queryText?: string) => {
    const q = (queryText ?? questionInput).trim();
    setIsAsking(true);
    setCoachError(null);

    const savedKey = loadSavedGeminiApiKey();

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "equipment",
          character,
          archetypeId: activeArchetype.id,
          artifactSetName: selectedArtifactSetName,
          question: q || undefined,
          apiKey: savedKey || undefined,
        }),
      });

      const data = (await res.json()) as EquipmentCoachQueryResponse & {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch equipment advice.");
      }

      setCoachResponse(data);
      saveEquipmentAdvice(character.avatarId, data, character.name);
      if (!queryText) {
        setQuestionInput("");
      }
    } catch (err) {
      setCoachError(
        err instanceof Error ? err.message : "Failed to connect to equipment coach."
      );
    } finally {
      setIsAsking(false);
    }
  };

  const equippedWeaponName = character.weapon.name.toLowerCase().trim();

  return (
    <div className="space-y-6">
      {/* Top Banner: Guide Context & External Resource Hub */}
      <section className="glass-panel-gold rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/50 text-[10px] font-mono font-bold text-[#f2ca50] uppercase tracking-wider">
                Equipment Hub
              </span>
              <span className="text-xs font-mono text-[#99907c]">
                {character.element.toUpperCase()} {"//"} {guide.role}
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#dfe2f1] mt-1">
              Equipment Recommendations for {character.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#d0c5af]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Curated from Game8, Icy-Veins &amp; KQM
          </div>
        </div>

        <p className="text-xs text-[#d0c5af] leading-relaxed">
          {guide.overview}
        </p>

        {/* 4 External Community Guide Cards */}
        <div className="pt-2 border-t border-white/8 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#99907c]">
            <span className="flex items-center gap-1.5 font-semibold text-[#dfe2f1]">
              <ExternalLink className="w-3.5 h-3.5 text-[#f2ca50]" />
              Trusted Community Reference Guides:
            </span>
            <span className="text-[10px] text-[#99907c]">
              Opens official guides in a new tab
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            <a
              href={guide.guideLinks.game8Url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-[#0a0e18]/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-[#dfe2f1] group-hover:text-emerald-300 transition-colors">
                    Game8 Build Guide
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#99907c] mt-0.5">
                  Tier lists, weapon rankings &amp; stats
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400/70 group-hover:text-emerald-300 shrink-0 ml-2" />
            </a>

            <a
              href={guide.guideLinks.icyVeinsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-[#0a0e18]/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-bold text-[#dfe2f1] group-hover:text-cyan-300 transition-colors">
                    Icy-Veins Guide
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#99907c] mt-0.5">
                  Best builds, weapon tiers &amp; rotations
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400/70 group-hover:text-cyan-300 shrink-0 ml-2" />
            </a>

            <a
              href={guide.guideLinks.kqmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-[#0a0e18]/80 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-[#dfe2f1] group-hover:text-amber-300 transition-colors">
                    KeqingMains (KQM)
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#99907c] mt-0.5">
                  Frame-by-frame theorycraft &amp; ICD
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300 shrink-0 ml-2" />
            </a>

            <a
              href={guide.guideLinks.genshinGgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-[#0a0e18]/80 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs font-bold text-[#dfe2f1] group-hover:text-purple-300 transition-colors">
                    Genshin.gg
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#99907c] mt-0.5">
                  Quick visual build cards &amp; artifacts
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300 shrink-0 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Build Archetype Switcher */}
      {guide.archetypes.length > 1 && (
        <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#99907c]">
            <Target className="w-3.5 h-3.5 text-[#f2ca50]" />
            <span>SELECT BUILD ARCHETYPE:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {guide.archetypes.map((arch) => {
              const active = arch.id === activeArchetype.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => {
                    setSelectedArchetypeId(arch.id);
                    setSelectedArtifactSetName(arch.bestArtifactSets[0]?.name ?? "");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    active
                      ? "bg-[#262a35] border-[#d4af37] text-[#f2ca50] font-bold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                      : "bg-[#0a0e18]/70 border-white/10 text-[#99907c] hover:text-[#dfe2f1]"
                  }`}
                >
                  {arch.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Equipped vs Recommended Live Comparison Banner */}
      <section className="glass-panel rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#dfe2f1] uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#f2ca50]" />
            Equipped Gear vs. {selectedArtifactSetName || "Recommended"} Setup
          </span>
          <span className="text-[#99907c]">
            Focus: {selectedArtifactSetName} ({activeArchetype.name})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {/* Weapon Verdict */}
          <div className="p-3 rounded-lg bg-[#0a0e18]/80 border border-white/8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#99907c] uppercase">
                Weapon Matchup
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comparison.weaponStatus === "bis_match"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : comparison.weaponStatus === "recommended_match"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : comparison.weaponStatus === "alternative"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {comparison.weaponStatus === "bis_match"
                  ? "BiS Match"
                  : comparison.weaponStatus === "recommended_match"
                  ? "Recommended Tier"
                  : comparison.weaponStatus === "alternative"
                  ? "5★ Alternative"
                  : "Upgrade Candidate"}
              </span>
            </div>
            <div className="font-bold text-[#dfe2f1]">
              {character.weapon.name} (R{character.weapon.refinement})
            </div>
            <p className="text-[11px] text-[#d0c5af] leading-relaxed">
              {comparison.weaponFeedback}
            </p>
          </div>

          {/* Artifact Set Verdict */}
          <div className="p-3 rounded-lg bg-[#0a0e18]/80 border border-white/8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#99907c] uppercase">
                Artifact Set Match
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comparison.artifactSetStatus === "full_match"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : comparison.artifactSetStatus === "partial_match"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {comparison.artifactSetStatus === "full_match"
                  ? "4pc Set Match"
                  : comparison.artifactSetStatus === "partial_match"
                  ? "2pc Partial Match"
                  : "Set Mismatch"}
              </span>
            </div>
            <div className="font-bold text-[#dfe2f1] truncate">
              {character.artifactSets
                .map((s) => `${s.count}pc ${s.name}`)
                .join(" + ") || "No active set"}
            </div>
            <p className="text-[11px] text-[#d0c5af] leading-relaxed">
              {comparison.artifactSetFeedback}
            </p>
          </div>

          {/* ER & Stats Verdict */}
          <div className="p-3 rounded-lg bg-[#0a0e18]/80 border border-white/8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#99907c] uppercase">
                Energy Recharge
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comparison.erStatus === "optimal"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : comparison.erStatus === "close"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}
              >
                {comparison.erStatus === "optimal"
                  ? "ER Optimal"
                  : comparison.erStatus === "close"
                  ? "Close to Target"
                  : "ER Deficit"}
              </span>
            </div>
            <div className="font-bold text-[#dfe2f1]">
              Current: {character.stats.er.toFixed(1)}% ER
            </div>
            <p className="text-[11px] text-[#d0c5af] leading-relaxed">
              {comparison.erFeedback}
            </p>
          </div>
        </div>
      </section>

      {/* 2-Column Grid: Weapons (Left) + Artifacts & Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 6 COLS: Weapons Tier Ranking */}
        <div className="lg:col-span-6 space-y-4">
          <section className="glass-panel rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold text-[#dfe2f1] uppercase tracking-wider">
                <Swords className="w-4 h-4 text-[#f2ca50]" />
                Recommended Weapons Ranking
              </span>
              <span className="px-2 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f2ca50] text-[10px] font-bold">
                Synergized with {selectedArtifactSetName}
              </span>
            </div>

            <div className="space-y-3">
              {displayedWeapons.map((weapon, idx) => {
                const isEquipped =
                  equippedWeaponName.includes(weapon.name.toLowerCase().trim()) ||
                  weapon.name.toLowerCase().trim().includes(equippedWeaponName);

                return (
                  <div
                    key={`${weapon.name}-${idx}`}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isEquipped
                        ? "bg-[#262a35] border-[#d4af37] shadow-[0_0_14px_rgba(212,175,55,0.2)]"
                        : "bg-[#0a0e18]/80 border-white/8 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#99907c]">
                          #{idx + 1}
                        </span>
                        <h4 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1]">
                          {weapon.name}
                        </h4>
                        <span className="text-xs text-[#f2ca50] font-mono">
                          {weapon.rarity}★
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/50 text-[10px] font-mono font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#f2ca50]" />
                            Equipped
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            weapon.tier === "BiS (Signature)"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : weapon.tier === "Top Alternative (5★)"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {weapon.tier}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#d0c5af] leading-relaxed mt-2">
                      {weapon.reason}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/6 text-[10px] font-mono text-[#99907c]">
                      {weapon.sourceNote && (
                        <span>Source: {weapon.sourceNote}</span>
                      )}
                      {weapon.refinementPriority && (
                        <span className="text-[#4cd6fb]">
                          Refinements: {weapon.refinementPriority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT 6 COLS: Artifacts, Main Stats & Benchmarks */}
        <div className="lg:col-span-6 space-y-4">
          {/* Artifact Sets */}
          <section className="glass-panel rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold text-[#dfe2f1] uppercase tracking-wider">
                <Shield className="w-4 h-4 text-[#f2ca50]" />
                Recommended Artifact Sets
              </span>
              <span className="text-[10px] text-[#f2ca50] font-mono">
                Click set to update weapon synergies
              </span>
            </div>

            <div className="space-y-3">
              {activeArchetype.bestArtifactSets.map((set, idx) => {
                const isSelected =
                  set.name.toLowerCase() === selectedArtifactSetName.toLowerCase() ||
                  selectedArtifactSetName.toLowerCase().includes(set.name.toLowerCase());

                return (
                  <button
                    key={`${set.name}-${idx}`}
                    type="button"
                    onClick={() => setSelectedArtifactSetName(set.name)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-[#262a35] border-[#d4af37] shadow-[0_0_14px_rgba(212,175,55,0.22)] ring-1 ring-[#d4af37]/50"
                        : "bg-[#0a0e18]/80 border-white/8 hover:border-white/25 hover:bg-[#131a2a]/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1]">
                          {set.name}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/60 text-[9px] font-mono font-bold text-[#f2ca50] flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#f2ca50]" />
                            Active Set Focus
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          set.type === "4-Piece"
                            ? "bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f2ca50]"
                            : "bg-white/10 text-[#d0c5af]"
                        }`}
                      >
                        {set.type}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#f2ca50]">
                      {set.bonusSummary}
                    </div>
                    <p className="text-xs text-[#d0c5af] leading-relaxed">
                      {set.reason}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#99907c]">
                      <span>
                        {isSelected
                          ? "✓ Weapons ranking on left is optimized for this set"
                          : "Click to load weapon synergies for this set"}
                      </span>
                      {isSelected && (
                        <span className="text-emerald-300 font-semibold">
                          Weapons &amp; Stats Active
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Main Stats & Substat Priority */}
          <section className="glass-panel rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold text-[#dfe2f1] uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#f2ca50]" />
                Main Stats &amp; Substats Priority
              </span>
              <span className="text-[#99907c]">Optimal Rolls ({selectedArtifactSetName})</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0a0e18]/80 border border-white/8 space-y-1">
                <div className="text-[10px] text-[#99907c] uppercase">
                  Sands of Eon
                </div>
                <div className="font-bold text-[#f2ca50] text-xs">
                  {displayedMainStats.sands.join(" / ")}
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0a0e18]/80 border border-white/8 space-y-1">
                <div className="text-[10px] text-[#99907c] uppercase">
                  Goblet of Eonothem
                </div>
                <div className="font-bold text-[#f2ca50] text-xs">
                  {displayedMainStats.goblet.join(" / ")}
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0a0e18]/80 border border-white/8 space-y-1">
                <div className="text-[10px] text-[#99907c] uppercase">
                  Circlet of Logos
                </div>
                <div className="font-bold text-[#f2ca50] text-xs">
                  {displayedMainStats.circlet.join(" / ")}
                </div>
              </div>
            </div>

            {/* Substat Priority Order */}
            <div className="p-3 rounded-lg bg-[#0a0e18]/60 border border-white/8 space-y-1.5 text-xs font-mono">
              <div className="text-[10px] text-[#99907c] uppercase">
                Substat Priority Order
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#dfe2f1]">
                {activeArchetype.benchmarks.keySubstats.map((sub, i) => (
                  <span key={sub} className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-[#262a35] text-[#f2ca50] font-semibold">
                      {sub}
                    </span>
                    {i < activeArchetype.benchmarks.keySubstats.length - 1 && (
                      <span className="text-[#99907c]">&gt;</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Benchmarks */}
            <div className="p-3 rounded-lg bg-[#0a0e18]/60 border border-white/8 space-y-1 text-xs font-mono">
              <div className="text-[10px] text-[#99907c] uppercase">
                Target Stat Benchmarks
              </div>
              <div className="text-xs text-[#4cd6fb]">
                CRIT Ratio: {activeArchetype.benchmarks.critRatio}
              </div>
              <div className="text-xs text-[#d0c5af]">
                Energy Recharge: {activeArchetype.benchmarks.recommendedEr}
              </div>
              <p className="text-[11px] text-[#99907c] mt-1 leading-relaxed">
                {activeArchetype.benchmarks.targetNotes}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Interactive AI Equipment Coach Section (Gemini 3.8 Flash + Local Heuristics) */}
      <section className="glass-panel-gold rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#f2ca50]" />
            <div>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1]">
                Ask Equipment Coach
              </h3>
              <p className="text-xs text-[#99907c]">
                Tailored equipment analysis referencing Game8, Icy-Veins &amp; KQM theorycraft
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#0a0e18] border border-white/10 text-[10px] font-mono text-[#d0c5af]">
              Gemini 3.8 Flash &bull; Local Heuristics Fallback
            </span>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-[#99907c] mr-1">
            Quick prompts:
          </span>
          {[
            `Which weapons best synergize with 4pc ${selectedArtifactSetName || "my build"}?`,
            "What is my best F2P 4-star weapon option?",
            `Compare my equipped gear to the ${selectedArtifactSetName || "meta"} build.`,
            "What main stats should I prioritize on Sands, Goblet, and Circlet?",
            "What Energy Recharge breakpoint do I need for smooth rotations?",
          ].map((pq) => (
            <button
              key={pq}
              type="button"
              disabled={isAsking}
              onClick={() => handleAskCoach(pq)}
              className="px-2.5 py-1 rounded bg-[#0a0e18]/80 hover:bg-[#262a35] border border-white/10 hover:border-[#d4af37]/40 text-xs text-[#d0c5af] hover:text-[#f2ca50] transition-colors cursor-pointer disabled:opacity-50 text-left"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Custom Question Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAskCoach();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder={`Ask about ${character.name}'s weapons, artifacts, or stat goals (e.g., "Is Staff of Homa better than Deathmatch R5 for my build?")...`}
            className="flex-1 bg-[#0a0e18]/80 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-[#dfe2f1] placeholder:text-[#99907c]/70 focus:outline-none focus:border-[#d4af37]"
            disabled={isAsking}
          />
          <button
            type="submit"
            disabled={isAsking || !questionInput.trim()}
            className="gold-tactical-btn px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isAsking ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Analyzing...
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Ask Coach
              </>
            )}
          </button>
        </form>

        {coachError && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{coachError}</span>
          </div>
        )}

        {/* Coach Advice Response Display */}
        {coachResponse && (
          <div className="p-4 rounded-xl bg-[#0a0e18]/90 border border-[#d4af37]/40 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-2.5">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#f2ca50]" />
                <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#f2ca50]">
                  Coach Evaluation // {coachResponse.archetypeName}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#99907c]">
                Source: {coachResponse.source === "gemini" ? "Gemini 3.8 Flash (Live)" : "Local Game8 / Icy-Veins Theorycraft Heuristics"}
              </span>
            </div>

            <p className="text-xs text-[#dfe2f1] leading-relaxed font-semibold">
              {coachResponse.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#262a35]/60 border border-white/6 space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#f2ca50] flex items-center gap-1">
                  <Swords className="w-3 h-3" /> Weapon Recommendations
                </div>
                <p className="text-[#d0c5af] leading-relaxed text-xs">
                  {coachResponse.weaponAdvice}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#262a35]/60 border border-white/6 space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#4cd6fb] flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Artifact Set Advice
                </div>
                <p className="text-[#d0c5af] leading-relaxed text-xs">
                  {coachResponse.artifactAdvice}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#262a35]/40 border border-white/6 space-y-1 text-xs">
              <div className="text-[10px] font-mono uppercase text-[#d4af37]">
                Stat Priority &amp; Current Loadout Verdict
              </div>
              <p className="text-[#d0c5af] leading-relaxed">
                {coachResponse.statPriorityAdvice}
              </p>
              <p className="text-xs font-semibold text-[#dfe2f1] mt-1">
                {coachResponse.comparisonVerdict}
              </p>
            </div>

            {coachResponse.actionableNextSteps.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                  Actionable Next Steps:
                </div>
                <ul className="space-y-1 text-xs text-[#d0c5af]">
                  {coachResponse.actionableNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#f2ca50] font-bold shrink-0">&bull;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/6 text-[10px] font-mono text-[#99907c]">
              <span>{coachResponse.externalReferenceNote}</span>
              {onOpenCoachTab && (
                <button
                  type="button"
                  onClick={onOpenCoachTab}
                  className="text-[#f2ca50] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Test in Full Combat Coach &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

