// netlify/functions/newsletter-signup.js
//
// Подписка на newsletter с автовыдачей промо-кода на первую покупку.
//
// Пайплайн:
//   1. Валидация email.
//   2. Отправка welcome-письма через Resend с уникальным промо-кодом.
//   3. (Опционально) сохранение email в Resend audience для будущих
//      рассылок — если задан RESEND_AUDIENCE_ID.
//
// На стороне клиента промо-код можно ввести на checkout — но для этого
// нужна отдельная логика (пока обещаем в письме, применяет админ вручную
// или добавим promo-код систему позже).

const { Resend } = require('resend');

const ALLOWED_ORIGINS = [
  'https://kvitko-sweet.netlify.app',
  'https://www.kvitko-sweet.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

function escapeHtml(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makePromoCode() {
  // Простой человекочитаемый код. Для строгой безопасности можно
  // подключить crypto.randomBytes, но для welcome-скидки достаточно.
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VITEJ10-${suffix}`;
}

exports.handler = async function (event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Neplatný e-mail.' }),
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Služba je dočasně nedostupná.' }),
      };
    }

    const resend = new Resend(apiKey);
    const promoCode = makePromoCode();
    const safeEmail = escapeHtml(email);
    const safePromo = escapeHtml(promoCode);

    // 1. Welcome-email с промо
    await resend.emails.send({
      from: 'Kvitko Sweet <noreply@kvitko-sweet.netlify.app>',
      to: email,
      subject: 'Vítejte v Kvitko Sweet — vaše sleva 10 % 🌸',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌸 Vítejte!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Děkujeme za odběr novinek</h2>
            <p>Jsme rádi, že jste s námi. Jako poděkování máte slevu <strong>10 %</strong> na první objednávku.</p>
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 24px 0; border: 2px dashed #4CAF50; text-align: center;">
              <p style="margin: 0; color: #666; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Váš promo kód</p>
              <p style="font-size: 24px; font-weight: bold; margin: 8px 0; color: #4CAF50; letter-spacing: 2px;">${safePromo}</p>
              <p style="margin: 0; color: #999; font-size: 12px;">Platí 30 dní na jakoukoli objednávku.</p>
            </div>
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://kvitko-sweet.netlify.app/catalog"
                 style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Prohlédnout katalog
              </a>
            </p>
            <p style="color: #666; margin-top: 30px; font-size: 12px;">
              Promo kód uveďte v poznámce k objednávce — florista slevu ručně aplikuje.
              Brzy spustíme automatické uplatnění na checkoutu.
            </p>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Kvitko Sweet · Praha</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://kvitko-sweet.netlify.app" style="color: #8BC34A;">kvitko-sweet.netlify.app</a>
            </p>
          </div>
        </div>
      `,
    });

    // 2. Опционально — добавить в Resend audience (для будущих рассылок)
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        await resend.contacts.create({
          email,
          audienceId,
          unsubscribed: false,
        });
      } catch (audienceErr) {
        // Не критично: письмо уже отправлено. Логируем и идём дальше.
        console.warn('Failed to add to Resend audience:', audienceErr.message);
      }
    }

    // 3. Уведомить админа о новом подписчике
    const adminEmail = process.env.ADMIN_EMAIL || 'kvetiny.na.paloucku@gmail.com';
    try {
      await resend.emails.send({
        from: 'Kvitko Sweet <noreply@kvitko-sweet.netlify.app>',
        to: adminEmail,
        subject: `🆕 Nový odběratel newsletteru`,
        html: `
          <p>Přihlásil se nový odběratel:</p>
          <p><strong>${safeEmail}</strong></p>
          <p>Promo kód: <strong>${safePromo}</strong></p>
        `,
      });
    } catch (adminErr) {
      console.warn('Failed to notify admin:', adminErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Děkujeme! Zkontrolujte e-mail — poslali jsme vám kód se slevou.',
      }),
    };
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Nepodařilo se dokončit registraci.' }),
    };
  }
};
