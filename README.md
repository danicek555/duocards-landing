# DuoCards — landing page

Animovaná jednostránková prezentace aplikace [DuoCards](https://www.duocards.com) — kartičky pro učení jazyků. Stránka láká, vysvětluje, co aplikace umí, a tlačítkem „Přihlásit se“ přesměruje na [duocards.xyz](https://duocards.xyz/).

**Živě:** [duocards-landing.vercel.app](https://duocards-landing.vercel.app)

## Spuštění lokálně

Čistě statická stránka (`index.html` + `style.css` + `script.js`) — stačí otevřít `index.html` v prohlížeči. Žádný build ani server není potřeba.

## Nasazení

Hostováno na Vercelu. Nová verze se nasadí z kořene repa:

```bash
vercel deploy --prod
```

## Technika

- Vanilla HTML/CSS/JS, bez frameworků a bez buildu
- Scroll animace přes `IntersectionObserver`, 3D CSS transformy, `requestAnimationFrame`
- Interaktivní demo kartičky (otočení + swipe vím/nevím/naučeno, klávesnice i dotyk)
- Výslovnost přes `SpeechSynthesis`, konfety, scroll-flip finální kartičky
- Respektuje `prefers-reduced-motion`, animace pouze `transform`/`opacity`
