# DuoCards — design systém „Midnight Indigo"

Zdroj pravdy: aplikace DuoCards (`~/Desktop/Programování/duocards`, Next.js + Tailwind 4,
tokeny definované v `src/app/globals.css`). Tento dokument je framework-agnostický —
všechny barvy jsou uvedené v hex, aby šly použít i ve vanilla CSS (landing page).

Cíl pro landing page: převzít odsud barvy, font, gradienty a komponentové vzory tak,
aby landing a aplikace vypadaly jako jeden produkt.

## 1. Filozofie

- **Jeden primární akcent: indigo.** Tlačítka, odkazy, focus stavy, aktivní prvky.
- **Violet je vyhrazený výhradně pro AI / premium funkce** (AI Generate, AI chat, coiny ne — ty jsou amber). Nikdy ho nepoužívat na běžné akce.
- **Sémantické barvy:** emerald = úspěch / public kódy, red = chyba / destruktivní, amber = coiny / streak / varování.
- **Dva režimy řízené OS** (`prefers-color-scheme`), žádný ruční přepínač. Landing musí fungovat v obou.
- Tmavý režim není „černá": plochy jsou modře tónované půlnoční odstíny.
- Málo barev, hodně neutrálů. Barva znamená akci nebo význam, ne dekoraci.

## 2. Barevné palety (hex)

### Neutrály „midnight" (modře tónovaná šedá)
| Token | Hex | Použití (light) | Použití (dark) |
|---|---|---|---|
| gray-50 | `#f7f9fc` | jemné pozadí sekcí | — |
| gray-100 | `#eef2f8` | hover ploch, chipy | text nadpisů |
| gray-200 | `#dfe6f0` | rámečky karet | — |
| gray-300 | `#c3cfe0` | oddělovače | sekundární text |
| gray-400 | `#94a5c0` | placeholder, ikony | tlumený text (min. AA na gray-800) |
| gray-500 | `#64748f` | tlumený text | tlumený text |
| gray-600 | `#475572` | sekundární text | — |
| gray-700 | `#334059` | primární text (na světlé) | rámečky, hover ploch |
| gray-800 | `#1d2739` | — | plocha karet a sidebaru |
| gray-900 | `#12192b` | nadpisy (na světlé) | pozadí stránky (začátek gradientu) |
| gray-950 | `#0a0f1e` | — | nejhlubší pozadí (body) |

### Primární akcent — indigo
| Token | Hex | Poznámka |
|---|---|---|
| blue-50 | `#eef2ff` | tinty pozadí, začátek světlého gradientu |
| blue-100 | `#e0e7ff` | konec světlého gradientu, pill pozadí |
| blue-300 | `#a5b4fc` | dark: text na tintech |
| blue-400 | `#818cf8` | dark: odkazy, ikony |
| blue-500 | `#6366f1` | focus ring |
| blue-600 | `#4f46e5` | **primární tlačítka, odkazy, aktivní stavy** |
| blue-700 | `#4338ca` | hover primárních tlačítek |
| blue-900 | `#312e81` | dark: tinty `rgba(49,46,129,.2–.3)` |

### AI / premium — violet
| Token | Hex | Poznámka |
|---|---|---|
| purple-100 | `#ede9fe` | světlý AI tag / chip |
| purple-300 | `#c4b5fd` | dark: text AI tagu |
| purple-400 | `#a78bfa` | dark: AI ikony, hodnota AI coinů |
| purple-600 | `#7c3aed` | **začátek AI gradientu**, AI ikony (light) |
| purple-700 | `#6d28d9` | text AI tagu (light) |
| purple-900 | `#4c1d95` | dark: AI tinty `rgba(76,29,149,.3)` |

### Sémantické
- Úspěch / public kód: emerald — text `#059669` (light) / `#34d399` (dark), tint `#ecfdf5` / `rgba(6,78,59,.2)`
- Chyba / destruktivní: red-600 `#dc2626`, tinty `#fee2e2` / `rgba(127,29,29,.3)`
- Coiny / streak / varování: amber — `#f59e0b` (500), `#d97706` (600), tint `#fffbeb`

## 3. Typografie

- **Písmo: Geist Sans** (Google Fonts / vercel), fallback `ui-sans-serif, system-ui, sans-serif`. Vše `antialiased`.
- **Geist Mono** výhradně pro kódy (public code, room code) a časovače.
- Škála v aplikaci: h1 brand 24 px bold; nadpis obrazovky 30 px bold, `letter-spacing: -0.025em`; nadpis karty 18 px semibold; běžný text 14–16 px; meta/labely 12 px.
- Brand „DuoCards" v sidebaru: gradientový text indigo→violet
  (`background: linear-gradient(90deg, #4f46e5, #7c3aed)`, dark: `#818cf8 → #a78bfa`; `background-clip: text; color: transparent`).

## 4. Pozadí a gradienty

