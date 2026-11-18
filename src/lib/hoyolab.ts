import { createHash, randomInt } from "node:crypto";
import { evaluateArtifacts, round1 } from "@/lib/build-engine";
import {
  getCharacterCombatRoles,
  inferActiveCombatRole,
} from "@/lib/character-roles";
import { formatParametricCooldown } from "@/lib/directives-engine";
import type {
  ArtifactSlot,
  CharacterStats,
  DailyDirectives,
  ElementType,
  HoyolabCredentialsPayload,
  HoyolabSyncResponse,
  RawArtifactInput,
  RawSubstatInput,
  ShowcaseCharacter,
  TravelerProfile,
} from "@/types/genshin";

type HoyolabRegion = "os" | "cn";

export interface HoyolabAuthConfig {
  cookieHeader: string;
  hasV2Token: boolean;
  hasMid: boolean;
  accountId?: string;
}

const OS_DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
const CN_DS_SALT = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";

const GEETEST_RETCODES = new Set([1034, 5003, 10035, 10041]);

const GENSHIN_SERVER_PREFIXES: {
  prefix: string;
  server: string;
  region: HoyolabRegion;
}[] = [
  { prefix: "18", server: "os_asia", region: "os" },
  { prefix: "6", server: "os_usa", region: "os" },
  { prefix: "7", server: "os_euro", region: "os" },
  { prefix: "8", server: "os_asia", region: "os" },
  { prefix: "9", server: "os_cht", region: "os" },
  { prefix: "1", server: "cn_gf01", region: "cn" },
  { prefix: "2", server: "cn_gf01", region: "cn" },
  { prefix: "3", server: "cn_gf01", region: "cn" },
  { prefix: "5", server: "cn_qd01", region: "cn" },
];

const POS_TO_SLOT: Record<number, ArtifactSlot> = {
  1: "Flower",
  2: "Plume",
  3: "Sands",
  4: "Goblet",
  5: "Circlet",
};

const VALID_ELEMENTS = new Set<ElementType>([
  "Pyro",
  "Hydro",
  "Electro",
  "Cryo",
  "Dendro",
  "Anemo",
  "Geo",
]);

const ELEMENT_DMG_LABELS: Record<ElementType, string> = {
  Pyro: "Pyro DMG Bonus",
  Hydro: "Hydro DMG Bonus",
  Electro: "Electro DMG Bonus",
  Cryo: "Cryo DMG Bonus",
  Dendro: "Dendro DMG Bonus",
  Anemo: "Anemo DMG Bonus",
  Geo: "Geo DMG Bonus",
};

function md5(input: string): string {
  return createHash("md5").update(input, "utf8").digest("hex");
}

function createOverseasDs(): string {
  const t = Math.floor(Date.now() / 1000);
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let r = "";
  for (let i = 0; i < 6; i++) {
    r += chars[randomInt(0, chars.length)];
  }
  const h = md5(`salt=${OS_DS_SALT}&t=${t}&r=${r}`);
  return `${t},${r},${h}`;
}

function createCnDs(
  body?: Record<string, unknown>,
  query?: Record<string, string>
): string {
  const t = Math.floor(Date.now() / 1000);
  const r = randomInt(100001, 200000);
  const b = body ? JSON.stringify(body) : "";
  const q = query
    ? Object.keys(query)
        .sort()
        .map((k) => `${k}=${query[k]}`)
        .join("&")
    : "";
  const h = md5(`salt=${CN_DS_SALT}&t=${t}&r=${r}&b=${b}&q=${q}`);
  return `${t},${r},${h}`;
}

function parseCookiePairs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key && val) {
      out[key] = val;
    }
  }
  return out;
}

export function hasEnvHoyolabCredentials(): boolean {
  return Boolean(
    process.env.HOYOLAB_COOKIE?.trim() ||
      (process.env.HOYOLAB_LTUID_V2?.trim() &&
        process.env.HOYOLAB_LTOKEN_V2?.trim())
  );
}

