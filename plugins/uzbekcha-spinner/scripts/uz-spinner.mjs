#!/usr/bin/env node
// Claude Code spinner fe'llarini o'zbekchaga almashtiradi.
//
// spinnerVerbs — settings.json kaliti. Plugin uni deklarativ tarzda bera olmaydi
// (plugin sozlamalari ["agent", "subagentStatusLine"] allowlist'idan o'tadi), shuning
// uchun bu skript SessionStart hook orqali foydalanuvchi settings.json'iga o'zi yozadi.
//
// Ishlatilishi:  node uz-spinner.mjs [on|off|holat|ro'yxat]

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const SETTINGS_PATH = join(CONFIG_DIR, "settings.json");
const DATA_DIR = process.env.CLAUDE_PLUGIN_DATA || join(CONFIG_DIR, "uzbekcha-spinner");
const STATE_PATH = join(DATA_DIR, "state.json");

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
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function loadVerbs() {
  const data = JSON.parse(readFileSync(join(PLUGIN_ROOT, "data", "verbs.json"), "utf8"));
  const hammasi = Object.values(data.toifalar).flat();
  return [...new Set(hammasi)].filter((v) => typeof v === "string" && v.trim());
}

const birXil = (a, b) =>
  Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);

function on() {
  const verbs = loadVerbs();
  if (verbs.length === 0) return; // bo'sh ro'yxat yozilsa Claude Code default'ga qaytadi

  const settings = readSettings();
  const joriy = settings.spinnerVerbs;
  if (joriy?.mode === "replace" && birXil(joriy.verbs, verbs)) return; // idempotent

  const state = readState();
  if (!state.qollangan) writeState({ qollangan: true, avvalgi: joriy ?? null });

  settings.spinnerVerbs = { mode: "replace", verbs };
  writeSettings(settings);
}

function off() {
  const settings = readSettings();
  const { avvalgi } = readState();

  if (avvalgi) settings.spinnerVerbs = avvalgi;
  else delete settings.spinnerVerbs;

  writeSettings(settings);
  writeState({ qollangan: false, avvalgi: null });
  console.log("O'zbekcha spinner o'chirildi. Inglizcha fe'llar qaytdi.");
}

function holat() {
  const verbs = loadVerbs();
  const joriy = readSettings().spinnerVerbs;
  const yoqilgan = joriy?.mode === "replace" && birXil(joriy.verbs, verbs);

  console.log(`O'zbekcha spinner: ${yoqilgan ? "YOQILGAN" : "o'chirilgan"}`);
  console.log(`Fe'llar: ${verbs.length} ta`);
  if (yoqilgan) {
    const namuna = [...verbs].sort(() => Math.random() - 0.5).slice(0, 3);
    console.log(`Namuna: ${namuna.map((v) => `${v}…`).join("  ·  ")}`);
  }
  console.log(`Sozlama: ${SETTINGS_PATH}`);
}

function royxat() {
  const data = JSON.parse(readFileSync(join(PLUGIN_ROOT, "data", "verbs.json"), "utf8"));
  for (const [toifa, verbs] of Object.entries(data.toifalar)) {
    console.log(`\n${toifa} (${verbs.length}):`);
    console.log(verbs.join(" · "));
  }
}

try {
  const buyruq = process.argv[2] ?? "holat";
  if (buyruq === "on") on();
  else if (buyruq === "off") off();
  else if (buyruq === "ro'yxat" || buyruq === "royxat") royxat();
  else holat();
} catch (err) {
  // Hook kontekstida hech qachon seansni buzmaymiz: xato stderr'ga, exit kodi 0.
  console.error(`uzbekcha-spinner: ${err.message}`);
}

process.exit(0);
