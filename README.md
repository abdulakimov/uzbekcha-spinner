# O'zbekcha Spinner

Claude Code ishlayotganda terminalda tasodifiy inglizcha fe'l chiqadi — `Cooking…`, `Pondering…`, `Wrangling…`. Bu plugin ularni **o'zbekcha fe'llarga** almashtiradi va spinner ostiga **o'zbekcha faktlar** qo'yadi.

```
✻ Osh damlayapti… (2m 13s · ↓ 5.2k tokens)
  ⎿  Tip: Asal buzilmaydi — Misr piramidalaridan topilgan 3000 yillik asalni hamon yesa bo'lardi.

✻ Bosh qotiryapti… (1m 07s · ↓ 3.4k tokens)
  ⎿  Tip: "Algoritm" so'zi Xorazmiy ismidan kelib chiqqan.

✻ Sho'ng'iyapti… (0m 42s · ↓ 1.1k tokens)
  ⎿  Tip: Neytron yulduzdan olingan 1 choy qoshiq modda Yerda 1 milliard tonna tortadi.
```

**158 fe'l** to'rtta toifada va **300 fakt**.

## O'rnatish

```
/plugin marketplace add abdulakimov/uzbekcha-spinner
/plugin install uzbekcha-spinner@uzbekcha
```

So'ng Claude Code'ni qayta ishga tushiring — hooklar faqat seans boshida yuklanadi.

**Talab:** Node.js 18+ (`node` buyrug'i PATH'da bo'lishi kerak).

## Boshqarish

O'rnatgandan keyin fe'llar ham, faktlar ham **darhol ishlaydi** — hech narsa yoqish shart emas.

| Buyruq | Nima qiladi |
|---|---|
| `/uzbekcha` | Holatini ko'rsatadi |
| `/uzbekcha fakt off` | Faktlarni o'chiradi, fe'llar qoladi |
| `/uzbekcha fakt` | Faktlarni qaytaradi |
| `/uzbekcha hazil` | Faqat hazil fe'llari |
| `/uzbekcha hazil oshxona` | Ikki toifa birga |
| `/uzbekcha hammasi` | To'rtala toifa (default) |
| `/uzbekcha ro'yxat` | Barcha fe'llarni chiqaradi |
| `/uzbekcha faktlar` | Barcha faktlarni chiqaradi |
| `/uzbekcha off` | Hammasini o'chiradi — inglizcha qaytadi |

Fe'l toifalari: `neytral` (46) · `oshxona` (35) · `hazil` (37) · `harakat` (40).

Fe'l toifasi va fakt rejimi bir-biridan mustaqil, tanlovingiz esa saqlanadi — keyingi seanslarda ham o'sha holat tiklanadi. `/uzbekcha off` desangiz, plugin o'chgan holida qoladi: hook uni o'z-o'zidan qayta yoqmaydi.

## Qanday ishlaydi

Claude Code spinner matnini `settings.json` dagi ikkita kalitdan oladi:

```json
{
  "spinnerVerbs": { "mode": "replace", "verbs": ["O'ylayapti", "…"] },
  "spinnerTipsEnabled": true,
  "spinnerTipsOverride": { "excludeDefault": true, "tips": ["Asal buzilmaydi — …"] }
}
```

Plugin bu kalitlarni o'zi olib kela olmaydi: Claude Code plugin sozlamalarini `agent` va `subagentStatusLine` bilan cheklaydi, qolganini jimgina tashlab yuboradi. Shuning uchun plugin `SessionStart` hook orqali sizning **global `~/.claude/settings.json`** faylingizga yozadi.

Yozuv atomik va idempotent: faqat shu kalitlarga tegadi, boshqa sozlamalaringizni saqlaydi, hech narsa o'zgarmagan bo'lsa faylni umuman qayta yozmaydi. O'rnatishdan oldingi qiymatlaringiz saqlanadi va `/uzbekcha off` ularni tiklaydi.

Ikkita nozik joy bor, ikkalasi ham Claude Code kodidan aniqlangan:

- `"excludeDefault": true` **shart**. Usiz 30 soniyadan keyin chiqadigan `/btw` maslahati sizning faktingizni bosib ketadi.
- `"Tip: "` prefiksi Claude Code renderer'ida qotirilgan (`` `Tip: ${tip}` ``) — uni olib tashlab bo'lmaydi.

> **Diqqat:** pluginni o'chirish (`/plugin uninstall`) bu kalitlarni avtomatik olib tashlamaydi. Avval `/uzbekcha off` qiling.

## O'z fe'lingiz yoki faktingizni qo'shish

`data/verbs.json` yoki `data/facts.json` faylidagi tegishli toifaga qo'shing va PR yuboring.

**Fe'llar uchun:**
- `-yapti` shaklida, bosh harf bilan: `Ag'anayapti`
- Lotin alifbosi, oddiy ASCII apostrof (`o'`, `g'`) — rasmiy `oʻ` (U+02BB) emas, u ba'zi terminal shriftlarida kvadrat bo'lib chiqadi
- 20 belgidan oshmasin — uzun fe'l spinner qatorini cho'zib yuboradi

**Faktlar uchun:**
- To'liq, tugallangan jumla. Telegramma uslubi va inglizchadan kalka qilingan tuzilish yaramaydi
- **Sonlar raqam bilan** yoziladi: `3000 yillik`, `20 yildan keyin` — `uch ming`, `yigirma` emas
- Rost bo'lsin. Afsonani fakt sifatida yozmang; xohlasangiz afsona ekanini aytib yozing
- `Tip: ` prefiksi bilan o'qilishini yodda tuting

## Litsenziya

MIT