export function resolveHoyolabAuth(
  payload?: HoyolabCredentialsPayload
): HoyolabAuthConfig {
  const cookieRaw =
    payload?.cookieString?.trim() || process.env.HOYOLAB_COOKIE?.trim();
  const cookies: Record<string, string> = cookieRaw
    ? parseCookiePairs(cookieRaw)
    : {};

  const ltuid =
    payload?.ltuid?.trim() ||
    process.env.HOYOLAB_LTUID_V2?.trim() ||
    cookies.ltuid_v2 ||
    cookies.ltuid ||
    cookies.account_id_v2 ||
    cookies.account_id ||
    "";
  const ltoken =
    payload?.ltoken?.trim() ||
    process.env.HOYOLAB_LTOKEN_V2?.trim() ||
    cookies.ltoken_v2 ||
    cookies.ltoken ||
    cookies.cookie_token_v2 ||
    cookies.cookie_token ||
    "";
  const ltmid =
    payload?.ltmid?.trim() ||
    process.env.HOYOLAB_LTMID_V2?.trim() ||
    cookies.ltmid_v2 ||
    cookies.account_mid_v2 ||
    "";

  if (ltuid) {
    if (ltoken.startsWith("v2_")) {
      cookies.ltuid_v2 = ltuid;
      cookies.account_id_v2 = cookies.account_id_v2 || ltuid;
    } else {
      cookies.ltuid_v2 = cookies.ltuid_v2 || ltuid;
      cookies.ltuid = cookies.ltuid || ltuid;
    }
  }

  if (ltoken) {
    if (ltoken.startsWith("v2_")) {
      cookies.ltoken_v2 = ltoken;
    } else {
      cookies.ltoken_v2 = cookies.ltoken_v2 || ltoken;
      cookies.ltoken = cookies.ltoken || ltoken;
    }
  }

  if (ltmid) {
    cookies.ltmid_v2 = ltmid;
    cookies.account_mid_v2 = cookies.account_mid_v2 || ltmid;
  }

  const hasAuth = Boolean(
    (cookies.ltuid_v2 && cookies.ltoken_v2) ||
      (cookies.ltuid && cookies.ltoken) ||
      (cookies.account_id && cookies.cookie_token) ||
      (cookies.account_id_v2 && cookies.cookie_token_v2)
  );

  if (!hasAuth) {
    throw new Error(
      "Missing HoYoLAB credentials. Provide ltuid_v2 and ltoken_v2 (or paste your hoyolab.com cookie string), or set HOYOLAB_LTUID_V2 / HOYOLAB_LTOKEN_V2 in .env.local."
    );
  }

  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return {
    cookieHeader,
    hasV2Token: ltoken.startsWith("v2_"),
    hasMid: Boolean(ltmid),
    accountId: ltuid || undefined,
  };
}

function recognizeServer(uid: string): { server: string; region: HoyolabRegion } {
  const clean = uid.trim();
  if (!/^\d{9,10}$/.test(clean)) {
    throw new Error("Please enter a valid 9- or 10-digit Genshin Impact UID.");
  }
  const prefix = clean.slice(0, -8);
  const match = GENSHIN_SERVER_PREFIXES.find((entry) => entry.prefix === prefix);
  if (!match) {
    throw new Error(`UID ${clean} is not associated with a recognized Genshin server.`);
  }
  return { server: match.server, region: match.region };
}

class HoyolabApiError extends Error {
  retcode: number;

  constructor(retcode: number, message: string) {
    super(message);
    this.retcode = retcode;
  }
}

