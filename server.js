require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const ui = require('./i18n-ui.json');
const { text: contentText, meta } = require('./i18n-content');

const app = express();
const PORT = process.env.PORT || 3000;

// Set SITE_URL in production, e.g. https://meteorpanorama.com
const SITE_URL = (process.env.SITE_URL || 'https://meteorpanorama.com').replace(/\/+$/, '');
const LANGS = ['tr', 'de', 'en'];
const DEFAULT_LANG = 'tr';
const LANGUAGE_LABELS = { tr: 'TR', de: 'DE', en: 'EN' };
const OG_LOCALES = { tr: 'tr_TR', de: 'de_DE', en: 'en_GB' };

// ---------------------------------------------------
// Page registry — one template, three rendered languages
// ---------------------------------------------------
const PAGES = {
  home: { file: 'index.html', slug: '' },
  'cam-balkon': { file: 'cam-balkon.html', slug: 'cam-balkon' },
  'pvc-sistemleri': { file: 'pvc-sistemleri.html', slug: 'pvc-sistemleri' },
  'giyotin-cam': { file: 'giyotin-cam.html', slug: 'giyotin-cam' },
  'kis-bahcesi': { file: 'kis-bahcesi.html', slug: 'kis-bahcesi' },
  'surme-cam': { file: 'surme-cam.html', slug: 'surme-cam' }
};

const PAGE_KEYS = Object.keys(PAGES);
const PATH_TO_PAGE = new Map();
for (const pageKey of PAGE_KEYS) {
  const slug = PAGES[pageKey].slug;
  if (slug) PATH_TO_PAGE.set('/' + slug, pageKey);
}
PATH_TO_PAGE.set('/', 'home');

// Stable sitemap timestamp: newest content/template mtime, not request time.
const SITEMAP_LASTMOD = (() => {
  const files = [
    ...PAGE_KEYS.map((key) => PAGES[key].file),
    'i18n-content.js',
    'i18n-ui.json'
  ];
  let latest = 0;
  for (const file of files) {
    try { latest = Math.max(latest, fs.statSync(path.join(__dirname, file)).mtimeMs); } catch (err) {}
  }
  return new Date(latest || Date.now()).toISOString();
})();

function normalizeText(value) {
  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

// Turkish source text -> localized text, built once at startup.
const TEXT_MAP = new Map();
for (const entry of contentText) {
  if (!entry || !entry[0]) continue;
  TEXT_MAP.set(normalizeText(entry[0]), { de: entry[1], en: entry[2] });
}

function pathFor(pageKey, lang) {
  const slug = PAGES[pageKey].slug;
  const prefix = lang === DEFAULT_LANG ? '' : '/' + lang;
  if (!slug) return prefix || '/';
  return prefix + '/' + slug;
}

function absoluteUrl(pathname) {
  return SITE_URL + (pathname || '/');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value) {
  return escapeHtml(value);
}

function translateValue(value, lang) {
  if (lang === DEFAULT_LANG || !value) return null;
  const entry = TEXT_MAP.get(normalizeText(value));
  if (!entry) return null;
  return entry[lang] || null;
}

function translateTextNodes(node, lang) {
  if (node.type === 'text') {
    const raw = node.data;
    if (!raw || !/\S/.test(raw)) return;
    const translated = translateValue(raw, lang);
    if (!translated) return;
    const leading = raw.match(/^\s*/)[0];
    const trailing = raw.match(/\s*$/)[0];
    node.data = leading + translated + trailing;
    return;
  }

  if (node.type !== 'tag' && node.type !== 'root') return;
  if (node.type === 'tag' && ['script', 'style', 'svg'].includes(node.name)) return;
  for (const child of node.children || []) translateTextNodes(child, lang);
}

function applyUiTranslations($, lang) {
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    const value = (ui[lang] && ui[lang][key]) || (ui[DEFAULT_LANG] && ui[DEFAULT_LANG][key]);
    if (value != null) $(el).text(value);
  });

  $('[data-i18n-ph]').each((_, el) => {
    const key = $(el).attr('data-i18n-ph');
    const value = (ui[lang] && ui[lang][key]) || (ui[DEFAULT_LANG] && ui[DEFAULT_LANG][key]);
    if (value != null) $(el).attr('placeholder', value);
  });

  // Accessible labels that are not represented by text nodes.
  $('nav.nav').attr('aria-label', ui[lang].main_nav_label || ui.tr.main_nav_label);
  $('.lang').attr('aria-label', ui[lang].language_label || ui.tr.language_label);
  $('.menu-toggle').attr('aria-label', ui[lang].menu_label || ui.tr.menu_label);
  $('.breadcrumb').attr('aria-label', ui[lang].breadcrumb_label || ui.tr.breadcrumb_label);
  $('.social').attr('aria-label', ui[lang].social_label || ui.tr.social_label);
  $('#chatInput').attr('aria-label', ui[lang].chat_placeholder || ui.tr.chat_placeholder);
}

