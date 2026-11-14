"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bolt,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Flame,
  KeyRound,
  Lightbulb,
  Send,
  ShieldCheck,
  Sparkles,
  Swords,
  Timer,
  Trash2,
} from "lucide-react";
import { CharacterAvatar, ElementBadge } from "@/components/ElementBadge";
import { ENCOUNTER_PRESETS } from "@/lib/demo-data";
import { computeResonances, ELEMENT_THEMES } from "@/lib/elements";
import { profileStore } from "@/lib/profile-store";
import type {
  CoachFollowUpMessage,
  CoachStrategyResponse,
  CoachingFocus,
  ShowcaseCharacter,
} from "@/types/genshin";

interface CoachTabProps {
  roster: ShowcaseCharacter[];
  partyNames: string[];
  onChangePartyNames: (names: string[]) => void;
  strategy: CoachStrategyResponse;
  onUpdateStrategy: (strategy: CoachStrategyResponse) => void;
  chatMessages: CoachFollowUpMessage[];
  onUpdateChatMessages: (messages: CoachFollowUpMessage[]) => void;
}

const FOCUS_OPTIONS: CoachingFocus[] = [
  "Optimal Rotation",
  "ER & Burst Uptime",
  "Combo Mechanics",
  "Gear Priority",
];

const QUICK_PROMPTS = [
  "How do I funnel particles if I miss a Burst?",
  "Can I swap in a shielder without losing too much DPS?",
  "What is the best combo cancel for my main carry?",
];

