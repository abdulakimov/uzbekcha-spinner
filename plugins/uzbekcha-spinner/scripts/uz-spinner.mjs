#!/usr/bin/env node
// Claude Code spinner'ini o'zbekchalashtiradi:
//   spinnerVerbs        → fe'llar   (✻ Osh damlayapti…)
//   spinnerTipsOverride → faktlar   (⎿ Tip: Asal buzilmaydi — …)
//
// Ikkalasi ham settings.json kalitlari. Plugin ularni deklarativ bera olmaydi
// (plugin sozlamalari ["agent", "subagentStatusLine"] allowlist'idan o'tadi), shuning
// uchun bu skript SessionStart hook orqali foydalanuvchi settings.json'iga o'zi yozadi.
//
// Ishlatilishi:
//   node uz-spinner.mjs on|off|holat|ro'yxat
//   node uz-spinner.mjs hazil oshxona      — faqat shu fe'l toifalari
//   node uz-spinner.mjs hammasi            — barcha fe'l toifalari
//   node uz-spinner.mjs fakt [on|off]      — fakt rejimi
//   node uz-spinner.mjs faktlar            — faktlar ro'yxati

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const SETTINGS_PATH = join(CONFIG_DIR, "settings.json");

// Ataylab CLAUDE_PLUGIN_DATA ishlatilmaydi: u faqat hook subprotsessida o'rnatiladi,
// /uzbekcha oddiy Bash orqali chaqirilganda esa yo'q — natijada ikkita turli state
// fayli paydo bo'lib, tanlangan toifa har seansda bekor bo'lib ketardi.
const STATE_PATH = join(CONFIG_DIR, "uzbekcha-spinner", "state.json");

const data = (nom) => JSON.parse(readFileSync(join(PLUGIN_ROOT, "data", nom), "utf8"));

const BARCHA_TOIFALAR = Object.keys(data("verbs.json").toifalar);

// settings.json buzuq bo'lsa xato tashlaydi — chaqiruvchi uni ushlab, hech narsa yozmaydi.
function readSettings() {
  if (!existsSync(SETTINGS_PATH)) return {};
  const raw = readFileSync(SETTINGS_PATH, "utf8");
  return raw.trim() ? JSON.parse(raw) : {};
}

