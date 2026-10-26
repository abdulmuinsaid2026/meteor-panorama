# Meteor Panorama — Kurumsal Web Sitesi

Meteor Panorama resmi web sitesi: ısıcamlı cam balkon, motorlu giyotin cam, kış bahçesi, PVC pencere/kapı ve alüminyum sürme sistemleri.

Site; Türkçe (TR), Almanca (DE) ve İngilizce (EN) olarak, URL tabanlı ve sunucu tarafında render edilen bir mimariyle çalışır. Amaç; her sayfanın kendi dilinde dizine eklenebilmesi, paylaşılan bağlantıların doğru dilde açılması ve tarayıcı dili ne olursa olsun kullanıcıya açık bir dil seçimi sunulmasıdır.

## Mimari

- **Sunucu:** Node.js + Express 5
- **Şablonlar:** Altı adet Türkçe kaynak HTML dosyası
- **Render:** `cheerio` ile istek anında dile özel HTML üretimi
- **Çeviri katalogları:**
  - `i18n-ui.json`: menü, form, hesaplayıcı, sohbet ve dinamik arayüz metinleri
  - `i18n-content.js`: sayfa gövdesi metinleri, SSS/teknik içerik ve sayfa bazlı SEO meta verileri
- **İstemci:** `script.js` yalnızca hesaplayıcı, modallar, mobil menü, WhatsApp bağlantıları ve canlı sohbet gibi etkileşimleri yönetir. İstemci tarafında çeviri sözlüğü veya dil değiştirme mantığı yoktur.

### URL yapısı

Türkçe varsayılan dildir ve kök URL'leri kullanır. Almanca `/de`, İngilizce `/en` önekiyle yayınlanır.

| Sayfa | Türkçe | Almanca | İngilizce |
| --- | --- | --- | --- |
| Ana sayfa | `/` | `/de` | `/en` |
| Cam balkon | `/cam-balkon` | `/de/cam-balkon` | `/en/cam-balkon` |
| PVC sistemleri | `/pvc-sistemleri` | `/de/pvc-sistemleri` | `/en/pvc-sistemleri` |
| Giyotin cam | `/giyotin-cam` | `/de/giyotin-cam` | `/en/giyotin-cam` |
| Kış bahçesi | `/kis-bahcesi` | `/de/kis-bahcesi` | `/en/kis-bahcesi` |
| Sürme cam | `/surme-cam` | `/de/surme-cam` | `/en/surme-cam` |

- `/tr` ve `/tr/...` URL'leri 301 ile Türkçe kanonik URL'ye yönlendirilir.
- Eski `.html` URL'leri 301 ile temiz URL'ye yönlendirilir.
- Dil köklerinde ve sayfalarda sondaki eğik çizgi 301 ile kaldırılır (`/de/` → `/de`).
- Tarayıcı dili algılanıp otomatik yönlendirme yapılmaz. Böylece paylaşılan bağlantılar ve arama sonuçları kararlı kalır.

## SEO ve paylaşım

Her dil ve sayfa için sunucu tarafında şunlar üretilir:

- Dile özel `<title>` ve `meta description`
- Kanonik URL (`link rel="canonical"`)
- `hreflang` alternatifleri: `tr`, `de`, `en` ve `x-default` (Türkçe)
- `og:title`, `og:description`, `og:url`, `og:image`, `og:locale` ve `og:locale:alternate`
- Twitter card etiketleri
- `HomeAndConstructionBusiness` JSON-LD yapılandırılmış verisi
- `lang` ve `dir` öznitelikleri
- `/sitemap.xml` içinde 18 URL ve her URL için dil alternatifleri
- `/robots.txt`
- Dile özel, `noindex` 404 sayfası

`SITE_URL` ortam değişkeni üretimde mutlaka gerçek alan adına ayarlanmalıdır. Kanonik, hreflang, OG ve sitemap URL'leri bu değerden üretilir.

## Fiyat hesaplayıcı

- TR'de Türk Lira (₺), DE/EN'de Euro (€) kullanılır.
- Hesaplama; ürün, alan şekli, genişlik, yükseklik, cam tipi ve profil rengine göre yapılır.
- İlk HTML çıktısında da varsayılan ölçülere göre yerelleştirilmiş fiyat bulunur. Böylece JavaScript çalışmasa bile sayfa doğru dil ve para biriminde görünür.
- Hesaplayıcı durumu sayfa bazında `sessionStorage` içinde tutulur. Dil değiştirildiğinde veya sayfa yenilendiğinde ölçüler, ürün, cam ve renk seçimi korunur.
- WhatsApp teklif mesajı; ürün, ölçü, cam, profil ve tahmini fiyatla birlikte aktif dilde oluşturulur.
- Fiyatlar bilgilendirme amaçlıdır; kesin teklif yerinde ücretsiz ölçüm sonrası verilir.

## Canlı sohbet ve lead akışı

