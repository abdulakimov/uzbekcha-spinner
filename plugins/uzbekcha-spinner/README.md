# uzbekcha-spinner

Claude Code spinner'ini o'zbekchalashtiradi: `✻ Osh damlayapti…` va ostida `⎿ Tip: Asal buzilmaydi — …`.

To'liq hujjat va o'rnatish yo'riqnomasi: [repo ildizidagi README](../../README.md).

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `data/verbs.json` | 158 fe'l: neytral 46 · oshxona 35 · hazil 37 · harakat 40 |
| `data/facts.json` | 300 fakt: dunyo 90 · fan 80 · tarix 60 · texnologiya 70 |
| `scripts/uz-spinner.mjs` | `settings.json` dagi `spinnerVerbs` va `spinnerTipsOverride` kalitlarini boshqaradi |
| `hooks/hooks.json` | `SessionStart` → skriptni `on` bilan chaqiradi (idempotent) |
| `skills/uzbekcha/SKILL.md` | `/uzbekcha` slash-buyrug'i |
| `~/.claude/uzbekcha-spinner/state.json` | Tanlangan toifalar, fakt rejimi, o'rnatishdan avvalgi qiymatlar |

## Skript buyruqlari

```
node scripts/uz-spinner.mjs on | off | holat | ro'yxat | faktlar
node scripts/uz-spinner.mjs fakt [on|off]
node scripts/uz-spinner.mjs hazil oshxona | hammasi
```