function translateAttributes($, lang) {
  if (lang === DEFAULT_LANG) return;
  $('*').each((_, el) => {
    for (const attr of ['placeholder', 'alt', 'aria-label', 'title']) {
      const current = $(el).attr(attr);
      if (!current) continue;
      const translated = translateValue(current, lang);
      if (translated) $(el).attr(attr, translated);
    }
  });
}

function localizeHref(href, lang) {
  if (!href) return href;
  if (href.startsWith('#') || /^(mailto:|tel:|https?:|\/\/|javascript:|data:)/i.test(href)) return href;

  const hashIndex = href.indexOf('#');
  let pathname = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  if (!pathname) return href;

  if (!pathname.startsWith('/')) pathname = '/' + pathname.replace(/^\.\//, '');
  pathname = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');

  // Also accept already-localized links and re-localize them.
  const langPrefix = pathname.match(/^\/(de|en)(?=\/|$)/);
  if (langPrefix) pathname = pathname.slice(langPrefix[0].length) || '/';
  if (pathname === '/tr') pathname = '/';
  if (pathname.startsWith('/tr/')) pathname = pathname.slice(3);

  if (pathname === '') pathname = '/';
  if (pathname === '/') return pathFor('home', lang) + hash;
  if (pathname.startsWith('/assets/') || pathname === '/styles.css' || pathname === '/script.js' ||
      pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname.startsWith('/api/')) {
    return href;
  }

  const pageKey = PATH_TO_PAGE.get(pathname);
  if (!pageKey) return href;
  return pathFor(pageKey, lang) + hash;
}

function localizeInternalLinks($, lang) {
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const localized = localizeHref(href, lang);
    if (localized !== href) $(el).attr('href', localized);
  });

  // Make image and stylesheet paths safe for /de/ and /en/ routes.
  $('[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !/^(https?:|data:|\/|#)/i.test(src)) {
      $(el).attr('src', '/' + src.replace(/^\.\//, ''));
    }
  });
}

function updateLanguageLinks($, pageKey, lang) {
  $('[data-lang-link]').each((_, el) => {
    const target = $(el).attr('data-lang-link');
    if (!LANGS.includes(target)) return;
    $(el).attr('href', pathFor(pageKey, target));
    $(el).attr('hreflang', target);
    $(el).attr('lang', target);
    $(el).toggleClass('active', target === lang);
    if (target === lang) $(el).attr('aria-current', 'page');
    else $(el).removeAttr('aria-current');
  });
}

const WHATSAPP_MESSAGES = {
  home: {
    tr: 'Merhaba, web sitenizdeki ürünler hakkında bilgi ve teklif almak istiyorum.',
    de: 'Hallo, ich möchte Informationen und ein Angebot zu Ihren Produkten anfordern.',
    en: 'Hello, I would like information and a quote about your products.'
  },
  'cam-balkon': {
    tr: 'Merhaba, cam balkon sistemleri hakkında bilgi ve teklif almak istiyorum.',
    de: 'Hallo, ich möchte Informationen und ein Angebot zu Balkonverglasungen anfordern.',
    en: 'Hello, I would like information and a quote about balcony glazing systems.'
  },
  'pvc-sistemleri': {
    tr: 'Merhaba, PVC pencere ve kapı sistemleri hakkında bilgi ve teklif almak istiyorum.',
    de: 'Hallo, ich möchte Informationen und ein Angebot zu PVC-Fenster- und Türsystemen anfordern.',
    en: 'Hello, I would like information and a quote about PVC window and door systems.'
  },
  'giyotin-cam': {
    tr: 'Merhaba, motorlu giyotin cam sistemleri hakkında bilgi ve teklif almak istiyorum.',
    de: 'Hallo, ich möchte Informationen und ein Angebot zu elektrischen Guillotine-Glassystemen anfordern.',
    en: 'Hello, I would like information and a quote about motorized guillotine glass systems.'
  },
  'kis-bahcesi': {
    tr: 'Merhaba, kış bahçesi sistemleri hakkında bilgi ve teklif almak istiyorum.',
    de: 'Hallo, ich möchte Informationen und ein Angebot zu Wintergartensystemen anfordern.',
    en: 'Hello, I would like information and a quote about winter garden systems.'
  },
  'surme-cam': {
    tr: 'Merhaba, alüminyum sürme sistemler hakkında bilgi ve teklif almak istiyorum.',
    de: 'Hallo, ich möchte Informationen und ein Angebot zu Aluminium-Schiebeglassystemen anfordern.',
    en: 'Hello, I would like information and a quote about aluminium sliding glass systems.'
  }
};

