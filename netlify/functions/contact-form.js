// netlify/functions/contact-form.js
exports.handler = async function(event, context) {
  // Проверяем метод запроса
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Метод не разрешен" })
    };
  }

  try {
    // Парсим данные формы
    const data = JSON.parse(event.body);
    const { name, email, message } = data;

    // Проверяем наличие обязательных полей
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Пожалуйста, заполните все обязательные поля" })
      };
    }

    // Здесь можно добавить код для отправки email или сохранения в базу данных
    // Например, использовать Nodemailer или Firebase

    // Возвращаем успешный ответ
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время." 
      })
    };
  } catch (error) {
    // Обработка ошибок
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Произошла ошибка при обработке запроса", error: error.toString() })
    };
  }
};
