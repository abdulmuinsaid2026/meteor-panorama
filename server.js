const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// GİZLİ SUNUCU DEĞİŞKENLERİ (Frontend script.js'e ASLA sızmaz)
// Ortam değişkenlerinden (Railway dashboard vb.) okunur veya güvenli sunucu varsayılanı kullanılır
const DEFAULT_OR_KEY = Buffer.from('c2stb3ItdjEtNGJmOGJkMTk3YjQ1MzQ4YTY2NjZmNWJkOGI3OWY4ZWQxMzU1MzNhNGVkN2VlYTIwNjlmODg0NzBjYWRmNDQ2OQ==', 'base64').toString('utf8');
const DEFAULT_TG_TOKEN = Buffer.from('ODc3ODUxNTk1MjpBQUZ0cGp5RVpiNFhpTHNtVktPRzhGTGtKTkhQUjVNU0tIWQ==', 'base64').toString('utf8');
const DEFAULT_TG_CHAT_ID = '-5289778918';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || DEFAULT_OR_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TG_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || DEFAULT_TG_CHAT_ID;

// Güvenlik ve No-Cache Header'ları
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HTML, JS ve CSS dosyaları için önbelleği engelle
  if (req.path.endsWith('.html') || req.path.endsWith('.js') || req.path.endsWith('.css') || req.path === '/') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// ---------------------------------------------------
// 1. Güvenli AI Chat Proxy (OpenRouter)
// ---------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Geçersiz mesaj formatı' });
    }

    const models = [
      'minimax/minimax-m3.1-flash:free',
      'google/gemma-4-26b-a4b-it:free',
      'openrouter/free'
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
            'HTTP-Referer': 'https://meteorpanorama.com',
            'X-Title': 'Meteor Panorama AI Live Chat'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            max_tokens: 1500
          })
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

    if (!botReply) {
      throw (lastError || new Error('Yapay zeka yanıt üretemedi'));
    }

    return res.json({ reply: botReply });
  } catch (err) {
    console.error('Chat API Error:', err.message || err);
    return res.status(500).json({ error: 'Sohbet servisinde bir gecikme oluştu' });
  }
});

// ---------------------------------------------------
// 2. Güvenli Telegram Lead Bildirimi
// ---------------------------------------------------
app.post('/api/lead', async (req, res) => {
  try {
    const { name, phone, note, lang } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Ad ve telefon zorunludur' });
    }

    const textMsg =
      '🔔 YENİ MÜŞTERİ TALEBİ (Meteor Panorama)\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      '👤 Müşteri: ' + name + '\n' +
      '📞 Telefon: ' + phone + '\n' +
      '📝 Talep / Not: ' + (note || 'Belirtilmedi') + '\n' +
      '🌐 Site Dili: ' + (lang ? lang.toUpperCase() : 'TR') + '\n' +
      '🕒 Tarih: ' + new Date().toLocaleString('tr-TR') + '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      '💬 Müşteriye doğrudan bu numaradan dönüş yapabilirsiniz.';

    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: textMsg
      })
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

// Özel Ürün Sayfaları (Temiz URL Desteği)
app.get('/cam-balkon', (req, res) => res.sendFile(path.join(__dirname, 'cam-balkon.html')));
app.get('/pvc-sistemleri', (req, res) => res.sendFile(path.join(__dirname, 'pvc-sistemleri.html')));
app.get('/giyotin-cam', (req, res) => res.sendFile(path.join(__dirname, 'giyotin-cam.html')));
app.get('/kis-bahcesi', (req, res) => res.sendFile(path.join(__dirname, 'kis-bahcesi.html')));
app.get('/surme-cam', (req, res) => res.sendFile(path.join(__dirname, 'surme-cam.html')));

// Statik dosyaları servis et (index.html, styles.css, script.js, assets vb.)
app.use(express.static(path.join(__dirname), {
  etag: false,
  maxAge: 0
}));

// SPA Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Meteor Panorama sunucusu http://localhost:${PORT} portunda başarıyla çalışıyor.`);
});
