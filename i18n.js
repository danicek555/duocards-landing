/* DuoCards landing — 29 UI languages */
(() => {
'use strict';

const STORAGE_KEY = 'duocards-lang';
const SHARED_COOKIE_KEY = 'duocards-locale';
const PENDING_APP_COOKIE_KEY = 'duocards-locale-pending';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const LANG_COUNT = 28;
const LANG_LABEL = '28+';
const LOCALES = ['ar', 'ca', 'zh', 'cs', 'da', 'nl', 'en', 'fi', 'fr', 'de', 'el', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'no', 'pl', 'pt', 'ro', 'ru', 'es', 'sv', 'th', 'tr', 'uk', 'vi'];
const RTL_LOCALES = new Set(['ar', 'he']);
const LOCALE_TAGS = { ar: 'ar', ca: 'ca', zh: 'zh-CN', cs: 'cs-CZ', da: 'da-DK', nl: 'nl-NL', en: 'en-US', fi: 'fi-FI', fr: 'fr-FR', de: 'de-DE', el: 'el-GR', he: 'he-IL', hi: 'hi-IN', hu: 'hu-HU', id: 'id-ID', it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR', no: 'nb-NO', pl: 'pl-PL', pt: 'pt-PT', ro: 'ro-RO', ru: 'ru-RU', es: 'es-ES', sv: 'sv-SE', th: 'th-TH', tr: 'tr-TR', uk: 'uk-UA', vi: 'vi-VN' };
const refreshers = [];

const cookieAttributes = (maxAge = COOKIE_MAX_AGE) => {
  const hostname = location.hostname.toLowerCase();
  const isDuocardsDomain = hostname === 'duocards.xyz' || hostname.endsWith('.duocards.xyz');
  return [
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    ...(isDuocardsDomain ? ['Domain=.duocards.xyz', 'Secure'] : []),
  ].join('; ');
};

const readCookie = name => {
  const rawValue = document.cookie
    .split(';')
    .map(row => row.trim())
    .find(row => row.startsWith(`${name}=`))
    ?.slice(name.length + 1);
  if (!rawValue) return null;

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return null;
  }
};

const writeCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieAttributes(maxAge)}`;
};

const T = {
  en: {
    metaTitle: 'DuoCards — AI Flashcards to Learn Any Language',
    metaDesc: `Learn vocabulary in 3 seconds with AI flashcards and spaced repetition. ${LANG_LABEL} languages, swipe-to-study decks, free web app. Start at app.duocards.xyz.`,
    metaKeywords: 'language learning, flashcards, spaced repetition, vocabulary app, learn Spanish, learn German, AI translator, language flashcards, memorize words, DuoCards',
    ogTitle: 'DuoCards — Learn a Word in 3 Seconds',
    ogDesc: `AI flashcards that know when you start forgetting. Swipe, flip, and master ${LANG_LABEL} languages — free on the web.`,
    ogImageAlt: 'DuoCards — AI flashcards for language learning',
    jsonLdDesc: `DuoCards is a free web app for learning languages with AI flashcards, spaced repetition, and swipe-based study decks in ${LANG_LABEL} languages.`,
    brandAria: 'DuoCards — top of page',
    langSwitch: 'Switch to Czech',
    langLabel: 'CS',
    login: 'Sign in',
    loginArrow: 'Sign in →',
    heroTitle1: 'Learn',
    heroTitle3: 'in&nbsp;3&nbsp;seconds',
    heroSub: 'Flashcards that know the rhythm of your brain. AI builds them, spaced repetition brings them back right when you start forgetting.',
    heroCta: 'See how it works ↓',
    slotTags: ['= HELLO [ES]', '= HELLO [EN]', '= HELLO [FR]', '= HELLO [JA]', '= HELLO [DE]', '= HELLO [KO]'],
    strayFernweh: '[DE] wanderlust',
    straySobremesa: '[ES] after-dinner chat',
    strayKomore: '[JA] light through leaves',
    straySaudade: '[PT] bittersweet longing',
    flierSerendipity: '[EN] happy accident',
    flierBonjour: 'hello',
    flierNihao: 'hello',
    flierCiao: 'hey',
    chap01: '01 / TRY IT',
    demoTitle: 'Swipe. Flip. Learn.',
    demoNote: ['click = flip', '→ know', '← don\'t know', '↑ learned'],
    demoPt1b: 'Don\'t know?',
    demoPt1: 'The card goes back to the bottom of the deck.',
    demoPt2b: 'Know it?',
    demoPt2: 'It moves on — and comes back when you start forgetting.',
    demoPt3b: 'Know it three times?',
    demoPt3: 'Learned. For good.',
    pileNo: "DON'T KNOW",
    pileYes: 'KNOW',
    pileDone: 'LEARNED',
    btnNo: "✕ Don't know",
    btnFlip: 'Flip',
    btnYes: '✓ Know',
    btnDone: '↑ Learned',
    chap02: '02 / AI TRANSLATOR',
    aiTitle: 'One tap. Done card.',
    aiBody: `No typing. Tap a word, AI translates it, pronounces it, and adds it to your deck. Works in ${LANG_LABEL} languages.`,
    aiTap: '↳ tap',
    aiTrans: 'swallow',
    chap03: '03 / SPACED REPETITION',
    badgeDev: 'IN DEVELOPMENT',
    srTitle: 'Your brain has a rhythm. We know it.',
    srBody: 'Forgetting is an algorithm. Spaced repetition has a better one: it brings a card back in a day, three days, a week, a month — always just before the word slips away.',
    srAria: 'Repetition timeline: 1 day, 3 days, week, month',
    srD1: '1 DAY',
    srD2: '3 DAYS',
    srD3: 'WEEK',
    srD4: 'MONTH',
    chap04: '04 / CHROME EXTENSION',
    chromeTitle: 'Watch videos. Words save themselves.',
    chromeBody: 'Word from subtitles → card. Word from a Chrome article → card. Learn from content you already consume.',
    chap05: '05 / COMMUNITY',
    commTitle: 'Thousands of decks from people learning what you are.',
    commBody: 'Millions of community flashcards are waiting. Or build your own deck in a minute.',
    deck1: 'Spanish for your flight',
    deck2: 'Kitchen German',
    deck3: 'K-pop vocabulary',
    deck4: 'English for interviews',
    deck5: 'Japanese from anime',
    deck6: 'Italian for vacation',
    deck7: 'French for foodies',
    deck8: 'Portuguese for surfing',
    cards: 'cards',
    chap06: '06 / SCORE',
    statsTitle: 'A score that keeps growing.',
    statLangs: 'LANGUAGES',
    statPiles: 'PILES',
    statTap: 'TAP PER CARD',
    statDecks: 'COMMUNITY DECKS',
    streak: 'DAY STREAK',
    stampEn: 'English — play greeting',
    stampEs: 'Spanish — play greeting',
    stampDe: 'German — play greeting',
    stampIt: 'Italian — play greeting',
    stampCs: 'Czech — play greeting',
    stampKo: 'Korean — play greeting',
    stampPt: 'Portuguese — play greeting',
    stampSk: 'Slovak — play greeting',
    stampFr: 'French — play greeting',
    stampJa: 'Japanese — play greeting',
    stampRu: 'Russian — play greeting',
    stampTr: 'Turkish — play greeting',
    stampUk: 'Ukrainian — play greeting',
    satGracias: 'thanks',
    satBridge: 'bridge',
    satChat: 'cat',
    satWort: 'word',
    flipTitle: 'Your first word is waiting.',
    flipHint: '↓ scroll and flip the card ↓',
    flipNote: 'Free. No credit card. Swiping in a minute.',
    footer: 'DuoCards — flashcards that know the rhythm of your brain. © 2026 · ',
    cardHint: 'tap = flip',
    cardAria: (w) => `Card ${w} — Enter flips, arrows sort into piles`,
    speakAria: 'Play pronunciation',
    cardPlural: (n) => n === 1 ? '1 card' : `${n} cards`,
    demoDoneLive: (done, total) => `Demo complete. Learned ${done} of ${total} cards.`,
    demoResult: (done, total) => `Nice work.<br>You know ${done} of ${total}.`,
    demoResultNote: 'Imagine that with a whole language.',
    demoResultCta: 'Give me thousands more →',
    msgNo: (w) => `${w} → Don't know pile, back to the bottom of the deck.`,
    msgYes: (w) => `${w} → Know pile.`,
    msgYesDone: (w) => `${w} — third time known, moved to Learned.`,
    msgDone: (w) => `${w} → Learned pile.`,
    msgQueue: (msg, n) => `${msg} In deck: ${T.en.cardPlural(n)}.`,
    stampYes: "KNOW",
    stampNo: "DON'T KNOW",
    stampUp: 'LEARNED',
  },
  cs: {
    metaTitle: 'DuoCards — Nauč se jazyky s AI kartičkami',
    metaDesc: `Nauč se slovíčka za 3 vteřiny. AI kartičky se spaced repetition ve ${LANG_LABEL} jazycích. Švihej, otáčej, pamatuj — zdarma na app.duocards.xyz.`,
    metaKeywords: 'učení jazyků, kartičky, spaced repetition, slovíčka, naučit se španělsky, AI překladač, flashcards, DuoCards, výuka jazyků',
    ogTitle: 'DuoCards — Nauč se slovo za 3 vteřiny',
    ogDesc: `AI kartičky, které znají rytmus tvého mozku. Švihej, otáčej a zvládni ${LANG_LABEL} jazyků — zdarma na webu.`,
    ogImageAlt: 'DuoCards — AI kartičky pro učení jazyků',
    jsonLdDesc: `DuoCards je bezplatná webová aplikace pro učení jazyků s AI kartičkami, spaced repetition a výukou ve ${LANG_LABEL} jazycích.`,
    brandAria: 'DuoCards — začátek stránky',
    langSwitch: 'Přepnout do angličtiny',
    langLabel: 'EN',
    login: 'Přihlásit se',
    loginArrow: 'Přihlásit se →',
    heroTitle1: 'Nauč&nbsp;se',
    heroTitle3: 'za&nbsp;3&nbsp;vteřiny',
    heroSub: 'Kartičky, které znají rytmus tvého mozku. AI je vyrobí, spaced repetition je vrátí přesně ve chvíli, kdy začínáš zapomínat.',
    heroCta: 'Podívej se, jak to funguje ↓',
    slotTags: ['= AHOJ [ES]', '= AHOJ [EN]', '= AHOJ [FR]', '= AHOJ [JA]', '= AHOJ [DE]', '= AHOJ [KO]'],
    strayFernweh: '[DE] touha cestovat',
    straySobremesa: '[ES] povídání po jídle',
    strayKomore: '[JA] světlo skrz listí',
    straySaudade: '[PT] sladkobolný stesk',
    flierSerendipity: '[EN] šťastná náhoda',
    flierBonjour: 'ahoj',
    flierNihao: 'ahoj',
    flierCiao: 'čau',
    chap01: '01 / VYZKOUŠEJ',
    demoTitle: 'Švihni. Otoč. Nauč se.',
    demoNote: ['klik = otočit', '→ vím', '← nevím', '↑ naučeno'],
    demoPt1b: 'Nevíš?',
    demoPt1: 'Kartička se vrátí na dno balíčku.',
    demoPt2b: 'Víš?',
    demoPt2: 'Posune se dál — a vrátí se, až ji začneš zapomínat.',
    demoPt3b: 'Třikrát víš?',
    demoPt3: 'Naučeno. Napořád.',
    pileNo: 'NEVÍM',
    pileYes: 'VÍM',
    pileDone: 'NAUČENO',
    btnNo: '✕ Nevím',
    btnFlip: 'Otočit',
    btnYes: '✓ Vím',
    btnDone: '↑ Naučeno',
    chap02: '02 / AI PŘEKLADAČ',
    aiTitle: 'Jedno klepnutí. Hotová kartička.',
    aiBody: `Žádné vypisování. Klepneš na slovo, AI ho přeloží, vysloví a zařadí do balíčku. Funguje ve ${LANG_LABEL} jazycích.`,
    aiTap: '↳ klepnutí',
    aiTrans: 'vlaštovka',
    chap03: '03 / OPAKOVÁNÍ V INTERVALECH',
    badgeDev: 'VE VÝVOJI',
    srTitle: 'Tvůj mozek má rytmus. My ho známe.',
    srBody: 'Každé slovo zapomínáš jinak. Opakování v intervalech ti kartičku ukáže za den, za tři dny, za týden nebo za měsíc — právě ve chvíli, kdy ji potřebuješ procvičit.',
    srAria: 'Časová osa opakování: 1 den, 3 dny, týden, měsíc',
    srD1: '1 DEN',
    srD2: '3 DNY',
    srD3: 'TÝDEN',
    srD4: 'MĚSÍC',
    chap04: '04 / ROZŠÍŘENÍ PRO CHROME',
    chromeTitle: 'Koukej na videa. Slova se uloží sama.',
    chromeBody: 'Slovo z titulků → kartička. Z článku v Chromu → kartička. Učíš se z obsahu, na který stejně koukáš.',
    chap05: '05 / KOMUNITA',
    commTitle: 'Tisíce balíčků od lidí, co se učí to, co ty.',
    commBody: 'Miliony kartiček od komunity čekají. Nebo si postavíš vlastní balíček za minutu.',
    deck1: 'Španělština do letadla',
    deck2: 'Kuchyňská němčina',
    deck3: 'K-pop slovník',
    deck4: 'Angličtina na pohovor',
    deck5: 'Japonština z anime',
    deck6: 'Italština na dovolenou',
    deck7: 'Francouzština pro gurmány',
    deck8: 'Portugalština na surf',
    cards: 'karet',
    chap06: '06 / SKÓRE',
    statsTitle: 'Skóre, které roste.',
    statLangs: 'JAZYKŮ',
    statPiles: 'HROMÁDKY',
    statTap: 'KLEPNUTÍ NA KARTIČKU',
    statDecks: 'KOMUNITNÍCH BALÍČKŮ',
    streak: 'DNÍ V ŘADĚ',
    stampEn: 'Angličtina — přehrát pozdrav',
    stampEs: 'Španělština — přehrát pozdrav',
    stampDe: 'Němčina — přehrát pozdrav',
    stampIt: 'Italština — přehrát pozdrav',
    stampCs: 'Čeština — přehrát pozdrav',
    stampKo: 'Korejština — přehrát pozdrav',
    stampPt: 'Portugalština — přehrát pozdrav',
    stampSk: 'Slovenština — přehrát pozdrav',
    stampFr: 'Francouzština — přehrát pozdrav',
    stampJa: 'Japonština — přehrát pozdrav',
    stampRu: 'Ruština — přehrát pozdrav',
    stampTr: 'Turečtina — přehrát pozdrav',
    stampUk: 'Ukrajinština — přehrát pozdrav',
    satGracias: 'díky',
    satBridge: 'most',
    satChat: 'kočka',
    satWort: 'slovo',
    flipTitle: 'Tvoje první slovo čeká.',
    flipHint: '↓ scrolluj a otoč kartičku ↓',
    flipNote: 'Zdarma. Bez kreditky. Za minutu se učíš.',
    footer: 'DuoCards — kartičky, které znají rytmus tvého mozku. © 2026 · ',
    cardHint: 'klepni = otočit',
    cardAria: (w) => `Kartička ${w} — Enter otočí, šipky zařadí do hromádky`,
    speakAria: 'Přehrát výslovnost',
    cardPlural: (n) => n === 1 ? '1 karta' : (n >= 2 && n <= 4 ? `${n} karty` : `${n} karet`),
    demoDoneLive: (done, total) => `Demo dokončeno. Naučeno ${done} z ${total} karet.`,
    demoResult: (done, total) => `Šlo ti to.<br>Umíš ${done} z ${total}.`,
    demoResultNote: 'Představ si to s celým jazykem.',
    demoResultCta: 'Chci dalších tisíc →',
    msgNo: (w) => `${w} → hromádka Nevím, vrací se na dno balíčku.`,
    msgYes: (w) => `${w} → hromádka Vím.`,
    msgYesDone: (w) => `${w} — potřetí Vím, přesouvá se do Naučeno.`,
    msgDone: (w) => `${w} → hromádka Naučeno.`,
    msgQueue: (msg, n) => `${msg} V balíčku: ${T.cs.cardPlural(n)}.`,
    stampYes: 'VÍM',
    stampNo: 'NEVÍM',
    stampUp: 'NAUČENO',
  },
};