function createFollowUpMessage(
  role: "user" | "coach",
  text: string
): CoachFollowUpMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    text,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function CoachTab({
  roster,
  partyNames,
  onChangePartyNames,
  strategy,
  onUpdateStrategy,
  chatMessages,
  onUpdateChatMessages,
}: CoachTabProps) {
  const [encounterId, setEncounterId] = useState(ENCOUNTER_PRESETS[0].id);
  const [focus, setFocus] = useState<CoachingFocus>("Optimal Rotation");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [envGeminiConfigured, setEnvGeminiConfigured] = useState(false);
  const [keySavedFlash, setKeySavedFlash] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const loaded = profileStore.loadGeminiApiKey();
      setSavedApiKey(loaded);
      setApiKeyInput(loaded);
    });

    fetch("/api/coach")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { envConfigured?: boolean } | null) => {
        if (!active || !data) return;
        setEnvGeminiConfigured(Boolean(data.envConfigured));
      })
      .catch(() => {
        // Ignore silent probe errors
      });

    return () => {
      active = false;
    };
  }, []);

  const effectiveApiKey = apiKeyInput.trim() || savedApiKey.trim() || undefined;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    profileStore.saveGeminiApiKey(trimmed);
    setSavedApiKey(trimmed);
    setKeySavedFlash(true);
    setTimeout(() => setKeySavedFlash(false), 2000);
  };

  const handleClearApiKey = () => {
    profileStore.clearGeminiApiKey();
    setSavedApiKey("");
    setApiKeyInput("");
    setKeySavedFlash(false);
  };

  const encounter = useMemo(
    () =>
      ENCOUNTER_PRESETS.find((e) => e.id === encounterId) ??
      ENCOUNTER_PRESETS[0],
    [encounterId]
  );

  const party: ShowcaseCharacter[] = useMemo(() => {
    const picked: ShowcaseCharacter[] = [];
    for (const name of partyNames) {
      const match = roster.find((c) => c.name === name);
      if (match && !picked.some((p) => p.avatarId === match.avatarId)) {
        picked.push(match);
      }
    }
    for (const candidate of roster) {
      if (picked.length >= 4) break;
      if (!picked.some((p) => p.avatarId === candidate.avatarId)) {
        picked.push(candidate);
      }
    }
    return picked.slice(0, 4);
  }, [partyNames, roster]);

  const resonances = useMemo(
    () => computeResonances(party.map((c) => c.element)),
    [party]
  );

  const handleSlotChange = (slotIdx: number, nextName: string) => {
    const next = [...party.map((p) => p.name)];
    const existingIdx = next.indexOf(nextName);
    if (existingIdx !== -1 && existingIdx !== slotIdx) {
      const prevAtSlot = next[slotIdx];
      next[slotIdx] = nextName;
      next[existingIdx] = prevAtSlot;
    } else {
      next[slotIdx] = nextName;
    }
    onChangePartyNames(next);
  };

  const handleImportTop4 = () => {
    onChangePartyNames(roster.slice(0, 4).map((c) => c.name));
  };

  const handleAnalyze = async () => {
    if (party.length === 0) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "strategy",
          party,
          encounter,
          focus,
          ...(effectiveApiKey ? { apiKey: effectiveApiKey } : {}),
        }),
      });
      const data = (await res.json()) as CoachStrategyResponse & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate strategy.");
      }
      onUpdateStrategy(data);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to run combat analysis."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const submitFollowUp = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || party.length === 0 || isAsking) return;

    const userMsg = createFollowUpMessage("user", trimmed);
    const nextMessages = [...chatMessages, userMsg];
    onUpdateChatMessages(nextMessages);
    setQuestionInput("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "followup",
          question: trimmed,
          party,
          encounter,
          previousInteractionId: strategy.interactionId,
          ...(effectiveApiKey ? { apiKey: effectiveApiKey } : {}),
        }),
      });
      const data = (await res.json()) as {
        answer?: string;
        interactionId?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to get coach reply.");
      }
      if (data.interactionId) {
        onUpdateStrategy({ ...strategy, interactionId: data.interactionId });
      }
      const coachMsg = createFollowUpMessage(
        "coach",
        data.answer ?? "No answer returned."
      );
      onUpdateChatMessages([...nextMessages, coachMsg]);
    } catch (err) {
      const errMsg = createFollowUpMessage(
        "coach",
        err instanceof Error
          ? `Error: ${err.message}`
          : "Error reaching Gemini Coach."
      );
      onUpdateChatMessages([...nextMessages, errMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#f2ca50] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f2ca50]" />
            TACTICAL TELEMETRY SUITE •{" "}
            {strategy.source === "gemini"
              ? "GEMINI 3.8 FLASH ACTIVE"
              : "LOCAL HEURISTICS MODE"}
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#dfe2f1] tracking-tight mt-0.5">
            AI Combat &amp; Rotation Coach
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <a
            href="#gemini-api-key-card"
            onClick={() => {
              document.getElementById("gemini-api-key-input")?.focus();
            }}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors ${
              savedApiKey
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : apiKeyInput.trim()
                ? "bg-[#d4af37]/15 border-[#d4af37]/50 text-[#f2ca50]"
                : envGeminiConfigured
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-[#1c1f2a] border-white/12 hover:border-[#d4af37]/50 text-[#d0c5af]"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            {savedApiKey
              ? "KEY: SAVED"
              : apiKeyInput.trim()
              ? "KEY: SESSION"
              : envGeminiConfigured
              ? "KEY: .ENV.LOCAL"
              : "ADD GEMINI KEY"}
          </a>
          <span className="px-2.5 py-1 rounded bg-[#1c1f2a] border border-white/10 text-[#d0c5af] tabular-nums">
            CYCLE: <strong className="text-[#f2ca50]">{strategy.rotationDuration}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#1c1f2a] border border-white/10 text-[#d0c5af]">
            OUTPUT: <strong className="text-[#4cd6fb]">{strategy.estimatedDpsLabel}</strong>
          </span>
        </div>
      </div>

      {strategy.note && (
        <div className="px-3.5 py-2.5 rounded-lg bg-[#171b26] border border-[#00b4d8]/35 text-xs text-[#b3ebff] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#4cd6fb] shrink-0" />
          <span>{strategy.note}</span>
        </div>
      )}

      {errorMsg && (
        <div className="px-3.5 py-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 4 COLS: Team & Encounter Setup */}
        <div className="lg:col-span-4 space-y-5">
          {/* 4-Slot Party Composition */}
          <section className="glass-panel rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1] uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#f2ca50]" />
                Party Composition
              </h2>
              <button
                type="button"
                onClick={handleImportTop4}
                className="text-[11px] font-mono px-2 py-1 rounded bg-[#1c1f2a] border border-white/12 hover:border-[#d4af37]/50 text-[#f2ca50] cursor-pointer"
              >
                Import Roster Top 4
              </button>
            </div>

            {party.length === 0 ? (
              <div className="text-xs text-[#99907c] p-3 rounded bg-[#0a0e18]">
                Connect HoYoLAB or sync a roster to assemble a party.
              </div>
            ) : (
              <div className="space-y-2.5">
                {party.map((char, idx) => (
                  <div
                    key={`${char.avatarId}-${idx}`}
                    className="p-2.5 rounded-lg bg-[#0a0e18]/80 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <CharacterAvatar
                        name={char.name}
                        element={char.element}
                        iconUrl={char.iconUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={char.name}
                            onChange={(e) => handleSlotChange(idx, e.target.value)}
                            className="bg-[#171b26] border border-white/15 rounded px-2 py-1 text-xs font-semibold text-[#dfe2f1] focus:outline-none focus:border-[#d4af37] w-full"
                          >
                            {roster.map((opt) => (
                              <option key={opt.avatarId} value={opt.name}>
                                {opt.name} (C{opt.constellation} • {opt.element})
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] font-mono text-[#99907c] shrink-0">
                            SLOT 0{idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#d0c5af] tabular-nums">
                          <ElementBadge element={char.element} compact />
                          <span className="truncate">{char.weapon.name}</span>
                          <span className="text-[#4cd6fb] ml-auto shrink-0">
                            ER {char.stats.er.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resonances */}
            {resonances.map((res) => (
              <div
                key={res.name}
                className="p-2.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs space-y-0.5"
              >
                <div className="font-mono text-[11px] font-bold text-[#f2ca50] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  {res.name}
                </div>
                <div className="text-[11px] text-[#d0c5af]">{res.effect}</div>
              </div>
            ))}
          </section>

          {/* Target Encounter Selector */}
          <section className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-[#dfe2f1] uppercase tracking-wider">
                Target Encounter
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00b4d8]/15 border border-[#00b4d8]/40 text-[#4cd6fb]">
                LV. {encounter.level}
              </span>
            </div>

            <select
              value={encounterId}
              onChange={(e) => setEncounterId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/15 text-xs font-semibold text-[#dfe2f1] focus:outline-none focus:border-[#d4af37]"
            >
              {ENCOUNTER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} — {preset.location}
                </option>
              ))}
            </select>

            <div className="text-[11px] font-mono text-[#99907c]">
              {encounter.location} • {encounter.hpLabel}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {encounter.resistances.map((r) => (
                <span
                  key={r.label}
                  className="px-2 py-0.5 rounded bg-[#0a0e18] border border-white/10 text-[10px] font-mono text-[#d0c5af] tabular-nums"
                >
                  {r.label}: <strong className="text-[#dfe2f1]">{r.value}</strong>
                </span>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-500/30 text-[11px] text-amber-100 leading-relaxed">
              {encounter.mechanicsAlert}
            </div>
          </section>

          {/* Coaching Focus & CTA */}
          <section className="glass-panel rounded-xl p-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#99907c]">
              AI Coaching Focus
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFocus(opt)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-mono text-left transition-colors cursor-pointer ${
                    focus === opt
                      ? "bg-[#d4af37]/15 border-[#d4af37] text-[#f2ca50] font-bold"
                      : "bg-[#0a0e18]/70 border-white/10 text-[#d0c5af] hover:border-white/25"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isGenerating || party.length === 0}
              className="gold-tactical-btn w-full py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating
                ? "Analyzing Builds & Rotation..."
                : "Analyze Team & Generate Strategy"}
            </button>
          </section>

          {/* Gemini API Key Settings Card */}
          <section
            id="gemini-api-key-card"
            className="glass-panel rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#d0c5af] flex items-center gap-1.5 font-semibold">
                <KeyRound className="w-3.5 h-3.5 text-[#f2ca50]" />
                Gemini API Key
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  savedApiKey
                    ? "text-emerald-300 bg-emerald-950/40 border-emerald-500/35"
                    : apiKeyInput.trim()
                    ? "text-[#f2ca50] bg-[#d4af37]/15 border-[#d4af37]/40"
                    : envGeminiConfigured
                    ? "text-emerald-300 bg-emerald-950/40 border-emerald-500/35"
                    : "text-[#99907c] bg-[#0a0e18] border-white/10"
                }`}
              >
                {savedApiKey
                  ? "Saved in Browser"
                  : apiKeyInput.trim()
                  ? "Session Key Ready"
                  : envGeminiConfigured
                  ? ".env.local Active"
                  : "Optional (Heuristics Mode)"}
              </span>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-2.5">
              <div className="relative">
                <input
                  id="gemini-api-key-input"
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIza... (from Google AI Studio)"
                  autoComplete="off"
                  className="w-full pl-3 pr-9 py-2 rounded-lg bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/60 focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  title={showApiKey ? "Hide API key" : "Show API key"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#dfe2f1] cursor-pointer"
                >
                  {showApiKey ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={!apiKeyInput.trim()}
                  className="px-3 py-1.5 rounded bg-[#262a35] border border-[#d4af37]/45 hover:border-[#f2ca50] text-[#f2ca50] font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45"
                >
                  {keySavedFlash ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Saved
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      Save Key
                    </>
                  )}
                </button>

                {(savedApiKey || apiKeyInput) && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="px-2.5 py-1.5 rounded bg-[#1c1f2a] border border-white/10 hover:border-red-500/40 text-[#ff7a5c] font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}

                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-[11px] font-mono text-[#4cd6fb] hover:underline flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </form>

            <div className="flex items-start gap-2 text-[11px] text-[#99907c] leading-relaxed bg-[#0a0e18]/65 border border-white/8 rounded-lg p-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4cd6fb] shrink-0 mt-0.5" />
              <span>
                {envGeminiConfigured && !savedApiKey && !apiKeyInput.trim() ? (
                  <>
                    Server <code className="text-[#f2ca50]">GEMINI_API_KEY</code>{" "}
                    in <code className="text-[#f2ca50]">.env.local</code> is
                    active. Paste a key above only if you want to override it in
                    this browser.
                  </>
                ) : (
                  <>
                    Stored optionally in your browser&apos;s{" "}
                    <code className="text-[#dfe2f1]">localStorage</code> and sent
                    only to your local{" "}
                    <code className="text-[#f2ca50]">/api/coach</code> backend
                    (or set <code className="text-[#f2ca50]">GEMINI_API_KEY</code>{" "}
                    in <code className="text-[#f2ca50]">.env.local</code>).
                  </>
                )}
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT 8 COLS: Strategy Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {/* Rotation Timeline Visualizer */}
          <section className="glass-panel-gold rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#dfe2f1] flex items-center gap-2">
                  <Timer className="w-5 h-5 text-[#f2ca50]" />
                  Optimal Team Rotation Timeline
                </h2>
                <p className="text-xs text-[#d0c5af] mt-0.5">
                  {strategy.teamName}
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0a0e18] border border-[#d4af37]/35 text-[#f2ca50] tabular-nums">
                {strategy.rotationDuration}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
              {strategy.rotationSteps.map((step) => {
                const theme = ELEMENT_THEMES[step.element] ?? ELEMENT_THEMES.Pyro;
                return (
                  <div
                    key={step.step}
                    className="p-3 rounded-lg bg-[#0a0e18]/85 border border-white/10 flex flex-col justify-between space-y-2"
                    style={{ borderTop: `2px solid ${theme.hex}` }}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span style={{ color: theme.hex }} className="font-bold">
                        STEP {step.step}
                      </span>
                      <span className="text-[#99907c] tabular-nums">
                        {step.timeRange}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#dfe2f1]">
                        {step.action}
                      </div>
                      <p className="text-[11px] text-[#d0c5af] mt-1 leading-snug">
                        {step.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buff Overlap Bars */}
            {strategy.buffBars.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#99907c]">
                  Buff &amp; Shred Overlap Windows
                </div>
                {strategy.buffBars.map((bar) => (
                  <div key={bar.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-[#d0c5af]">
                      <span>{bar.name}</span>
                      <span className="tabular-nums text-[#99907c]">
                        {bar.duration}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0a0e18] relative overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: bar.color,
                          marginLeft: `${Math.max(0, Math.min(80, bar.startPct))}%`,
                          width: `${Math.max(12, Math.min(100, bar.widthPct))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-[#0a0e18]/75 border border-[#d4af37]/30 text-xs text-[#dfe2f1] flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#f2ca50] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-bold text-[#f2ca50] uppercase mr-1.5">
                  Key Timing Note:
                </span>
                {strategy.criticalNote}
              </div>
            </div>
          </section>

          {/* Energy Recharge Diagnostics */}
          <section className="glass-panel rounded-xl p-5 space-y-3.5">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-[#dfe2f1] flex items-center gap-2">
              <Bolt className="w-4 h-4 text-[#4cd6fb]" />
              Energy Recharge &amp; Burst Funneling Check
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strategy.energyChecks.map((check) => {
                const pct = Math.min(
                  100,
                  Math.round((check.currentEr / Math.max(100, check.recommendedEr)) * 100)
                );
                const isDeficit = check.status === "Deficit";
                return (
                  <div
                    key={check.character}
                    className="p-3 rounded-lg bg-[#0a0e18]/80 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#dfe2f1]">
                        {check.character}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isDeficit
                            ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                            : "bg-emerald-950/40 text-emerald-400 border-emerald-500/35"
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#d0c5af] tabular-nums">
                      <span>Current: {check.currentEr.toFixed(0)}%</span>
                      <span>Target: {check.recommendedEr.toFixed(0)}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#1c1f2a] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isDeficit ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#99907c] leading-snug">
                      {check.advice}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Execution & Upgrade Priority Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategy.executionCards.map((card) => (
              <div
                key={card.title}
                className="glass-panel rounded-xl p-4 space-y-2"
              >
                <div className="text-xs font-mono font-bold text-[#f2ca50] uppercase">
                  {card.title}
                </div>
                <p className="text-xs text-[#dfe2f1] leading-relaxed">
                  {card.detail}
                </p>
                <div className="text-[11px] font-mono text-[#4cd6fb] pt-1 border-t border-white/8">
                  Rule: {card.rule}
                </div>
              </div>
            ))}
          </div>

          {strategy.upgradePriorities.length > 0 && (
            <section className="glass-panel rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-[#dfe2f1] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#70e000]" />
                Roster Upgrade Priorities
              </div>
              <ul className="space-y-1 text-xs text-[#d0c5af]">
                {strategy.upgradePriorities.map((item, idx) => (
                  <li key={idx} className="font-mono text-[11px]">
                    • {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Pinned Interactive Follow-Up Coach */}
          <section className="glass-panel-gold rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#f2ca50] uppercase">
                <Bot className="w-4 h-4" />
                Ask Gemini Combat Coach
              </div>
              {chatMessages.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateChatMessages([])}
                  className="text-[11px] font-mono text-[#99907c] hover:text-[#dfe2f1] cursor-pointer"
                >
                  Clear chat
                </button>
              )}
            </div>

            {chatMessages.length > 0 && (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#262a35] border border-[#d4af37]/30 text-[#dfe2f1] ml-8"
                        : "bg-[#0a0e18]/85 border border-white/10 text-[#d0c5af] mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#99907c] mb-1">
                      <span className="uppercase font-bold text-[#f2ca50]">
                        {msg.role === "user" ? "Traveler" : "Teyvat Coach"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submitFollowUp(q)}
                  disabled={isAsking}
                  className="px-2.5 py-1 rounded-full bg-[#0a0e18]/80 border border-white/12 hover:border-[#d4af37]/50 text-[11px] text-[#d0c5af] hover:text-[#f2ca50] transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitFollowUp(questionInput);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask about combo cancels, substitutions, enemy shields, or ER math..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/15 text-xs text-[#dfe2f1] placeholder:text-[#99907c]/70 focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                disabled={isAsking || !questionInput.trim()}
                className="gold-tactical-btn px-4 py-2 rounded font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isAsking ? "Thinking" : "Send"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
