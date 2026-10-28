/**
 * Meteor Panorama — site script
 * - TR / DE / EN translations (TR prices in ₺, DE/EN in €)
 * - Price calculator + WhatsApp quote link
 * - Product detail modal, contact form -> WhatsApp, mobile menu
 */
document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = '905308447736';

  // ---------------------------------------------------
  // Localized UI copy
  // The server renders the page in the active language and injects the
  // matching dictionary. There is no client-side language switch anymore.
  // ---------------------------------------------------
  const I18N = window.__METEOR_I18N__ || {};
  const lang = ['tr', 'de', 'en'].includes(I18N.lang)
    ? I18N.lang
    : (['tr', 'de', 'en'].includes(document.documentElement.lang) ? document.documentElement.lang : 'tr');
  const pageKey = document.body.dataset.page || 'home';
  const ui = I18N.ui || {};
  const tr = (key) => ui[key] || key;

  // Single source of truth: price ranges per m² (also used for the "from" prices on the cards)
  const rates = {
    isicamli:   { tr: [3400, 4400],   eu: [140, 190] },
    mevlana:    { tr: [2400, 3200],   eu: [100, 140] },
    pvc:        { tr: [2800, 3900],   eu: [120, 170] },
    giyotin:    { tr: [6400, 8600],   eu: [280, 380] },
    kisbahcesi: { tr: [10500, 14200], eu: [460, 610] },
    surme:      { tr: [3800, 5100],   eu: [160, 215] }
  };
  const priceCodeToProduct = {
    isicam: 'isicamli',
    mevlana: 'mevlana',
    pvc: 'pvc',
    giyotin: 'giyotin',
    kisbahcesi: 'kisbahcesi',
    surme: 'surme'
  };


  // ---------------------------------------------------
  // Calculator
  // ---------------------------------------------------
  const productKey = {
    isicamli: 'p1_title',
    mevlana: 'mevlana_title',
    giyotin: 'p2_title',
    kisbahcesi: 'p3_title',
    surme: 'p4_title',
    pvc: 'p5_title'
  };
  const shapeMod = { 'duz': 1, 'l-tipi': 1.08, 'u-tipi': 1.15 };
  const shapeKey = { 'duz': 'shape_flat', 'l-tipi': 'shape_l', 'u-tipi': 'shape_u' };
  const glassMod = { seffaf: 1, fume: 1.07, bronz: 1.07, reflekte: 1.12 };

  const pageProduct = {
    'cam-balkon': 'isicamli',
    'pvc-sistemleri': 'pvc',
    'giyotin-cam': 'giyotin',
    'kis-bahcesi': 'kisbahcesi',
    'surme-cam': 'surme'
  }[pageKey] || null;

  const $ = (s) => document.querySelector(s);
  const inW = $('#inputWidth'), rgW = $('#rangeWidth'), inH = $('#inputHeight'), rgH = $('#rangeHeight');
  const glassSel = $('#glassType'), colorSel = $('#profileColor');

  function activeChoice(attr) {
    return document.querySelector(`.choice[data-${attr}].active`) || document.querySelector(`.choice[data-${attr}]`);
  }

  function clamp(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  const initialProduct = activeChoice('product');
  const initialShape = activeChoice('shape');
  const state = {
    product: initialProduct ? initialProduct.dataset.product : (pageProduct || 'isicamli'),
    shape: initialShape ? initialShape.dataset.shape : 'duz',
    width: inW ? clamp(inW.value, parseFloat(inW.min) || 1, parseFloat(inW.max) || 50, 3.5) : 3.5,
    height: inH ? clamp(inH.value, parseFloat(inH.min) || 0.8, parseFloat(inH.max) || 6, 1.6) : 1.6
  };

  const STORAGE_KEY = 'meteor_calc_' + pageKey;

  function saveCalcState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        product: state.product,
        shape: state.shape,
        width: state.width,
        height: state.height,
        glass: glassSel ? glassSel.value : null,
        color: colorSel ? colorSel.value : null
      }));
    } catch (e) {}
  }

  function setActiveChoice(selector, attr, value) {
    const items = [...document.querySelectorAll(selector)];
    if (!items.some(item => item.getAttribute(attr) === value)) return false;
    let matched = false;
    items.forEach(item => {
      const on = item.getAttribute(attr) === value;
      item.classList.toggle('active', on);
      item.setAttribute('aria-checked', String(on));
      if (on) matched = true;
    });
    return matched;
  }

  function restoreCalcState() {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
    if (!saved || typeof saved !== 'object') return;

    if (typeof saved.product === 'string' && setActiveChoice('.choice[data-product]', 'data-product', saved.product)) {
      state.product = saved.product;
    }
    if (typeof saved.shape === 'string' && setActiveChoice('.choice[data-shape]', 'data-shape', saved.shape)) {
      state.shape = saved.shape;
    }

    state.width = inW ? clamp(saved.width, parseFloat(inW.min) || 1, parseFloat(inW.max) || 50, state.width) : state.width;
    state.height = inH ? clamp(saved.height, parseFloat(inH.min) || 0.8, parseFloat(inH.max) || 6, state.height) : state.height;
    if (inW) inW.value = state.width;
    if (rgW) rgW.value = Math.min(parseFloat(rgW.max) || state.width, state.width);
    if (inH) inH.value = state.height;
    if (rgH) rgH.value = Math.min(parseFloat(rgH.max) || state.height, state.height);

    if (glassSel && typeof saved.glass === 'string' && [...glassSel.options].some(o => o.value === saved.glass)) {
      glassSel.value = saved.glass;
    }
    if (colorSel && typeof saved.color === 'string' && [...colorSel.options].some(o => o.value === saved.color)) {
      colorSel.value = saved.color;
    }
  }

  function bindDim(input, range, key, min, max, rangeMax) {
    if (!input || !range) return;
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      if (isNaN(v)) return;
      state[key] = Math.max(min, Math.min(max, v));
      range.value = Math.min(rangeMax, state[key]);
      calculatePrice();
    });
    input.addEventListener('change', () => { input.value = state[key]; calculatePrice(); });
    range.addEventListener('input', () => {
      state[key] = parseFloat(range.value);
      input.value = state[key];
      calculatePrice();
    });
  }
  if (inW && rgW) bindDim(inW, rgW, 'width', parseFloat(inW.min) || 1, parseFloat(inW.max) || 50, parseFloat(rgW.max) || 20);
  if (inH && rgH) bindDim(inH, rgH, 'height', parseFloat(inH.min) || 0.8, parseFloat(inH.max) || 6, parseFloat(rgH.max) || 4);

  function bindChoices(selector, attr, key) {
    const items = document.querySelectorAll(selector);
    items.forEach(item => item.addEventListener('click', () => {
      items.forEach(i => { i.classList.remove('active'); i.setAttribute('aria-checked', 'false'); });
      item.classList.add('active');
      item.setAttribute('aria-checked', 'true');
      state[key] = item.getAttribute(attr);
      calculatePrice();
    }));
  }
  bindChoices('.choice[data-product]', 'data-product', 'product');
  bindChoices('.choice[data-shape]', 'data-shape', 'shape');
  if (glassSel) glassSel.addEventListener('change', calculatePrice);
  if (colorSel) colorSel.addEventListener('change', calculatePrice);

  const locale = () => (lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-GB');
  const money = (n) => n.toLocaleString(locale()) + (lang === 'tr' ? ' ₺' : ' €');
  const decimal = (n, digits) => n.toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function updateStaticPrices() {
    document.querySelectorAll('[data-price-code]').forEach(el => {
      const r = rates[priceCodeToProduct[el.dataset.priceCode]];
      if (r) el.textContent = money(r[lang === 'tr' ? 'tr' : 'eu'][0]);
    });
  }

  function calculatePrice() {
    const resPriceDisplay = $('#resPriceDisplay');
    if (!resPriceDisplay) return;
    const w = state.width, h = state.height;
    const area = Math.round(w * h * 100) / 100;
    const prodRates = rates[state.product] || rates.isicamli;
    const r = prodRates[lang === 'tr' ? 'tr' : 'eu'];
    const gVal = glassSel ? glassSel.value : 'seffaf';
    const mod = (shapeMod[state.shape] || 1) * (glassMod[gVal] || 1);
    const round = lang === 'tr' ? 50 : 10;
    const min = Math.round(area * r[0] * mod / round) * round;
    const max = Math.round(area * r[1] * mod / round) * round;

    resPriceDisplay.textContent = `${money(min)} – ${money(max)}`;
    if ($('#resDimensions')) $('#resDimensions').textContent = `${decimal(w, 1)} × ${decimal(h, 1)} m`;
    if ($('#resTotalArea')) $('#resTotalArea').textContent = `${decimal(area, 2)} m²`;
    if ($('#resProduct')) $('#resProduct').textContent = tr(productKey[state.product] || 'p1_title');

    const glassTxt = (glassSel && glassSel.options[glassSel.selectedIndex]) ? glassSel.options[glassSel.selectedIndex].text : '-';
    const colorTxt = (colorSel && colorSel.options[colorSel.selectedIndex]) ? colorSel.options[colorSel.selectedIndex].text : '-';
    const lines = {
      tr: ['Merhaba, web sitenizden fiyat hesapladım:', 'Ürün', 'Şekil', 'Ölçü', 'Cam', 'Profil', 'Tahmini fiyat', 'Detaylı teklif almak istiyorum.'],
      de: ['Hallo, ich habe auf Ihrer Website einen Richtpreis berechnet:', 'Produkt', 'Form', 'Maße', 'Glas', 'Profil', 'Richtpreis', 'Ich bitte um ein Angebot.'],
      en: ['Hello, I calculated an estimate on your website:', 'Product', 'Layout', 'Size', 'Glass', 'Frame', 'Estimate', 'I would like a detailed quote.']
    }[lang];
    const msg = `${lines[0]}\n\n` +
      `${lines[1]}: ${tr(productKey[state.product] || 'p1_title')}\n` +
      `${lines[2]}: ${tr(shapeKey[state.shape] || 'shape_flat')}\n` +
      `${lines[3]}: ${decimal(w, 1)} × ${decimal(h, 1)} m (${decimal(area, 2)} m²)\n` +
      `${lines[4]}: ${glassTxt}\n` +
      `${lines[5]}: ${colorTxt}\n` +
      `${lines[6]}: ${money(min)} – ${money(max)}\n\n${lines[7]}`;
    if ($('#btnSendWhatsapp')) $('#btnSendWhatsapp').href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    saveCalcState();
  }

  restoreCalcState();
  updateStaticPrices();
  calculatePrice();

  // Keep calculator values when the visitor changes language (full page navigation).
  document.querySelectorAll('[data-lang-link]').forEach(link => {
    link.addEventListener('click', saveCalcState);
  });
  window.addEventListener('beforeunload', saveCalcState);

  document.querySelectorAll('.btn-select-product').forEach(btn => {
    btn.addEventListener('click', () => selectAndScroll(btn.dataset.targetProduct));
  });
  function selectAndScroll(product) {
    const chip = document.querySelector(`.choice[data-product="${product}"]`);
    if (chip) chip.click();
    const calcEl = $('#hesaplayici');
    if (calcEl) calcEl.scrollIntoView({ behavior: 'smooth' });
  }

  // ---------------------------------------------------
  // Product modal
  // ---------------------------------------------------
  const modalData = {
    'modal-isicam': {
      img: '/assets/hero-light.jpg', product: 'isicamli', title: 'p1_title', desc: 'p1_desc',
      specs: {
        tr: [['Cam', '4+12+4 veya 4+16+4 temperli çift cam'], ['Profil', 'Alüminyum, elektrostatik toz boya'], ['Açılım', 'Katlanır, içe veya dışa toplanır'], ['Conta', 'EPDM fitil'], ['Üretim', 'Kayseri']],
        de: [['Glas', '4+12+4 oder 4+16+4 ESG-Isolierglas'], ['Profil', 'Aluminium, pulverbeschichtet'], ['Öffnung', 'Faltbar, nach innen oder außen'], ['Dichtung', 'EPDM'], ['Fertigung', 'Kayseri']],
        en: [['Glass', '4+12+4 or 4+16+4 tempered double glazing'], ['Frame', 'Aluminium, powder coated'], ['Opening', 'Folding, inward or outward'], ['Seals', 'EPDM'], ['Made in', 'Kayseri']]
      }
    },
    'modal-giyotin': {
      img: '/assets/giyotin-light.jpg', product: 'giyotin', title: 'p2_title', desc: 'p2_desc',
      specs: {
        tr: [['Cam', '8–10 mm temperli veya ısıcam'], ['Hareket', 'Motorlu, kayış tahrikli'], ['Kumanda', 'Uzaktan kumanda / duvar anahtarı'], ['Kullanım', 'Teras, balkon, restoran'], ['Üretim', 'Kayseri']],
        de: [['Glas', '8–10 mm ESG oder Isolierglas'], ['Antrieb', 'Motorisch, Zahnriemen'], ['Steuerung', 'Fernbedienung / Wandschalter'], ['Einsatz', 'Terrasse, Balkon, Gastronomie'], ['Fertigung', 'Kayseri']],
        en: [['Glass', '8–10 mm tempered or insulated'], ['Drive', 'Motorized belt drive'], ['Control', 'Remote / wall switch'], ['Use', 'Terrace, balcony, restaurant'], ['Made in', 'Kayseri']]
      }
    },
    'modal-kis-bahcesi': {
      img: '/assets/wintergarten-light.jpg', product: 'kisbahcesi', title: 'p3_title', desc: 'p3_desc',
      specs: {
        tr: [['Taşıyıcı', 'Alüminyum kolon ve kiriş'], ['Çatı', 'Lamine cam veya panel'], ['Yan yüzeyler', 'Sürme, katlanır veya giyotin cam'], ['Drenaj', 'Gizli yağmur oluğu'], ['Üretim', 'Kayseri']],
        de: [['Tragwerk', 'Aluminiumstützen und -träger'], ['Dach', 'VSG-Glas oder Paneel'], ['Seiten', 'Schiebe-, Falt- oder Guillotine-Glas'], ['Entwässerung', 'Verdeckte Regenrinne'], ['Fertigung', 'Kayseri']],
        en: [['Structure', 'Aluminium posts and beams'], ['Roof', 'Laminated glass or panel'], ['Sides', 'Sliding, folding or guillotine glass'], ['Drainage', 'Concealed gutter'], ['Made in', 'Kayseri']]
      }
    },
    'modal-surme': {
      img: '/assets/sliding-light.jpg', product: 'surme', title: 'p4_title', desc: 'p4_desc',
      specs: {
        tr: [['Cam', 'Tek cam veya ısıcam'], ['Ray', 'Standart veya eşiksiz (gömme) ray'], ['Kilit', 'Anahtarlı kilit seçeneği'], ['Profil', 'Alüminyum, ince kasa'], ['Üretim', 'Kayseri']],
        de: [['Glas', 'Einfach- oder Isolierglas'], ['Schiene', 'Standard oder schwellenlos'], ['Verriegelung', 'Optional mit Schloss'], ['Profil', 'Aluminium, schmal'], ['Fertigung', 'Kayseri']],
        en: [['Glass', 'Single or double glazing'], ['Track', 'Standard or flush threshold'], ['Lock', 'Optional key lock'], ['Frame', 'Slim aluminium'], ['Made in', 'Kayseri']]
      }
    },
    'modal-pvc': {
      img: '/assets/pvc-light.jpg', product: 'pvc', title: 'p5_title', desc: 'p5_desc',
      specs: {
        tr: [['Profil', '70–80 mm çok odacıklı PVC profil'], ['Cam', '4+16+4 çift veya üçlü ısıcam'], ['Açılım', 'Tek açılım, çift açılım, sürme kapı'], ['Conta', 'EPDM gri/siyah çift conta'], ['Üretim', 'Kayseri']],
        de: [['Profil', '70–80 mm Mehrkammer-PVC'], ['Glas', '2-fach oder 3-fach Isolierglas'], ['Öffnung', 'Dreh-Kipp, Schiebe'], ['Dichtung', 'EPDM Doppel-Dichtung'], ['Fertigung', 'Kayseri']],
        en: [['Frame', '70–80 mm multi-chamber PVC'], ['Glass', 'Double or triple glazing'], ['Opening', 'Tilt & turn, sliding door'], ['Seals', 'EPDM double gasket'], ['Made in', 'Kayseri']]
      }
    }
  };

  const backdrop = $('#productModalBackdrop');
  const content = $('#modalContentArea');

  function openModal(key) {
    if (!backdrop || !content) return;
    const d = modalData[key];
    if (!d) return;
    const title = tr(d.title);
    const rows = d.specs[lang].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('');
    const waText = encodeURIComponent(`${lang === 'tr' ? 'Merhaba, şu ürün hakkında bilgi almak istiyorum' : lang === 'de' ? 'Hallo, ich hätte gern Informationen zu' : 'Hello, I would like information about'}: ${title}`);
    content.innerHTML = `
      <div class="modal-img"><img src="${d.img}" alt="${title}"></div>
      <div class="modal-body">
        <h3 id="modalProductTitle">${title}</h3>
        <p>${tr(d.desc)}</p>
        <table class="specs"><tbody>${rows}</tbody></table>
        <div class="modal-actions">
          <button type="button" class="btn btn-dark" data-modal-calc="${d.product}">${tr('modal_calc')}</button>
          <a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP_PHONE}?text=${waText}">${tr('modal_wa')}</a>
        </div>
      </div>`;
    const calcBtn = content.querySelector('[data-modal-calc]');
    if (calcBtn) {
      calcBtn.addEventListener('click', (e) => {
        closeModal();
        selectAndScroll(e.currentTarget.dataset.modalCalc);
      });
    }
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-open-modal]').forEach(el => el.addEventListener('click', () => openModal(el.dataset.openModal)));
  const closeProdBtn = $('#closeProductModal');
  if (closeProdBtn) closeProdBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) closeModal(); });

  // ---------------------------------------------------
  // Contact form -> WhatsApp
  // ---------------------------------------------------
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sel = $('#formProductInterest');
      const interest = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '-';
      const name = $('#formName') ? $('#formName').value : '';
      const phone = $('#formPhone') ? $('#formPhone').value : '';
      const country = $('#formCountry') ? $('#formCountry').value : '';
      const message = $('#formMessage') ? $('#formMessage').value : '';
      const msg =
        `${tr('form_label_name')}: ${name}\n` +
        `${tr('form_label_phone')}: ${phone}\n` +
        `${tr('form_label_country')}: ${country}\n` +
        `${tr('form_label_interest')}: ${interest}\n` +
        `${tr('form_label_msg')}: ${message || '-'}`;
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  // ---------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------
  const toggle = $('#mobileToggle'), nav = $('#navMenu');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  $('#currentYear').textContent = new Date().getFullYear();

  // ---------------------------------------------------
  // AI Live Chat & Telegram Lead Entegrasyonu
  // Güvenlik Katmanı: Tüm API anahtarları ve Telegram tokenları
  // sunucu tarafında (server.js) güvenle korunmaktadır.
  // İstemcide (script.js) hiçbir gizli anahtar barındırılmaz.
  // ---------------------------------------------------

  const chatWidget = $('#chatWidget');
  const chatToggle = $('#chatToggle');
  const chatWindow = $('#chatWindow');
  const chatClose = $('#chatClose');
  const chatReset = $('#chatReset');
  const chatForm = $('#chatForm');
  const chatInput = $('#chatInput');
  const chatSendBtn = $('#chatSendBtn');
  const chatStatusBar = $('#chatStatusBar');
  const chatStatusText = $('#chatStatusText');
  const chatMessages = $('#chatMessages');
  const chatQuickArea = $('#chatQuickArea');
  const chatBody = $('#chatBody');

  let chatHistory = [];
  let isChatBusy = false;
  let chatInitialized = false;

  const productNames = {
    tr: 'Cam Balkon, PVC Pencere ve Kapı, Motorlu Giyotin Cam, Kış Bahçesi, Alüminyum Sürme Sistem',
    de: 'Balkonverglasung, PVC-Fenster und -Türen, Elektrisches Guillotine-Glas, Wintergarten, Aluminium-Schiebesystem',
    en: 'Balcony Glazing, PVC Windows and Doors, Motorized Guillotine Glass, Winter Garden, Aluminium Sliding System'
  };
  const productFacts = {
    tr: '1) Cam Balkon: Isıcamlı çift cam 4+12+4/4+16+4 veya Mevlana 8 mm temperli tek cam; katlanır sistem.\n' +
      '2) PVC Pencere ve Kapı: 70–80 mm çok odacıklı profil; 4+16+4 çift veya üçlü ısıcam; pencere, balkon kapısı ve sürme seçenekleri.\n' +
      '3) Motorlu Giyotin Cam: Uzaktan kumandalı dikey panel; açıkken cam korkuluk, kapalıyken tam cam cephe.\n' +
      '4) Kış Bahçesi: Alüminyum kolon/kiriş, lamine cam çatı, gizli yağmur oluğu.\n' +
      '5) Alüminyum Sürme Sistem: İnce alüminyum profil, 2–5 ray, isteğe bağlı eşiksiz/gömme zemin rayı.',
    de: '1) Balkonverglasung: Faltsystem mit Isolierglas 4+12+4/4+16+4 oder Mevlana 8 mm ESG-Einscheibenglas.\n' +
      '2) PVC-Fenster und -Türen: 70–80 mm Mehrkammerprofile, 4+16+4 Doppel- oder Dreifachverglasung, Fenster/Balkontüren/Schiebeoptionen.\n' +
      '3) Elektrisches Guillotine-Glas: motorisch per Fernbedienung vertikal; offen als Glasbrüstung, geschlossen als Glasfront.\n' +
      '4) Wintergarten: Aluminiumstützen und -träger, VSG-Glasdach, verdeckte Regenrinne.\n' +
      '5) Aluminium-Schiebesystem: schlanke Profile, 2–5 Schienen, optional schwellenlose/eingelassene Bodenschiene.',
    en: '1) Balcony glazing: folding system with 4+12+4/4+16+4 insulated glazing or Mevlana 8 mm tempered single glass.\n' +
      '2) PVC windows and doors: 70–80 mm multi-chamber profiles, 4+16+4 double or triple glazing, windows/balcony doors/sliding options.\n' +
      '3) Motorized guillotine glass: remote-controlled vertical panels; open as a glass balustrade, closed as a full glass front.\n' +
      '4) Winter garden: aluminium posts and beams, laminated glass roof, concealed rainwater gutter.\n' +
      '5) Aluminium sliding system: slim profiles, 2–5 tracks, optional flush/recessed floor track.'
  };
  const noInvent = {
    tr: 'Bu gerçeklerin dışında teknik detay, ölçü veya özellik uydurma.',
    de: 'Erfinde keine technischen Details, Maße oder Eigenschaften, die hier nicht stehen.',
    en: 'Do not invent technical details, dimensions or features that are not listed here.'
  };

  function cleanBotReply(text, cLang) {
    if (!text) return '';
    let cleaned = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/(?:user\s*safety|response\s*safety|safety\s*assessment|content\s*safety|safety)\s*:\s*(?:safe|unsafe|[^\n\r]+)/gi, '')
      .replace(/(?:safety check passed|safety evaluation:)/gi, '')
      .trim();

    if (!cleaned || cleaned.length < 2) {
      if (cLang === 'de') {
        return 'Gern geschehen! Wie kann ich Ihnen bei Balkonverglasung, PVC-Fenstern, Guillotine-Glas oder Wintergärten weiterhelfen?';
      } else if (cLang === 'en') {
        return "You're welcome! How else can I assist you regarding our balcony glazing, PVC windows, guillotine glass or winter garden systems?";
      } else {
        return 'Rica ederim! Isıcamlı cam balkon, PVC pencere, giyotin cam veya kış bahçesi sistemlerimizle ilgili başka nasıl yardımcı olabilirim?';
      }
    }
    return cleaned;
  }

  function setWaitingState(isWaiting) {
    if (chatStatusBar) {
      chatStatusBar.hidden = !isWaiting;
      if (chatStatusText) chatStatusText.textContent = tr('chat_status_waiting');
    }
    if (chatForm) {
      if (isWaiting) chatForm.classList.add('is-busy');
      else chatForm.classList.remove('is-busy');
    }
    if (chatInput) {
      chatInput.disabled = isWaiting;
      if (isWaiting) {
        if (!chatInput.getAttribute('data-orig-ph')) {
          chatInput.setAttribute('data-orig-ph', chatInput.placeholder || tr('chat_placeholder'));
        }
        chatInput.placeholder = tr('chat_status_waiting');
      } else {
        const orig = chatInput.getAttribute('data-orig-ph') || tr('chat_placeholder');
        chatInput.placeholder = orig;
        setTimeout(() => chatInput.focus(), 80);
      }
    }
    if (chatSendBtn) {
      chatSendBtn.disabled = isWaiting;
      chatSendBtn.setAttribute('aria-busy', String(isWaiting));
    }
  }

  function getSystemPrompt(cLang) {
    const langNames = { tr: 'Türkçe', de: 'Almanca (Deutsch)', en: 'İngilizce (English)' };
    const assistantNames = { tr: 'Meteor AI Asistan', de: 'Meteor AI Assistent', en: 'Meteor AI Assistant' };
    return "Sen Meteor Panorama firmasının resmi, bilgili, güler yüzlü ve son derece uzman yapay zeka müşteri danışmanısın.\n" +
      "Adın: " + (assistantNames[cLang] || assistantNames.tr) + ".\n" +
      "Şu anki site dili: " + (langNames[cLang] || 'Türkçe') + ". Varsayılan olarak bu dilde yanıt ver; kullanıcı başka bir dilde yazarsa o dilde yanıtla.\n\n" +
      "FİRMA BİLGİLERİ (METEOR PANORAMA):\n" +
      "- Üretici: Kayseri Mimarsinan Organize Sanayi Bölgesi'ndeki modern tesisimizde (Mimarsinan OSB 25. Cad. No:7, Melikgazi / Kayseri / Türkiye) özel ölçüye göre imalat yapıyoruz.\n" +
      "- Ana Ürünlerimiz (bu adları kullan): " + productNames[cLang] + "\n" +
      "- Ürün gerçekleri:\n" + productFacts[cLang] + "\n" +
      "- " + noInvent[cLang] + "\n" +
      "- Hizmet Felsefesi: 'Ölçüden montaja, tek ekip'. Aracı yoktur; keşif, ölçü, üretim ve montaj baştan sona kendi uzman ekibimizdedir.\n" +
      "- Keşif ve Ölçü: Kayseri ve çevre illerde ile Almanya'da Nordrhein-Westfalen (NRW) eyaletinde keşif ve yerinde ölçü hizmetimiz tamamen ÜCRETSİZDİR.\n" +
      "- Teslimat: Tüm Türkiye'ye ve Almanya başta olmak üzere tüm Avrupa ülkelerine ölçüye özel güvenli teslimat yapıyoruz.\n" +
      "- Tecrübe: 10+ yıl sektör deneyimi, 250+ tamamlanmış proje.\n" +
      "- Çalışma Saatleri: Pazartesi – Cumartesi 08:30 – 18:30 (TR saati).\n" +
      "- İletişim: +90 530 844 77 36 (WhatsApp & Çağrı), info@meteorpanorama.com.\n\n" +
      "FİYAT VE TEKLİF KURALLARI (ÇOK ÖNEMLİ):\n" +
      "- Asla kesin bir son fiyat veya pazarlık rakamı uydurma!\n" +
      "- Sitede bir 'Tahmini Fiyat Hesaplama' aracı (#hesaplayici) olduğunu belirt.\n" +
      "- Yaklaşık m² başlangıç fiyatları: Cam Balkon ~3.400 ₺ (140 €), PVC Pencere/Kapı ~2.800 ₺ (120 €), Motorlu Giyotin ~6.400 ₺ (280 €), Kış Bahçesi ~10.500 ₺ (460 €), Sürme Sistem ~3.800 ₺ (160 €) seviyesindedir.\n" +
      "- Kesin net maliyetin alanın şekline, ölçülerine ve cam tipine göre yerinde ücretsiz ölçü alındıktan sonra netleşeceğini söyle.\n" +
      "- Müşteri kesin fiyat, randevu veya keşif talep ederse: 'Yetkili uzmanımızın sizinle iletişime geçmesi için adınızı ve telefon numaranızı belirtebilir veya WhatsApp\'tan yazabilirsiniz.' şeklinde yönlendir.\n\n" +
      "GÜVENLİK VE FORMAT KURALI (KESİNLİKLE UYULACAK):\n" +
      "- ASLA 'User Safety: safe', 'Response Safety: safe', 'Safety: safe' veya sistem güvenlik etiketleri yazma!\n" +
      "- Yalnızca doğrudan müşteriye hitap eden doğal, nazik ve bilgilendirici cümleler kur.\n\n" +
      "ÜSLUP VE UZUNLUK KURALI:\n" +
      "- Kısa, öz, samimi, güven veren, net ve profesyonel cevaplar ver.\n" +
      "- Cümlelerini DAİMA eksiksiz ve tam bitir, asla cümlenin ortasında veya yarım bırakma. 1-2 odaklı paragraf ile konuyu netleştir.";
  }

  function initChat() {
    if (chatInitialized) return;
    chatInitialized = true;
    chatMessages.innerHTML = '';
    chatHistory = [];
    appendMessage('bot', tr('chat_welcome'));
    if (chatQuickArea) chatQuickArea.style.display = 'flex';
  }

  function toggleChat(forceOpen) {
    if (!chatWidget) return;
    const isOpen = chatWidget.classList.contains('open');
    const next = forceOpen !== undefined ? forceOpen : !isOpen;
    if (next) {
      chatWidget.classList.add('open');
      document.body.classList.add('chat-is-open');
      if (chatToggle) chatToggle.setAttribute('aria-expanded', 'true');
      if (chatWindow) chatWindow.hidden = false;
      initChat();
      setTimeout(() => {
        if (chatBody) chatBody.scrollTop = 0;
        if (chatInput && window.innerWidth > 600) chatInput.focus();
      }, 150);
    } else {
      chatWidget.classList.remove('open');
      document.body.classList.remove('chat-is-open');
      if (chatToggle) chatToggle.setAttribute('aria-expanded', 'false');
      if (chatWindow) chatWindow.hidden = true;
    }
  }

  if (chatToggle) chatToggle.addEventListener('click', () => toggleChat());
  if (chatClose) chatClose.addEventListener('click', () => toggleChat(false));
  if (chatReset) {
    chatReset.addEventListener('click', () => {
      chatInitialized = false;
      initChat();
    });
  }

  function formatTime() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function appendMessage(sender, text, isHtml) {
    if (!chatMessages) return null;
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-' + sender;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      let parsed = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\s*[-•]\s*(.+)/g, '<br>• $1')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = parsed;
    }

    const time = document.createElement('span');
    time.className = 'chat-msg-time';
    time.textContent = formatTime();

    msg.appendChild(bubble);
    msg.appendChild(time);
    chatMessages.appendChild(msg);
    scrollChatBottom();
    return msg;
  }

  function showTyping() {
    if (!chatMessages) return;
    const existing = document.getElementById('chatTypingIndicator');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg-bot';
    el.id = 'chatTypingIndicator';
    el.innerHTML =
      '<div class="chat-typing-bubble">' +
        '<div class="chat-typing-badge">' +
          '<span class="chat-typing-radar"></span>' +
          '<span>' + tr('chat_status_waiting') + '</span>' +
        '</div>' +
        '<div class="chat-typing-dots"><span></span><span></span><span></span></div>' +
      '</div>';
    chatMessages.appendChild(el);
    setWaitingState(true);
    scrollChatBottom();
  }

  function removeTyping() {
    const el = document.getElementById('chatTypingIndicator');
    if (el) el.remove();
    setWaitingState(false);
  }

  function scrollChatBottom() {
    setTimeout(() => {
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }, 30);
  }

  function renderLeadCard(prefillNote) {
    if (!chatMessages) return;
    const existing = document.getElementById('chatLeadCard');
    if (existing) existing.remove();

    const noteVal = prefillNote ? prefillNote.replace(/"/g, '&quot;') : '';
    const card = document.createElement('div');
    card.className = 'chat-lead-card';
    card.id = 'chatLeadCard';
    card.innerHTML =
      '<h4>' + tr('chat_rep_title') + '</h4>' +
      '<input type="text" id="leadName" class="chat-lead-input" aria-label="' + tr('chat_rep_name') + '" placeholder="' + tr('chat_rep_name') + ' *" required>' +
      '<input type="tel" id="leadPhone" class="chat-lead-input" aria-label="' + tr('chat_rep_phone') + '" placeholder="' + tr('chat_rep_phone') + ' *" required>' +
      '<input type="text" id="leadNote" class="chat-lead-input" aria-label="' + tr('chat_rep_note') + '" placeholder="' + tr('chat_rep_note') + '" value="' + noteVal + '">' +
      '<button type="button" class="chat-lead-btn" id="btnSendLead">' + tr('chat_rep_btn') + '</button>' +
      '<a href="https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(tr('chat_lead_wa_text')) + '" target="_blank" rel="noopener" class="chat-lead-wa">' +
        '<svg viewBox="0 0 24 24" class="ic-wa" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
        '<span>' + tr('chat_rep_wa') + '</span>' +
      '</a>';

    chatMessages.appendChild(card);
    scrollChatBottom();

    const btn = card.querySelector('#btnSendLead');
    if (btn) {
      btn.addEventListener('click', async () => {
        const nameInput = card.querySelector('#leadName');
        const phoneInput = card.querySelector('#leadPhone');
        const noteInput = card.querySelector('#leadNote');
        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const note = noteInput ? noteInput.value.trim() : '';

        if (!name || !phone) {
          alert(tr('chat_lead_required'));
          return;
        }

        const waText =
          tr('chat_lead_wa_text') + '\n\n' +
          tr('form_label_name') + ': ' + name + '\n' +
          tr('form_label_phone') + ': ' + phone + '\n' +
          (note ? tr('form_label_msg') + ': ' + note : tr('form_label_msg') + ': ' + tr('chat_lead_note_default'));

        const waUrl = 'https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(waText);

        try {
          btn.disabled = true;
          btn.textContent = tr('chat_lead_sending');
          const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, note, lang })
          });
          if (res.ok) {
            card.innerHTML =
              '<div style="background:#f0fdf4;border:1px solid #86efac;color:#166534;padding:12px;border-radius:8px;font-size:0.86rem;line-height:1.45;">' +
                '<strong>✓ ' + tr('chat_rep_success') + '</strong>' +
                '<p style="margin:4px 0 0;font-size:0.8rem;color:#15803d;">' + tr('chat_lead_success_detail') + '</p>' +
              '</div>' +
              '<a href="' + waUrl + '" target="_blank" rel="noopener" class="chat-lead-wa" style="display:flex;margin-top:8px;">' +
                '<svg viewBox="0 0 24 24" class="ic-wa" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
                '<span>' + tr('chat_rep_wa') + '</span>' +
              '</a>';
            scrollChatBottom();
            return;
          }
        } catch (e) {
          console.error('Lead send error:', e);
        }

        card.innerHTML =
          '<div style="background:#fffbeb;border:1px solid #fcd34d;color:#92400e;padding:12px;border-radius:8px;font-size:0.86rem;line-height:1.45;">' +
            '<strong>! ' + tr('chat_lead_fallback') + '</strong>' +
          '</div>' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener" class="chat-lead-wa" style="display:flex;margin-top:8px;">' +
            '<svg viewBox="0 0 24 24" class="ic-wa" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
            '<span>' + tr('chat_rep_wa') + '</span>' +
          '</a>';
      });
    }
  }

  async function callOpenRouterAI(messagesPayload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65000);
    let res;
    try {
      res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesPayload
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new Error('Chat API HTTP ' + res.status);
    }

    const data = await res.json();
    if (data && data.reply) {
      return cleanBotReply(data.reply, lang);
    }
    throw new Error('Empty AI response');
  }

  async function handleUserMessage(userText) {
    if (!userText || isChatBusy) return;
    isChatBusy = true;

    appendMessage('user', userText);
    if (chatInput) chatInput.value = '';
    if (chatQuickArea) chatQuickArea.style.display = 'none';
    showTyping();

    chatHistory.push({ role: 'user', content: userText });
    if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);

    try {
      const messagesPayload = [
        { role: 'system', content: getSystemPrompt(lang) },
        ...chatHistory
      ];

      const botReply = await callOpenRouterAI(messagesPayload);
      removeTyping();

      if (!botReply) {
        throw new Error('Empty sanitized reply');
      }

      chatHistory.push({ role: 'assistant', content: botReply });
      appendMessage('bot', botReply);

      const triggerWords = ['fiyat', 'fiyatı', 'ücret', 'teklif', 'keşif', 'randevu', 'ölçü', 'yetkili', 'telefon', 'numara', 'preis', 'angebot', 'aufmaß', 'price', 'quote', 'survey', 'appointment'];
      const combined = (userText + ' ' + botReply).toLowerCase();
      const hasTrigger = triggerWords.some(w => combined.includes(w));

      if (hasTrigger) {
        renderLeadCard(userText);
      }

    } catch (err) {
      console.error('Chat AI Error:', err);
      removeTyping();
      const fallbackHtml =
        '<p>' + tr('chat_err_msg') + '</p>' +
        '<a href="https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(userText) + '" target="_blank" rel="noopener" class="chat-lead-wa" style="display:inline-flex;margin-top:8px;">' +
          '<svg viewBox="0 0 24 24" class="ic-wa" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
          '<span>WhatsApp (+90 530 844 77 36)</span>' +
        '</a>';
      appendMessage('bot', fallbackHtml, true);
    } finally {
      isChatBusy = false;
    }
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput ? chatInput.value.trim() : '';
      if (val) handleUserMessage(val);
    });
  }

  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.question;
      if (q === 'rep') {
        if (chatQuickArea) chatQuickArea.style.display = 'none';
        appendMessage('user', chip.textContent);
        appendMessage('bot', tr('chat_lead_prompt'));
        renderLeadCard();
      } else {
        handleUserMessage(chip.textContent);
      }
    });
  });

});