Object.entries(window.DuoLandingLocales || {}).forEach(([code, pack]) => {
  const format = (template, values) => Object.entries(values).reduce((text, [key, value]) => text.split(`{${key}}`).join(value), template);
  T[code] = {
    ...T.en,
    ...pack,
    cardAria: w => format(pack._cardAriaTpl, { w }),
    cardPlural: n => format(pack._cardPluralTpl, { n }),
    demoDoneLive: (done, total) => format(pack._demoDoneLiveTpl, { done, total }),
    demoResult: (done, total) => format(pack._demoResultTpl, { done, total }),
    msgNo: w => format(pack._msgNoTpl, { w }),
    msgYes: w => format(pack._msgYesTpl, { w }),
    msgYesDone: w => format(pack._msgYesDoneTpl, { w }),
    msgDone: w => format(pack._msgDoneTpl, { w }),
    msgQueue: (msg, n) => format(pack._msgQueueTpl, { msg, n }),
  };
});

let lang = readCookie(SHARED_COOKIE_KEY) || localStorage.getItem(STORAGE_KEY);
const urlLang = new URLSearchParams(location.search).get('lang');
if (LOCALES.includes(urlLang)) lang = urlLang;
else if (!LOCALES.includes(lang)) {
  const detected = navigator.language?.toLowerCase().split(/[-_]/)[0];
  lang = LOCALES.includes(detected) ? detected : 'en';
}

