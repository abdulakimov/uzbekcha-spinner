# O'zbekcha Spinner

Claude Code ishlayotganda terminalda tasodifiy inglizcha fe'l chiqadi — `Cooking…`, `Pondering…`, `Wrangling…`. Bu plugin ularni **o'zbekcha fe'llarga** almashtiradi.

```
✻ Osh damlayapti… (2m 13s · ↓ 5.2k tokens)
✻ Bosh qotiryapti… (1m 07s · ↓ 3.4k tokens)
✻ Sho'ng'iyapti… (0m 42s · ↓ 1.1k tokens)
✻ Imillayapti… (0m 09s · ↓ 0.3k tokens)
```

158 ta fe'l — to'rtta toifadan: ishchi (`Tekshiryapti`, `Rejalashtiryapti`), oshxona (`Non yopyapti`, `Zirvak qilyapti`), hazil (`Dovdirayapti`, `Kallasi qotyapti`) va harakat (`Titkilayapti`, `Payvandlayapti`).

## O'rnatish

```
/plugin marketplace add abdulakimov/uzbekcha-spinner
/plugin install uzbekcha-spinner@uzbekcha
```

So'ng Claude Code'ni qayta ishga tushiring — hooklar faqat seans boshida yuklanadi.

**Talab:** Node.js 18+ (`node` buyrug'i PATH'da bo'lishi kerak).

## Boshqarish

| Buyruq | Nima qiladi |
|---|---|
| `/uzbekcha` | Holatini ko'rsatadi |
| `/uzbekcha off` | Inglizcha fe'llarni qaytaradi |
| `/uzbekcha on` | Qaytadan yoqadi |
| `/uzbekcha ro'yxat` | Barcha fe'llarni chiqaradi |

## Qanday ishlaydi

Claude Code spinner fe'llarini `settings.json` dagi `spinnerVerbs` kalitidan oladi:

```json
{ "spinnerVerbs": { "mode": "replace", "verbs": ["O'ylayapti", "…"] } }
```

Plugin bu kalitni o'zi olib kela olmaydi — Claude Code plugin sozlamalarini `agent` va `subagentStatusLine` bilan cheklaydi, qolganini jimgina tashlab yuboradi. Shuning uchun plugin `SessionStart` hook orqali sizning **global `~/.claude/settings.json`** faylingizga yozadi.

Yozuv atomik va idempotent: faqat `spinnerVerbs` kalitiga tegadi, boshqa sozlamalaringizni saqlaydi, ro'yxat allaqachon o'rnatilgan bo'lsa faylni umuman o'zgartirmaydi. O'rnatishdan oldingi qiymatingiz saqlanadi va `/uzbekcha off` uni tiklaydi.

> **Diqqat:** pluginni o'chirish (`/plugin uninstall`) `spinnerVerbs` kalitini avtomatik olib tashlamaydi. Avval `/uzbekcha off` qiling.

## O'z fe'lingizni qo'shish

`plugins/uzbekcha-spinner/data/verbs.json` faylidagi tegishli toifaga qo'shing va PR yuboring. Shartlar:

- `-yapti` shaklida, bosh harf bilan: `Ag'anayapti`
- Lotin alifbosi, oddiy ASCII apostrof (`o'`, `g'`) — rasmiy `oʻ` (U+02BB) emas, u ba'zi terminal shriftlarida kvadrat bo'lib chiqadi
- 20 belgidan oshmasin — uzun fe'l spinner qatorini cho'zib yuboradi

## Litsenziya

MIT
