---
name: uzbekcha
description: O'zbekcha spinner fe'llarini boshqarish — yoqish, o'chirish, toifa tanlash, holatini ko'rish, ro'yxatini chiqarish
argument-hint: [on|off|holat|ro'yxat|hammasi|neytral|oshxona|hazil|harakat]
allowed-tools: [Bash, Read, Edit]
---

Foydalanuvchi so'rovi: `$ARGUMENTS` (bo'sh bo'lsa — `holat`).

Bu skill Claude Code spinner fe'llarini (`✻ Cooking…`) o'zbekchaga (`✻ Osh damlayapti…`) almashtirishni boshqaradi.

## Bajarish

Skriptni ishga tushir va argumentlarni o'zgartirmasdan uzat:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/uz-spinner.mjs" <argumentlar>
```

| Argument | Nima qiladi |
|---|---|
| `on` | Fe'llarni `~/.claude/settings.json` ga yozadi (`spinnerVerbs.mode = "replace"`). Jim ishlaydi — keyin `holat` ni ham chaqirib natijani ko'rsat |
| `off` | Avvalgi qiymatni tiklaydi, bo'lmasa kalitni o'chiradi — inglizcha fe'llar qaytadi |
| `holat` | Yoqilganmi, qaysi toifalar faol, nechta fe'l bor |
| `ro'yxat` | Hamma fe'llarni toifalar bo'yicha chiqaradi, faollarini belgilaydi |
| `hazil`, `oshxona`, `neytral`, `harakat` | Faqat shu toifa(lar). Bir nechtasini birga berish mumkin: `hazil oshxona` |
| `hammasi` | Barcha toifalarni qaytaradi |

Toifa tanlovi state faylida saqlanadi, shuning uchun keyingi seansda `SessionStart` hook ham aynan shu toifalarni yozadi.

Skript chiqargan matnni foydalanuvchiga qisqacha yetkaz. Yangi fe'llar darhol kuchga kiradi — qayta ishga tushirish shart emas.

## Node topilmasa

`node` buyrug'i mavjud bo'lmasa (Claude Code'ning native o'rnatmasi), o'zing bajar:

1. `${CLAUDE_PLUGIN_ROOT}/data/verbs.json` ni o'qi va kerakli `toifalar` massivlarini bitta ro'yxatga birlashtir.
2. `~/.claude/settings.json` ni o'qi (yo'q bo'lsa — `{}`).
3. Yoqish uchun shu kalitni qo'sh, **boshqa kalitlarga tegma**:
   ```json
   "spinnerVerbs": { "mode": "replace", "verbs": ["O'ylayapti", "..."] }
   ```
   O'chirish uchun `spinnerVerbs` kalitini butunlay o'chir.
4. Faylni 2 probel indent bilan qayta yoz.
5. Tanlovni `~/.claude/uzbekcha-spinner/state.json` ga yoz: `{ "qollangan": true, "avvalgi": null, "toifalar": ["hazil"] }`
