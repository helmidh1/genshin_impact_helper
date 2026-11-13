"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { HoyolabCredentialsPayload } from "@/types/genshin";

interface HoyolabSyncModalProps {
  open: boolean;
  onClose: () => void;
  envConfigured: boolean;
  savedCreds: HoyolabCredentialsPayload | null;
  defaultUid?: string;
  isSyncing: boolean;
  error: string | null;
  onSubmit: (
    payload: HoyolabCredentialsPayload,
    rememberInBrowser: boolean
  ) => Promise<void>;
  onClearSaved: () => void;
}

export function HoyolabSyncModal({
  open,
  onClose,
  envConfigured,
  savedCreds,
  defaultUid,
  isSyncing,
  error,
  onSubmit,
  onClearSaved,
}: HoyolabSyncModalProps) {
  const [mode, setMode] = useState<"tokens" | "cookie">(
    savedCreds?.cookieString ? "cookie" : "tokens"
  );
  const [uid, setUid] = useState(savedCreds?.uid ?? defaultUid ?? "");
  const [ltuid, setLtuid] = useState(savedCreds?.ltuid ?? "");
  const [ltoken, setLtoken] = useState(savedCreds?.ltoken ?? "");
  const [ltmid, setLtmid] = useState(savedCreds?.ltmid ?? "");
  const [cookieString, setCookieString] = useState(
    savedCreds?.cookieString ?? ""
  );
  const [remember, setRemember] = useState(Boolean(savedCreds));
  const [guideOpen, setGuideOpen] = useState(false);

  if (!open) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: HoyolabCredentialsPayload =
      mode === "cookie"
        ? { uid: uid.trim() || undefined, cookieString: cookieString.trim() }
        : {
            uid: uid.trim() || undefined,
            ltuid: ltuid.trim() || undefined,
            ltoken: ltoken.trim() || undefined,
            ltmid: ltmid.trim() || undefined,
          };
    await onSubmit(payload, remember);
  };

  const handleEnvSync = async () => {
    await onSubmit({ uid: uid.trim() || undefined }, false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel-gold rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f2ca50]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-[#dfe2f1]">
                Sync Full Roster via HoYoLAB
              </h2>
              <p className="text-[11px] text-[#99907c]">
                Imports all owned characters, stats, artifacts, live Resin &amp;
                Genshin Daily Check-In
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded bg-[#1c1f2a] border border-white/10 text-[#99907c] hover:text-[#dfe2f1] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {envConfigured && (
          <div className="p-3 rounded-lg bg-emerald-950/35 border border-emerald-500/35 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Server `.env.local` HoYoLAB credentials detected</span>
              </div>
            </div>
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleEnvSync}
              className="gold-tactical-btn w-full py-2 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing Full Roster..." : "Sync Using .env.local"}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-950/45 border border-red-500/40 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#99907c] mb-1">
              Genshin UID{" "}
              <span className="normal-case text-[#d0c5af]/70">
                (optional — leave blank to auto-detect)
              </span>
            </label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Auto-detect from HoYoLAB or enter 9/10-digit UID"
              className="w-full px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/60 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode("tokens")}
              className={`px-2.5 py-1 rounded border cursor-pointer ${
                mode === "tokens"
                  ? "bg-[#262a35] border-[#d4af37]/50 text-[#f2ca50] font-semibold"
                  : "bg-[#0a0e18] border-white/10 text-[#99907c]"
              }`}
            >
              Cookie Fields (v2)
            </button>
            <button
              type="button"
              onClick={() => setMode("cookie")}
              className={`px-2.5 py-1 rounded border cursor-pointer ${
                mode === "cookie"
                  ? "bg-[#262a35] border-[#d4af37]/50 text-[#f2ca50] font-semibold"
                  : "bg-[#0a0e18] border-white/10 text-[#99907c]"
              }`}
            >
              Paste Full Cookie String
            </button>
          </div>

          {mode === "tokens" ? (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-[#d0c5af] mb-1">
                    ltuid_v2
                  </label>
                  <input
                    type="text"
                    value={ltuid}
                    onChange={(e) => setLtuid(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/60 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#d0c5af] mb-1">
                    ltmid_v2{" "}
                    <span className="text-[10px] text-[#99907c]">
                      (for v2_ tokens)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={ltmid}
                    onChange={(e) => setLtmid(e.target.value)}
                    placeholder="Optional unless ltoken starts with v2_"
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/60 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#d0c5af] mb-1">
                  ltoken_v2
                </label>
                <input
                  type="password"
                  value={ltoken}
                  onChange={(e) => setLtoken(e.target.value)}
                  placeholder="v2_..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/60 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-mono text-[#d0c5af] mb-1">
                hoyolab.com Cookie Header
              </label>
              <textarea
                rows={3}
                value={cookieString}
                onChange={(e) => setCookieString(e.target.value)}
                placeholder="ltuid_v2=...; ltoken_v2=...; ltmid_v2=..."
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e18] border border-white/12 text-xs font-mono text-[#dfe2f1] placeholder:text-[#99907c]/60 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs text-[#d0c5af] cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-[#d4af37]"
              />
              <span>Remember in this browser&apos;s localStorage</span>
            </label>

            {savedCreds && (
              <button
                type="button"
                onClick={() => {
                  onClearSaved();
                  setLtuid("");
                  setLtoken("");
                  setLtmid("");
                  setCookieString("");
                  setRemember(false);
                }}
                className="text-[11px] font-mono text-[#ff7a5c] hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear Saved
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#99907c] bg-[#0a0e18]/70 border border-white/8 rounded-lg p-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4cd6fb] shrink-0" />
            <span>
              Sent only from your local browser to your local Next.js backend
              (`/api/hoyolab`) to query HoYoLAB directly. Or set{" "}
              <code className="text-[#f2ca50]">HOYOLAB_LTUID_V2</code> /{" "}
              <code className="text-[#f2ca50]">HOYOLAB_LTOKEN_V2</code> in{" "}
              <code className="text-[#f2ca50]">.env.local</code>.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded bg-[#1c1f2a] border border-white/12 text-xs font-mono text-[#d0c5af] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSyncing}
              className="gold-tactical-btn px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync Full Roster"}
            </button>
          </div>
        </form>

        <div className="border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="w-full flex items-center justify-between text-xs font-mono text-[#4cd6fb] hover:text-[#dfe2f1] cursor-pointer"
          >
            <span>How to find ltuid_v2 / ltoken_v2 on hoyolab.com</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${guideOpen ? "rotate-180" : ""}`}
            />
          </button>
          {guideOpen && (
            <ol className="mt-2 space-y-1.5 text-[11px] text-[#d0c5af] list-decimal list-inside leading-relaxed">
              <li>
                Log in at <span className="text-[#f2ca50]">hoyolab.com</span>{" "}
                and open your Genshin Battle Chronicle once.
              </li>
              <li>
                Open DevTools (<kbd className="px-1 bg-[#1c1f2a] rounded">F12</kbd>) →{" "}
                <strong>Application</strong> (or Storage) →{" "}
                <strong>Cookies</strong> → <code>https://www.hoyolab.com</code>.
              </li>
              <li>
                Copy <code className="text-[#f2ca50]">ltuid_v2</code>,{" "}
                <code className="text-[#f2ca50]">ltoken_v2</code>, and{" "}
                <code className="text-[#f2ca50]">ltmid_v2</code> (if{" "}
                <code>ltoken_v2</code> begins with <code>v2_</code>).
              </li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