- Tarayıcıdan yalnızca `/api/chat` ve `/api/lead` uç noktalarına istek gider. OpenRouter ve Telegram anahtarları istemciye gönderilmez.
- `/api/chat`, OpenRouter üzerinden yanıt üretir; başarısız olursa arayüz WhatsApp yönlendirmesi gösterir.
- `/api/lead`, form bilgilerini ve aktif site dilini (`lang`) alır; Telegram bildirimi aynı dilde hazırlanır.
- API uç noktalarında IP başına dakikada 20 istek sınırı vardır. Bu koruma tek süreçte bellek içi çalışır; çok örnekli/dağıtık kurulumlarda paylaşımlı bir rate limiter kullanılmalıdır.

## Kurulum

Gereksinim: Node.js 20+ (Express 5 ve yerleşik `fetch` için önerilir).

```bash
npm install
cp .env.example .env
# .env içindeki değerleri doldurun
npm start
```

Varsayılan adres: <http://localhost:3000>

Sözdizimi kontrolü:

```bash
npm run check
```

### Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `PORT` | Hayır | Sunucu portu (varsayılan `3000`) |
| `SITE_URL` | Üretimde evet | Kanonik alan adı; örn. `https://meteorpanorama.com` |
| `OPENROUTER_API_KEY` | Sohbet için evet | OpenRouter API anahtarı |
| `TELEGRAM_BOT_TOKEN` | Lead için evet | Telegram bot token'ı |
| `TELEGRAM_CHAT_ID` | Lead için evet | Bildirimin gönderileceği sohbet/kullanıcı ID'si |

`.env` dosyası `.gitignore` içindedir ve repoya eklenmemelidir. Anahtarlar eksikse uygulama çalışmaya devam eder; ilgili API uç noktası `503` döndürür ve arayüz WhatsApp alternatifini gösterir.

> **Güvenlik:** Daha önce kaynak kodda bulunan OpenRouter/Telegram kimlik bilgileri artık koddan çıkarılmıştır. Bu değerlerin bir noktada paylaşıldığını varsayarak üretimde mutlaka yeni anahtarlarla değiştirin ve eski anahtarları iptal edin.

## Üretim notları

- `SITE_URL` değerini HTTPS adresinizle ayarlayın.
- Uygulamayı kalıcı bir process manager (systemd, PM2 vb.) ile çalıştırın.
- TLS sonlandırmayı reverse proxy (Nginx, Caddy vb.) üzerinden yapın.
- Yalnızca gerekli dosyalar sunulur: `/assets`, `/styles.css`, `/script.js`, `/robots.txt`, `/sitemap.xml`. HTML şablonları, JSON katalogları, `server.js` ve `.env` statik olarak erişilemez.
- `npm audit` ile bağımlılık güvenlik taramasını düzenli aralıklarla çalıştırın.
- Trafik arttığında API rate limitini Redis gibi paylaşımlı bir katmana taşıyın.

## Dosya yapısı

```text
server.js              Express sunucusu, SSR, SEO, yönlendirmeler, API'ler
i18n-content.js        Sayfa gövdesi çevirileri + sayfa meta verileri
i18n-ui.json           Arayüz/dinamik metin çevirileri
script.js              Hesaplayıcı, modallar, mobil menü, WhatsApp, sohbet
styles.css             Tema, responsive düzen, sohbet/hesaplayıcı stilleri
index.html             Türkçe ana sayfa kaynağı
cam-balkon.html        Cam balkon kaynağı
pvc-sistemleri.html    PVC sistemleri kaynağı
giyotin-cam.html       Giyotin cam kaynağı
kis-bahcesi.html       Kış bahçesi kaynağı
surme-cam.html         Sürme cam kaynağı
assets/                Logo ve ürün görselleri
.env.example           Ortam değişkeni örneği
```

### Yeni metin eklerken

1. Türkçe kaynak metni ilgili HTML dosyasına ekleyin.
2. `i18n-content.js` içindeki `text` dizisine `[Türkçe, Almanca, İngilizce]` olarak ekleyin.
3. Arayüz/dinamik metinse `i18n-ui.json` içinde üç dilde karşılığını tanımlayın.
4. `node --check i18n-content.js` ve `node --check server.js` ile sözdizimini doğrulayın.

### Yeni sayfa eklerken

1. Türkçe HTML şablonunu oluşturun.
2. `server.js` içindeki `PAGES` kaydına `file` ve `slug` bilgisini ekleyin.
3. `i18n-content.js` içindeki `meta` nesnesine üç dilde başlık, açıklama ve görsel ekleyin.
4. Menü/footer bağlantılarını tüm şablonlarda güncelleyin.

## İletişim

- **Telefon & WhatsApp:** +90 530 844 77 36
- **E-posta:** info@meteorpanorama.com
- **Adres:** Mimarsinan OSB 25. Cad. No:7, Melikgazi / Kayseri, Türkiye
- **Alan adı:** <https://meteorpanorama.com>
