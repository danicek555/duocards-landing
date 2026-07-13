# DuoCards — landing page

Animovaná jednostránková prezentace aplikace [DuoCards](https://www.duocards.com) — kartičky pro učení jazyků. Stránka láká, vysvětluje, co aplikace umí, a tlačítkem „Přihlásit se“ přesměruje na [app.duocards.com](https://app.duocards.com).

Jeden z projektů v repu [vibecoding](../).

## Spuštění lokálně

Čistě statická stránka (`index.html` + `style.css` + `script.js`) — stačí otevřít `index.html` v prohlížeči. Žádný build ani server není potřeba.

## Technika

- Vanilla HTML/CSS/JS, bez frameworků a bez buildu
- Scroll animace přes `IntersectionObserver`, 3D CSS transformy, `requestAnimationFrame`
- Interaktivní demo kartičky (otočení + swipe vím/nevím)
- Respektuje `prefers-reduced-motion`
