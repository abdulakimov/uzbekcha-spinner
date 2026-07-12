#!/usr/bin/env node
// Claude Code spinner fe'llarini o'zbekchaga almashtiradi.
//
// spinnerVerbs — settings.json kaliti. Plugin uni deklarativ tarzda bera olmaydi
// (plugin sozlamalari ["agent", "subagentStatusLine"] allowlist'idan o'tadi), shuning
// uchun bu skript SessionStart hook orqali foydalanuvchi settings.json'iga o'zi yozadi.
//
// Ishlatilishi:
//   node uz-spinner.mjs on|off|holat|ro'yxat
//   node uz-spinner.mjs hazil oshxona      — faqat shu toifalar
//   node uz-spinner.mjs hammasi            — barcha toifalar

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

function verbsData() {
  return JSON.parse(readFileSync(join(PLUGIN_ROOT, "data", "verbs.json"), "utf8"));
}

const BARCHA_TOIFALAR = Object.keys(verbsData().toifalar);

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

// Saqlangan tanlov; noto'g'ri yoki bo'sh bo'lsa — barcha toifalar.
function tanlanganToifalar(state = readState()) {
  const t = (state.toifalar ?? []).filter((x) => BARCHA_TOIFALAR.includes(x));
  return t.length ? t : BARCHA_TOIFALAR;
}

function loadVerbs(toifalar) {
  const data = verbsData();
  const hammasi = toifalar.flatMap((t) => data.toifalar[t] ?? []);
  return [...new Set(hammasi)].filter((v) => typeof v === "string" && v.trim());
}

const birXil = (a, b) =>
  Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);

// Joriy spinnerVerbs bizning fe'llarimizdanmi? Toifa almashtirilganda yoki state
// tiklanganda o'z ro'yxatimizni "o'rnatishdan avvalgi qiymat" deb saqlab qo'ymaslik uchun —
// aks holda `off` inglizchani qaytarish o'rniga o'zbekchani qayta tiklab qo'yadi.
function bizniki(sv) {
  if (sv?.mode !== "replace" || !Array.isArray(sv.verbs) || sv.verbs.length === 0) return false;
  const hovuz = new Set(loadVerbs(BARCHA_TOIFALAR));
  return sv.verbs.every((v) => hovuz.has(v));
}

function on() {
  const state = readState();
  const verbs = loadVerbs(tanlanganToifalar(state));
  if (verbs.length === 0) return; // bo'sh ro'yxat yozilsa Claude Code default'ga qaytadi

  const settings = readSettings();
  const joriy = settings.spinnerVerbs;
  if (joriy?.mode === "replace" && birXil(joriy.verbs, verbs)) return; // idempotent

  if (!state.qollangan) {
    writeState({ ...state, qollangan: true, avvalgi: bizniki(joriy) ? null : joriy ?? null });
  }

  settings.spinnerVerbs = { mode: "replace", verbs };
  writeSettings(settings);
}

function off() {
  const settings = readSettings();
  const state = readState();

  if (state.avvalgi) settings.spinnerVerbs = state.avvalgi;
  else delete settings.spinnerVerbs;

  writeSettings(settings);
  writeState({ ...state, qollangan: false, avvalgi: null });
  console.log("O'zbekcha spinner o'chirildi. Inglizcha fe'llar qaytdi.");
}

// Toifalarni almashtiradi va darhol qo'llaydi. Tanlov state'da saqlanadi, shuning
// uchun keyingi seansda hook ham aynan shu toifalarni yozadi.
function toifaOrnat(nomlar) {
  const notogri = nomlar.filter((n) => !BARCHA_TOIFALAR.includes(n));
  if (notogri.length) {
    console.log(`Noma'lum toifa: ${notogri.join(", ")}`);
    console.log(`Mavjud toifalar: ${BARCHA_TOIFALAR.join(", ")}, hammasi`);
    return;
  }

  writeState({ ...readState(), toifalar: nomlar });
  on();
  holat();
}

function holat() {
  const state = readState();
  const toifalar = tanlanganToifalar(state);
  const verbs = loadVerbs(toifalar);
  const joriy = readSettings().spinnerVerbs;
  const yoqilgan = joriy?.mode === "replace" && birXil(joriy.verbs, verbs);

  console.log(`O'zbekcha spinner: ${yoqilgan ? "YOQILGAN" : "o'chirilgan"}`);
  console.log(`Toifalar: ${toifalar.join(", ")}${toifalar.length === BARCHA_TOIFALAR.length ? " (hammasi)" : ""}`);
  console.log(`Fe'llar: ${verbs.length} ta`);
  if (yoqilgan) {
    const namuna = [...verbs].sort(() => Math.random() - 0.5).slice(0, 3);
    console.log(`Namuna: ${namuna.map((v) => `${v}…`).join("  ·  ")}`);
  }
  console.log(`Sozlama: ${SETTINGS_PATH}`);
}

function royxat() {
  const faol = tanlanganToifalar();
  for (const [toifa, verbs] of Object.entries(verbsData().toifalar)) {
    console.log(`\n${toifa} (${verbs.length})${faol.includes(toifa) ? " ← faol" : ""}:`);
    console.log(verbs.join(" · "));
  }
}

const BUYRUQLAR = ["on", "off", "holat", "ro'yxat", "royxat", "hammasi"];

try {
  const argv = process.argv.slice(2);
  const buyruq = argv[0] ?? "holat";

  if (buyruq === "on") on();
  else if (buyruq === "off") off();
  else if (buyruq === "ro'yxat" || buyruq === "royxat") royxat();
  else if (buyruq === "hammasi") toifaOrnat(BARCHA_TOIFALAR);
  else if (BARCHA_TOIFALAR.includes(buyruq)) toifaOrnat([...new Set(argv)]);
  else if (buyruq === "holat") holat();
  else {
    console.log(`Noma'lum buyruq: ${buyruq}`);
    console.log(`Buyruqlar: ${BUYRUQLAR.join(", ")}`);
    console.log(`Toifalar : ${BARCHA_TOIFALAR.join(", ")}`);
  }
} catch (err) {
  // Hook kontekstida hech qachon seansni buzmaymiz: xato stderr'ga, exit kodi 0.
  console.error(`uzbekcha-spinner: ${err.message}`);
}

process.exit(0);