function writeSettings(settings) {
  const tmp = `${SETTINGS_PATH}.tmp-${process.pid}`;
  writeFileSync(tmp, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  renameSync(tmp, SETTINGS_PATH);
}

function readState() {
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeState(state) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

const yassila = (fayl, toifalar) => {
  const t = data(fayl).toifalar;
  const hammasi = (toifalar ?? Object.keys(t)).flatMap((x) => t[x] ?? []);
  return [...new Set(hammasi)].filter((v) => typeof v === "string" && v.trim());
};

// Saqlangan tanlov; noto'g'ri yoki bo'sh bo'lsa — barcha toifalar.
function tanlanganToifalar(state = readState()) {
  const t = (state.toifalar ?? []).filter((x) => BARCHA_TOIFALAR.includes(x));
  return t.length ? t : BARCHA_TOIFALAR;
}

const loadVerbs = (toifalar) => yassila("verbs.json", toifalar);
const loadFacts = () => yassila("facts.json");

const birXil = (a, b) =>
  Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);

// Joriy qiymat bizning ma'lumotimizdanmi? Toifa almashtirilganda o'z ro'yxatimizni
// "o'rnatishdan avvalgi qiymat" deb saqlab qo'ymaslik uchun — aks holda `off`
// inglizchani qaytarish o'rniga o'zbekchani qayta tiklab qo'yadi.
const biznikiVerbs = (sv) =>
  sv?.mode === "replace" &&
  Array.isArray(sv.verbs) &&
  sv.verbs.length > 0 &&
  sv.verbs.every((v) => new Set(loadVerbs()).has(v));

const biznikiTips = (st) =>
  Array.isArray(st?.tips) &&
  st.tips.length > 0 &&
  st.tips.every((t) => new Set(loadFacts()).has(t));

// ——— fe'llar ———————————————————————————————————————————————

function felQolla(settings, state) {
  const verbs = loadVerbs(tanlanganToifalar(state));
  if (verbs.length === 0) return false; // bo'sh ro'yxat yozilsa Claude Code default'ga qaytadi

  const joriy = settings.spinnerVerbs;
  if (joriy?.mode === "replace" && birXil(joriy.verbs, verbs)) return false; // idempotent

  if (!state.qollangan) {
    Object.assign(state, { qollangan: true, avvalgi: biznikiVerbs(joriy) ? null : joriy ?? null });
  }
  settings.spinnerVerbs = { mode: "replace", verbs };
  return true;
}

// ——— faktlar ——————————————————————————————————————————————

function faktQolla(settings, state) {
  const tips = loadFacts();
  if (tips.length === 0) return false;

  const joriy = settings.spinnerTipsOverride;
  // excludeDefault shart: usiz 30-soniyalik /btw maslahati faktlarni bosib ketadi.
  if (joriy?.excludeDefault === true && birXil(joriy.tips, tips)) return false; // idempotent

  if (!state.faktQollangan) {
    Object.assign(state, {
      faktQollangan: true,
      avvalgiTips: biznikiTips(joriy) ? null : joriy ?? null,
      avvalgiTipsEnabled: settings.spinnerTipsEnabled ?? null,
    });
  }
  settings.spinnerTipsOverride = { excludeDefault: true, tips };
  settings.spinnerTipsEnabled = true;
  return true;
}

function faktOchir(settings, state) {
  if (state.avvalgiTips) settings.spinnerTipsOverride = state.avvalgiTips;
  else delete settings.spinnerTipsOverride;

  if (state.avvalgiTipsEnabled === null || state.avvalgiTipsEnabled === undefined) {
    delete settings.spinnerTipsEnabled;
  } else {
    settings.spinnerTipsEnabled = state.avvalgiTipsEnabled;
  }

  Object.assign(state, { faktQollangan: false, avvalgiTips: null, avvalgiTipsEnabled: null });
}

// ——— buyruqlar —————————————————————————————————————————————

// Hook shuni chaqiradi: fe'llarni, agar fakt rejimi yoqilgan bo'lsa — faktlarni ham qo'llaydi.
function on() {
  const state = readState();
  const settings = readSettings();

  const o1 = felQolla(settings, state);
  const o2 = state.faktQollangan ? faktQolla(settings, state) : false;

  if (o1 || o2) {
    writeState(state);
    writeSettings(settings);
  }
}

function off() {
  const state = readState();
  const settings = readSettings();

  if (state.avvalgi) settings.spinnerVerbs = state.avvalgi;
  else delete settings.spinnerVerbs;
  Object.assign(state, { qollangan: false, avvalgi: null });

  faktOchir(settings, state);

  writeState(state);
  writeSettings(settings);
  console.log("O'zbekcha spinner o'chirildi. Inglizcha fe'llar va maslahatlar qaytdi.");
}

// Fe'l toifalarini almashtiradi. Tanlov state'da saqlanadi, shuning uchun keyingi
// seansda hook ham aynan shu toifalarni yozadi.
function toifaOrnat(nomlar) {
  const notogri = nomlar.filter((n) => !BARCHA_TOIFALAR.includes(n));
  if (notogri.length) {
    console.log(`Noma'lum toifa: ${notogri.join(", ")}`);
    console.log(`Mavjud toifalar: ${BARCHA_TOIFALAR.join(", ")}, hammasi`);
    return;
  }
  const state = readState();
  writeState({ ...state, toifalar: nomlar });
  on();
  holat();
}

function fakt(buyruq = "on") {
  const state = readState();
  const settings = readSettings();

  if (buyruq === "off") {
    faktOchir(settings, state);
    writeState(state);
    writeSettings(settings);
    console.log("Fakt rejimi o'chirildi.");
    return;
  }
  if (buyruq !== "on") {
    console.log(`Noma'lum buyruq: fakt ${buyruq}. Kutilgani: fakt on | fakt off`);
    return;
  }

  if (faktQolla(settings, state)) {
    writeState(state);
    writeSettings(settings);
  }
  const tips = loadFacts();
  console.log(`Fakt rejimi: YOQILGAN — ${tips.length} ta fakt.`);
  console.log(`Namuna: Tip: ${tips[Math.floor(Math.random() * tips.length)]}`);
}

function holat() {
  const state = readState();
  const toifalar = tanlanganToifalar(state);
  const verbs = loadVerbs(toifalar);
  const facts = loadFacts();
  const settings = readSettings();

  const felYoq = settings.spinnerVerbs?.mode === "replace" && birXil(settings.spinnerVerbs.verbs, verbs);
  const faktYoq = settings.spinnerTipsOverride?.excludeDefault === true && birXil(settings.spinnerTipsOverride.tips, facts);

  console.log(`Fe'llar    : ${felYoq ? "YOQILGAN" : "o'chirilgan"} — ${verbs.length} ta`);
  console.log(`Toifalar   : ${toifalar.join(", ")}${toifalar.length === BARCHA_TOIFALAR.length ? " (hammasi)" : ""}`);
  console.log(`Fakt rejimi: ${faktYoq ? "YOQILGAN" : "o'chirilgan"} — ${facts.length} ta fakt`);
  if (felYoq) {
    const namuna = [...verbs].sort(() => Math.random() - 0.5).slice(0, 3);
    console.log(`Namuna     : ${namuna.map((v) => `${v}…`).join("  ·  ")}`);
  }
  console.log(`Sozlama    : ${SETTINGS_PATH}`);
}

function royxat(fayl) {
  const faol = fayl === "verbs.json" ? tanlanganToifalar() : null;
  for (const [toifa, list] of Object.entries(data(fayl).toifalar)) {
    console.log(`\n${toifa} (${list.length})${faol && faol.includes(toifa) ? " ← faol" : ""}:`);
    console.log(fayl === "verbs.json" ? list.join(" · ") : list.map((f) => `  • ${f}`).join("\n"));
  }
}

const BUYRUQLAR = ["on", "off", "holat", "ro'yxat", "fakt", "faktlar", "hammasi"];

try {
  const argv = process.argv.slice(2);
  const buyruq = argv[0] ?? "holat";

  if (buyruq === "on") on();
  else if (buyruq === "off") off();
  else if (buyruq === "fakt") fakt(argv[1]);
  else if (buyruq === "faktlar") royxat("facts.json");
  else if (buyruq === "ro'yxat" || buyruq === "royxat") royxat("verbs.json");
  else if (buyruq === "hammasi") toifaOrnat(BARCHA_TOIFALAR);
  else if (BARCHA_TOIFALAR.includes(buyruq)) toifaOrnat([...new Set(argv)]);
  else if (buyruq === "holat") holat();
  else {
    console.log(`Noma'lum buyruq: ${buyruq}`);
    console.log(`Buyruqlar: ${BUYRUQLAR.join(", ")}`);
    console.log(`Fe'l toifalari: ${BARCHA_TOIFALAR.join(", ")}`);
  }
} catch (err) {
  // Hook kontekstida hech qachon seansni buzmaymiz: xato stderr'ga, exit kodi 0.
  console.error(`uzbekcha-spinner: ${err.message}`);
}

process.exit(0);
