// netlify/functions/contact-form.js
const { Resend } = require('resend');

const ALLOWED_ORIGINS = [
  'https://kvitko-sweet.netlify.app',
  'https://www.kvitko-sweet.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

exports.handler = async function (event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Метод не разрешен' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, message } = data;

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Pожалуйста, заполните все обязательные поля' })
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'kvetiny.na.paloucku@gmail.com';

    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Сервис временно недоступен' })
      };
    }

    const resend = new Resend(apiKey);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    await resend.emails.send({
      from: 'Kvitko Sweet <noreply@kvitko-sweet.netlify.app>',
      to: adminEmail,
      replyTo: email,
      subject: `Nová zpráva z kontaktního formuláře — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nová zpráva z kontaktního formuláře</h2>
          <p><strong>Jméno:</strong> ${safeName}</p>
          <p><strong>E-mail:</strong> ${safeEmail}</p>
          <hr>
          <p>${safeMessage}</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Děkujeme za vaši zprávu! Brzy se vám ozveme.'
      })
    };
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Произошла ошибка при обработке запроса', error: error.toString() })
    };
  }
};
