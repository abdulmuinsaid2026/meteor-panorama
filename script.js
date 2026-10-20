/**
 * Meteor Panorama — site script
 * - TR / DE / EN translations (TR prices in ₺, DE/EN in €)
 * - Price calculator + WhatsApp quote link
 * - Product detail modal, contact form -> WhatsApp, mobile menu
 */
document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = '905308447736';

  // ---------------------------------------------------
  // Translations
  // ---------------------------------------------------
  const t = {
    tr: {
      meta_title: 'Meteor Panorama | Cam Balkon, Giyotin Cam ve Kış Bahçesi',
      meta_desc: "Meteor Panorama; ısıcamlı cam balkon, giyotin cam, kış bahçesi ve alüminyum sürme sistemlerini ölçüye özel üretir. Ölçüden montaja tek ekip.",
      topbar_hours: 'Pzt – Cmt, 08:30 – 18:30',
      nav_products: 'Ürünler', nav_calculator: 'Fiyat Hesapla', nav_production: 'Üretim', nav_contact: 'İletişim', nav_cta: 'Teklif Al',
      nav_cambalkon: 'Cam Balkon', nav_pvc: 'PVC Sistemleri', nav_giyotin: 'Giyotin Cam', nav_kisbahcesi: 'Kış Bahçesi', nav_surme: 'Sürme Sistem',
      hero_place: 'Cam balkon · Giyotin cam · Kış bahçesi · PVC Sistemleri',
      hero_title: 'Balkonunuzu dört mevsim yaşam alanına çevirin',
      hero_lead: 'Ölçüye özel üretim, yerinde keşif ve profesyonel montaj. Türkiye ve Avrupa’ya teslim ediyoruz.',
      hero_cta_calc: 'Fiyat hesapla', hero_cta_wa: "WhatsApp'tan yazın",
      hero_p1: 'Ölçüye özel üretim', hero_p2: 'Ücretsiz keşif ve ölçü', hero_p3: 'Profesyonel montaj',
      stat1_label: 'Yıllık deneyim', stat2_label: 'Tamamlanan proje', stat3_label: 'Dil desteği',
      hero_card_title: 'Ücretsiz keşif', hero_card_text: "Yerinde ölçü için WhatsApp'tan randevu alın.",
      prod_title: 'Ürünler',
      prod_desc: 'Balkon, teras, pencere ve işletmeler için ölçüye özel mimari sistemler.',
      badge_popular: 'En çok tercih edilen',
      p1_title: 'Cam Balkon Sistemleri', p1_desc: 'Isıcamlı çift cam ve Mevlana 8mm temperli tek cam seçenekli katlanır sistemler.',
      p2_title: 'Motorlu Giyotin Cam', p2_desc: 'Kumandayla dikey açılan cam paneller. Açıkken korkuluk, kapalıyken tam cephe olur.',
      p3_title: 'Kış Bahçesi', p3_desc: 'Alüminyum taşıyıcı ve cam çatıyla bahçe ya da terasta dört mevsim kullanılan alan.',
      p4_title: 'Alüminyum Sürme Sistem', p4_desc: 'İnce profilli, eşiksiz ray seçenekli sürme kapılar. Salonu bahçeye ya da terasa açar.',
      p5_title: 'PVC Pencere & Kapı Sistemleri', p5_desc: 'Yüksek ısı ve ses yalıtımlı çok odacıklı PVC profil, çift veya üçlü cam konforu.',
      mevlana_title: 'Mevlana 8mm Temperli Tek Cam', mevlana_desc: '8 mm rodajlı darbeye dayanıklı temperli emniyet camı, ferah panoramik manzara, ekonomik ve şık kapatma.',
      isicam_title: 'Isıcamlı Cam Balkon', isicam_desc: '4+12+4 veya 4+16+4 temperli çift camlı, yüksek ısı yalıtımlı, balkonu dört mevsim sıcak odaya çeviren sistem.',
      price_from: 'm² başlangıç', btn_details: 'Teknik detay', btn_calc_this: 'Hesapla', btn_view_page: 'Sayfayı İncele',
      calc_title: 'Tahmini fiyat hesaplama',
      calc_desc: "Ürünü ve yaklaşık ölçüleri seçin. Sonucu tek tıkla WhatsApp'tan bize gönderebilirsiniz.",
      step1_title: 'Ürün', step2_title: 'Alan şekli', step3_title: 'Ölçüler', step4_title: 'Cam ve profil',
      shape_flat: 'Düz', shape_l: 'L tipi', shape_u: 'U tipi',
      label_width: 'Toplam genişlik (m)', label_height: 'Yükseklik (m)',
      label_glass_type: 'Cam', label_profile_color: 'Profil rengi',
      opt_glass_clear: 'Şeffaf çift cam', opt_glass_fume: 'Füme', opt_glass_bronze: 'Bronz', opt_glass_reflect: 'Reflekte',
      opt_color_anthracite: 'Antrasit (RAL 7016)', opt_color_black: 'Siyah (RAL 9005)', opt_color_white: 'Beyaz (RAL 9016)', opt_color_eloxal: 'Eloksal', opt_color_wood: 'Ahşap desen',
      res_est_title: 'Tahmini fiyat aralığı', res_product: 'Ürün',
      res_f1: 'Ücretsiz keşif ve ölçü', res_f2: 'Ölçünüze özel net teklif',
      btn_whatsapp_quote: "Bu ölçülerle WhatsApp'tan teklif iste",
      res_disclaimer: 'Bu tutar bilgi amaçlıdır. Kesin fiyat, yerinde ölçü alındıktan sonra verilir.',
      prod2_title: 'Ölçüden montaja, tek ekip',
      prod2_p1: 'Keşif, ölçü, üretim ve montaj aynı ekip tarafından yürütülür. Aracı yoktur; süreç, termin ve kalite baştan sona bizim kontrolümüzdedir.',
      prod2_p2: 'Türkiye’nin her yerine ve Avrupa’ya teslimat yapıyoruz. Türkçe, Almanca ve İngilizce destek veriyoruz.',
      s1_title: 'Keşif ve ölçü', s1_desc: 'Alanı yerinde ölçer, size uygun sistemi birlikte belirleriz.',
      s2_title: 'Proje ve teklif', s2_desc: 'Ölçü, cam ve renk seçimlerinizle net bir teklif hazırlarız.',
      s3_title: 'Üretim', s3_desc: 'Onaylanan ölçülere göre sistem tesisimizde üretilir.',
      s4_title: 'Teslim ve montaj', s4_desc: 'Ürün korumalı ambalajla gönderilir ve montajı yapılır.',
      contact_title: 'İletişim', contact_addr_title: 'Adres', contact_phone_title: 'Telefon / WhatsApp',
      contact_email_title: 'E-posta', contact_hours_title: 'Çalışma saatleri', contact_hours_val: 'Pazartesi – Cumartesi, 08:30 – 18:30',
      form_title: 'Bize yazın', form_label_name: 'Ad soyad', form_label_phone: 'Telefon', form_label_country: 'Şehir / ülke',
      form_label_interest: 'İlgilendiğiniz ürün', form_opt_other: 'Diğer', form_label_msg: 'Mesajınız', form_btn_send: 'WhatsApp ile gönder',
      foot_about: 'Cam balkon, giyotin cam, kış bahçesi ve sürme sistemlerinde ölçüden montaja tek ekip.',
      foot_links: 'Bağlantılar', foot_follow: 'Bizi takip edin', foot_rights: 'Tüm hakları saklıdır.', foot_top: 'Yukarı çık', country: 'Türkiye',
      chat_title: 'Meteor Canlı Destek', chat_subtitle: 'AI Asistan · Çevrimiçi', chat_badge: 'Canlı Destek',
      chat_welcome: "Merhaba! Meteor Panorama'ya hoş geldiniz. Cam balkon, giyotin cam, kış bahçesi ve sürme sistemlerimiz hakkında her şeyi bana sorabilirsiniz. Size nasıl yardımcı olabilirim?",
      chat_placeholder: 'Bir soru yazın...', chat_quick_title: 'Hızlı Sorular:',
      chat_status_waiting: 'Meteor AI yanıt hazırlıyor...',
      chat_q1: 'Ürünleriniz nelerdir?', chat_q2: 'Keşif ve ölçü ücretsiz mi?', chat_q3: 'Fiyat nasıl hesaplanır?',
      chat_q4: 'Hangi bölgelere teslimat yapıyorsunuz?', chat_q5: 'Yetkiliye bağlan / Teklif iste',
      chat_rep_title: 'Uzman Ekip İletişim Talebi', chat_rep_name: 'Adınız Soyadınız', chat_rep_phone: 'Telefon Numaranız',
      chat_rep_note: 'Notunuz / Talebiniz', chat_rep_btn: 'Yetkiliye İlet', chat_rep_wa: "WhatsApp'tan Devam Et",
      chat_rep_success: 'Talebiniz yetkili ekibimize başarıyla iletildi! En kısa sürede sizinle iletişime geçeceğiz.',
      chat_err_msg: 'Şu anda yanıt üretilirken bir gecikme oluştu. Dilerseniz hemen WhatsApp üzerinden yetkilimizle iletişime geçebilirsiniz:',
      chat_lead_prompt: 'Ölçü ve teklif için aşağıdaki formu doldurabilir veya WhatsApp butonuna basabilirsiniz:',
      area: 'm²', specs_title: 'Teknik bilgiler', modal_calc: 'Bu ürün için fiyat hesapla', modal_wa: "WhatsApp'tan bilgi al"
    },
    de: {
      meta_title: 'Meteor Panorama | Balkonverglasung, Guillotine-Glas und Wintergärten',
      meta_desc: 'Meteor Panorama fertigt Balkonverglasungen, Guillotine-Glas, Wintergärten und Aluminium-Schiebesysteme nach Maß. Von der Aufnahme bis zur Montage aus einer Hand.',
      topbar_hours: 'Mo – Sa, 08:30 – 18:30 (TR)',
      nav_products: 'Produkte', nav_calculator: 'Preisrechner', nav_production: 'Fertigung', nav_contact: 'Kontakt', nav_cta: 'Angebot anfordern',
      nav_cambalkon: 'Balkonverglasung', nav_pvc: 'PVC Systeme', nav_giyotin: 'Guillotine-Glas', nav_kisbahcesi: 'Wintergarten', nav_surme: 'Schiebesystem',
      hero_place: 'Balkonverglasung · Guillotine-Glas · Wintergarten · PVC Systeme',
      hero_title: 'Machen Sie Ihren Balkon zum Wohnraum für alle vier Jahreszeiten',
      hero_lead: 'Fertigung nach Maß, Aufmaß vor Ort und fachgerechte Montage. Lieferung in die Türkei und nach Europa.',
      hero_cta_calc: 'Preis berechnen', hero_cta_wa: 'Per WhatsApp schreiben',
      hero_p1: 'Fertigung nach Maß', hero_p2: 'Kostenloses Aufmaß', hero_p3: 'Fachgerechte Montage',
      stat1_label: 'Jahre Erfahrung', stat2_label: 'Realisierte Projekte', stat3_label: 'Sprachen',
      hero_card_title: 'Kostenloses Aufmaß', hero_card_text: 'Vereinbaren Sie per WhatsApp einen Termin vor Ort.',
      prod_title: 'Produkte',
      prod_desc: 'Systeme für Balkon, Terrasse, Fenster und Gewerbe – jeweils nach Ihren Maßen gefertigt.',
      badge_popular: 'Besonders beliebt',
      p1_title: 'Balkonverglasung', p1_desc: 'Faltsysteme mit Isolierglas oder Mevlana 8mm ESG-Einscheibenglas.',
      p2_title: 'Elektrisches Guillotine-Glas', p2_desc: 'Vertikal fahrende Glaselemente per Fernbedienung. Offen eine Brüstung, geschlossen eine Glasfront.',
      p3_title: 'Wintergarten', p3_desc: 'Aluminiumkonstruktion mit Glasdach – ganzjährig nutzbarer Raum im Garten oder auf der Terrasse.',
      p4_title: 'Aluminium-Schiebesystem', p4_desc: 'Schiebetüren mit schmalen Profilen, auf Wunsch mit schwellenloser Schiene.',
      p5_title: 'PVC Fenster- & Türsysteme', p5_desc: 'Wärmedämmende Mehrkammer-PVC-Profile mit 2-fach oder 3-fach Verglasung.',
      mevlana_title: 'Mevlana 8mm ESG-Einscheibenglas', mevlana_desc: '8 mm gehärtetes Sicherheitsglas, freier Panoramablick, leichtgängig und preiswert.',
      isicam_title: 'Isolierte Balkonverglasung', isicam_desc: 'Faltsystem mit Doppel-Isolierglas für ganzjährige Nutzung und beste Wärmedämmung.',
      price_from: 'ab pro m²', btn_details: 'Technische Daten', btn_calc_this: 'Berechnen', btn_view_page: 'Seite anzeigen',
      calc_title: 'Richtpreis berechnen',
      calc_desc: 'Wählen Sie Produkt und ungefähre Maße. Das Ergebnis senden Sie uns mit einem Klick per WhatsApp.',
      step1_title: 'Produkt', step2_title: 'Form', step3_title: 'Maße', step4_title: 'Glas und Profil',
      shape_flat: 'Gerade', shape_l: 'L-Form', shape_u: 'U-Form',
      label_width: 'Gesamtbreite (m)', label_height: 'Höhe (m)',
      label_glass_type: 'Glas', label_profile_color: 'Profilfarbe',
      opt_glass_clear: 'Klares Isolierglas', opt_glass_fume: 'Grau getönt', opt_glass_bronze: 'Bronze', opt_glass_reflect: 'Reflektierend',
      opt_color_anthracite: 'Anthrazit (RAL 7016)', opt_color_black: 'Schwarz (RAL 9005)', opt_color_white: 'Weiß (RAL 9016)', opt_color_eloxal: 'Eloxiert', opt_color_wood: 'Holzdekor',
      res_est_title: 'Geschätzte Preisspanne', res_product: 'Produkt',
      res_f1: 'Kostenloses Aufmaß vor Ort', res_f2: 'Verbindliches Angebot nach Maß',
      btn_whatsapp_quote: 'Angebot per WhatsApp anfragen',
      res_disclaimer: 'Unverbindlicher Richtwert. Der genaue Preis folgt nach dem Aufmaß vor Ort.',
      prod2_title: 'Vom Aufmaß bis zur Montage – ein Team',
      prod2_p1: 'Aufmaß, Fertigung und Montage liegen in einer Hand. Keine Zwischenhändler – Ablauf, Termine und Qualität behalten wir von Anfang bis Ende selbst im Griff.',
      prod2_p2: 'Wir liefern in die ganze Türkei und nach Europa. Support auf Türkisch, Deutsch und Englisch.',
      s1_title: 'Beratung und Aufmaß', s1_desc: 'Wir messen vor Ort und wählen mit Ihnen das passende System.',
      s2_title: 'Planung und Angebot', s2_desc: 'Mit Ihren Maß-, Glas- und Farbwünschen erstellen wir ein klares Angebot.',
      s3_title: 'Fertigung', s3_desc: 'Das System wird nach den freigegebenen Maßen in unserem Werk gefertigt.',
      s4_title: 'Lieferung und Montage', s4_desc: 'Sicher verpackt geliefert und fachgerecht montiert.',
      contact_title: 'Kontakt', contact_addr_title: 'Adresse', contact_phone_title: 'Telefon / WhatsApp',
      contact_email_title: 'E-Mail', contact_hours_title: 'Öffnungszeiten', contact_hours_val: 'Montag – Samstag, 08:30 – 18:30 (TR)',
      form_title: 'Schreiben Sie uns', form_label_name: 'Name', form_label_phone: 'Telefon', form_label_country: 'Stadt / Land',
      form_label_interest: 'Produkt', form_opt_other: 'Sonstiges', form_label_msg: 'Nachricht', form_btn_send: 'Per WhatsApp senden',
      foot_about: 'Balkonverglasung, Guillotine-Glas, Wintergärten und Schiebesysteme – vom Aufmaß bis zur Montage aus einer Hand.',
      foot_links: 'Links', foot_follow: 'Folgen Sie uns', foot_rights: 'Alle Rechte vorbehalten.', foot_top: 'Nach oben', country: 'Türkei',
      chat_title: 'Meteor Live-Chat', chat_subtitle: 'KI-Assistent · Online', chat_badge: 'Live-Chat',
      chat_welcome: "Hallo! Willkommen bei Meteor Panorama. Fragen Sie mich gerne alles zu Balkonverglasung, Guillotine-Glas, Wintergärten und Schiebesystemen. Wie kann ich Ihnen helfen?",
      chat_placeholder: 'Schreiben Sie eine Frage...', chat_quick_title: 'Häufige Fragen:',
      chat_status_waiting: 'Meteor AI bereitet eine Antwort vor...',
      chat_q1: 'Welche Produkte bieten Sie an?', chat_q2: 'Ist das Aufmaß kostenlos?', chat_q3: 'Wie wird der Preis berechnet?',
      chat_q4: 'Wohin liefern Sie?', chat_q5: 'Berater kontaktieren / Angebot',
      chat_rep_title: 'Kontaktanfrage Fachberater', chat_rep_name: 'Ihr Name', chat_rep_phone: 'Ihre Telefonnummer',
      chat_rep_note: 'Ihre Nachricht / Wunsch', chat_rep_btn: 'An Berater senden', chat_rep_wa: 'Per WhatsApp fortsetzen',
      chat_rep_success: 'Ihre Anfrage wurde erfolgreich weitergeleitet! Wir melden uns in Kürze bei Ihnen.',
      chat_err_msg: 'Bei der Antwort ist eine Verzögerung aufgetreten. Sie können unseren Berater gerne direkt per WhatsApp kontaktieren:',
      chat_lead_prompt: 'Füllen Sie für Aufmaß & Angebot das Formular aus oder schreiben Sie uns per WhatsApp:',
      area: 'm²', specs_title: 'Technische Daten', modal_calc: 'Preis für dieses Produkt berechnen', modal_wa: 'Per WhatsApp anfragen'
    },
    en: {
      meta_title: 'Meteor Panorama | Balcony Glazing, Guillotine Glass and Winter Gardens',
      meta_desc: 'Meteor Panorama builds insulated balcony glazing, guillotine glass, winter gardens and aluminium sliding systems to measure. One team from survey to installation.',
      topbar_hours: 'Mon – Sat, 08:30 – 18:30 (TR)',
      nav_products: 'Products', nav_calculator: 'Price Calculator', nav_production: 'Production', nav_contact: 'Contact', nav_cta: 'Get a Quote',
      nav_cambalkon: 'Balcony Glazing', nav_pvc: 'PVC Systems', nav_giyotin: 'Guillotine Glass', nav_kisbahcesi: 'Winter Garden', nav_surme: 'Sliding Systems',
      hero_place: 'Balcony glazing · Guillotine glass · Winter garden · PVC Systems',
      hero_title: 'Turn your balcony into a four-season living space',
      hero_lead: 'Made-to-measure production, on-site survey and professional installation. We deliver across Turkey and Europe.',
      hero_cta_calc: 'Calculate price', hero_cta_wa: 'Message on WhatsApp',
      hero_p1: 'Made to measure', hero_p2: 'Free on-site survey', hero_p3: 'Professional installation',
      stat1_label: 'Years of experience', stat2_label: 'Projects completed', stat3_label: 'Languages',
      hero_card_title: 'Free site survey', hero_card_text: 'Book an on-site measurement on WhatsApp.',
      prod_title: 'Products',
      prod_desc: 'Architectural systems for balconies, terraces, windows and businesses – built to your dimensions.',
      badge_popular: 'Most popular',
      p1_title: 'Balcony Glazing Systems', p1_desc: 'Folding glass systems with insulated double glazing or Mevlana 8mm tempered glass.',
      p2_title: 'Motorized Guillotine Glass', p2_desc: 'Remote-controlled vertical glass panels. A balustrade when open, a full glass front when closed.',
      p3_title: 'Winter Garden', p3_desc: 'Aluminium frame with glass roof – a year-round room in your garden or on your terrace.',
      p4_title: 'Aluminium Sliding System', p4_desc: 'Slim-profile sliding doors with an optional flush threshold.',
      p5_title: 'PVC Window & Door Systems', p5_desc: 'High thermal insulation multi-chamber PVC profiles with double or triple glazing.',
      mevlana_title: 'Mevlana 8mm Tempered Single Glass', mevlana_desc: '8 mm impact-resistant tempered safety glass, open panoramic views, smooth and affordable.',
      isicam_title: 'Insulated Double Glazed Balcony', isicam_desc: 'Double glazed folding system turning your balcony into a warm 4-season living space.',
      price_from: 'from per m²', btn_details: 'Specifications', btn_calc_this: 'Calculate', btn_view_page: 'View Page',
      calc_title: 'Price estimate',
      calc_desc: 'Choose the product and approximate size. Send us the result on WhatsApp with one click.',
      step1_title: 'Product', step2_title: 'Layout', step3_title: 'Dimensions', step4_title: 'Glass and frame',
      shape_flat: 'Straight', shape_l: 'L-shape', shape_u: 'U-shape',
      label_width: 'Total width (m)', label_height: 'Height (m)',
      label_glass_type: 'Glass', label_profile_color: 'Frame colour',
      opt_glass_clear: 'Clear double glazing', opt_glass_fume: 'Grey tint', opt_glass_bronze: 'Bronze', opt_glass_reflect: 'Reflective',
      opt_color_anthracite: 'Anthracite (RAL 7016)', opt_color_black: 'Black (RAL 9005)', opt_color_white: 'White (RAL 9016)', opt_color_eloxal: 'Anodised', opt_color_wood: 'Wood finish',
      res_est_title: 'Estimated price range', res_product: 'Product',
      res_f1: 'Free on-site survey', res_f2: 'Tailored, fixed quote',
      btn_whatsapp_quote: 'Request a quote on WhatsApp',
      res_disclaimer: 'For guidance only. The final price is confirmed after an on-site survey.',
      prod2_title: 'From survey to installation, one team',
      prod2_p1: 'Survey, measuring, production and installation are handled by the same team. No middlemen – process, lead time and quality stay under our control from start to finish.',
      prod2_p2: 'We deliver across Turkey and to Europe, with support in Turkish, German and English.',
      s1_title: 'Survey and measuring', s1_desc: 'We measure on site and choose the right system with you.',
      s2_title: 'Design and quote', s2_desc: 'We prepare a clear quote based on your size, glass and colour choices.',
      s3_title: 'Production', s3_desc: 'The system is built at our plant to the approved dimensions.',
      s4_title: 'Delivery and installation', s4_desc: 'Shipped in protective packaging and installed.',
      contact_title: 'Contact', contact_addr_title: 'Address', contact_phone_title: 'Phone / WhatsApp',
      contact_email_title: 'Email', contact_hours_title: 'Opening hours', contact_hours_val: 'Monday – Saturday, 08:30 – 18:30 (TR)',
      form_title: 'Write to us', form_label_name: 'Full name', form_label_phone: 'Phone', form_label_country: 'City / country',
      form_label_interest: 'Product', form_opt_other: 'Other', form_label_msg: 'Message', form_btn_send: 'Send via WhatsApp',
      foot_about: 'Balcony glazing, guillotine glass, winter gardens and sliding systems – one team from survey to installation.',
      foot_links: 'Links', foot_follow: 'Follow us', foot_rights: 'All rights reserved.', foot_top: 'Back to top', country: 'Turkey',
      chat_title: 'Meteor Live Chat', chat_subtitle: 'AI Assistant · Online', chat_badge: 'Live Chat',
      chat_welcome: "Hello! Welcome to Meteor Panorama. Feel free to ask me anything about balcony glazing, guillotine glass, winter gardens and sliding systems. How can I help you today?",
      chat_placeholder: 'Type a question...', chat_quick_title: 'Quick Questions:',
      chat_status_waiting: 'Meteor AI is preparing an answer...',
      chat_q1: 'What are your products?', chat_q2: 'Is the site survey free?', chat_q3: 'How is price calculated?',
      chat_q4: 'Where do you deliver?', chat_q5: 'Contact specialist / Get quote',
      chat_rep_title: 'Specialist Contact Request', chat_rep_name: 'Your Full Name', chat_rep_phone: 'Your Phone Number',
      chat_rep_note: 'Your Request / Note', chat_rep_btn: 'Send to Specialist', chat_rep_wa: 'Continue on WhatsApp',
      chat_rep_success: 'Your request has been successfully sent! We will get in touch with you shortly.',
      chat_err_msg: 'There was a delay generating a response. You can reach our specialist directly via WhatsApp:',
      chat_lead_prompt: 'Fill out the form below for survey & quote or reach us on WhatsApp:',
      area: 'm²', specs_title: 'Specifications', modal_calc: 'Calculate price for this product', modal_wa: 'Ask on WhatsApp'
    }
  };

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


  let lang = 'tr';
  const tr = (key) => (t[lang] && t[lang][key]) || t.tr[key] || key;

  function setLanguage(next) {
    if (!t[next]) return;
    lang = next;
    document.documentElement.lang = next;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === next));
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t[next][el.dataset.i18n];
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const v = t[next][el.dataset.i18nPh];
      if (v) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-price-code]').forEach(el => {
      const r = rates[priceCodeToProduct[el.dataset.priceCode]];
      if (r) el.textContent = money(r[lang === 'tr' ? 'tr' : 'eu'][0]);
    });
    document.title = t[next].meta_title;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t[next].meta_desc);
    calculatePrice();
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      try { localStorage.setItem('meteor_lang', btn.dataset.lang); } catch (e) {}
    });
  });

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

  const state = { product: 'isicamli', shape: 'duz', width: 3.5, height: 1.6 };

  const $ = (s) => document.querySelector(s);
  const inW = $('#inputWidth'), rgW = $('#rangeWidth'), inH = $('#inputHeight'), rgH = $('#rangeHeight');
  const glassSel = $('#glassType'), colorSel = $('#profileColor');

  function bindDim(input, range, key, min, max, rangeMax) {
    if (!input || !range) return;
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      if (isNaN(v)) return;
      state[key] = Math.max(min, Math.min(max, v));
      range.value = Math.min(rangeMax, state[key]);
      calculatePrice();
    });
    input.addEventListener('change', () => { input.value = state[key]; });
    range.addEventListener('input', () => {
      state[key] = parseFloat(range.value);
      input.value = state[key];
      calculatePrice();
    });
  }
  if (inW && rgW) bindDim(inW, rgW, 'width', 1, 50, 20);
  if (inH && rgH) bindDim(inH, rgH, 'height', 0.8, 6, 4);

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
    if ($('#resDimensions')) $('#resDimensions').textContent = `${w.toFixed(1)} × ${h.toFixed(1)} m`;
    if ($('#resTotalArea')) $('#resTotalArea').textContent = `${area.toFixed(2)} m²`;
    if ($('#resProduct')) $('#resProduct').textContent = tr(productKey[state.product] || 'p1_title');

    const glassTxt = (glassSel && glassSel.options[glassSel.selectedIndex]) ? glassSel.options[glassSel.selectedIndex].text : 'Standart';
    const colorTxt = (colorSel && colorSel.options[colorSel.selectedIndex]) ? colorSel.options[colorSel.selectedIndex].text : 'Standart';
    const lines = {
      tr: ['Merhaba, web sitenizden fiyat hesapladım:', 'Ürün', 'Şekil', 'Ölçü', 'Cam', 'Profil', 'Tahmini fiyat', 'Detaylı teklif almak istiyorum.'],
      de: ['Hallo, ich habe auf Ihrer Website einen Richtpreis berechnet:', 'Produkt', 'Form', 'Maße', 'Glas', 'Profil', 'Richtpreis', 'Ich bitte um ein Angebot.'],
      en: ['Hello, I calculated an estimate on your website:', 'Product', 'Layout', 'Size', 'Glass', 'Frame', 'Estimate', 'I would like a detailed quote.']
    }[lang];
    const msg = `${lines[0]}\n\n` +
      `${lines[1]}: ${tr(productKey[state.product] || 'p1_title')}\n` +
      `${lines[2]}: ${tr(shapeKey[state.shape] || 'shape_flat')}\n` +
      `${lines[3]}: ${w.toFixed(1)} × ${h.toFixed(1)} m (${area.toFixed(2)} m²)\n` +
      `${lines[4]}: ${glassTxt}\n` +
      `${lines[5]}: ${colorTxt}\n` +
      `${lines[6]}: ${money(min)} – ${money(max)}\n\n${lines[7]}`;
    if ($('#btnSendWhatsapp')) $('#btnSendWhatsapp').href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
  }

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
      img: 'assets/hero-light.jpg', product: 'isicamli', title: 'p1_title', desc: 'p1_desc',
      specs: {
        tr: [['Cam', '4+12+4 veya 4+16+4 temperli çift cam'], ['Profil', 'Alüminyum, elektrostatik toz boya'], ['Açılım', 'Katlanır, içe veya dışa toplanır'], ['Conta', 'EPDM fitil'], ['Üretim', 'Kayseri']],
        de: [['Glas', '4+12+4 oder 4+16+4 ESG-Isolierglas'], ['Profil', 'Aluminium, pulverbeschichtet'], ['Öffnung', 'Faltbar, nach innen oder außen'], ['Dichtung', 'EPDM'], ['Fertigung', 'Kayseri']],
        en: [['Glass', '4+12+4 or 4+16+4 tempered double glazing'], ['Frame', 'Aluminium, powder coated'], ['Opening', 'Folding, inward or outward'], ['Seals', 'EPDM'], ['Made in', 'Kayseri']]
      }
    },
    'modal-giyotin': {
      img: 'assets/giyotin-light.jpg', product: 'giyotin', title: 'p2_title', desc: 'p2_desc',
      specs: {
        tr: [['Cam', '8–10 mm temperli veya ısıcam'], ['Hareket', 'Motorlu, kayış tahrikli'], ['Kumanda', 'Uzaktan kumanda / duvar anahtarı'], ['Kullanım', 'Teras, balkon, restoran'], ['Üretim', 'Kayseri']],
        de: [['Glas', '8–10 mm ESG oder Isolierglas'], ['Antrieb', 'Motorisch, Zahnriemen'], ['Steuerung', 'Fernbedienung / Wandschalter'], ['Einsatz', 'Terrasse, Balkon, Gastronomie'], ['Fertigung', 'Kayseri']],
        en: [['Glass', '8–10 mm tempered or insulated'], ['Drive', 'Motorized belt drive'], ['Control', 'Remote / wall switch'], ['Use', 'Terrace, balcony, restaurant'], ['Made in', 'Kayseri']]
      }
    },
    'modal-kis-bahcesi': {
      img: 'assets/wintergarten-light.jpg', product: 'kisbahcesi', title: 'p3_title', desc: 'p3_desc',
      specs: {
        tr: [['Taşıyıcı', 'Alüminyum kolon ve kiriş'], ['Çatı', 'Lamine cam veya panel'], ['Yan yüzeyler', 'Sürme, katlanır veya giyotin cam'], ['Drenaj', 'Gizli yağmur oluğu'], ['Üretim', 'Kayseri']],
        de: [['Tragwerk', 'Aluminiumstützen und -träger'], ['Dach', 'VSG-Glas oder Paneel'], ['Seiten', 'Schiebe-, Falt- oder Guillotine-Glas'], ['Entwässerung', 'Verdeckte Regenrinne'], ['Fertigung', 'Kayseri']],
        en: [['Structure', 'Aluminium posts and beams'], ['Roof', 'Laminated glass or panel'], ['Sides', 'Sliding, folding or guillotine glass'], ['Drainage', 'Concealed gutter'], ['Made in', 'Kayseri']]
      }
    },
    'modal-surme': {
      img: 'assets/sliding-light.jpg', product: 'surme', title: 'p4_title', desc: 'p4_desc',
      specs: {
        tr: [['Cam', 'Tek cam veya ısıcam'], ['Ray', 'Standart veya eşiksiz (gömme) ray'], ['Kilit', 'Anahtarlı kilit seçeneği'], ['Profil', 'Alüminyum, ince kasa'], ['Üretim', 'Kayseri']],
        de: [['Glas', 'Einfach- oder Isolierglas'], ['Schiene', 'Standard oder schwellenlos'], ['Verriegelung', 'Optional mit Schloss'], ['Profil', 'Aluminium, schmal'], ['Fertigung', 'Kayseri']],
        en: [['Glass', 'Single or double glazing'], ['Track', 'Standard or flush threshold'], ['Lock', 'Optional key lock'], ['Frame', 'Slim aluminium'], ['Made in', 'Kayseri']]
      }
    },
    'modal-pvc': {
      img: 'assets/pvc-light.jpg', product: 'pvc', title: 'p5_title', desc: 'p5_desc',
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

  // Initial language
  let saved = 'tr';
  try { saved = localStorage.getItem('meteor_lang') || 'tr'; } catch (e) {}
  setLanguage(t[saved] ? saved : 'tr');

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

  function cleanBotReply(text, cLang) {
    if (!text) return '';
    let cleaned = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/(?:user\s*safety|response\s*safety|safety\s*assessment|content\s*safety|safety)\s*:\s*(?:safe|unsafe|[^\n\r]+)/gi, '')
      .replace(/(?:safety check passed|safety evaluation:)/gi, '')
      .trim();

    if (!cleaned || cleaned.length < 2) {
      if (cLang === 'de') {
        return 'Gern geschehen! Wie kann ich Ihnen bei Balkonverglasung, Guillotine-Glas oder Wintergärten weiterhelfen?';
      } else if (cLang === 'en') {
        return "You're welcome! How else can I assist you regarding our balcony glazing, guillotine glass or winter garden systems?";
      } else {
        return 'Rica ederim! Isıcamlı cam balkon, giyotin cam veya kış bahçesi sistemlerimizle ilgili başka nasıl yardımcı olabilirim?';
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
    return "Sen Meteor Panorama firmasının resmi, bilgili, güler yüzlü ve son derece uzman yapay zeka müşteri danışmanısın.\n" +
      "Adın: Meteor AI Asistan.\n" +
      "Şu anki dil: " + (langNames[cLang] || 'Türkçe') + ". Yanıtlarını kesinlikle kullanıcının konuştuğu dilde ver (" + (langNames[cLang] || 'Türkçe') + ").\n\n" +
      "FİRMA BİLGİLERİ (METEOR PANORAMA):\n" +
      "- Üretici: Kayseri Mimarsinan Organize Sanayi Bölgesi'ndeki modern tesisimizde (Mimarsinan OSB 25. Cad. No:7, Melikgazi / Kayseri / Türkiye) özel ölçüye göre imalat yapıyoruz.\n" +
      "- Dört Ana Ürünümüz:\n" +
      "  1) Isıcamlı Cam Balkon: Çift camlı (4+12+4 veya 4+16+4 temperli), balkonu kışın da tam yaşanabilir sıcak bir odaya çeviren katlanır sistem.\n" +
      "  2) Motorlu Giyotin Cam: Kumandayla dikey açılıp kapanan cam paneller. Açıkken cam korkuluk, kapalıyken tam cephe olur. Teras, balkon, kafe ve restoranlar için idealdir.\n" +
      "  3) Kış Bahçesi: Alüminyum kolon/kiriş taşıyıcı, lamine cam tavan, gizli yağmur oluğu ile dört mevsim bahçe ve teras keyfi.\n" +
      "  4) Alüminyum Sürme Sistem: İnce zarif profilli, eşiksiz (gömme) zemin ray seçenekli sürme kapı sistemleri.\n" +
      "- Hizmet Felsefesi: 'Ölçüden montaja, tek ekip'. Aracı yoktur; keşif, ölçü, üretim ve montaj baştan sona kendi uzman ekibimizdedir.\n" +
      "- Keşif ve Ölçü: Keşif ve yerinde ölçü hizmetimiz tamamen ÜCRETSİZDİR.\n" +
      "- Teslimat: Tüm Türkiye'ye ve Almanya başta olmak üzere tüm Avrupa ülkelerine ölçüye özel güvenli teslimat yapıyoruz.\n" +
      "- Tecrübe: 10+ yıl sektör deneyimi, 250+ tamamlanmış proje.\n" +
      "- Çalışma Saatleri: Pazartesi – Cumartesi 08:30 – 18:30 (TR saati).\n" +
      "- İletişim: +90 530 844 77 36 (WhatsApp & Çağrı), info@meteorpanorama.com.\n\n" +
      "FİYAT VE TEKLİF KURALLARI (ÇOK ÖNEMLİ):\n" +
      "- Asla kesin bir son fiyat veya pazarlık rakamı uydurma!\n" +
      "- Sitede bir 'Tahmini Fiyat Hesaplama' aracı (#hesaplayici) olduğunu belirt.\n" +
      "- Yaklaşık m² başlangıç fiyatları: Isıcamlı Cam Balkon ~3.400 ₺ (140 €), Motorlu Giyotin ~6.400 ₺ (280 €), Kış Bahçesi ~10.500 ₺ (460 €), Sürme Sistem ~3.800 ₺ (160 €) seviyesindedir.\n" +
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
      if (chatToggle) chatToggle.setAttribute('aria-expanded', 'true');
      if (chatWindow) chatWindow.hidden = false;
      initChat();
      setTimeout(() => { if (chatInput) chatInput.focus(); }, 150);
    } else {
      chatWidget.classList.remove('open');
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
      '<input type="text" id="leadName" class="chat-lead-input" placeholder="' + tr('chat_rep_name') + ' *" required>' +
      '<input type="tel" id="leadPhone" class="chat-lead-input" placeholder="' + tr('chat_rep_phone') + ' *" required>' +
      '<input type="text" id="leadNote" class="chat-lead-input" placeholder="' + tr('chat_rep_note') + '" value="' + noteVal + '">' +
      '<button type="button" class="chat-lead-btn" id="btnSendLead">' + tr('chat_rep_btn') + '</button>' +
      '<a href="https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent('Merhaba, web sitenizdeki canlı destek üzerinden teklif almak istiyorum.') + '" target="_blank" rel="noopener" class="chat-lead-wa">' +
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
          alert(lang === 'tr' ? 'Lütfen adınızı ve telefon numaranızı giriniz.' : lang === 'de' ? 'Bitte geben Sie Ihren Namen und Ihre Telefonnummer ein.' : 'Please enter your name and phone number.');
          return;
        }

        const textMsg =
          '🔔 YENİ MÜŞTERİ TALEBİ (Meteor Panorama)\n' +
          '━━━━━━━━━━━━━━━━━━━━━━\n' +
          '👤 Müşteri: ' + name + '\n' +
          '📞 Telefon: ' + phone + '\n' +
          '📝 Talep / Not: ' + (note || 'Belirtilmedi') + '\n' +
          '🌐 Site Dili: ' + lang.toUpperCase() + '\n' +
          '🕒 Tarih: ' + new Date().toLocaleString('tr-TR') + '\n' +
          '━━━━━━━━━━━━━━━━━━━━━━\n' +
          '💬 Müşteriye doğrudan bu numaradan dönüş yapabilirsiniz.';

        const waUrl = 'https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(textMsg);

        try {
          btn.disabled = true;
          btn.textContent = lang === 'tr' ? 'İletiliyor...' : lang === 'de' ? 'Wird gesendet...' : 'Sending...';
          const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, note, lang })
          });
          if (res.ok) {
            card.innerHTML =
              '<div style="background:#f0fdf4;border:1px solid #86efac;color:#166534;padding:12px;border-radius:8px;font-size:0.86rem;line-height:1.45;">' +
                '<strong>✓ ' + tr('chat_rep_success') + '</strong>' +
                '<p style="margin:4px 0 0;font-size:0.8rem;color:#15803d;">Talebiniz yetkili ekibimize başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.</p>' +
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
          '<div style="color:#15803d;font-weight:600;margin-bottom:8px;">✓ ' + tr('chat_rep_success') + '</div>' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener" class="chat-lead-wa" style="display:flex;">' +
            '<svg viewBox="0 0 24 24" class="ic-wa" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
            '<span>' + tr('chat_rep_wa') + '</span>' +
          '</a>';
      });
    }
  }

  async function callOpenRouterAI(messagesPayload) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messagesPayload
      })
    });

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