function localizeWhatsAppLinks($, pageKey, lang) {
  const message = (WHATSAPP_MESSAGES[pageKey] && WHATSAPP_MESSAGES[pageKey][lang]) || WHATSAPP_MESSAGES.home[lang];
  $('a[href^="https://wa.me/905308447736"]').each((_, el) => {
    const href = $(el).attr('href');
    const classes = $(el).attr('class') || '';
    let url;
    try {
      url = new URL(href);
    } catch (err) {
      return;
    }
    const shouldPrefill = url.searchParams.has('text') || /\b(wa-float|btn-wa|hero-card|btn-line)\b/.test(classes);
    if (!shouldPrefill) return;
    url.searchParams.set('text', message);
    $(el).attr('href', url.toString());
  });
}


// ---------------------------------------------------
// Server-side price rendering (so no-JS and crawlers see localized prices)
// ---------------------------------------------------
const PRICE_RATES = {
  isicamli:   { tr: [3400, 4400],   eu: [140, 190] },
  mevlana:    { tr: [2400, 3200],   eu: [100, 140] },
  pvc:        { tr: [2800, 3900],   eu: [120, 170] },
  giyotin:    { tr: [6400, 8600],   eu: [280, 380] },
  kisbahcesi: { tr: [10500, 14200], eu: [460, 610] },
  surme:      { tr: [3800, 5100],   eu: [160, 215] }
};

const PRODUCT_UI_KEYS = {
  isicamli: 'p1_title',
  mevlana: 'mevlana_title',
  pvc: 'p5_title',
  giyotin: 'p2_title',
  kisbahcesi: 'p3_title',
  surme: 'p4_title'
};

const CALC_DEFAULTS = {
  home: { product: 'isicamli', width: 3.5, height: 1.6 },
  'cam-balkon': { product: 'isicamli', width: 4.0, height: 1.7 },
  'pvc-sistemleri': { product: 'pvc', width: 2.5, height: 1.5 },
  'giyotin-cam': { product: 'giyotin', width: 3.5, height: 2.4 },
  'kis-bahcesi': { product: 'kisbahcesi', width: 5.0, height: 3.0 },
  'surme-cam': { product: 'surme', width: 4.0, height: 2.2 }
};

function priceLocale(lang) {
  return lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-GB';
}

function moneyForLang(value, lang) {
  return value.toLocaleString(priceLocale(lang)) + (lang === 'tr' ? ' ₺' : ' €');
}

