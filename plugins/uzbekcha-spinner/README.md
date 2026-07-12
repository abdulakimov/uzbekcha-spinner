# uzbekcha-spinner

Claude Code spinner fe'llarini o'zbekchaga almashtiradi: `✻ Osh damlayapti… (2m 13s)`.

To'liq hujjat va o'rnatish yo'riqnomasi: [repo ildizidagi README](../../README.md).

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `data/verbs.json` | 158 fe'l: neytral 46 · oshxona 35 · hazil 37 · harakat 40 |
| `scripts/uz-spinner.mjs` | `on` / `off` / `holat` / `ro'yxat` — `settings.json` dagi `spinnerVerbs` kalitini boshqaradi |
| `hooks/hooks.json` | `SessionStart` → skriptni `on` bilan chaqiradi (idempotent) |
| `skills/uzbekcha/SKILL.md` | `/uzbekcha` slash-buyrug'i |
