// netlify/functions/order-notification.js
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const data = JSON.parse(event.body);

        const {
            orderId,
            customerEmail,
            customerName,
            items,
            totalPrice,
            deliveryType,
            deliveryAddress,
            paymentMethod
        } = data;

        if (!orderId || !customerEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        const safeOrderId = escapeHtml(orderId);
        const safeCustomerName = escapeHtml(customerName);
        const safeCustomerEmail = escapeHtml(customerEmail);
        const safeDeliveryAddress = escapeHtml(deliveryAddress || '');
        const safePaymentMethod = escapeHtml(paymentMethod);
        const safeTotalPrice = escapeHtml(totalPrice);
        const safeDeliveryLabel = deliveryType === 'delivery' ? 'Doručení na adresu' : 'Osobní odběr';

        const itemsListHtml = (Array.isArray(items) ? items : [])
            .map(item =>
                `• ${escapeHtml(item.name)} x ${escapeHtml(item.quantity)} - ${escapeHtml(Number(item.price) * Number(item.quantity))} Kč`
            )
            .join('\n');

        // Email to customer
        await resend.emails.send({
            from: 'Kvitko Sweet <noreply@kvitko-sweet.netlify.app>',
            to: customerEmail,
            subject: `Potvrzení objednávky #${orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌸 Kvitko Sweet</h1>
          </div>

          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Děkujeme za Vaši objednávku!</h2>
            <p>Dobrý den, ${safeCustomerName}!</p>
            <p>Vaše objednávka <strong>#${safeOrderId}</strong> byla úspěšně přijata.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">📦 Položky objednávky:</h3>
              <pre style="font-family: inherit; white-space: pre-wrap;">${itemsListHtml}</pre>
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
              <p style="font-size: 18px; font-weight: bold; margin: 0;">
                Celkem: ${safeTotalPrice} Kč
              </p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">🚚 Doručení:</h3>
              <p><strong>${safeDeliveryLabel}</strong></p>
              <p>${safeDeliveryAddress}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">💳 Platba:</h3>
              <p>${safePaymentMethod}</p>
            </div>

            <p style="color: #666;">
              Brzy Vás budeme kontaktovat ohledně stavu Vaší objednávky.
            </p>

            <p style="color: #666;">
              S pozdravem,<br>
              <strong>Tým Kvitko Sweet</strong>
            </p>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Kvitko Sweet - Květinové studio</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://kvitko-sweet.netlify.app" style="color: #8BC34A;">kvitko-sweet.netlify.app</a>
            </p>
          </div>
        </div>
      `
        });

        // Email to admin
        const adminEmail = process.env.ADMIN_EMAIL || 'kvetiny.na.paloucku@gmail.com';
        const adminDeliveryLabel = deliveryType === 'delivery' ? 'Doručení' : 'Osobní odběr';

        await resend.emails.send({
            from: 'Kvitko Sweet <noreply@kvitko-sweet.netlify.app>',
            to: adminEmail,
            subject: `🆕 Nová objednávka #${orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff9800; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">📦 Nová objednávka!</h1>
          </div>

          <div style="padding: 20px; background: #fff3e0;">
            <h2>Objednávka #${safeOrderId}</h2>
            <p><strong>Zákazník:</strong> ${safeCustomerName}</p>
            <p><strong>Email:</strong> ${safeCustomerEmail}</p>

            <h3>Položky:</h3>
            <pre style="background: white; padding: 15px; border-radius: 5px;">${itemsListHtml}</pre>

            <p style="font-size: 20px; font-weight: bold;">Celkem: ${safeTotalPrice} Kč</p>

            <p><strong>Doručení:</strong> ${escapeHtml(adminDeliveryLabel)}</p>
            <p><strong>Adresa:</strong> ${safeDeliveryAddress || 'N/A'}</p>
            <p><strong>Platba:</strong> ${safePaymentMethod}</p>

            <a href="https://kvitko-sweet.netlify.app/admin/orders"
               style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Zobrazit v admin panelu
            </a>
          </div>
        </div>
      `
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Notification emails sent successfully'
            })
        };

    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to send notification email',
                error: error.message
            })
        };
    }
};