function decimalForLang(value, digits, lang) {
  return value.toLocaleString(priceLocale(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

const SHAPE_MODS = { duz: 1, 'l-tipi': 1.08, 'u-tipi': 1.15 };
const GLASS_MODS = { seffaf: 1, fume: 1.07, bronz: 1.07, reflekte: 1.12 };

function estimateFor($, pageKey, lang) {
  const fallback = CALC_DEFAULTS[pageKey];
  if (!fallback) return null;

  const activeProduct = $('.choice[data-product].active').first().attr('data-product');
  const activeShape = $('.choice[data-shape].active').first().attr('data-shape');
  const product = activeProduct || fallback.product;
  const shape = activeShape || 'duz';
  const width = parseFloat($('#inputWidth').attr('value')) || fallback.width;
  const height = parseFloat($('#inputHeight').attr('value')) || fallback.height;
  const glass = $('#glassType option:selected').attr('value') || 'seffaf';

  const rates = PRICE_RATES[product];
  if (!rates) return null;
  const area = Math.round(width * height * 100) / 100;
  const range = rates[lang === 'tr' ? 'tr' : 'eu'];
  const modifier = (SHAPE_MODS[shape] || 1) * (GLASS_MODS[glass] || 1);
  const round = lang === 'tr' ? 50 : 10;
  const min = Math.round(area * range[0] * modifier / round) * round;
  const max = Math.round(area * range[1] * modifier / round) * round;
  return { product, shape, width, height, area, min, max };
}

function applyLocalizedPrices($, pageKey, lang) {
  // Homepage "starting at" cards.
  $('[data-price-code]').each((_, el) => {
    const code = $(el).attr('data-price-code');
    const codeMap = { isicam: 'isicamli', mevlana: 'mevlana', pvc: 'pvc', giyotin: 'giyotin', kisbahcesi: 'kisbahcesi', surme: 'surme' };
    const rates = PRICE_RATES[codeMap[code]];
    if (rates) $(el).text(moneyForLang(rates[lang === 'tr' ? 'tr' : 'eu'][0], lang));
  });

  // Product cards keep a secondary euro figure in Turkish. In DE/EN show only EUR.
  if (lang !== 'tr') {
    $('strong').each((_, el) => {
      const $el = $(el);
      const $small = $el.find('small');
      if (!$small.length) return;
      const smallText = $small.text();
      if (!/€/.test(smallText) || !/₺/.test($el.text())) return;
      const eur = smallText.replace(/[()]/g, '').trim();
      $el.text(eur);
    });
  }

  const estimate = estimateFor($, pageKey, lang);
  if (!estimate) return;
  const { product, width, height, area, min, max } = estimate;
  $('#resPriceDisplay').text(moneyForLang(min, lang) + ' – ' + moneyForLang(max, lang));
  const productLabel = ui[lang] && ui[lang][PRODUCT_UI_KEYS[product]];
  if (productLabel) $('#resProduct').text(productLabel);
  $('#resDimensions').text(
    decimalForLang(width, 1, lang) + ' × ' + decimalForLang(height, 1, lang) + ' m'
  );
  $('#resTotalArea').text(decimalForLang(area, 2, lang) + ' m²');
}

function applyMeta($, pageKey, lang) {
  const pageMeta = meta[pageKey] && meta[pageKey][lang];
  if (!pageMeta) return;

  const canonicalPath = pathFor(pageKey, lang);
  const canonical = absoluteUrl(canonicalPath);
  const image = pageMeta.image.startsWith('http') ? pageMeta.image : absoluteUrl(pageMeta.image);

  $('html').attr('lang', lang);
  $('html').attr('dir', 'ltr');
  $('title').text(pageMeta.title);

  let description = $('meta[name="description"]');
  if (!description.length) description = $('<meta>').attr('name', 'description');
  description.attr('content', pageMeta.description);
  $('head').append(description);

  // Rebuild SEO tags that depend on the active language.
  $('meta[property^="og:"]').remove();
  $('meta[name^="twitter:"]').remove();
  $('link[rel="canonical"]').remove();
  $('link[rel="alternate"][hreflang]').remove();
  $('meta[name="robots"]').remove();

  $('head').append($('<meta>').attr('name', 'robots').attr('content', 'index, follow, max-image-preview:large'));
  $('head').append($('<link>').attr('rel', 'canonical').attr('href', canonical));

  for (const altLang of LANGS) {
    $('head').append(
      $('<link>')
        .attr('rel', 'alternate')
        .attr('hreflang', altLang)
        .attr('href', absoluteUrl(pathFor(pageKey, altLang)))
    );
  }
  $('head').append(
    $('<link>')
      .attr('rel', 'alternate')
      .attr('hreflang', 'x-default')
      .attr('href', absoluteUrl(pathFor(pageKey, DEFAULT_LANG)))
  );

  const ogTags = [
    ['og:title', pageMeta.title],
    ['og:description', pageMeta.description],
    ['og:type', 'website'],
    ['og:url', canonical],
    ['og:image', image],
    ['og:image:alt', pageMeta.title],
    ['og:site_name', 'Meteor Panorama'],
    ['og:locale', OG_LOCALES[lang]]
  ];
  for (const altLang of LANGS) {
    if (altLang !== lang) ogTags.push(['og:locale:alternate', OG_LOCALES[altLang]]);
  }
  for (const [property, content] of ogTags) {
    $('head').append($('<meta>').attr('property', property).attr('content', content));
  }

  $('head').append($('<meta>').attr('name', 'twitter:card').attr('content', 'summary_large_image'));
  $('head').append($('<meta>').attr('name', 'twitter:title').attr('content', pageMeta.title));
  $('head').append($('<meta>').attr('name', 'twitter:description').attr('content', pageMeta.description));
  $('head').append($('<meta>').attr('name', 'twitter:image').attr('content', image));

  // Structured data helps search engines connect all language variants to one business.
  $('script[data-seo="local-business"]').remove();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'Meteor Panorama',
    url: canonical,
    '@id': SITE_URL + '/#organization',
    inLanguage: lang,
    image,
    telephone: '+90 530 844 77 36',
    email: 'info@meteorpanorama.com',
    priceRange: lang === 'tr' ? '₺₺' : '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mimarsinan OSB 25. Cad. No:7',
      addressLocality: 'Melikgazi / Kayseri',
      addressCountry: 'TR'
    },
    areaServed: ['TR', 'DE', 'EU'],
    availableLanguage: ['Turkish', 'German', 'English'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:30',
      closes: '18:30'
    }
  };
  $('head').append(
    $('<script>')
      .attr('type', 'application/ld+json')
      .attr('data-seo', 'local-business')
      .text(JSON.stringify(structuredData))
  );
}

function renderPage(res, pageKey, lang) {
  const file = path.join(__dirname, PAGES[pageKey].file);
  let html;
  try {
    html = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error('Template read error:', err.message);
    return res.status(500).send('Template unavailable');
  }

  const $ = cheerio.load(html, { decodeEntities: true });
  $('body').attr('data-page', pageKey);

  // Kayseri ve çevre iller duyuru bandı yalnızca Türkçe dilinde gösterilir.
  if (lang !== 'tr') {
    $('.announcement-ticker').remove();
  }

  applyUiTranslations($, lang);
  translateAttributes($, lang);
  translateTextNodes($.root()[0], lang);
  localizeInternalLinks($, lang);
  updateLanguageLinks($, pageKey, lang);
  localizeWhatsAppLinks($, pageKey, lang);
  applyLocalizedPrices($, pageKey, lang);
  applyMeta($, pageKey, lang);

  // Expose the current UI dictionary to the browser for dynamic content.
  const clientData = {
    lang,
    page: pageKey,
    ui: ui[lang] || ui.tr
  };
  const serialized = JSON.stringify(clientData).replace(/</g, '\\u003c');
  const script = $('<script>').attr('id', 'meteor-i18n').text(`window.__METEOR_I18N__ = ${serialized};`);
  const mainScript = $('script[src^="/script.js"], script[src^="script.js"]').first();
  if (mainScript.length) mainScript.before(script);
  else $('body').append(script);

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Language', lang);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.send($.html());
}

function render404(req, res, lang) {
  const copy = {
    tr: {
      title: 'Sayfa bulunamadı | Meteor Panorama',
      heading: 'Sayfa bulunamadı',
      text: 'Aradığınız sayfa taşınmış veya kaldırılmış olabilir.',
      home: 'Ana sayfaya dön',
      contact: 'İletişim'
    },
    de: {
      title: 'Seite nicht gefunden | Meteor Panorama',
      heading: 'Seite nicht gefunden',
      text: 'Die gesuchte Seite wurde möglicherweise verschoben oder entfernt.',
      home: 'Zur Startseite',
      contact: 'Kontakt'
    },
    en: {
      title: 'Page not found | Meteor Panorama',
      heading: 'Page not found',
      text: 'The page you are looking for may have been moved or removed.',
      home: 'Back to home',
      contact: 'Contact'
    }
  }[lang] || null;
  const c = copy || {
    title: 'Sayfa bulunamadı | Meteor Panorama',
    heading: 'Sayfa bulunamadı',
    text: 'Aradığınız sayfa taşınmış veya kaldırılmış olabilir.',
    home: 'Ana sayfaya dön',
    contact: 'İletişim'
  };

  res.status(404);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Language', lang);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  return res.send(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${escapeHtml(c.title)}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="section" style="max-width:680px;margin:12vh auto;">
    <p class="eyebrow">404</p>
    <h1>${escapeHtml(c.heading)}</h1>
    <p style="margin:16px 0 28px;">${escapeHtml(c.text)}</p>
    <p><a class="btn btn-dark" href="${pathFor('home', lang)}">${escapeHtml(c.home)}</a></p>
    <p style="margin-top:22px;"><a href="${pathFor('home', lang)}#iletisim">${escapeHtml(c.contact)}</a></p>
  </main>
</body>
</html>`);
}

// ---------------------------------------------------
// Security and content headers
// ---------------------------------------------------
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------
// API — AI chat proxy and Telegram lead notification
// ---------------------------------------------------
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY is not set; /api/chat is disabled until configured.');
}
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are not set; /api/lead is disabled until configured.');
}

// Small in-memory abuse guard for the public API endpoints. For multi-instance
// deployments put a shared rate limiter in front of the app instead.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateBuckets = new Map();
function rateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start >= RATE_LIMIT_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.start + RATE_LIMIT_WINDOW_MS - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.start >= RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service is not configured' });
    }
    const rawMessages = req.body && req.body.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    const totalLength = rawMessages.reduce((sum, m) => sum + ((m && typeof m.content === 'string') ? m.content.length : 0), 0);
    if (totalLength > 16000 || rawMessages.some((m) => m && typeof m.content === 'string' && m.content.length > 6000)) {
      return res.status(413).json({ error: 'Message too long' });
    }
    const messages = rawMessages
      .filter((m) => m && ['user', 'assistant', 'system'].includes(m.role) && typeof m.content === 'string')
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    const models = [
      'openrouter/free',
      'google/gemma-4-31b-it:free',
      'liquid/lfm-2.5-2.6b:free',
      'cohere/north-mini-code:free'
    ];

    let botReply = '';
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Meteor Panorama AI Live Chat'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            max_tokens: 1500
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          lastError = new Error(`Model ${model} HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices && data.choices[0] && data.choices[0].message
          ? data.choices[0].message.content
          : '';

        if (content && content.trim()) {
          botReply = content.trim();
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!botReply) throw (lastError || new Error('Yapay zeka yanıt üretemedi'));
    return res.json({ reply: botReply });
  } catch (err) {
    console.error('Chat API Error:', err.message || err);
    return res.status(500).json({ error: 'Sohbet servisinde bir gecikme oluştu' });
  }
});

