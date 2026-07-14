# DuoCards — landing page

Responzivní jednostránková prezentace aplikace [DuoCards](https://duocards.xyz/) pro učení jazyků pomocí kartiček. Vysvětluje hlavní funkce aplikace, nabízí interaktivní demo a přesměruje uživatele k přihlášení do [app.duocards.xyz](https://app.duocards.xyz/).

**Živě:** [duocards.xyz](https://duocards.xyz/)

## Co stránka obsahuje

- Interaktivní balíček s otočením a gesty „vím“, „nevím“ a „naučeno“
- Mobilní animace, zvuková a vibrační odezva při třídění kartiček
- Ukázku AI překladače, opakování v intervalech, Chrome rozšíření a komunitních balíčků
- Přepínání mezi 29 jazyky včetně arabštiny, čínštiny, japonštiny a hebrejštiny
- Responzivní rozložení pro mobil, tablet i desktop
- SEO metadata a samostatný obrázek pro náhled při sdílení

## Spuštění lokálně

Jde o čistě statickou stránku bez buildu. Pro lokální spuštění stačí v kořeni repozitáře spustit:

```bash
python3 -m http.server 4173
```

Stránka pak poběží na [localhost:4173](http://localhost:4173/).

## Nasazení

Hostováno na Vercelu. Nová verze se nasadí z kořene repa:

```bash
vercel deploy --prod
```

## Technika

- Vanilla HTML/CSS/JS, bez frameworků a bez buildu
- Základní lokalizace v `i18n.js`, generované jazykové balíčky v `landing-locales.js`
- Zvolený jazyk se ukládá do `localStorage`; arabština a hebrejština používají RTL rozložení
- Scroll animace přes `IntersectionObserver`, 3D CSS transformy, `requestAnimationFrame`
- Interaktivní demo ovladatelné dotykem, myší i klávesnicí
- Výslovnost přes `SpeechSynthesis`, krátké UI tóny přes Web Audio API
- Respektuje `prefers-reduced-motion` a bezpečně se přizpůsobuje úzkým displejům
- Open Graph a Twitter metadata používají obrázek `og-image-whatsapp.png` (1200 × 630 px)