const siteOrigin = () => {
  const o = location.origin;
  return o.startsWith('http') ? o : 'https://duocards.xyz';
};

const setMeta = (id, val, attr = 'content') => {
  const el = document.getElementById(id);
  if (el && val != null) el.setAttribute(attr, val);
};

const t = key => {
  const v = T[lang]?.[key] ?? T.en[key];
  return typeof v === 'function' ? v : v;
};

const buildWt = (text) => {
  const parts = text.split(/(\s+)/);
  return parts.filter(Boolean).map(part => {
    if (/^\s+$/.test(part)) return part;
    const w = part.replace(/ /g, '&nbsp;');
    return `<span class="wm"><span class="w">${w}</span></span>`;
  }).join('');
};

const initWt = (el) => {
  el.querySelectorAll('.wm').forEach((wm, i) => {
    const w = wm.querySelector('.w');
    if (w) w.style.setProperty('--wi', i);
  });
};

const applyLang = () => {
  const L = T[lang];

  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LOCALES.has(lang) ? 'rtl' : 'ltr';
  document.title = L.metaTitle;
  setMeta('meta-desc', L.metaDesc);
  setMeta('meta-keywords', L.metaKeywords);
  setMeta('og-title', L.ogTitle);
  setMeta('og-desc', L.ogDesc);
  setMeta('tw-title', L.ogTitle);
  setMeta('tw-desc', L.ogDesc);
  setMeta('og-image-alt', L.ogImageAlt);
  setMeta('og-locale', (LOCALE_TAGS[lang] || lang).replace('-', '_'));

  const origin = siteOrigin();
  const home = `${origin}/`;
  const ogImg = `${origin}/og-image-whatsapp.png`;
  setMeta('canonical', home, 'href');
  setMeta('og-url', home);
  setMeta('og-image', ogImg);
  setMeta('tw-image', ogImg);
  LOCALES.forEach(code => {
    if (document.querySelector(`link[data-hreflang="${code}"]`)) return;
    const alternate = document.createElement('link');
    alternate.rel = 'alternate';
    alternate.hreflang = code;
    alternate.dataset.hreflang = code;
    document.head.appendChild(alternate);
  });
  document.querySelectorAll('[data-hreflang]').forEach(el => {
    el.href = `${home}?lang=${el.dataset.hreflang}`;
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${home}#website`,
        name: 'DuoCards',
        url: home,
        description: L.jsonLdDesc,
        inLanguage: LOCALE_TAGS[lang] || lang,
        publisher: { '@id': `${home}#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${home}#organization`,
        name: 'DuoCards',
        url: home,
        logo: { '@type': 'ImageObject', url: ogImg },
      },
      {
        '@type': 'WebApplication',
        '@id': `${home}#app`,
        name: 'DuoCards',
        url: 'https://app.duocards.xyz/',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        description: L.jsonLdDesc,
        inLanguage: LOCALES,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: `AI flashcards, spaced repetition, ${LANG_LABEL} languages, swipe learning, AI translator`,
      },
    ],
  };
  const ld = document.getElementById('jsonld');
  if (ld) ld.textContent = JSON.stringify(jsonLd);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = L[el.dataset.i18n];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = L[el.dataset.i18nHtml];
  });

  document.querySelectorAll('[data-i18n-wt]').forEach(el => {
    el.innerHTML = buildWt(L[el.dataset.i18nWt]);
    initWt(el);
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key && L[key] != null) el.setAttribute(attr, L[key]);
    });
  });

  const hw1 = document.querySelector('.hw1');
  const hw3 = document.querySelector('.hw3');
  if (hw1) hw1.innerHTML = L.heroTitle1;
  if (hw3) hw3.innerHTML = L.heroTitle3;

  const words = document.querySelectorAll('.slot-word');
  words.forEach((w, i) => { if (L.slotTags[i]) w.dataset.tag = L.slotTags[i]; });

  const tag = document.getElementById('slotTag');
  const active = document.querySelector('.slot-word.active') || words[0];
  if (tag && active) tag.textContent = active.dataset.tag;

  const demoNote = document.querySelector('.mono-note');
  if (demoNote) demoNote.innerHTML = L.demoNote.map(s => `<span>${s}</span>`).join('');

  const demoPts = document.querySelectorAll('.demo-points li');
  [[L.demoPt1b, L.demoPt1], [L.demoPt2b, L.demoPt2], [L.demoPt3b, L.demoPt3]].forEach(([b, txt], i) => {
    if (demoPts[i]) demoPts[i].innerHTML = `<b>${b}</b> ${txt}`;
  });

  document.querySelectorAll('.deckcard').forEach((el, i) => {
    const b = el.querySelector('b');
    const count = el.querySelector('i');
    if (b && L[`deck${i + 1}`]) b.textContent = L[`deck${i + 1}`];
    if (count) {
      const n = count.textContent.match(/\d+/);
      if (n) count.textContent = `${n[0]} ${L.cards}`;
    }
  });

  document.querySelectorAll('.sr-label').forEach((el, i) => {
    const keys = ['srD1', 'srD2', 'srD3', 'srD4'];
    if (L[keys[i]]) el.textContent = L[keys[i]];
  });

  const footer = document.querySelector('.colophon');
  if (footer) {
    footer.innerHTML = `${L.footer}<a href="https://app.duocards.xyz/" rel="noopener">app.duocards.xyz</a>`;
  }

  const select = document.getElementById('langSelect');
  if (select) select.value = lang;

  document.dispatchEvent(new CustomEvent('duocards:lang', { detail: { lang } }));
  refreshers.forEach(fn => fn(lang));
};

const setLang = next => {
  lang = LOCALES.includes(next) ? next : 'en';
  localStorage.setItem(STORAGE_KEY, lang);
  writeCookie(SHARED_COOKIE_KEY, lang);
  writeCookie(PENDING_APP_COOKIE_KEY, lang);
  applyLang();
};

const getLang = () => lang;

const onLangChange = fn => { refreshers.push(fn); };

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('langSelect');
  if (select) select.addEventListener('change', () => setLang(select.value));
  applyLang();
});

window.DuoI18n = { t, setLang, getLang, onLangChange, buildWt, initWt, T };
})();