const LEAD_COPY = {
  tr: {
    title: '🔔 YENİ MÜŞTERİ TALEBİ (Meteor Panorama)',
    customer: '👤 Müşteri',
    phone: '📞 Telefon',
    note: '📝 Talep / Not',
    lang: '🌐 Site Dili',
    date: '🕒 Tarih',
    footer: '💬 Müşteriye doğrudan bu numaradan dönüş yapabilirsiniz.',
    notProvided: 'Belirtilmedi',
    locale: 'tr-TR'
  },
  de: {
    title: '🔔 NEUE KUNDENANFRAGE (Meteor Panorama)',
    customer: '👤 Kunde',
    phone: '📞 Telefon',
    note: '📝 Anfrage / Notiz',
    lang: '🌐 Website-Sprache',
    date: '🕒 Datum',
    footer: '💬 Sie können den Kunden direkt unter dieser Nummer kontaktieren.',
    notProvided: 'Nicht angegeben',
    locale: 'de-DE'
  },
  en: {
    title: '🔔 NEW CUSTOMER REQUEST (Meteor Panorama)',
    customer: '👤 Customer',
    phone: '📞 Phone',
    note: '📝 Request / Note',
    lang: '🌐 Website language',
    date: '🕒 Date',
    footer: '💬 You can contact the customer directly on this number.',
    notProvided: 'Not specified',
    locale: 'en-GB'
  }
};

