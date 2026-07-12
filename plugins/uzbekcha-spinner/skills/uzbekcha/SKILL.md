---
name: uzbekcha
description: O'zbekcha spinner fe'llarini boshqarish — yoqish, o'chirish, holatini ko'rish, ro'yxatini chiqarish
argument-hint: [on|off|holat|ro'yxat]
allowed-tools: [Bash, Read, Edit]
---

Foydalanuvchi so'rovi: `$ARGUMENTS` (bo'sh bo'lsa — `holat`).

Bu skill Claude Code spinner fe'llarini (`✻ Cooking…`) o'zbekchaga (`✻ Osh damlayapti…`) almashtirishni boshqaradi.

## Bajarish

Skriptni ishga tushir:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/uz-spinner.mjs" <buyruq>
```

| Buyruq | Nima qiladi | Keyin |
|---|---|---|
| `on` | Fe'llarni `~/.claude/settings.json` ga yozadi (`spinnerVerbs.mode = "replace"`). Jim ishlaydi. | So'ng `holat` ni ham ishga tushirib, natijani ko'rsat |
| `off` | Avvalgi qiymatni tiklaydi, bo'lmasa kalitni o'chiradi — inglizcha fe'llar qaytadi | — |
| `holat` | Yoqilganmi, nechta fe'l bor, sozlama fayli qayerda | — |
| `ro'yxat` | Hamma fe'llarni toifalar bo'yicha chiqaradi | — |

Skript chiqargan matnni foydalanuvchiga qisqacha yetkaz. Yangi fe'llar darhol kuchga kiradi — qayta ishga tushirish shart emas.

## Node topilmasa

`node` buyrug'i mavjud bo'lmasa (Claude Code'ning native o'rnatmasi), o'zing bajar:

1. `${CLAUDE_PLUGIN_ROOT}/data/verbs.json` ni o'qi va `toifalar` ichidagi barcha massivlarni bitta ro'yxatga birlashtir.
2. `~/.claude/settings.json` ni o'qi (yo'q bo'lsa — `{}`).
3. `on` uchun shu kalitni qo'sh, **boshqa kalitlarga tegma**:
   ```json
   "spinnerVerbs": { "mode": "replace", "verbs": ["O'ylayapti", "..."] }
   ```
   `off` uchun `spinnerVerbs` kalitini butunlay o'chir.
4. Faylni 2 probel indent bilan qayta yoz.
