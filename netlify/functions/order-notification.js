// netlify/functions/order-notification.js
const { Resend } = require('resend');

exports.handler = async function (event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight request
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

        // Validate required fields
        if (!orderId || !customerEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        // Format items list
        const itemsList = items.map(item =>
            `• ${item.name} x ${item.quantity} - ${item.price * item.quantity} Kč`
        ).join('\n');

        // Email to customer
        const customerEmailResult = await resend.emails.send({
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
            <p>Dobrý den, ${customerName}!</p>
            <p>Vaše objednávka <strong>#${orderId}</strong> byla úspěšně přijata.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">📦 Položky objednávky:</h3>
              <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
              <p style="font-size: 18px; font-weight: bold; margin: 0;">
                Celkem: ${totalPrice} Kč
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">🚚 Doručení:</h3>
              <p><strong>${deliveryType === 'delivery' ? 'Doručení na adresu' : 'Osobní odběr'}</strong></p>
              <p>${deliveryAddress || ''}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4CAF50;">💳 Platba:</h3>
              <p>${paymentMethod}</p>
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

        // Email to admin (store owner)
        const adminEmail = process.env.ADMIN_EMAIL || 'kvetiny.na.paloucku@gmail.com';

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
            <h2>Objednávka #${orderId}</h2>
            <p><strong>Zákazník:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            
            <h3>Položky:</h3>
            <pre style="background: white; padding: 15px; border-radius: 5px;">${itemsList}</pre>
            
            <p style="font-size: 20px; font-weight: bold;">Celkem: ${totalPrice} Kč</p>
            
            <p><strong>Doručení:</strong> ${deliveryType === 'delivery' ? 'Doručení' : 'Osobní odběr'}</p>
            <p><strong>Adresa:</strong> ${deliveryAddress || 'N/A'}</p>
            <p><strong>Platba:</strong> ${paymentMethod}</p>
            
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