app.post('/api/lead', rateLimit, async (req, res) => {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(503).json({ error: 'Lead service is not configured' });
    }
    const body = req.body || {};
    const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);
    const name = clean(body.name, 120);
    const phone = clean(body.phone, 60);
    const note = clean(body.note, 1500);
    const lang = LANGS.includes(body.lang) ? body.lang : DEFAULT_LANG;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const copy = LEAD_COPY[lang] || LEAD_COPY.tr;
    const textMsg =
      copy.title + '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      copy.customer + ': ' + name + '\n' +
      copy.phone + ': ' + phone + '\n' +
      copy.note + ': ' + (note || copy.notProvided) + '\n' +
      copy.lang + ': ' + LANGUAGE_LABELS[lang] + '\n' +
      copy.date + ': ' + new Date().toLocaleString(copy.locale) + '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      copy.footer;

    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: textMsg
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!tgRes.ok) {
      const tgErr = await tgRes.text();
      console.error('Telegram API Error:', tgErr);
      return res.status(500).json({ error: 'Telegram bildirimi iletilemedi' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Lead API Error:', err.message || err);
    return res.status(500).json({ error: 'Talep işlenirken hata oluştu' });
  }
});

// ---------------------------------------------------
// Clean URL redirects
// ---------------------------------------------------
function redirectWithQuery(req, res, target) {
  const queryIndex = req.originalUrl.indexOf('?');
  const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
  return res.redirect(301, target + query);
}