- **Podpisové pozadí aplikace** (každá obrazovka, směr 135°/to bottom-right):
  - light: `linear-gradient(135deg, #eef2ff, #e0e7ff)`
  - dark: `linear-gradient(135deg, #12192b, #1d2739)`
- **AI gradient** (tlačítka a hlavičky AI funkcí): `linear-gradient(90deg, #7c3aed, #4f46e5)`; plošná verze pro pozadí sekcí: `#f5f3ff → #eef2ff` (dark: tinty `rgba(76,29,149,.2) → rgba(49,46,129,.2)`).
- ::selection: pozadí `#4f46e5`, text bílý.
- Scrollbary tenké, barva palce `#94a5c0` (light) / `#334059` (dark), track průhledný.

## 5. Komponentové vzory

### Tlačítka
Společné: `border-radius: 12px; font-weight: 500; font-size: 14px; padding: 10px 16px;`
přechod `transition: all .15s`, aktivní stisk `transform: scale(.98)`, disabled `opacity: .5`.

- **Primární:** pozadí `#4f46e5`, text bílý, hover `#4338ca`.
- **Sekundární / outline:** pozadí bílá (dark `#1d2739`), rámeček `#dfe6f0` (dark `#334059`), text `#12192b` (dark bílá), hover: rámeček `#4f46e5` + jemný stín.
- **AI (gradientové):** AI gradient, text bílý, stín `0 4px 6px rgba(124,58,237,.25)`, hover `filter: brightness(1.1)` + větší stín. Ikona jiskry/žárovky vlevo.
- **Destruktivní:** tint `#fee2e2` + text `#dc2626` (menší akce) nebo plná `#dc2626` + bílá.

### Karty
- Plocha: bílá (dark `#1d2739`), `border-radius: 16px`, rámeček 1 px `#dfe6f0` (dark `#334059`), stín `0 4px 6px rgba(0,0,0,.07)`.
- Hover (klikatelné karty): stín `0 20px 25px rgba(0,0,0,.1)`, `transform: translateY(-2px)`, rámeček `#818cf8`.
- Poloprůhledná toolbar plocha (filtry): `rgba(255,255,255,.7)` / dark `rgba(29,39,57,.6)` + `backdrop-filter: blur(8px)`, radius 16 px.

### Formulářové prvky
- Input/select: radius 12 px, rámeček `#dfe6f0` (dark `#475572`), pozadí bílá (dark `rgba(18,25,43,.6)`), text tmavý/bílý, placeholder `#94a5c0`.
- Focus: `outline: none; box-shadow: 0 0 0 2px #6366f1; border-color: transparent;`

### Pills / tagy
- Radius plný (`999px`), 12 px text, padding `4px 12px`.
- Default: pozadí `#eef2f8` (dark `#334059`), text `#475572` (dark `#c3cfe0`).
- Vybraný / aktivní: pozadí `#4f46e5`, text bílý, jemný indigo stín.
- **„AI Generated": vždy violet** — `#ede9fe` + text `#6d28d9` (dark `rgba(76,29,149,.3)` + `#c4b5fd`).
- Počet karet (count pill): tint `#eef2ff` + text `#4f46e5` (dark `rgba(49,46,129,.3)` + `#a5b4fc`).
- Přetečení: zobrazit max ~5–10, zbytek `+N` v tlumené barvě.

### Modaly
- Backdrop jednotně: `rgba(0,0,0,.6)` + `backdrop-filter: blur(4px)`.
- Panel: radius 16 px, plocha jako karta, stín `0 25px 50px rgba(0,0,0,.25)`.

## 6. Interakce a pohyb

- Přechody krátké (150 ms, `all` nebo `colors`), hover zdvih karet `-2px`.
- Stisknutí čehokoli klikatelného: `scale(.98)`.
- Žádné dlouhé/hravé animace v aplikaci; landing si smí dovolit víc (scroll reveal), ale respektovat `prefers-reduced-motion`.

## 7. Pokyny pro redesign landing page (`vibecoding/duocards`)

1. Zahodit současnou paletu paper/lime (`--paper #F5F0E6`, `--lime #C8F031`…) a neo-brutalistický styl. Nahradit tokeny z tohoto dokumentu.
2. Podpora obou režimů přes `@media (prefers-color-scheme: dark)` — světlý default, tmavý = půlnoční plochy výše. (Aplikace nemá přepínač, landing ho nezavádí.)
3. Font: načíst Geist (např. `<link>` na Google Fonts nebo lokální woff2) + Geist Mono pro ukázky kódů.
4. Pozadí hero i sekcí: podpisový gradient; karty a demo kartička podle vzoru „Karty".
5. CTA „Přihlásit se" = primární indigo tlačítko; jakákoli zmínka AI funkcí = violet/AI gradient.
6. Zachovat funkčnost: scroll animace, interaktivní demo kartičky (flip/swipe), `prefers-reduced-motion`, přesměrování tlačítek beze změny.
7. Emoji vlajky a maskoti jsou v pořádku; nezavádět nové akcentové barvy mimo tento dokument.