async function requestHoyolab<T>(params: {
  url: string;
  method?: "GET" | "POST";
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  region: HoyolabRegion;
  auth: HoyolabAuthConfig;
}): Promise<T> {
  const method = params.method ?? "GET";
  const urlObj = new URL(params.url);
  if (params.query) {
    for (const [k, v] of Object.entries(params.query)) {
      urlObj.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Cookie: params.auth.cookieHeader,
    Accept: "application/json",
    "x-rpc-client_type": "5",
    "x-rpc-language": "en-us",
    "x-rpc-lang": "en-us",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  };

  if (params.region === "os") {
    headers["x-rpc-app_version"] = "1.5.0";
    headers.DS = createOverseasDs();
    headers.Origin = "https://act.hoyolab.com";
    headers.Referer = "https://act.hoyolab.com/";
  } else {
    headers["x-rpc-app_version"] = "2.11.1";
    headers.DS = createCnDs(params.body, params.query);
    headers.Referer = "https://webstatic.mihoyo.com/";
  }

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(urlObj.toString(), {
    method,
    headers,
    body: method === "POST" && params.body ? JSON.stringify(params.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HoYoLAB returned HTTP ${res.status}.`);
  }

  const json = (await res.json()) as { retcode: number; message?: string; data?: T };
  const retcode = Number(json.retcode ?? 0);

  if (retcode === 0 && json.data !== undefined) {
    return json.data;
  }

  if (GEETEST_RETCODES.has(retcode)) {
    throw new HoyolabApiError(
      retcode,
      `HoYoLAB requested human verification (code ${retcode}). Open your Battle Chronicle on hoyolab.com in your browser, complete any verification prompt, and try syncing again.`
    );
  }
  if (retcode === -100 || retcode === 10001 || retcode === -1071) {
    const midHint =
      params.auth.hasV2Token && !params.auth.hasMid
        ? " Your token uses v2_ format—make sure you also include ltmid_v2 from hoyolab.com cookies."
        : "";
    throw new HoyolabApiError(
      retcode,
      `HoYoLAB session cookies are invalid or expired (code ${retcode}).${midHint}`
    );
  }
  if (retcode === 10102) {
    throw new HoyolabApiError(
      retcode,
      "Battle Chronicle data is set to private (code 10102). Enable Battle Chronicle visibility in your HoYoLAB privacy settings."
    );
  }
  if (retcode === 10103 || retcode === -10002 || retcode === 1009) {
    throw new HoyolabApiError(
      retcode,
      "No Genshin Impact account is bound to these HoYoLAB cookies, or the UID could not be found."
    );
  }
  if (retcode === 10101 || retcode === -110 || retcode === 1028) {
    throw new HoyolabApiError(
      retcode,
      "HoYoLAB rate limit reached. Please wait a minute before syncing again."
    );
  }

  throw new HoyolabApiError(
    retcode,
    `HoYoLAB error (${retcode}): ${json.message || "Unknown error"}`
  );
}

async function discoverGenshinAccount(auth: HoyolabAuthConfig): Promise<{
  uid: string;
  server: string;
  region: HoyolabRegion;
  nickname?: string;
  ar?: number;
}> {
  const data = await requestHoyolab<{
    list?: Array<{
      game_biz?: string;
      region?: string;
      game_uid?: string;
      nickname?: string;
      level?: number;
    }>;
  }>({
    url: "https://api-os-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie",
    query: { game_biz: "hk4e_global" },
    region: "os",
    auth,
  });

  const accounts = (data.list ?? []).filter(
    (acc) => acc.game_uid && (!acc.game_biz || acc.game_biz.includes("hk4e"))
  );

  if (accounts.length === 0) {
    throw new Error(
      "Could not auto-detect a Genshin Impact UID on this HoYoLAB account. Enter your 9- or 10-digit UID manually."
    );
  }

  const best = [...accounts].sort(
    (a, b) => Number(b.level ?? 0) - Number(a.level ?? 0)
  )[0];
  const uid = String(best.game_uid);
  const { server, region } = recognizeServer(uid);
  return {
    uid,
    server: best.region || server,
    region,
    nickname: best.nickname,
    ar: best.level,
  };
}

function parseNumericStat(raw: unknown): number {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  if (typeof raw !== "string") return 0;
  const cleaned = raw.replace(/[,%\s]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function normalizePropName(raw: string | undefined): string {
  return (raw ?? "").replace(/\u00a0/g, " ").trim().toLowerCase();
}

function canonicalStatLabel(
  rawName: string | undefined,
  rawValue: string | undefined,
  propType?: number
): { label: string; isPercent: boolean } {
  const norm = normalizePropName(rawName);
  const valueHasPct = (rawValue ?? "").includes("%");

  if (norm === "max hp" || norm === "hp") {
    return valueHasPct ? { label: "HP%", isPercent: true } : { label: "HP", isPercent: false };
  }
  if (norm === "hp%") return { label: "HP%", isPercent: true };
  if (norm === "atk") {
    return valueHasPct ? { label: "ATK%", isPercent: true } : { label: "ATK", isPercent: false };
  }
  if (norm === "atk%") return { label: "ATK%", isPercent: true };
  if (norm === "def") {
    return valueHasPct ? { label: "DEF%", isPercent: true } : { label: "DEF", isPercent: false };
  }
  if (norm === "def%") return { label: "DEF%", isPercent: true };
  if (norm.includes("crit rate")) return { label: "CRIT Rate", isPercent: true };
  if (norm.includes("crit dmg")) return { label: "CRIT DMG", isPercent: true };
  if (norm.includes("energy recharge")) return { label: "Energy Recharge", isPercent: true };
  if (norm.includes("elemental mastery")) return { label: "Elemental Mastery", isPercent: false };
  if (norm.includes("healing bonus") && !norm.includes("incoming")) {
    return { label: "Healing Bonus", isPercent: true };
  }
  if (norm.includes("physical dmg")) return { label: "Physical DMG Bonus", isPercent: true };

  if (norm.includes("dmg bonus")) {
    return { label: (rawName ?? "").replace(/\u00a0/g, " ").trim(), isPercent: true };
  }

  // Fallback by HoYoLAB/FIGHT_PROP numeric ID
  switch (propType) {
    case 2:
    case 2000:
      return valueHasPct ? { label: "HP%", isPercent: true } : { label: "HP", isPercent: false };
    case 3:
      return { label: "HP%", isPercent: true };
    case 5:
    case 2001:
      return valueHasPct ? { label: "ATK%", isPercent: true } : { label: "ATK", isPercent: false };
    case 6:
      return { label: "ATK%", isPercent: true };
    case 8:
    case 2002:
      return valueHasPct ? { label: "DEF%", isPercent: true } : { label: "DEF", isPercent: false };
    case 9:
      return { label: "DEF%", isPercent: true };
    case 20:
      return { label: "CRIT Rate", isPercent: true };
    case 22:
      return { label: "CRIT DMG", isPercent: true };
    case 23:
      return { label: "Energy Recharge", isPercent: true };
    case 26:
      return { label: "Healing Bonus", isPercent: true };
    case 28:
      return { label: "Elemental Mastery", isPercent: false };
    case 30:
      return { label: "Physical DMG Bonus", isPercent: true };
  }

  return {
    label: (rawName ?? `Stat ${propType ?? ""}`).replace(/\u00a0/g, " ").trim(),
    isPercent: valueHasPct,
  };
}

function normalizeElement(raw: unknown): ElementType {
  if (typeof raw === "string") {
    const titled = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    if (VALID_ELEMENTS.has(titled as ElementType)) {
      return titled as ElementType;
    }
  }
  return "Pyro";
}

function worldLevelFromAr(ar: number): number {
  if (ar >= 58) return 9;
  if (ar >= 55) return 8;
  if (ar >= 50) return 7;
  if (ar >= 45) return 6;
  if (ar >= 40) return 5;
  if (ar >= 35) return 4;
  if (ar >= 30) return 3;
  if (ar >= 25) return 2;
  if (ar >= 20) return 1;
  return 0;
}

interface HoyolabPropInfo {
  property_type: number;
  name?: string;
  filter_name?: string;
}

function parseHoyolabCharacter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  propertyMap: Record<string, HoyolabPropInfo>
): ShowcaseCharacter {
  const base = raw.base ?? raw;
  const avatarId = Number(base.id ?? 0);
  const name = String(base.name ?? `Character #${avatarId}`);
  const element = normalizeElement(base.element);
  const level = Number(base.level ?? 90);
  const ascensionMaxLevels = [20, 40, 50, 60, 70, 80, 90];
  const maxLevel =
    level > 90
      ? level > 95
        ? 100
        : 95
      : base.promote_level !== undefined
        ? (ascensionMaxLevels[Number(base.promote_level)] ?? 90)
        : 90;
  const constellation = Number(base.actived_constellation_num ?? 0);
  const friendship = Number(base.fetter ?? 1);

  // Extract skills from HoYoLAB active combat talents
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSkills: any[] = Array.isArray(raw.skills) ? raw.skills : [];
  const activeSkills = rawSkills.filter(
    (s) =>
      Number(s.skill_type) === 1 &&
      Array.isArray(s.skill_affix_list) &&
      s.skill_affix_list.length > 0
  );
  const fallbackSkills =
    activeSkills.length >= 3
      ? activeSkills
      : rawSkills.filter((s) => Number(s.skill_type) === 1);
  const normal = Number(fallbackSkills[0]?.level ?? 1);
  const skill = Number(fallbackSkills[1]?.level ?? 1);
  const burst = Number(fallbackSkills[2]?.level ?? 1);

  // Weapon
  const w = raw.weapon ?? {};
  const wMain = w.main_property;
  const wSub = w.sub_property;
  const wSubInfo = wSub ? propertyMap[String(wSub.property_type)] : undefined;
  const wSubMeta = wSub
    ? canonicalStatLabel(wSubInfo?.name, wSub.final, Number(wSub.property_type))
    : undefined;
  const weapon = {
    name: String(w.name ?? "Equipped Weapon"),
    level: Number(w.level ?? 90),
    refinement: Number(w.affix_level ?? 1),
    rarity: Number(w.rarity ?? 5),
    baseAtk: Math.round(parseNumericStat(wMain?.final ?? 0)),
    subStatLabel: wSubMeta?.label ?? "Substat",
    subStatValue: wSub?.final ? String(wSub.final) : "—",
    iconUrl: w.icon ? String(w.icon) : undefined,
    passiveSummary: `Refinement Rank ${Number(w.affix_level ?? 1)} • Level ${Number(w.level ?? 90)}`,
  };

  // Artifacts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRelics: any[] = Array.isArray(raw.relics) ? raw.relics : [];
  const rawArtifactInputs: RawArtifactInput[] = rawRelics.map((relic) => {
    const slot: ArtifactSlot = POS_TO_SLOT[Number(relic.pos)] ?? "Flower";
    const setObj = relic.set ?? {};
    const setName = String(setObj.name ?? "Artifact Set");
    const relicLevel = Number(relic.level ?? 20);

    const mainProp = relic.main_property ?? {};
    const mainInfo = propertyMap[String(mainProp.property_type)];
    const mainMeta = canonicalStatLabel(
      mainInfo?.name,
      mainProp.value,
      Number(mainProp.property_type)
    );
    const mainVal = parseNumericStat(String(mainProp.value ?? "0"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSubs: any[] = Array.isArray(relic.sub_property_list)
      ? relic.sub_property_list
      : [];
    const rawTimes = rawSubs.map((s) => Number(s.times ?? -1));
    const hasZeroUpgradeTag = rawTimes.some((t) => t === 0);
    const timesSum = rawTimes.reduce((acc, t) => acc + Math.max(0, t), 0);
    const timesAreUpgradeOffsets =
      hasZeroUpgradeTag || (relicLevel >= 16 && timesSum <= 5);

    const substats: RawSubstatInput[] = rawSubs.map((sub) => {
      const subInfo = propertyMap[String(sub.property_type)];
      const rawValStr = String(sub.value ?? "0");
      const subMeta = canonicalStatLabel(
        subInfo?.name,
        rawValStr,
        Number(sub.property_type)
      );
      const numVal = parseNumericStat(rawValStr);
      const rawT = Number(sub.times ?? -1);
      let rolls: number | undefined;
      if (rawT >= 0) {
        rolls = timesAreUpgradeOffsets
          ? Math.max(1, Math.min(6, rawT + 1))
          : Math.max(1, Math.min(6, rawT));
      }

      return {
        id: sub.property_type,
        label: subMeta.label,
        value: numVal,
        isPercent: subMeta.isPercent,
        rolls,
      };
    });

    return {
      slot,
      name: String(relic.name ?? `${setName} ${slot}`),
      setName,
      iconUrl: relic.icon ? String(relic.icon) : undefined,
      level: relicLevel,
      rarity: Number(relic.rarity ?? 5),
      mainStat: {
        id: mainProp.property_type,
        label: mainMeta.label,
        value: mainVal,
        isPercent: mainMeta.isPercent,
      },
      substats,
    };
  });

  // Combat stats from selected_properties + base_properties + extra_properties + element_properties
  const elemDmgLabel = ELEMENT_DMG_LABELS[element];
  const targetElemNorm = elemDmgLabel.toLowerCase();

  let maxHp = 0;
  let atk = 0;
  let baseAtk = 0;
  let def = 0;
  let em = 0;
  let critRate = 5;
  let critDmg = 50;
  let er = 100;
  let elemDmgBonus = 0;
  let physicalDmgBonus = 0;
  let healingBonus = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allProps: any[] = [
    ...(Array.isArray(raw.base_properties) ? raw.base_properties : []),
    ...(Array.isArray(raw.extra_properties) ? raw.extra_properties : []),
    ...(Array.isArray(raw.element_properties) ? raw.element_properties : []),
    ...(Array.isArray(raw.selected_properties) ? raw.selected_properties : []),
  ];

  for (const prop of allProps) {
    if (prop?.final === undefined || prop?.final === null || prop?.final === "") {
      continue;
    }
    const propType = Number(prop?.property_type ?? 0);
    const info = propertyMap[String(propType)];
    const norm = normalizePropName(info?.name);
    const finalVal = parseNumericStat(prop.final);
    const baseVal = parseNumericStat(prop.base);

    if (norm === "max hp" || propType === 2000) {
      maxHp = Math.round(finalVal);
    } else if (norm === "atk" || propType === 2001) {
      atk = Math.round(finalVal);
      if (baseVal > 0) baseAtk = Math.round(baseVal);
    } else if (norm === "base atk" || propType === 4) {
      baseAtk = Math.round(finalVal);
    } else if (norm === "def" || propType === 2002) {
      def = Math.round(finalVal);
    } else if (norm === "elemental mastery" || propType === 28) {
      em = Math.round(finalVal);
    } else if (norm.includes("crit rate") || propType === 20) {
      critRate = round1(finalVal);
    } else if (norm.includes("crit dmg") || propType === 22) {
      critDmg = round1(finalVal);
    } else if (norm.includes("energy recharge") || propType === 23) {
      er = round1(finalVal);
    } else if (norm === targetElemNorm) {
      elemDmgBonus = round1(finalVal);
    } else if (norm.includes("physical dmg") || propType === 30) {
      physicalDmgBonus = round1(finalVal);
    } else if (
      (norm.includes("healing bonus") && !norm.includes("incoming")) ||
      propType === 26
    ) {
      healingBonus = round1(finalVal);
    }
  }

  const stats: CharacterStats = {
    maxHp,
    atk,
    ...(baseAtk > 0 ? { baseAtk } : {}),
    def,
    em,
    critRate,
    critDmg,
    er,
    elementalDmgLabel: elemDmgLabel,
    elementalDmgBonus: elemDmgBonus,
    ...(physicalDmgBonus > 0 ? { physicalDmgBonus } : {}),
    ...(healingBonus > 0 ? { healingBonus } : {}),
  };

  const evaluation = evaluateArtifacts(rawArtifactInputs, stats);
  const roles = getCharacterCombatRoles(name, avatarId);

  const characterRecord: ShowcaseCharacter = {
    avatarId,
    name,
    element,
    rarity: Number(base.rarity ?? 5) === 4 ? 4 : 5,
    level,
    maxLevel,
    constellation,
    friendship,
    iconUrl: base.icon ? String(base.icon) : undefined,
    talents: { normal, skill, burst },
    weapon,
    artifactSets: evaluation.artifactSets,
    artifacts: evaluation.artifacts,
    stats,
    totalCv: evaluation.totalCv,
    buildTier: evaluation.buildTier,
    critique: evaluation.critique,
    roles,
  };

  const activeRole = inferActiveCombatRole(characterRecord);
  return {
    ...characterRecord,
    activeRole,
  };
}

export async function fetchHoyolabProfile(
  payload: HoyolabCredentialsPayload = {}
): Promise<HoyolabSyncResponse> {
  const auth = resolveHoyolabAuth(payload);

  let uid = payload.uid?.trim() ?? "";
  let server = "";
  let region: HoyolabRegion = "os";

  if (uid) {
    ({ server, region } = recognizeServer(uid));
  } else {
    const discovered = await discoverGenshinAccount(auth);
    uid = discovered.uid;
    server = discovered.server;
    region = discovered.region;
  }

  const baseUrl =
    region === "os"
      ? "https://sg-public-api.hoyolab.com/event/game_record/genshin/api"
      : "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api";

  const [indexData, listData] = await Promise.all([
    requestHoyolab<{
      role?: {
        nickname?: string;
        level?: number;
        region?: string;
      };
      stats?: {
        achievement_number?: number;
        avatar_number?: number;
        spiral_abyss?: string;
        role_combat?: {
          max_round_id?: number;
        };
      };
    }>({
      url: `${baseUrl}/index`,
      query: { role_id: uid, server },
      region,
      auth,
    }),
    requestHoyolab<{
      list?: Array<{ id: number }>;
    }>({
      url: `${baseUrl}/character/list`,
      method: "POST",
      body: { role_id: uid, server },
      region,
      auth,
    }),
  ]);

  const charIds = (listData.list ?? [])
    .map((c) => Number(c.id))
    .filter((id) => Number.isFinite(id) && id > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let detailedList: any[] = [];
  let propertyMap: Record<string, HoyolabPropInfo> = {};

  if (charIds.length > 0) {
    try {
      const detailData = await requestHoyolab<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        list?: any[];
        property_map?: Record<string, HoyolabPropInfo>;
      }>({
        url: `${baseUrl}/character/detail`,
        method: "POST",
        body: { role_id: uid, server, character_ids: charIds },
        region,
        auth,
      });
      detailedList = detailData.list ?? [];
      propertyMap = detailData.property_map ?? {};
    } catch (err) {
      // If a single payload is rejected due to batch size, chunk into groups of 25
      if (charIds.length > 25 && !(err instanceof HoyolabApiError && GEETEST_RETCODES.has(err.retcode))) {
        for (let i = 0; i < charIds.length; i += 25) {
          const chunk = charIds.slice(i, i + 25);
          const chunkData = await requestHoyolab<{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            list?: any[];
            property_map?: Record<string, HoyolabPropInfo>;
          }>({
            url: `${baseUrl}/character/detail`,
            method: "POST",
            body: { role_id: uid, server, character_ids: chunk },
            region,
            auth,
          });
          detailedList.push(...(chunkData.list ?? []));
          propertyMap = { ...propertyMap, ...(chunkData.property_map ?? {}) };
        }
      } else {
        throw err;
      }
    }
  }

  // Best-effort secondary fetches (Abyss stars, Theater medals, Real-Time Notes)
  const [abyssResult, theaterResult, notesResult] = await Promise.allSettled([
    requestHoyolab<{ max_floor?: string; total_star?: number }>({
      url: `${baseUrl}/spiralAbyss`,
      query: { role_id: uid, server, schedule_type: "1" },
      region,
      auth,
    }),
    requestHoyolab<{
      data?: Array<{
        stat?: { max_round_id?: number; medal_num?: number };
      }>;
    }>({
      url: `${baseUrl}/role_combat`,
      query: { role_id: uid, server, need_detail: "false" },
      region,
      auth,
    }),
    requestHoyolab<{
      current_resin?: number;
      max_resin?: number;
      resin_recovery_time?: string | number;
      current_condensed_resin?: number;
      max_condensed_resin?: number;
      current_home_coin?: number;
      max_home_coin?: number;
      home_coin_recovery_time?: string | number;
      finished_task_num?: number;
      total_task_num?: number;
      is_extra_task_reward_received?: boolean;
      remain_resin_discount_num?: number;
      resin_discount_num_limit?: number;
      current_expedition_num?: number;
      max_expedition_num?: number;
      expeditions?: Array<{
        avatar_side_icon?: string;
        status?: "Ongoing" | "Finished";
        remained_time?: string;
      }>;
      transformer?: {
        obtained?: boolean;
        recovery_time?: {
          Day?: number;
          Hour?: number;
          Minute?: number;
          Second?: number;
          reached?: boolean;
        };
      };
    }>({
      url: `${baseUrl}/dailyNote`,
      query: { role_id: uid, server },
      region,
      auth,
    }),
  ]);

  const characters = detailedList.map((char) =>
    parseHoyolabCharacter(char, propertyMap)
  );

  const ar = Number(indexData.role?.level ?? 60);
  const abyssFloor =
    (abyssResult.status === "fulfilled" && abyssResult.value.max_floor) ||
    indexData.stats?.spiral_abyss ||
    "—";
  const abyssStars =
    abyssResult.status === "fulfilled" &&
    abyssResult.value.total_star !== undefined
      ? `${abyssResult.value.total_star}/36`
      : "—";

  const theaterEntry =
    theaterResult.status === "fulfilled"
      ? theaterResult.value.data?.[0]?.stat
      : undefined;
  const maxRound =
    theaterEntry?.max_round_id ?? indexData.stats?.role_combat?.max_round_id ?? 0;

  const profile: TravelerProfile = {
    uid,
    nickname: String(indexData.role?.nickname ?? `Traveler ${uid}`),
    signature: `HoYoLAB Battle Chronicle • ${server}`,
    ar,
    worldLevel: worldLevelFromAr(ar),
    achievements: Number(indexData.stats?.achievement_number ?? 0),
    abyssFloor,
    abyssStars,
    theaterAct: maxRound > 0 ? `Act ${maxRound}` : "—",
    theaterMedals: Number(theaterEntry?.medal_num ?? 0),
    avatarCount: Number(indexData.stats?.avatar_number ?? characters.length),
    lv90Count: characters.filter((c) => c.level >= 90).length,
    characters,
    syncedAt: new Date().toISOString(),
    source: "hoyolab",
  };

  let liveDirectives: Partial<DailyDirectives> | undefined;
  let notesError: string | undefined;

  if (notesResult.status === "fulfilled") {
    const n = notesResult.value;
    const discountLimit = Number(n.resin_discount_num_limit ?? 3);
    const remainDiscount = Number(n.remain_resin_discount_num ?? discountLimit);
    const expeditions = n.expeditions ?? [];
    const finishedExpeditions = expeditions.filter(
      (e) => e.status === "Finished" || e.remained_time === "0"
    ).length;

    const parametricInfo = formatParametricCooldown({
      obtained: n.transformer?.obtained,
      reached: n.transformer?.recovery_time?.reached,
      days: n.transformer?.recovery_time?.Day,
      hours: n.transformer?.recovery_time?.Hour,
      minutes: n.transformer?.recovery_time?.Minute,
    });

    liveDirectives = {
      ...(n.current_resin !== undefined ? { resin: Number(n.current_resin) } : {}),
      ...(n.max_resin !== undefined ? { maxResin: Number(n.max_resin) } : {}),
      ...(n.resin_recovery_time !== undefined
        ? { resinRecoverySeconds: Number(n.resin_recovery_time) }
        : {}),
      condensedResin: Number(
        n.current_condensed_resin ??
          (n as unknown as Record<string, unknown>).condensed_resin ??
          0
      ),
      ...(n.current_home_coin !== undefined
        ? { realmCurrency: Number(n.current_home_coin) }
        : {}),
      ...(n.max_home_coin !== undefined
        ? { maxRealmCurrency: Number(n.max_home_coin) }
        : {}),
      ...(n.home_coin_recovery_time !== undefined
        ? { realmCurrencyRecoverySeconds: Number(n.home_coin_recovery_time) }
        : {}),
      ...(n.finished_task_num !== undefined
        ? { dailyCommissionsDone: Number(n.finished_task_num) }
        : {}),
      totalCommissions: Number(n.total_task_num ?? 4),
      extraRewardClaimed: Boolean(n.is_extra_task_reward_received),
      weeklyBossDiscountsRemaining: remainDiscount,
      weeklyBossesDone: Math.max(0, discountLimit - remainDiscount),
      weeklyBossDiscountLimit: discountLimit,
      ...(n.current_expedition_num !== undefined
        ? { expeditionsCount: Number(n.current_expedition_num) }
        : expeditions.length > 0
        ? { expeditionsCount: expeditions.length }
        : {}),
      ...(n.max_expedition_num !== undefined
        ? { maxExpeditions: Number(n.max_expedition_num) }
        : {}),
      expeditionsFinished: finishedExpeditions,
      ...(n.transformer?.obtained !== undefined
        ? {
            parametricReady: parametricInfo.ready,
            parametricRecoveryText: parametricInfo.label,
          }
        : {}),
      source: "hoyolab",
      lastUpdatedAt: new Date().toISOString(),
    };
  } else if (notesResult.status === "rejected") {
    notesError =
      notesResult.reason instanceof Error
        ? notesResult.reason.message
        : "Real-Time Notes disabled or unavailable.";
  }

  return {
    profile,
    ...(liveDirectives ? { liveDirectives } : {}),
    ...(notesError ? { notesError } : {}),
  };
}