function cleanUrlPath(pathname) {
  let target = String(pathname || '/')
    .replace(/\/index\.html$/, '')
    .replace(/\.html$/, '');
  if (target === '') target = '/';
  return target;
}

// Legacy /tr/... URLs -> canonical Turkish URLs without the prefix.
app.use((req, res, next) => {
  if (req.path === '/tr') return redirectWithQuery(req, res, '/');
  if (req.path.startsWith('/tr/')) {
    return redirectWithQuery(req, res, cleanUrlPath(req.path.slice(3) || '/'));
  }
  next();
});

// Legacy .html URLs -> clean localized URLs.
app.use((req, res, next) => {
  if (!req.path.endsWith('.html')) return next();
  return redirectWithQuery(req, res, cleanUrlPath(req.path));
});

// One canonical URL per page: no trailing slash except the site root.
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    return redirectWithQuery(req, res, req.path.replace(/\/+$/, '') || '/');
  }
  next();
});

// ---------------------------------------------------
// Server-rendered localized pages
// ---------------------------------------------------
for (const pageKey of PAGE_KEYS) {
  for (const lang of LANGS) {
    app.get(pathFor(pageKey, lang), (req, res) => renderPage(res, pageKey, lang));
  }
}

// ---------------------------------------------------
// Static files — only explicit public assets are exposed
// ---------------------------------------------------
const assetOptions = { etag: true, lastModified: true, maxAge: '7d' };
app.use('/assets', express.static(path.join(__dirname, 'assets'), assetOptions));

app.get('/styles.css', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'styles.css'));
});
app.get('/script.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/favicon.ico', (req, res) => res.redirect(301, '/assets/logo.png'));

app.get('/robots.txt', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.type('text/plain').send(
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /api/\n' +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const urls = [];
  for (const pageKey of PAGE_KEYS) {
    for (const lang of LANGS) {
      const alternates = LANGS.map((altLang) =>
        `<xhtml:link rel="alternate" hreflang="${altLang}" href="${escapeXml(absoluteUrl(pathFor(pageKey, altLang)))}"/>`
      ).join('') +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(pathFor(pageKey, DEFAULT_LANG)))}"/>`;
      urls.push(
        '<url>' +
        `<loc>${escapeXml(absoluteUrl(pathFor(pageKey, lang)))}</loc>` +
        alternates +
        `<lastmod>${SITEMAP_LASTMOD}</lastmod>` +
        '<changefreq>monthly</changefreq>' +
        `<priority>${pageKey === 'home' ? '1.0' : '0.8'}</priority>` +
        '</url>'
      );
    }
  }
  res.type('application/xml').send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') +
    '\n</urlset>\n'
  );
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'meteor-panorama', languages: LANGS });
});

// ---------------------------------------------------
// 404 — localized and noindex
// ---------------------------------------------------
app.use((req, res) => {
  const lang = (req.path === '/de' || req.path.startsWith('/de/')) ? 'de'
    : (req.path === '/en' || req.path.startsWith('/en/')) ? 'en'
    : 'tr';
  return render404(req, res, lang);
});

// Return JSON (not Express' HTML/stack page) for malformed or oversized API bodies.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const isApi = req.path.startsWith('/api/');
  const status = err && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status >= 500) console.error('Unhandled request error:', (err && err.message) || err);
  if (isApi) {
    const message = status === 400 ? 'Invalid request body'
      : status === 413 ? 'Request body too large'
      : 'Server error';
    return res.status(status).json({ error: message });
  }
  return res.status(status).type('text/plain').send(status === 413 ? 'Request body too large' : 'Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Meteor Panorama sunucusu http://localhost:${PORT} portunda başarıyla çalışıyor.`);
});
