---
name: uzbekcha
description: O'zbekcha spinner fe'llari va fakt rejimini boshqarish — yoqish, o'chirish, toifa tanlash, holatini ko'rish
argument-hint: [on|off|fakt|faktlar|holat|ro'yxat|hammasi|neytral|oshxona|hazil|harakat]
allowed-tools: [Bash, Read, Edit]
---

Foydalanuvchi so'rovi: `$ARGUMENTS` (bo'sh bo'lsa — `holat`).

Bu skill Claude Code spinner'ini o'zbekchalashtirishni boshqaradi:

- **Fe'llar** → `✻ Osh damlayapti… (2m 13s)`
- **Faktlar** → spinner ostidagi qatorda: `⎿ Tip: Asal buzilmaydi — …`

## Bajarish

Skriptni ishga tushir va argumentlarni o'zgartirmasdan uzat:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/uz-spinner.mjs" <argumentlar>
```

| Argument | Nima qiladi |
|---|---|
| `on` | Fe'llarni qo'llaydi (fakt rejimi yoqilgan bo'lsa — faktlarni ham). Jim ishlaydi — keyin `holat` ni chaqirib natijani ko'rsat |
| `off` | Hammasini o'chiradi: inglizcha fe'llar ham, maslahatlar ham qaytadi |
| `fakt` yoki `fakt on` | Fakt rejimini yoqadi |
| `fakt off` | Faqat faktlarni o'chiradi, fe'llar qoladi |
| `faktlar` | Barcha faktlarni toifalar bo'yicha chiqaradi |
| `holat` | Fe'llar va fakt rejimi yoqilganmi, qaysi toifalar faol |
| `ro'yxat` | Barcha fe'llarni chiqaradi, faol toifalarni belgilaydi |
| `hazil`, `oshxona`, `neytral`, `harakat` | Faqat shu fe'l toifa(lar)i. Bir nechtasini birga: `hazil oshxona` |
| `hammasi` | Barcha fe'l toifalarini qaytaradi |

Fe'l toifasi va fakt rejimi bir-biridan mustaqil — `oshxona` fe'llari bilan faktlar birga ishlayveradi.

Tanlov state faylida saqlanadi, shuning uchun keyingi seansda `SessionStart` hook ham aynan shu holatni tiklaydi.

Skript chiqargan matnni foydalanuvchiga qisqacha yetkaz. O'zgarishlar darhol kuchga kiradi — qayta ishga tushirish shart emas.

## Node topilmasa

`node` buyrug'i mavjud bo'lmasa (Claude Code'ning native o'rnatmasi), o'zing bajar:

1. `${CLAUDE_PLUGIN_ROOT}/data/verbs.json` va `data/facts.json` dagi `toifalar` massivlarini birlashtir.
2. `~/.claude/settings.json` ni o'qi (yo'q bo'lsa — `{}`).
3. Kerakli kalitlarni qo'sh, **boshqalariga tegma**:
   ```json
   "spinnerVerbs": { "mode": "replace", "verbs": ["O'ylayapti", "…"] },
   "spinnerTipsEnabled": true,
   "spinnerTipsOverride": { "excludeDefault": true, "tips": ["Asal buzilmaydi — …"] }
   ```
   `excludeDefault: true` **shart** — usiz 30-soniyalik `/btw` maslahati faktlarni bosib ketadi.
   O'chirish uchun tegishli kalitlarni butunlay olib tashla.
4. Faylni 2 probel indent bilan qayta yoz.
5. Tanlovni `~/.claude/uzbekcha-spinner/state.json` ga yoz.
